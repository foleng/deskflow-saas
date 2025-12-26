import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { RoleService } from './role.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PoliciesGuard } from '../casl/policies.guard';
import { CheckPolicies, Action } from '../casl/check-policies.decorator';
import { AppAbility } from '../casl/casl-ability.factory';
import { Role } from './role.model';

@Controller('api/roles')
@UseGuards(JwtAuthGuard, PoliciesGuard)
export class RoleController {
  constructor(private roleService: RoleService) {}

  @Get()
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, Role)) // Assuming Role is a subject
  async findAll() {
    return this.roleService.findAll();
  }

  @Post()
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Create, Role))
  async create(@Body() role: Partial<Role>) {
    return this.roleService.create(role);
  }

  @Put(':id')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, Role))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() role: Partial<Role>,
  ) {
    return this.roleService.update(id, role);
  }

  @Delete(':id')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, Role))
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.roleService.delete(id);
  }
}
