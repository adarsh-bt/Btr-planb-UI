import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import mainapi from 'api/mainapi';
import LoadingScreen from 'utils/loadingscreen';

const ClusterRouteWrapper = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  const syNo = searchParams.get('No');
  const slNo = searchParams.get('slno');
  
  useEffect(() => {
    const determineRoute = async () => {
      try {
        const token = localStorage.getItem('token');
        const zoneId = localStorage.getItem('activeZone');
        
        if (!zoneId) {
          console.error('No active zone found');
          // Fallback to default route
          navigate(`/schemes/earas/cluster_manual_entry?No=${syNo}&slno=${slNo}`);
          return;
        }

        // Fetch BTR type for the zone
        const response = await axios.get(
          `${mainapi.BTR_API}/btr-service/localbodies/${zoneId}/btr-type`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        const btrTypeId = response.data.btrTypeId;
        console.log('Fetched BTR Type ID:', response.data);
        // Route based on btrTypeId
        let targetRoute;
        switch (btrTypeId) {
          case 1:
            // BTR route
            targetRoute = `/schemes/earas/cluster_manual_entry?No=${syNo}&slno=${slNo}`;
            break;
          case 2:
            // Non-BTR route
            targetRoute = `/schemes/earas/cluster_manual_entry_Non_BTR?No=${syNo}&slno=${slNo}`;
            break;
          case 3:
            // BTR with minor circuit route (you may need to define this route)
            targetRoute = `/schemes/earas/cluster_manual_entry?No=${syNo}&slno=${slNo}`;
            break;
          default:
            // Default fallback to original route
            targetRoute = `/schemes/earas/cluster_manual_entry?No=${syNo}&slno=${slNo}`;
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

export default ClusterRouteWrapper;
