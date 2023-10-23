import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Request } from "express";
import { UserService } from "./user.service";
import { EditNicknameDto } from "./dto";

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

	@Patch('me/editNickname')
	editNickname(@Req() req: Request, @Body() dto: EditNicknameDto) {
		return this.userService.editNickname(req.user, dto.nickname);
	}

	// @Patch('me/editAvatar')
	// editAvatar() {}

	@Post('me/2fa')
	set2fa() { return 'set 2fa endpoint'; }

	// @Delete('me/2fa')
	// delete2fa() {}
}