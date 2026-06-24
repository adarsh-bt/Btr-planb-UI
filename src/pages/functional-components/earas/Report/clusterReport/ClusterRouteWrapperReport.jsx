import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import mainapi from 'api/mainapi';
import LoadingScreen from 'utils/loadingscreen';

const ClusterRouteWrapperReport = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const syNo = searchParams.get('No');
  const slNo = searchParams.get('slno');

  useEffect(() => {
    const determineRoute = async () => {
      try {
        const queryZoneId = searchParams.get('zoneId');
        const token = localStorage.getItem('token');
        const zoneId = localStorage.getItem('activeZone') || queryZoneId; // Use query param zoneId if available, else fallback to localStorage
console.log(`Determining route for zoneId: ${zoneId}, syNo: ${syNo}, slNo: ${slNo}`); // Debug log
        if (!zoneId) {
          console.error('No active zone found');
          // Fallback to default route
          navigate(`/schemes/earas/cluster_manual_entry?No=${syNo}&slno=${slNo}`);
          
          return;
        }

        // Fetch BTR type for the zone
        // If query params has zoneId, use it (Admin context), else use localStorage (Field User)
      
        // Debug alert
        const activeZoneId = queryZoneId || zoneId;

        const response = await axios.get(
          `${mainapi.BTR_API}/btr-service/localbodies/${activeZoneId}/btr-type`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        const btrTypeId = response.data.btrTypeId;
      

        let targetRoute;

        // Helper to construct route based on context (Admin/Nested vs Field/Flat)
        const getRoute = (basePath, nestedPath) => {
          if (queryZoneId) {
            return `/schemes/earas/Clusters/${queryZoneId}/${nestedPath}?No=${syNo}&slno=${slNo}`;
          }
          return `/schemes/earas/${basePath}?No=${syNo}&slno=${slNo}`;
        };

        // Route based on btrTypeId
        switch (btrTypeId) {
          case 1:
            // BTR route
            targetRoute = getRoute('cluster_manual_entry', 'Manual_Entry');
            break;
          case 2:
            // Non-BTR route
            targetRoute = getRoute('cluster_manual_entry_Non_BTR', 'Manual_Entry_Non_BTR');
            break;
          case 3:
            // BTR with minor circuit route (you may need to define this route)
            targetRoute = getRoute('cluster_manual_entry', 'Manual_Entry');
            break;
          default:
            // Default fallback to original route
            targetRoute = getRoute('cluster_manual_entry', 'Manual_Entry');
        }

        navigate(targetRoute, { replace: true });

      } catch (error) {
        console.error('Error determining route:', error);
        // Fallback to default route on error
        navigate(`/schemes/earas/cluster_manual_entry?No=${syNo}&slno=${slNo}`, { replace: true });
      }
    };

    if (syNo && slNo) {
      determineRoute();
    } else {
      // Invalid parameters, redirect to clusters list or home
      navigate('/schemes/earas/cluster-seat-map', { replace: true });
    }
  }, [syNo, slNo, navigate]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '50vh'
    }}>
      <LoadingScreen message="Determining route..." />
    </div>
  );
};

export default ClusterRouteWrapperReport;
