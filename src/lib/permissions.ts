export const PERMISSIONS = [
  'users:read',
  'users:write',
  'users:delete',
  'teams:manage',
  'teams:delete',
  'locations:manage',
  'locations:delete',
  'od:manage',
  'news:create',
  'news:delete',
  'catalog:manage',
  'settings:manage',
  'sudo:required',
  'credits:manage',
  'addons:manage',
  'prices:manage',
] as const;

export type Permission = typeof PERMISSIONS[number];

export const ROLE_PERMISSIONS: Record<string, ReadonlySet<Permission>> = {
  ADMIN: new Set(PERMISSIONS), // ADMIN receives all permissions
  OD_MANAGER: new Set([
  'users:read',
  'users:write',
  'users:delete',
  'teams:manage',
  'teams:delete',
  'locations:manage',
  'locations:delete',
  'od:manage',
  'news:create',
  'news:delete',
  ]),
  LOCATION_MANAGER: new Set([
  'users:read',
  'users:write',
  'users:delete',
  'teams:manage',
  'teams:delete',
  'locations:manage',
  'news:create',
  'news:delete',
  ]),
  TEAM_LEADER: new Set([
  'teams:manage',
  'news:create',
  'news:delete',
  ]),
  USER: new Set([
  ]),
};

/**
 * Verifies whether a given role possesses a specific granular permission.
 */
export function hasPermission(
  role: string | undefined | null,
  permission: Permission,
  isEditor?: boolean,
): boolean {
  if (!role) return false;

  // Bridge isEditor flag to catalog permissions
  if (isEditor && [
 'catalog:manage',
'prices:manage',
'addons:manage',
'credits:manage',
].includes(permission)) {
    return true;
  }

  const perms = ROLE_PERMISSIONS[role];
  if (!perms) return false;
  return perms.has(permission);
}

