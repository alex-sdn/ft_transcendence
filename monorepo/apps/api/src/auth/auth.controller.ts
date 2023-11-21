import { Body, Controller, Get, Post, Query, Req, Res, UseGuards } from "@nestjs/common";
import { Request } from "express";
import { AuthService } from "./auth.service";
import { TwoFactorDto } from "./dto";
import { AuthGuard } from "@nestjs/passport";

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) { }

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
	@UseGuards(AuthGuard('jwt-2fa'))
	@Post('signin/2fa')
	signin(@Req() req: Request, @Body() dto: TwoFactorDto) {
		return this.authService.signin(req.user, dto.code);
	}

	// FOR TESTING !
	@Get('generateToken')  //get token of existing user
	genToken(@Query('nickname') nickname: string) {
		return this.authService.genToken(nickname);
	}

	@Get('fakelogin')  //create new user
	fakelogin() {
		return this.authService.fakelogin();
	}
}