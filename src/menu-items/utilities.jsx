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
      id: 'util-btr',
      title: 'View E-BTR',
      type: 'item',
      url: '/schemes/earas/btr',
      icon: icons.TableOutlined
    },
    {
      id: 'util-zone',
      title: 'Zone Details',
      type: 'item',
      url: '/schemes/earas/zone_details',
      icon: icons.EnvironmentOutlined
    },
    {
      id: 'util-keyplot',
      title: 'Key Plot Generation',
      type: 'item',
      url: '/schemes/earas/keyplots',
      icon: icons.ClusterOutlined
    },
    {
      id: 'util-cluster',
      title: 'Cluster Formation',
      type: 'item',
      url: '/schemes/earas/cluster',
      icon: icons.DeploymentUnitOutlined
    },
    {
      id: 'util-typography',
      title: 'Work Allocation Report',
      type: 'item',
      url: '/typography',
      icon: icons.FormOutlined
    }
  ]
};

export default utilities;
