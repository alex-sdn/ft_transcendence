import { Controller, Get, Param, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Request } from "express";
import { UserService } from "./user.service";

@UseGuards(AuthGuard('jwt'))
@Controller('user')
export class UserController {
	constructor(private userService: UserService) {}

	@Get('me')
	getMe(@Req() req: Request) {
		return req.user;
	}

	@Get(':nickname')
	getUser(@Param('nickname') nickname: string) {
		return this.userService.getUser(nickname);
	}

	//add patch requests ? (nickname / avatar / 2fa)
}