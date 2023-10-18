import { HttpService } from "@nestjs/axios";
import { ForbiddenException, Injectable } from "@nestjs/common";
import axios, { AxiosResponse } from "axios";
import { Observable, catchError, lastValueFrom, map } from "rxjs";

@Injectable()
export class AuthService {
	constructor(private httpService: HttpService) {}

	async handleOAuthCallback(code: string, response) {
		const tokenEndpoint = 'https://api.intra.42.fr/oauth/token';

		const clientId = 'u-s4t2ud-5aa910e46806ef2878fcc39c28b29ced49eea2c7be64920d660e8ef997c748c0';
		const clientSecret = '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';

		try {
			const tokenResponse = await axios.post(tokenEndpoint, {
				grant_type: 'authorization_code',
				client_id: clientId,
				client_secret: clientSecret,
				code: code,
				redirect_uri: 'http://localhost:3000/api/auth',
			});

			const accessToken = tokenResponse.data.access_token;
			const refreshToken = tokenResponse.data.refresh_token; //pour pas avoir a relog

			// GET USER INFO FROM 42API HERE
			const userInfo = await this.getUserInfo(accessToken);
			console.log(userInfo);

			// CHECK WITH DB IF EXISTS

			// IF NOT -> First login page

			// IF YES -> home page

			response.redirect('/success');
		} catch (error) {
			console.error('Token exchange failed:', error);
			response.redirect('/error');
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
}

//move elsewhere ?
interface UserInfo {
	userId: string;
	login: string;
}