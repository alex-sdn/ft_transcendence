import { Body, Controller, Get, Post, Query, Res } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthDto } from "./dto";

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) {}

	@Get()
	handleOAuthCallback(@Query('code') code: string) {
		return this.authService.handleOAuthCallback(code);
	}

	// Nickname selection for first login
	// @Post('signup')
	// signup(@Body() dto: AuthDto) {
	// 	return this.authService.signup(dto);
	// }

	// 2FA
	@Post('signin')
	signin(@Body() dto: any) {
		return this.authService.signin(dto);
	}
}