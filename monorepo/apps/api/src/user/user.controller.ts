import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, ParseIntPipe, Patch, Post, Req, Res, UploadedFile, UseGuards, UseInterceptors, ValidationPipe } from "@nestjs/common";
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

	@Get('id/:id')
	getUserById(@Param('id', ParseIntPipe) userId: number) {
		return this.userService.getUserById(userId);
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
		limits: {fileSize: 1000000},
		fileFilter(req, file, callback) {
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

	@Get('me/friend/requests')
	myFriendRequests(@Req() req: Request) {
		return this.userService.myFriendRequests(req.user);
	}

	// @Get('friend/:nickname')
	@Get('friend/:id')
	checkFriend(@Param('id', ParseIntPipe) userId: number, @Req() req: Request) {
		return this.userService.checkFriend(userId, req.user);
	}

	// @Post('friend/:nickname')
	@Post('friend/:id')
	addFriend(@Param('id', ParseIntPipe) userId: number, @Req() req: Request) {
		return this.userService.addFriend(userId, req.user);
	}

	// @Delete('friend/:nickname')
	@Delete('friend/:id')
	deleteFriend(@Param('id', ParseIntPipe) userId: number, @Req() req: Request) {
		return this.userService.deleteFriend(userId, req.user);
	}

	/**  BLOCK  **/
	// @Get('block/:nickname')
	@Get('block/:id')
	checkBlock(@Param('id', ParseIntPipe) userId: number, @Req() req: Request) {
		return this.userService.checkBlock(userId, req.user);
	}

	// @Post('block/:nickname')
	@Post('block/:id')
	addBlock(@Param('id', ParseIntPipe) userId: number, @Req() req: Request) {
		return this.userService.addBlock(userId, req.user);
	}

	// @Delete('block/:nickname')
	@Delete('block/:id')
	deleteBlock(@Param('id', ParseIntPipe) userId: number, @Req() req: Request) {
		return this.userService.deleteBlock(userId, req.user);
	}

	/**  MATCHES  **/
	@Get('me/matches')
	myMatches(@Req() req: Request) {
		return this.userService.myMatches(req.user);
	}

	// @Get('matches/:nickname')
	@Get('matches/:id')
	getMatches(@Param('id', ParseIntPipe) userId: number, @Req() req: Request) {
		return this.userService.getMatches(userId);
	}

	@Get('me/achievements')
	myAchievements(@Req() req: Request) {
		return this.userService.myAchievements(req.user);
	}

	@Get('achievements/:id')
	getAchievements(@Param('id', ParseIntPipe) userId: number, @Req() req: Request) {
		return this.userService.getAchievements(userId);
	}
}