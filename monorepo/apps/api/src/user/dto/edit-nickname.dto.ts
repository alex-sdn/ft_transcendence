import { IsNotEmpty, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class EditNicknameDto {
	@IsString()
	@IsNotEmpty()
	@MinLength(2)   // 4 ?
	@MaxLength(20)
	@Matches(/^[a-zA-Z0-9_-]*$/, { message: 'Nickname can only contain letters, numbers, hyphens, and underscores.' })
	nickname: string;
}