
import { useParams } from 'react-router-dom';
import BTR from './BtrListing';

const BTRWrapper = () => {
  const { zoneId } = useParams();
  return <BTR zoneId={zoneId} />;
};

export default BTRWrapper;
