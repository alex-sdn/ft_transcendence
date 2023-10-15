import { Injectable } from "@nestjs/common";
import axios from "axios";

@Injectable()
export class AuthService {

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
			console.log('ACCESS:', accessToken, "\nREFRESH:", refreshToken);

			response.redirect('/success');
		} catch (error) {
			console.error('Token exchange failed:', error);
			response.redirect('/error');
		}
	}
}