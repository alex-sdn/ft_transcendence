import { HttpService } from "@nestjs/axios";
import { ForbiddenException, HttpException, HttpStatus, Injectable } from "@nestjs/common";
import axios from "axios";
import { catchError, lastValueFrom, map } from "rxjs";
import { PrismaService } from "../prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { User } from "@prisma/client";
import * as speakeasy from "speakeasy";
import * as path from "path";
import * as fs from "fs";

@Injectable()
export class AuthService {
	constructor(
		private httpService: HttpService,
		private prisma: PrismaService,
		private jwt: JwtService,
		private config: ConfigService) { }

	async handleOAuthCallback(code: string): Promise<{
		access_token: string | undefined,
		newUser: boolean,
		has2fa: boolean
	}> {
		console.log('Query=' + code);
		const tokenEndpoint = 'https://api.intra.42.fr/oauth/token';

		const clientId = 'u-s4t2ud-1b7f717c58b58406ad4b2abe9145475069d66ace504146041932a899c47ff960';
		const clientSecret = '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';

		try {
			// GET TOKENS FROM 42 API
			const tokenResponse = await axios.post(tokenEndpoint, {
				grant_type: 'authorization_code',
				client_id: clientId,
				client_secret: clientSecret,
				code: code,
				redirect_uri: 'http://localhost:3000/login',
			});

			const accessToken = tokenResponse.data.access_token;
			const refreshToken = tokenResponse.data.refresh_token; //pour pas avoir a relog

			// GET USER INFO FROM 42API
			const info42 = await this.getFortyTwoLogin(accessToken);
			console.log('42 login=' + info42.login42);

			// CHECK WITH DB IF EXISTS
			const user = await this.prisma.user.findUnique({
				where: { login42: info42.login42 },
			});

			// IF NOT -> First login page
			if (!user) {
				console.log('FIRST CONNECTION')
				const avatar = await this.getFortyTwoAvatar(info42.login42, info42.image);
				let nickname = info42.login42;
				let newUser = await this.createUser(info42.login42, nickname, avatar);
				while (!newUser) {
					nickname += '_';
					newUser = await this.createUser(info42.login42, nickname, avatar);
				}
				return {
					access_token: await this.signToken(newUser.id, newUser.nickname),
					newUser: true,
					has2fa: false
				};
			}
			// IF YES && has 2FA -> signin page
			else if (user.has2fa === true) {
				console.log('USER FOUND WITH 2FA');
				return {
					access_token: await this.sign2faToken(user.id, user.nickname),
					newUser: false,
					has2fa: true
				};
			}
			// IF YES && no 2FA -> home page
			else {
				console.log('USER FOUND, OK')
				return {
					access_token: await this.signToken(user.id, user.nickname),
					newUser: false,
					has2fa: false
				};
			}
		} catch (error) {
			// console.error('Token exchange failed:', error);
			throw new HttpException('TOKEN_EXCHANGE_FAILED', HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	// Finish signin with 2FA
	async signin(user: any, code: string) {
		const secret = user.secret2fa;

		const isValid = speakeasy.totp.verify({
			secret,
			encoding: 'base32',
			token: code,
		});

		if (isValid) {
			// return full access token
			return await this.signToken(user.id, user.nickname);
		}
		throw new ForbiddenException('2FA_CODE_INCORRECT',);
	}

	// Create User in db with given data
	async createUser(login42: string, nickname: string, avatar: string): Promise<User> {
		const checkTaken = await this.prisma.user.findUnique({
            where: {nickname: nickname}
        });
        if (checkTaken)
            return null;

        const checkTaken2 = await this.prisma.user.findUnique({
            where: {login42: login42}  // TMP FOR FAKELOGIN ONLY
        });
        if (checkTaken2)
            return null;	

		const user = await this.prisma.user.create({
			data: {
				login42,
				nickname,
				avatar
			},
		});
		return user;
	}

	// Fetch user info from 42 api with access token
	async getFortyTwoLogin(accessToken: string) {
		const userEndpoint = "https://api.intra.42.fr/v2/me";

		const fullInfo = await lastValueFrom(this.httpService.get(
			userEndpoint, {
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		}
		).pipe(
			map(res => res.data)
		).pipe(
			catchError(() => {
				// Revoir error handling
				throw new ForbiddenException('Error fetching user info');
			})
		));
		return {
			login42: fullInfo.login,
			image: fullInfo.image.versions.small
		}
	}

	// Download 42 avatar
	async getFortyTwoAvatar(login42: string, image: string) {
		try {
			const response = await axios.get(image, {responseType: 'stream'});
			const imgPath = path.join(__dirname, '../../uploads/custom/', login42);
			//pipe the img stream to the file
			response.data.pipe(fs.createWriteStream(imgPath));
			//return image name
			return login42;
		} catch (error) {
			console.log("42 avatar error:", error);
			return "default-avatar";
		}
	}

	// create JWT
	async signToken(userId: number, nickname: string) {
		const payload = {
			userId,
			nickname,
			need2fa: false
		};
		const secret = this.config.get('JWT_SECRET');

		const token = await this.jwt.signAsync(
			payload, {
			expiresIn: '6h',
			secret: secret
			}
		);
		return token;
	}

	async sign2faToken(userId: number, nickname: string) {
		const payload = {
			userId,
			nickname,
			need2fa: true
		};
		const secret = this.config.get('JWT_2FA_SECRET');

		const token = await this.jwt.signAsync(
			payload, {
			expiresIn: '15m',
			secret: secret
			}
		);
		return token;
	}

	// verify JWT (for sockets only)
	async validateToken(bearerToken: string) {
		try {
			if (!bearerToken)
				return null;

			const token = bearerToken.split(' ')[1];
			const secret = this.config.get('JWT_SECRET')
			const decoded = this.jwt.verify(token, {secret: secret});
			
			if (decoded.need2fa === true)
				return null;

			const user = await this.prisma.user.findUnique({
				where: {id: decoded.userId}
			});

			// delete unnecessary info
			delete user.secret2fa;
			return user;
		} catch(error) {
			console.log('ERROR VALIDATING WS TOKEN', error);
		}
	}


	/*****************************/
	// FOR TESTING ! returns jwt for given nickname
	async genToken(nickname: string) {
		const user = await this.prisma.user.findUnique({
			where: {nickname}
		});
		if (!user)
			return null;

		return await this.signToken(user.id, user.nickname);
	}

	async fakelogin(): Promise<{
		access_token: string | undefined,
		newUser: boolean,
		has2fa: boolean
	}> {
		let info42 = 'fakeuser';
		let nickname = 'testuser';
		let newUser = await this.createUser(info42, nickname, "default-avatar");
		while (!newUser) {
			nickname += '_';
			info42 += '_'
			newUser = await this.createUser(info42, nickname, "default-avatar");
		}
		return {
			access_token: await this.signToken(newUser.id, newUser.nickname),
			newUser: true,
			has2fa: false
		};
	}
}
