import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { GameService } from './game.service';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@UseGuards(AuthGuard('jwt'))
@Controller('game')
export class GameController {
	constructor(private gameService: GameService) {}


}
