// assets
import {
  AppstoreAddOutlined,
  AntDesignOutlined,
  FontSizeOutlined,
  LoadingOutlined,
  SplitCellsOutlined,
  PartitionOutlined,
  FormOutlined,
  DeploymentUnitOutlined,
  ScissorOutlined,
  TableOutlined  
} from '@ant-design/icons';


// icons
const icons = {
  FontSizeOutlined,
  AntDesignOutlined,
  LoadingOutlined,
  AppstoreAddOutlined,
  SplitCellsOutlined,
  PartitionOutlined,
  FormOutlined,
  DeploymentUnitOutlined,
  ScissorOutlined ,
  TableOutlined
};

// ==============================|| MENU ITEMS - UTILITIES ||============================== //

const utilities = {
  id: 'utilities',
  title: 'Utilities',
  type: 'group',
  children: [
    {
      id: 'util-typography',
      title: 'Work Allocation Report',
      type: 'item',
      url: '/typography',
      icon: icons.FormOutlined 
    },
    {
      id: 'util-color',
      title: 'Cluster Formation',
      type: 'item',
      url: '/color',
      icon: icons.DeploymentUnitOutlined
    },
    {
      id: 'util-shadow',
      title: 'Crop Cutting Experiment',
      type: 'item',
      url: '/shadow',
      icon: icons.ScissorOutlined 
    },

    {
      id: 'util-btr',
      title: 'View E-Btr',
      type: 'item',
      url: '/schemes/earas/btr',
      icon: icons.TableOutlined 
    }
  ]
};

export default utilities;
