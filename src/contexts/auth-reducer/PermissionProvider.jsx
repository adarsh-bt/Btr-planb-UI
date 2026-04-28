// import React, { useState, useEffect } from "react";
// import { PermissionContext } from "./PermissionsContext";

// export const PermissionProvider = ({ children }) => {
//   const [permissions, setPermissions] = useState([]);
//   const [roles, setRoles] = useState([]);
//   const [schemes, setSchemes] = useState([]);

//   // Helper functions
//   const hasPermission = (permId) => permissions.includes(permId);
//   const hasRole = (roleId) => roles.includes(roleId);
//   const hasScheme = (schemeId) => schemes.includes(schemeId);

//   // Save permissions after login
//   const savePermissions = (data) => {
//     setPermissions(data.permissionIds || []);
//     setRoles(data.roleIds || []);
//     setSchemes(data.schemeIds || []);

//     localStorage.setItem("permissionsData", JSON.stringify(data));
//   };

//   // Load permissions when app starts
//   const loadFromLocalStorage = () => {
//     const saved = localStorage.getItem("permissionsData");
//     if (saved) {
//       const parsed = JSON.parse(saved);

//       setPermissions(parsed.permissionIds || []);
//       setRoles(parsed.roleIds || []);
//       setSchemes(parsed.schemeIds || []);
//     }
//   };

//   useEffect(() => {
//     loadFromLocalStorage();
//   }, []);

//   return (
//     <PermissionContext.Provider
//       value={{
//         permissions,
//         roles,
//         schemes,
//         hasPermission,
//         hasRole,
//         hasScheme,
//         savePermissions
//       }}
//     >
//       {children}
//     </PermissionContext.Provider>
//   );
// };