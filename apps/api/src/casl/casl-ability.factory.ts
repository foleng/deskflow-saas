import { AbilityBuilder, PureAbility, AbilityClass, ExtractSubjectType, InferSubjects, Ability } from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { Agent } from '../agent/agent.model';
import { Role } from '../role/role.model';
import { RoleService } from '../role/role.service';

export enum Action {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}

export type Subjects = InferSubjects<typeof Agent | typeof Role> | 'all' | 'Agent' | 'Role';

export type AppAbility = Ability<[Action, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
  constructor(private roleService: RoleService) {}

  async createForUser(user: Agent) {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(Ability as AbilityClass<AppAbility>);

    const userRole = await this.roleService.findByName(user.role);

    if (userRole) {
        // Apply permissions from DB
        userRole.permissions.forEach(permission => {
            let subject: any = permission.subject;
            if (subject === 'Agent') subject = Agent;
            if (subject === 'Role') subject = Role;
            
            can(permission.action as Action, subject);
        });
    } else {
        // Fallback for safety (e.g. if role deleted but user still has it)
        can(Action.Read, 'all');
    }

    // Always allow user to update their own profile
    can(Action.Update, Agent, { id: user.id });

    // console.log('User Role:', user.role);
    // console.log('Permissions:', userRole?.permissions);

    return build({
      // Read https://casl.js.org/v6/en/guide/subject-type-detection#use-classes-as-subject-types for details
      detectSubjectType: (item) => {
          if (typeof item === 'string') return item;
          // If item is a Class (function), return it directly
          if (typeof item === 'function') return item as any;
          return item.constructor as ExtractSubjectType<Subjects>;
      },
    });
  }
}
