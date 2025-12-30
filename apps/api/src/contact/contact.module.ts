import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Contact } from './contact.model';
import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';

@Module({
  imports: [SequelizeModule.forFeature([Contact])],
  controllers: [ContactController],
  providers: [ContactService],
  exports: [ContactService],
})
export class ContactModule {}
