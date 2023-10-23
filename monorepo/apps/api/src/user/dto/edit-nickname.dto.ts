import { IsNotEmpty, IsString } from "class-validator";

export class EditNicknameDto {
	@IsString()
	@IsNotEmpty()
	nickname: string;
}