
import { useParams } from 'react-router-dom';


import UserZoneDetails from './UserZoneDetails';

const ZoneDetailsWrapper = () => {
  const { zoneId } = useParams();
  return <UserZoneDetails zoneId={zoneId} />;
};

export default ZoneDetailsWrapper;
