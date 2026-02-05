import React, { createContext, useContext, useState, useEffect } from "react";

const PermissionContext = createContext(null);

export const PermissionProvider = ({ children }) => {
  const [permissions, setPermissions] = useState([]); // permission IDs
  const [roles, setRoles] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load from localStorage on refresh
  useEffect(() => {
    const stored = localStorage.getItem("user_permissions");
    if (stored) {
      const parsed = JSON.parse(stored);
      setPermissions(parsed.permissions || []);
      setRoles(parsed.roles || []);
      setSchemes(parsed.schemes || []);
    }
    setLoading(false);
  }, []);

  const savePermissions = (apiResponse) => {
    /**
     * Normalize API RESPONSE
     */
    const permissionIds = new Set();
    const roleNames = new Set();
    const schemeNames = new Set();

    apiResponse?.schemes?.forEach((scheme) => {
      schemeNames.add(scheme.schemeName);

      scheme.roles.forEach((role) => {
        roleNames.add(role.roleName);

        role.permissions.forEach((perm) => {
          if (perm.isActive) {
            permissionIds.add(perm.id);
          }
        });
      });
    });

    const normalized = {
      permissions: Array.from(permissionIds),
      roles: Array.from(roleNames),
      schemes: Array.from(schemeNames),
    };

    // Save in memory
    setPermissions(normalized.permissions);
    setRoles(normalized.roles);
    setSchemes(normalized.schemes);

    // Save in localStorage
    localStorage.setItem("user_permissions", JSON.stringify(normalized));
  };

  const hasPermission = (permissionId) =>
    permissions.includes(permissionId);

  const hasRole = (roleName) =>
    roles.includes(roleName);

  const hasScheme = (schemeName) =>
    schemes.includes(schemeName);

  return (
    <PermissionContext.Provider
      value={{
        permissions,
        roles,
        schemes,
        hasPermission,
        hasRole,
        hasScheme,
        savePermissions,
        loading,
      }}
    >
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermissionContext = () => {
  const ctx = useContext(PermissionContext);
  if (!ctx) {
    throw new Error("usePermissionContext must be used inside PermissionProvider");
  }
  return ctx;
};
