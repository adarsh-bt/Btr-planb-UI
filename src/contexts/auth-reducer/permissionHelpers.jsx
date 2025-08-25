export function hasAnyPermission(userPermissions, requiredPermissions) {
  if (!Array.isArray(userPermissions) || !Array.isArray(requiredPermissions)) return false;
  return requiredPermissions.some(perm => userPermissions.includes(perm));
}
export function hasAllPermissions(userPermissions, requiredPermissions) {
  if (!Array.isArray(userPermissions) || !Array.isArray(requiredPermissions)) return false;
  return requiredPermissions.every(perm => userPermissions.includes(perm));
}
export function hasPermission(userPermissions, permission) {
  if (!Array.isArray(userPermissions)) return false;
  return userPermissions.includes(permission);
}

// utils/permissionHelpers.js
export function flattenPermissions(permissions) {
  if (!permissions || !permissions.schemes) return [];
  return permissions.schemes.flatMap(scheme =>
    scheme.roles.flatMap(role =>
      role.permissions
    )
  );
}

