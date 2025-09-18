import React, { useEffect, useContext } from 'react';
import { PermissionsContext } from './PermissionsContext';
import authservice from 'pages/authentication/services/authservice';

export default function PermissionsLoader({ children }) {
  const { permissions, setPermissions, setLoading, setError } = useContext(PermissionsContext);

  useEffect(() => {
    if (!permissions) {
      const token = localStorage.getItem('token');
      if (token) {
        setLoading(true);
        authservice.fetchPermissions(token)
          .then(data => {
            setPermissions(data);
            setLoading(false);
          })
          .catch(err => {
            setError(err.message);
            setLoading(false);
          });
      }
    }
  }, [permissions, setPermissions, setLoading, setError]);

  return children;
}
