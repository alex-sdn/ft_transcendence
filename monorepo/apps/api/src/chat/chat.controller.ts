import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@UseGuards(AuthGuard('jwt'))
@Controller('chat')
export class ChatController {
	constructor(private chatService: ChatService) {}

	@Get('/channels/me')
	getMyChannels(@Req() req: Request) {
		return this.chatService.getMyChannels(req.user);
	}

	@Get('/channels/all')
	getAllChannels() {
		return this.chatService.getAllChannels();
	}

	@Get('/:channel/members')
	getMembers(@Param('channel') channel: string, @Req() req: Request) {
		return this.chatService.getMembers(channel, req.user);
	}

	@Get('/:channel/messages')
	getMessages(@Param('channel') channel: string, @Req() req: Request) {
		return this.chatService.getMessages(channel, req.user);
	}

	@Get('/:nickname/privmsg')
	getPrivmessages(@Param('nickname') nickname: string, @Req() req: Request) {
		return this.chatService.getPrivmessages(nickname, req.user);
	}
}
