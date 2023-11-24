import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { Member, User } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class GameService {
	constructor(private prisma: PrismaService) {}

	/******************************************************************************
	*                              UPDATE PROFILES                                *
	******************************************************************************/


}