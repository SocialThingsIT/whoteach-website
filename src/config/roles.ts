export const DASHBOARD_ROLES = ['viewer', 'editor', 'admin'] as const;

export type DashboardRole = (typeof DASHBOARD_ROLES)[number];

export const ROLE_HIERARCHY: Record<DashboardRole, number> = {
  viewer: 0,
  editor: 1,
  admin: 3,
};

export const ROLE_PERMISSIONS: Record<DashboardRole, string[]> = {
  viewer: ['articles:read', 'profile:read'],
  editor: ['articles:read', 'articles:create', 'articles:update', 'profile:read', 'profile:update'],
  admin: ['*'], // tutti i permessi
};

export function hasPermission(userRole: DashboardRole, permission: string): boolean {
  const permissions = ROLE_PERMISSIONS[userRole] || [];
  return permissions.includes('*') || permissions.includes(permission);
}

export function hasRoleAccess(userRole: DashboardRole, requiredRole: DashboardRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}
