import { Body, Controller, Get, Post, Query, Res } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthDto } from "./dto";

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) {}

	@Get()
	handleOAuthCallback(@Query('code') code: string, @Res() response) {
		return this.authService.handleOAuthCallback(code, response);
	}

	@Post('signup')
	signup(@Body() dto: AuthDto) {
		return this.authService.signup(dto);
	}
}