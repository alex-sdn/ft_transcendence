import { Controller, Get, Post, Query, Res } from "@nestjs/common";
import { AuthService } from "./auth.service";

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) {}

	@Get() // post ?
	async handleOAuthCallback(@Query('code') code: string, @Res() response) {
		return this.authService.handleOAuthCallback(code, response);
	}
}