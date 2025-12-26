import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { AcdService } from './acd.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ConversationModule } from '../conversation/conversation.module';
import { MessageModule } from '../message/message.module';
import { RedisModule } from '../common/redis/redis.module';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
    ConversationModule,
    MessageModule,
    RedisModule
  ],
  providers: [ChatGateway, AcdService],
})
export class ChatModule {}
