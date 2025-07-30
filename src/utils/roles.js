export const USER_ROLES = {
  ADMIN: 'admin',
  EDITOR: 'editor',
};

export const ROLE_PERMISSIONS = {
  [USER_ROLES.ADMIN]: {
    canManageNews: true
  },
  [USER_ROLES.EDITOR]: {
    canManageNews: true
  }
};

export const getRoleDisplayName = (role) => {
  const roleNames = {
    [USER_ROLES.ADMIN]: 'Amministratore',
    [USER_ROLES.EDITOR]: 'Editor'
  };
  return roleNames[role] || 'Utente';
};

export const hasPermission = (userRole, permission) => {
  return ROLE_PERMISSIONS[userRole]?.[permission] || false;
};