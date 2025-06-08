// // In PermissionsContext.js
// import React, { createContext, useState } from 'react';

// export const PermissionsContext = createContext();

// export const PermissionsProvider = ({ children }) => {
//   const [permissions, setPermissions] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   return (
//     <PermissionsContext.Provider value={{ permissions, setPermissions, loading, setLoading, error, setError }}>
//       {children}
//     </PermissionsContext.Provider>
//   );
// };