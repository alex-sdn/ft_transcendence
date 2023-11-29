import { Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { AuthModule } from "src/auth/auth.module";
import { ChatModule } from "src/chat/chat.module";

@Module({
	imports: [AuthModule, ChatModule],
	controllers: [UserController],
	providers: [UserService]
})
export class UserModule {}