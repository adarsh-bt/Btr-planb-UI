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
 ProfileOutlined,
 BookOutlined
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
  ProfileOutlined,
  BookOutlined
};

// ==============================|| MENU ITEMS - UTILITIES ||============================== //


const role = authservice.getrole()?.trim(); // safely get and trim role

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
const earasManagement = {
  id: 'util-earasmanagement',
  title: 'Earas Management',
  type: 'item',
  url: '/schemes/earas/earas_management',
  icon: icons.DeliveredProcedureOutlined
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
  url: '/kerala_cce_report',
  icon: icons.ProfileOutlined
};

// Every signed-in user gets this entry. What they actually see behind it is decided by the
// backend from their roles, so there is no role test here: a user with no manuals assigned to
// their roles simply gets an empty list, and the management screen is offered from inside the
// page only when the server reports the User Manual Management permission.
const userManuals = {
  id: 'util-usermanuals',
  title: 'User Manuals',
  type: 'item',
  url: '/user_manuals',
  icon: icons.BookOutlined
};

// Role-based logic with fallback
if (role == 'Super Admin' ||role === 'IT Admin' || role === 'District Level Approver' || role === 'Taluk Level Approver' ) {
  utilities.children.push(
    userApproval,
    userManagement,
    zoneDetails,
    ccereport,
    userManuals
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
    ccereport,
    userManuals
  );
} else if (role === 'EARAS Admin') {
  utilities.children.push(
    zoneDetails,
    earasManagement,
    userManuals
  );
} else {
  // Fallback for undefined/empty/other roles
  utilities.children.push(zoneDetails, userManuals);
}

export default utilities;
