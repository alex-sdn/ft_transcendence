import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Patch, Post, Req, Res, UploadedFile, UseGuards, UseInterceptors, ValidationPipe } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Request, Response } from "express";
import { UserService } from "./user.service";
import { EditNicknameDto } from "./dto";
import { TwoFactorDto } from "../auth/dto";
import { FileInterceptor } from "@nestjs/platform-express";
import * as path from 'path';

@UseGuards(AuthGuard('jwt'))
@Controller('user')
export class UserController {
	constructor(private userService: UserService) {}

	@Get('me')
	getMe(@Req() req: Request) {
		return this.userService.getMe(req.user);
	}
	
	@Get('all')
	getAllUsers() {
		return this.userService.getAllUsers();
	}

	@Get(':nickname')
	getUser(@Param('nickname') nickname: string) {
		return this.userService.getUser(nickname);
	}

	@Patch('me/editNickname')
	editNickname(@Req() req: Request, @Body(new ValidationPipe()) dto: EditNicknameDto) {
		return this.userService.editNickname(req.user, dto.nickname);
	}

	/**  AVATAR  **/
	@Get('avatar/:filename')
	async getAvatar(@Param('filename') filename: string, @Res() res: Response) {
		return this.userService.getAvatar(filename, res);
	}

	@UseInterceptors(FileInterceptor('avatar', {
		dest: 'uploads/custom/',
		limits: {fileSize: 100000},       // UPDATE LATER
		fileFilter(req, file, callback) {  // MOVE ?
			const allowedFileTypes = ['.png', '.jpg', '.jpeg'];
			const extension = path.extname(file.originalname).toLowerCase();

			if (allowedFileTypes.includes(extension)) {
				// Accept the file
				callback(null, true);
			} else {
				// Reject the file
				callback(new HttpException('Only PNG and JPEG files are allowed',
					HttpStatus.UNSUPPORTED_MEDIA_TYPE), false);
			}
		},
	}))
	@Patch('me/editAvatar')
	editAvatar(@Req() req: Request, @UploadedFile() file) {
		return this.userService.editAvatar(req.user, file.filename);
	}

	/**  2FA  **/
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

	/**  FRIEND  **/
	@Get('me/friend')
	myFriends(@Req() req: Request) {
		return this.userService.myFriends(req.user);
	}

	@Post('friend/:nickname')
	addFriend(@Param('nickname') nickname: string, @Req() req: Request) {
		return this.userService.addFriend(nickname, req.user);
	}

	@Delete('friend/:nickname')
	deleteFriend(@Param('nickname') nickname: string, @Req() req: Request) {
		return this.userService.deleteFriend(nickname, req.user);
	}

	/**  BLOCK  **/
	@Post('block/:nickname')
	addBlock(@Param('nickname') nickname: string, @Req() req: Request) {
		return this.userService.addBlock(nickname, req.user);
	}

	@Delete('block/:nickname')
	deleteBlock(@Param('nickname') nickname: string, @Req() req: Request) {
		return this.userService.deleteBlock(nickname, req.user);
	}

	/**  MATCHES  **/
	@Get('me/matches')
	myMatches(@Req() req: Request) {
		return this.userService.myMatches(req.user);
	}

	@Get('matches/:nickname')
	getMatches(@Param('nickname') nickname: string, @Req() req: Request) {
		return this.userService.getMatches(nickname);
	}
}