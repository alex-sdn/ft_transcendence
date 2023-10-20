import { HttpService } from "@nestjs/axios";
import { ForbiddenException, Injectable } from "@nestjs/common";
import axios from "axios";
import { catchError, lastValueFrom, map } from "rxjs";
import { PrismaService } from "../prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AuthService {
	constructor(
		private httpService: HttpService,
		private prisma: PrismaService,
		private jwt: JwtService,
		private config: ConfigService) { }

	async handleOAuthCallback(code: string) {
		console.log("BACKEND CODE:" + code);
		const tokenEndpoint = 'https://api.intra.42.fr/oauth/token';

		const clientId = 'u-s4t2ud-1b7f717c58b58406ad4b2abe9145475069d66ace504146041932a899c47ff960';
		const clientSecret = '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';

		try {
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
			const userInfo = await this.getUserInfo(accessToken);
			console.log(userInfo);

			// CHECK WITH DB IF EXISTS
			const user = await this.prisma.user.findUnique({
				where: {
					login42: userInfo.login,
				},
			});
			// IF NOT -> First login page
			if (!user) {
				console.log('FIRST CONNECTION')
				//tmp
				// await this.prisma.user.create({
				// 	data: {
				// 		login42: userInfo.login,
				// 		nickname: "temp"
				// 	},
				// });

				return 'notfound';
				// response.redirect('/firstlogin'); //tmp
			}
			// IF YES -> home page
			else {
				console.log('USER FOUND');

				// return 'user found!!';
				// response.redirect('/success');

				// return token ?
				return this.signToken(user.id, user.nickname);
			}

			// response.redirect('/success'); //tmp
		} catch (error) {
			console.error('Token exchange failed:', error);
			console.log('failed request');
			// response.redirect('/error');
		}
	}

	//Fetch user info from 42 api with access token
	async getUserInfo(accessToken: string): Promise<UserInfo> {
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

		const userInfo: UserInfo = {
			userId: fullInfo.id,
			login: fullInfo.login,
		};

		return userInfo;

		// try {
		// 	const response = this.httpService.get(
		// 		userEndpoint, {
		// 			headers: {
		// 				Authorization: `Bearer ${accessToken}`,
		// 			},
		// 		}
		// 	).pipe(
		// 		map((response: AxiosResponse) => {
		// 			console.log('TEST ${accesToken}');
		// 			const fullInfo = response.data;

		// 			console.log(fullInfo);

		// 			const userInfo: UserInfo = {
		// 				userId: fullInfo.id,
		// 				login: fullInfo.login,
		// 			};

		// 			return userInfo;
		// 		})
		// 	);
		// } catch (error) {
		// 	// handle error here
		// 	throw new Error('Failed to fetch user info');
		// }
	}

	async signToken(userId: number, nickname: string) {
		const payload = {
			sub: userId,
			nickname
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

//move elsewhere ?
interface UserInfo {
	userId: string;
	login: string;
}