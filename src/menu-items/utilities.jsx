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
  TableOutlined,
  EnvironmentOutlined,       // New icon for Zone Details
  ClusterOutlined            // New icon for Key Plot Generation
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
  ScissorOutlined,
  TableOutlined,
  EnvironmentOutlined,
  ClusterOutlined
};

// ==============================|| MENU ITEMS - UTILITIES ||============================== //

const utilities = {
  id: 'utilities',
  // title: 'Utilities',
  type: 'group',
  children: [
    
    {
      id: 'util-zone',
      title: 'Zone Details',
      type: 'item',
      url: '/schemes/earas/zone_details',
      icon: icons.EnvironmentOutlined
    },
    {
      id: 'util-btr',
      title: 'View e-BTR',
      type: 'item',
      url: '/schemes/earas/btr',
      icon: icons.TableOutlined
    },
    {
      id: 'util-keyplot',
      title: 'Key Plot List',
      type: 'item',
      url: '/schemes/earas/Key_plot_Listing',
      icon: icons.ClusterOutlined
    },
    {
      id: 'util-cluster',
      title: 'Cluster Formation',
      type: 'item',
      url: '/schemes/earas/clusters',
      icon: icons.DeploymentUnitOutlined
    },
    {
      id: 'util-workallocation',
      title: 'Work Allocation Report',
      type: 'item',
      url: '/workallocation',
      icon: icons.FormOutlined
    }
  ]
};

export default utilities;
