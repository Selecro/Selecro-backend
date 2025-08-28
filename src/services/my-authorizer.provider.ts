// src/services/my-authorizer.provider.ts
import {
  AuthorizationContext,
  AuthorizationDecision,
  AuthorizationMetadata,
  Authorizer,
} from '@loopback/authorization';
import {Provider} from '@loopback/core';
import {repository} from '@loopback/repository';
import {securityId} from '@loopback/security';
import {
  PermissionRepository,
  RolePermissionRepository,
  RoleRepository,
  UserRepository,
  UserRoleRepository
} from '../repositories'; // Adjust path as needed

export class MyAuthorizerProvider implements Provider<Authorizer> {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
    @repository(UserRoleRepository)
    public userRoleRepository: UserRoleRepository,
    @repository(RoleRepository)
    public roleRepository: RoleRepository,
    @repository(RolePermissionRepository)
    public rolePermissionRepository: RolePermissionRepository,
    @repository(PermissionRepository)
    public permissionRepository: PermissionRepository,
  ) { }

  value(): Authorizer {
    return this.authorize.bind(this);
  }

  async authorize(
    authorizationCtx: AuthorizationContext,
    metadata: AuthorizationMetadata,
  ): Promise<AuthorizationDecision> {
    const client = authorizationCtx.principals[0]; // The authenticated user profile

    if (!client || !client[securityId]) {
      return AuthorizationDecision.DENY; // No authenticated user
    }

    const userId = parseInt(client[securityId]); // Assuming your user ID is a number (pgId)

    // 1. Get roles for the authenticated user
    const userRoles = await this.userRoleRepository.find({
      where: {userId: userId},
      include: [{relation: 'role'}], // Assuming you have a relation defined in UserRole model
    });

    const roles = await this.roleRepository.find({
      where: {
        id: {
          inq: userRoles.map(userRole => userRole.roleId)
        }
      }
    },
    );

    // If no roles, deny access
    if (roles.length === 0) {
      return AuthorizationDecision.DENY;
    }

    // 2. Check if the user has any of the allowed roles specified in @authorize decorator
    if (metadata.allowedRoles && metadata.allowedRoles.length > 0) {
      const hasAllowedRole = roles.some(role => metadata.allowedRoles!.includes(role.name));
      if (!hasAllowedRole) {
        console.log(`User ${client.username} (ID: ${userId}) does not have required roles.`);
        return AuthorizationDecision.DENY;
      }
    }

    // 3. Check for specific permissions (if specified in metadata.scopes)
    // This is where your custom Permission table logic comes in
    if (metadata.scopes && metadata.scopes.length > 0) {
      const requiredPermissionString = metadata.scopes[0]; // Assuming one scope per decorator
      // Example: 'User.read', 'File.write'
      const [resourceTypeStr, actionTypeStr] = requiredPermissionString.split('.');

      if (!resourceTypeStr || !actionTypeStr) {
        console.warn(`Invalid permission scope format: ${requiredPermissionString}`);
        return AuthorizationDecision.DENY;
      }

      const resourceType = resourceTypeStr as any;
      const actionType = actionTypeStr as any;

      // Find the permission ID for the required resource and action
      const permission = await this.permissionRepository.findOne({
        where: {
          resourceType: resourceType,
          actionType: actionType,
        },
      });

      if (!permission) {
        console.log(`Required permission ${requiredPermissionString} not found in DB.`);
        return AuthorizationDecision.DENY;
      }

      // Find all role-permission mappings for the user's roles
      const rolePermissions = await this.rolePermissionRepository.find({
        where: {
          roleId: {inq: userRoles.map(ur => ur.roleId)},
          permissionId: permission.id,
        },
      });

      if (rolePermissions.length === 0) {
        console.log(`User ${client.username} (ID: ${userId}) lacks permission ${requiredPermissionString}.`);
        return AuthorizationDecision.DENY;
      }
    }

    // If all checks pass, allow access
    return AuthorizationDecision.ALLOW;
  }
}
