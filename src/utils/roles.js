export const USER_ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student'
};

export const ROLE_PERMISSIONS = {
  [USER_ROLES.ADMIN]: {
    canManageUsers: true,
    canCreateCourses: true,
    canEditAllContent: true,
    canViewAnalytics: true,
    canAccessAdminPanel: true
  },
  [USER_ROLES.TEACHER]: {
    canManageUsers: false,
    canCreateCourses: true,
    canEditAllContent: false,
    canViewAnalytics: true,
    canAccessAdminPanel: false
  },
  [USER_ROLES.STUDENT]: {
    canManageUsers: false,
    canCreateCourses: false,
    canEditAllContent: false,
    canViewAnalytics: false,
    canAccessAdminPanel: false
  }
};

export const getRoleDisplayName = (role) => {
  const roleNames = {
    [USER_ROLES.ADMIN]: 'Amministratore',
    [USER_ROLES.TEACHER]: 'Insegnante',
    [USER_ROLES.STUDENT]: 'Studente'
  };
  return roleNames[role] || 'Utente';
};

export const hasPermission = (userRole, permission) => {
  return ROLE_PERMISSIONS[userRole]?.[permission] || false;
};