import { useParams } from 'react-router-dom';
import KeyPlot from './keyplots';


const keyplotsWrapper = () => {
  const { zoneId } = useParams();
  return <KeyPlot zoneId={zoneId} />;
};

export default keyplotsWrapper;
