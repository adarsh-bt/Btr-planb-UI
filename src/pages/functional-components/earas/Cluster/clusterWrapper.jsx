import { useParams } from 'react-router-dom';
import ClusterSeatMap from './cluster_order';


const clusterWrapper = () => {
  const { zoneId } = useParams();
  return <ClusterSeatMap zoneId={zoneId} />;
};

export default clusterWrapper;
