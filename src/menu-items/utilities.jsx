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
  ClusterOutlined ,    
   UsergroupAddOutlined,
  UserSwitchOutlined        // New icon for Key Plot Generation
 
} from '@ant-design/icons';
import authservice from 'pages/authentication/services/authservice';

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
  ClusterOutlined,
   UsergroupAddOutlined,
  UserSwitchOutlined ,



};

// ==============================|| MENU ITEMS - UTILITIES ||============================== //


const role = authservice.getrole()?.trim() ; // safely get and trim role

const utilities = {
  id: 'utilities',
  type: 'group',
  children: []
};

// Define reusable menu items
const viewBtr = {
  id: 'util-btr',
  title: 'View e-BTR',
  type: 'item',
  url: '/schemes/earas/btr',
  icon: icons.TableOutlined
};

const keyPlot = {
  id: 'util-keyplot',
  title: 'Key Plot List',
  type: 'item',
  url: '/schemes/earas/Key_plot_Listing',
  icon: icons.ClusterOutlined
};

const clusterFormation = {
  id: 'util-cluster',
  title: 'Cluster Formation',
  type: 'item',
  url: '/schemes/earas/clusters',
  icon: icons.DeploymentUnitOutlined
};

const zoneDetails = {
  id: 'util-zone',
  title: 'Zone Details',
  type: 'item',
  url: '/schemes/earas/zone_details',
  icon: icons.EnvironmentOutlined
};

const userApproval = {
  id: 'util-userapproval',
  title: 'User Approval',
  type: 'item',
  url: '/approvals',
  icon: icons.UsergroupAddOutlined
};

const userManagement = {
  id: 'util-usermanagement',
  title: 'User Management',
  type: 'item',
  url: '/rolelist',
  icon: icons.UserSwitchOutlined
};


   // {
    //   id: 'util-workallocation',
    //   title: 'Work Allocation Report',
    //   type: 'item',
    //   url: '/workallocation',
    //   icon: icons.FormOutlined
    // }

// Role-based logic with fallback
if (role === 'IT Admin' || role === 'District Level Approver') {
  utilities.children.push(
    userApproval,
    userManagement,
    zoneDetails,
    // viewBtr,
    // keyPlot,
    // clusterFormation
  );
} else if (role === 'Field Data Collector') {
  utilities.children.push(
    zoneDetails,
    viewBtr,
    keyPlot,
    clusterFormation
  );
} else {
  // Fallback for undefined/empty/other roles
  utilities.children.push(zoneDetails);
}

export default utilities;
