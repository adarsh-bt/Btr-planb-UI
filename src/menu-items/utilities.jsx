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
  ScissorOutlined  
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
  ScissorOutlined 
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
      url: '/dashboard/typography',
      icon: icons.FormOutlined 
    },
    {
      id: 'util-color',
      title: 'Cluster Formation',
      type: 'item',
      url: '/dashboard/color',
      icon: icons.DeploymentUnitOutlined
    },
    {
      id: 'util-shadow',
      title: 'Crop Cutting Experiment',
      type: 'item',
      url: '/dashboard/shadow',
      icon: icons.ScissorOutlined 
    }
  ]
};

export default utilities;
