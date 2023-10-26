import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Request } from "express";
import { UserService } from "./user.service";
import { EditNicknameDto } from "./dto";
import { TwoFactorDto } from "../auth/dto";
import { FileInterceptor } from "@nestjs/platform-express";

@UseGuards(AuthGuard('jwt'))
@Controller('user')
export class UserController {
	constructor(private userService: UserService) {}

	@Get('me')
	getMe(@Req() req: Request) {
		return req.user;
		//chercher le user dans la base de donnees a partir de l'uuid et le retourner en tant qu'objet (attention a pas renvoyer psswrd)
	}

	@Get(':nickname')
	getUser(@Param('nickname') nickname: string) {
		return this.userService.getUser(nickname);
	}

	@Patch('me/editNickname')
	editNickname(@Req() req: Request, @Body() dto: EditNicknameDto) {
		return this.userService.editNickname(req.user, dto.nickname);
	}

	@UseInterceptors(FileInterceptor('avatar'))
	@Patch('me/editAvatar')
	editAvatar(@Req() req: Request, @UploadedFile() file) {
		return this.userService.editAvatar(req.user, file.buffer);
	}

	@Post('me/edit2fa')
	generate2fa(@Req() req: Request) {
		// Generate secret and return QR code
		return this.userService.generate2fa(req.user);
	}

	@Post('me/activate2fa')
	activate2fa(@Req() req: Request, @Body() dto: TwoFactorDto) {
		// Receive code and compare to newly generated secret
		return this.userService.activate2fa(req.user, dto.code);
	}

	@Delete('me/edit2fa')
	delete2fa(@Req() req: Request) {
		return this.userService.delete2fa(req.user);
	}

}