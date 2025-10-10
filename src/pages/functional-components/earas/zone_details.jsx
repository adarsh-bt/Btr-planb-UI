import React from 'react';
import UserZoneDetails from './userzonedetails';
import AdminsZonelist from './AdminsZonelist';
import authservice from 'pages/authentication/services/authservice';

function ZoneDetailsWrapper() {
  const role = authservice.getrole();

  if (!role) return <p>Checking role...</p>;

  // You can customize this logic based on actual roles used in your app
  if (role === 'Taluk Level Approver' || role === "IT Admin" || role === "District Level Approver") {
    return <AdminsZonelist />;
  }

  return <UserZoneDetails />;
}

export default ZoneDetailsWrapper;
