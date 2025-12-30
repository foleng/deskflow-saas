import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { AgentModule } from './agent/agent.module';
import { ChatModule } from './chat/chat.module';
import { UploadModule } from './upload/upload.module';
import { ConversationModule } from './conversation/conversation.module';
import { RedisModule } from './common/redis/redis.module';
import { StatsModule } from './stats/stats.module';

import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { RoleModule } from './role/role.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // MySQL Connection
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        dialect: 'mysql',
        host: configService.get<string>('MYSQL_HOST'),
        port: parseInt(configService.get<string>('MYSQL_PORT') || '3306', 10),
        username: configService.get<string>('MYSQL_USER'),
        password: configService.get<string>('MYSQL_PASS'),
        database: configService.get<string>('MYSQL_DB'),
        autoLoadModels: true,
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    // MongoDB Connection
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    AgentModule,
    ChatModule,
    UploadModule,
    ConversationModule,
    RedisModule,
    RoleModule,
    StatsModule,
  ],
})
export class AppModule {}
