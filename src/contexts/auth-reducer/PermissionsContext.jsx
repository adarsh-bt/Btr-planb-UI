import React, { createContext, useState, useEffect } from 'react';

export const PermissionsContext = createContext();

export const PermissionsProvider = ({ children }) => {
  const [permissions, setPermissions] = useState(() => {
    const saved = localStorage.getItem('permissions');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (permissions) {
      localStorage.setItem('permissions', JSON.stringify(permissions));
    } else {
      localStorage.removeItem('permissions');
    }
  }, [permissions]);

  return (
    <PermissionsContext.Provider value={{ permissions, setPermissions, loading, setLoading, error, setError }}>
      {children}
    </PermissionsContext.Provider>
  );
};
