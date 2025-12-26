import { Module, forwardRef } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';
import { Role } from './role.model';
import { Agent } from '../agent/agent.model';
import { CaslModule } from '../casl/casl.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Role, Agent]),
    forwardRef(() => CaslModule)
  ],
  controllers: [RoleController],
  providers: [RoleService],
  exports: [RoleService]
})
export class RoleModule {}
