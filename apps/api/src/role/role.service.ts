import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Role } from './role.model';
import { Agent } from '../agent/agent.model';
import { Action } from '../casl/casl-ability.factory';

@Injectable()
export class RoleService implements OnModuleInit {
  constructor(
    @InjectModel(Role)
    private roleModel: typeof Role,
    @InjectModel(Agent)
    private agentModel: typeof Agent,
  ) {}

  async onModuleInit() {
    await this.seedRoles();
  }

  async seedRoles() {
    const adminRole = await this.roleModel.findOne({ where: { name: 'admin' } });
    const adminPermissions = [{ action: Action.Manage, subject: 'all' }];

    if (!adminRole) {
      await this.roleModel.create({
        name: 'admin',
        description: 'System Administrator',
        permissions: adminPermissions,
      });
      console.log('Seeded admin role');
    } else {
      // Ensure admin always has full permissions
      await this.roleModel.update(
        { permissions: adminPermissions },
        { where: { name: 'admin' } }
      );
      console.log('Updated admin role permissions');
    }

    const agentRole = await this.roleModel.findOne({ where: { name: 'agent' } });
    if (!agentRole) {
      await this.roleModel.create({
        name: 'agent',
        description: 'Support Agent',
        permissions: [
          { action: Action.Read, subject: 'all' },
          { action: Action.Update, subject: 'Agent' }, 
        ],
      });
      console.log('Seeded agent role');
    }
  }

  async findAll() {
    return this.roleModel.findAll();
  }

  async create(role: Partial<Role>) {
    return this.roleModel.create(role);
  }

  async update(id: number, role: Partial<Role>) {
    const existingRole = await this.roleModel.findByPk(id);
    if (!existingRole) {
      throw new Error('Role not found');
    }

    // If name is changing, update all agents with this role
    if (role.name && role.name !== existingRole.name) {
       // Prevent renaming system roles
       if (existingRole.name === 'admin' || existingRole.name === 'agent') {
           throw new Error('Cannot rename system roles');
       }
       await this.agentModel.update({ role: role.name }, { where: { role: existingRole.name } });
    }

    await this.roleModel.update(role, { where: { id } });
    return this.roleModel.findByPk(id);
  }

  async delete(id: number) {
    const role = await this.roleModel.findByPk(id);
    if (role && (role.name === 'admin' || role.name === 'agent')) {
        throw new Error('Cannot delete system roles');
    }
    return this.roleModel.destroy({ where: { id } });
  }

  async findByName(name: string) {
    return this.roleModel.findOne({ where: { name } });
  }
}
