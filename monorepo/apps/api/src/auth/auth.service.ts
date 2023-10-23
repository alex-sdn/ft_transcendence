import { HttpService } from "@nestjs/axios";
import { ForbiddenException, HttpException, HttpStatus, Injectable } from "@nestjs/common";
import axios from "axios";
import { catchError, lastValueFrom, map } from "rxjs";
import { PrismaService } from "../prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { User } from "@prisma/client";

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
		console.log('Query='+code);
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
			const login42 = await this.getFortyTwoLogin(accessToken);
			console.log('42 login=' + login42);

			// CHECK WITH DB IF EXISTS
			const user = await this.prisma.user.findUnique({
				where: {
					login42
				},
			});

			// IF NOT -> First login page (or not???)
			if (!user) {
				console.log('FIRST CONNECTION')
				let nickname = login42;
				let newUser = await this.createUser(login42, nickname);
				while (!newUser) {
					nickname += '_';
					newUser = await this.createUser(login42, nickname);
				}
				return {
					access_token: await this.signToken(newUser.id, newUser.nickname, false),
					newUser: true,
					has2fa: false
				};
			}
			// IF YES && has 2FA -> signin page
			else if (user.has2fa === true) {
				console.log('USER FOUND WITH 2FA');
				return {
					access_token: await this.signToken(user.id, user.nickname, true),
					newUser: false,
					has2fa: true
				};
			}
			// IF YES && no 2FA -> home page
			else {
				console.log('USER FOUND, OK')
				return {
					access_token: await this.signToken(user.id, user.nickname, false),
					newUser: false,
					has2fa: false
				};
			}
		} catch (error) {
			// console.error('Token exchange failed:', error);
			throw new HttpException('TOKEN_EXCHANGE_FAILED', HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	// Pick a nickname (or keep 42 login) // Do this in /user ???
	// async signup(dto: AuthDto) {
	// 	// const user = await this.prisma.user.create({})
	// }

	// Finish signin with 2FA
	signin(dto: any) {
		// return jwt?
	}

	async createUser(login42: string, nickname: string): Promise<User> {
		const checkTaken = await this.prisma.user.findUnique({
			where: {
				nickname: nickname,
			},
		});
		if (checkTaken)
			return null;

		const user = await this.prisma.user.create({
			data: {
				login42,
				nickname
			},
		});
		return user;
	}

	//Fetch user info from 42 api with access token
	async getFortyTwoLogin(accessToken: string): Promise<string> {
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
		// const userInfo: UserInfo = {
		// 	userId: fullInfo.id,
		// 	login: fullInfo.login,
		// };
		return fullInfo.login;
	}

	async signToken(userId: number, nickname: string, need2fa: boolean) {
		const payload = {
			userId,
			nickname,
			need2fa
		};
		const secret = this.config.get('JWT_SECRET');

		const token = await this.jwt.signAsync(
			payload, {
			expiresIn: '1h',
			secret: secret
		}
		);
		return token;
	}
}

//move elsewhere ?  // just login ?
// interface UserInfo {
// 	userId: string;
// 	login: string;
// }