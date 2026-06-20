import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import mainapi from 'api/mainapi';
import LoadingScreen from 'utils/loadingscreen';

const BtrClassifyWrapper = () => {
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    const determineRoute = async () => {
      try {
        const token = localStorage.getItem('token');
        const zoneId = localStorage.getItem('activeZone');

        if (!zoneId) {
          navigate('/schemes/earas/btr', { replace: true });
          return;
        }

        const resp = await axios.get(
          `${mainapi.BTR_API}/btr-service/localbodies/${zoneId}/btr-type`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const btrTypeId = resp?.data?.btrTypeId;

        let targetRoute = '/schemes/earas/btr';
        switch (btrTypeId) {
          case 1:
            targetRoute = '/schemes/earas/btr';
            break;
          case 2:
            targetRoute = '/schemes/earas/Non_btr';
            break;
          case 3:
            targetRoute = '/schemes/earas/btr';
            break;
          default:
            targetRoute = '/schemes/earas/btr';
        }

        if (!cancelled) navigate(targetRoute, { replace: true });
      } catch (e) {
        if (!cancelled) navigate('/schemes/earas/btr', { replace: true });
      }
    };

    // invoke it
    determineRoute();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
      <LoadingScreen message="Determining route..." />
    </div>
  );
};

export default BtrClassifyWrapper;
