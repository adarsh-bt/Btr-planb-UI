import React from 'react';
import UserZoneDetails from './UserZoneDetails';
import AdminsZonelist from './AdminsZonelist';
import authservice from 'pages/authentication/services/authservice';

function ZoneDetailsWrapper() {
  const role = authservice.getrole();

  if (!role) return <p>No Roles Assigned so please contact admin</p>;

  // You can customize this logic based on actual roles used in your app
  if (role === 'Taluk Level Approver' || role === 'District Level Approver' || role === 'IT Admin') {
    return <AdminsZonelist />;
  }

  return <UserZoneDetails />;
}

export default ZoneDetailsWrapper;
