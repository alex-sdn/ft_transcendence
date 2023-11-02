import { Controller, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('chat')
export class ChatController {
	constructor(private chatService: ChatService) {}

	// truc
}
