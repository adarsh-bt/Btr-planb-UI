import React from 'react';
import UserZoneDetails from './UserZoneDetails';
import AdminsZonelist from './AdminsZonelist';
import authservice from 'pages/authentication/services/authservice';
import { usePermission } from 'contexts/auth-reducer/usePermission';

function ZoneDetailsWrapper() {
  const role = authservice.getrole();
const { hasPermission } = usePermission();
const { roles, hasRole } = usePermission();
  if (!role) return <p>Checking role...</p>;

  // You can customize this logic based on actual roles used in your app
  if (hasPermission(94)) {
    return <AdminsZonelist />;
  }

  return <UserZoneDetails />;
}

export default ZoneDetailsWrapper;
