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
  UserSwitchOutlined,        
  DeliveredProcedureOutlined ,
 AppstoreOutlined,
 ProfileOutlined
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
  UserSwitchOutlined,
  DeliveredProcedureOutlined,
  AppstoreOutlined,
  ProfileOutlined
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

const ClusterFormView = {
  id: 'util-form-view',
  title: 'Form View',
  type: 'item',
  url: '/schemes/earas/Clusters_Form',
  icon: icons.DeliveredProcedureOutlined
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
  url: 'approval_manage/approvals',
  icon: icons.UsergroupAddOutlined
};

const userManagement = {
  id: 'util-usermanagement',
  title: 'User Management',
  type: 'item',
  url: '/User_Manage',
  icon: icons.UserSwitchOutlined
};


  const workallocation = {
      id: 'util-workallocation',
      title: 'Work Allocation Report',
      type: 'item',
      url: '/workallocation',
      icon: icons.FormOutlined
    };

    const cceview = {
  id: 'util-cceview',
  title: 'Crop Cutting Experiment',
  type: 'item',
  url: '/schemes/earas/cce/cceview',
  icon: icons.AppstoreOutlined
};
   const ccereport = {
  id: 'util-ccereport',
  title: 'CCE Report',
  type: 'item',
  url: '/schemes/earas/cce/CceReport',
  icon: icons.ProfileOutlined
};

// Role-based logic with fallback
if (role == 'Super Admin' ||role === 'IT Admin' || role === 'District Level Approver' || role === 'Taluk Level Approver' ) {
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
    clusterFormation,
    ClusterFormView,
    workallocation,
    cceview,
    ccereport
  );
} else {
  // Fallback for undefined/empty/other roles
  utilities.children.push(zoneDetails);
}

export default utilities;
