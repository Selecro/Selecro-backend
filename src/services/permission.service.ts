import {injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {
  PermissionRepository,
  RolePermissionRepository,
  UserRoleRepository,
} from '../repositories';

@injectable()
export class PermissionService {
  constructor(
    @repository(UserRoleRepository)
    public userRoleRepository: UserRoleRepository,
    @repository(RolePermissionRepository)
    public rolePermissionRepository: RolePermissionRepository,
    @repository(PermissionRepository)
    public permissionRepository: PermissionRepository,
  ) {}

  async checkPermissions(
    userId: number,
    requiredPermissions: string[],
  ): Promise<boolean> {
    const userRoles = await this.userRoleRepository.find({where: {userId}});
    if (userRoles.length === 0) {
      return false;
    }

    const roleIds = userRoles.map(ur => ur.roleId);
    const rolePermissions = await this.rolePermissionRepository.find({
      where: {roleId: {inq: roleIds}},
    });
    const permissionIds = rolePermissions.map(rp => rp.permissionId);

    if (permissionIds.length === 0) {
      return false;
    }

    const parsedPermissions = requiredPermissions.map(perm => {
      const [resourceType, actionType] = perm.split('.');
      return {resourceType: resourceType, actionType: actionType};
    });

    const permissions = await this.permissionRepository.find({
      where: {
        id: {inq: permissionIds},
        or: parsedPermissions,
        deleted: false,
      },
    });

    return permissions.length > 0;
  }
}
