import { IsNotEmpty } from "class-validator";

export class AuthDto {
	@IsNotEmpty()
	nickname: string;
}