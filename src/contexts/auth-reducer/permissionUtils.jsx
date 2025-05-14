

export const hasPermission = (permissionsData, permissionToCheck) => {
  if (!permissionsData?.schemes) return false;

  return permissionsData.schemes.some(scheme =>
    scheme.roles.some(role =>
      role.permissions.includes(permissionToCheck)
    )
  );
};
