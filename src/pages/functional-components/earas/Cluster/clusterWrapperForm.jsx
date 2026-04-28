import { useParams } from 'react-router-dom';
import ClusterSeatMap from './cluster_order_form';


const clusterWrapperform = () => {
  const { zoneId } = useParams();
  return <ClusterSeatMap zoneId={zoneId} />;
};

export default clusterWrapperform;
