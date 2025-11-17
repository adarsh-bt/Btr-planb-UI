import mainapi from 'api/mainapi';
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

// Create the context
const UserAccessContext = createContext();

// Custom hook to use the context with error handling
export const useUserAccess = () => {
  const context = useContext(UserAccessContext);
  if (!context) {
    throw new Error('useUserAccess must be used within a UserAccessProvider');
  }
  return context;
};

// Provider component
export const UserAccessProvider = ({ children }) => {
  const [userAccessData, setUserAccessData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user access data
  // Fetch user access data
const fetchUserAccess = useCallback(async () => {
  try {
    setLoading(true);
    setError(null);
    
    // Get token from localStorage
    const token = localStorage.getItem('token');
    console.log('Token from localStorage:', token);
    const BASE_URL = mainapi.BASE_URL
    const response = await fetch(`${BASE_URL}/user-access/user-state/user-permissions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Add JWT token if it exists
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    if (!response.ok) {
      throw new Error(`Failed to fetch user permissions: ${response.status}`);
    }

    // Only call response.json() once!
    const data = await response.json();
    console.log('API Response data:', data);
    
    setUserAccessData(data);
  } catch (err) {
    setError(err.message);
    console.error('Error fetching user access data:', err);
  } finally {
    setLoading(false);
  }
}, []);


  // Fetch data on component mount
  useEffect(() => {
    fetchUserAccess();
  }, [fetchUserAccess]);

  // Helper function to check if user has a specific permission
  const hasPermission = useCallback((permissionId, schemeId = null, roleId = null) => {
    if (!userAccessData || !userAccessData.schemes) return false;

    // If scheme is specified, check only that scheme
    if (schemeId) {
      const scheme = userAccessData.schemes.find(s => s.schemeId === schemeId);
      if (!scheme) return false;

      // If role is specified, check only that role
      if (roleId) {
        const role = scheme.roles.find(r => r.roleId === roleId);
        if (!role) return false;
        
        return role.permissions.some(p => p.id === permissionId && p.isActive);
      }

      // Check all roles in the scheme
      return scheme.roles.some(role => 
        role.permissions.some(p => p.id === permissionId && p.isActive)
      );
    }

    // Check all schemes
    return userAccessData.schemes.some(scheme =>
      scheme.roles.some(role =>
        role.permissions.some(p => p.id === permissionId && p.isActive)
      )
    );
  }, [userAccessData]);

  // Helper function to check if user has a specific permission by name
  const hasPermissionByName = useCallback((permissionName, schemeId = null, roleId = null) => {
    if (!userAccessData || !userAccessData.schemes) return false;

    // If scheme is specified, check only that scheme
    if (schemeId) {
      const scheme = userAccessData.schemes.find(s => s.schemeId === schemeId);
      if (!scheme) return false;

      // If role is specified, check only that role
      if (roleId) {
        const role = scheme.roles.find(r => r.roleId === roleId);
        if (!role) return false;
        
        return role.permissions.some(p => p.permissionName === permissionName && p.isActive);
      }

      // Check all roles in the scheme
      return scheme.roles.some(role => 
        role.permissions.some(p => p.permissionName === permissionName && p.isActive)
      );
    }

    // Check all schemes
    return userAccessData.schemes.some(scheme =>
      scheme.roles.some(role =>
        role.permissions.some(p => p.permissionName === permissionName && p.isActive)
      )
    );
  }, [userAccessData]);

  // Helper function to check if user has a specific role
  const hasRole = useCallback((roleId, schemeId = null) => {
    if (!userAccessData || !userAccessData.schemes) return false;

    if (schemeId) {
      const scheme = userAccessData.schemes.find(s => s.schemeId === schemeId);
      return scheme ? scheme.roles.some(r => r.roleId === roleId) : false;
    }

    return userAccessData.schemes.some(scheme =>
      scheme.roles.some(r => r.roleId === roleId)
    );
  }, [userAccessData]);

  // Helper function to get all permissions for a user
  const getAllPermissions = useCallback((schemeId = null, roleId = null) => {
    if (!userAccessData || !userAccessData.schemes) return [];

    let allPermissions = [];

    if (schemeId) {
      const scheme = userAccessData.schemes.find(s => s.schemeId === schemeId);
      if (!scheme) return [];

      if (roleId) {
        const role = scheme.roles.find(r => r.roleId === roleId);
        if (!role) return [];
        
        allPermissions = role.permissions.filter(p => p.isActive);
      } else {
        scheme.roles.forEach(role => {
          allPermissions.push(...role.permissions.filter(p => p.isActive));
        });
      }
    } else {
      userAccessData.schemes.forEach(scheme => {
        scheme.roles.forEach(role => {
          allPermissions.push(...role.permissions.filter(p => p.isActive));
        });
      });
    }

    // Remove duplicates based on permission id
    return allPermissions.filter((permission, index, self) =>
      index === self.findIndex(p => p.id === permission.id)
    );
  }, [userAccessData]);

  // Helper function to get user schemes
  const getSchemes = useCallback(() => {
    return userAccessData?.schemes || [];
  }, [userAccessData]);

  // Helper function to get user roles for a specific scheme
  const getRoles = useCallback((schemeId) => {
    if (!userAccessData || !userAccessData.schemes) return [];
    
    const scheme = userAccessData.schemes.find(s => s.schemeId === schemeId);
    return scheme ? scheme.roles : [];
  }, [userAccessData]);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    // userAccessData,
    loading,
    error,
    refetch: fetchUserAccess,
    hasPermission,
    hasPermissionByName,
    hasRole,
    getAllPermissions,
    getSchemes,
    getRoles,
  }), [
    // userAccessData,
    loading,
    error,
    fetchUserAccess,
    hasPermission,
    hasPermissionByName,
    hasRole,
    getAllPermissions,
    getSchemes,
    getRoles,
  ]);

  return (
    <UserAccessContext.Provider value={contextValue}>
      {children}
    </UserAccessContext.Provider>
  );
};

// Additional custom hooks for specific use cases
export const usePermissionCheck = (permissionId, schemeId = null, roleId = null) => {
  const { hasPermission } = useUserAccess();
  return hasPermission(permissionId, schemeId, roleId);
};

export const usePermissionByName = (permissionName, schemeId = null, roleId = null) => {
  const { hasPermissionByName } = useUserAccess();
  return hasPermissionByName(permissionName, schemeId, roleId);
};

export const useRoleCheck = (roleId, schemeId = null) => {
  const { hasRole } = useUserAccess();
  return hasRole(roleId, schemeId);
};

// Higher-order component for permission-based rendering
export const withPermission = (permissionId, schemeId = null, roleId = null) => {
  return (WrappedComponent) => {
    return (props) => {
      const { hasPermission } = useUserAccess();
      
      if (!hasPermission(permissionId, schemeId, roleId)) {
        return null; // or return a "No Permission" component
      }
      
      return <WrappedComponent {...props} />;
    };
  };
};

// Component for conditional rendering based on permissions
export const PermissionGate = ({ 
  permissionId, 
  permissionName,
  schemeId = null, 
  roleId = null, 
  children, 
  fallback = null 
}) => {
  const { hasPermission, hasPermissionByName } = useUserAccess();
  
  const hasRequiredPermission = permissionId 
    ? hasPermission(permissionId, schemeId, roleId)
    : hasPermissionByName(permissionName, schemeId, roleId);
  
  return hasRequiredPermission ? children : fallback;
};
