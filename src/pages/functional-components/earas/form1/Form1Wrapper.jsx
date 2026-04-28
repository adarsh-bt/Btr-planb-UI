import { useParams } from 'react-router-dom';
import ClusterSeatMap from './cluster_order';


const formWrapper = () => {
  const { zoneId } = useParams();
  return <ClusterSeatMap zoneId={zoneId} />;
};

export default formWrapper;
