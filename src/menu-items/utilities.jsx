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
  DeliveredProcedureOutlined 
 
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
  DeliveredProcedureOutlined
};

// ==============================|| MENU ITEMS - UTILITIES ||============================== //
// ❌ REMOVE this – hooks cannot be used here
// import { usePermission } from "../contexts/auth-reducer/usePermission";


const utilities = {
  id: 'utilities',
  type: 'group',
  children: []
};

// =============================
//   MENU ITEMS WITH PERMISSION
// =============================

const viewBtr = {
  id: 'util-btr',
  title: 'View e-BTR',
  type: 'item',
  url: '/schemes/earas/btr',
  icon: icons.TableOutlined,
  permission: 1
};

const keyPlot = {
  id: 'util-keyplot',
  title: 'Key Plot List',
  type: 'item',
  url: '/schemes/earas/Key_plot_Listing',
  icon: icons.ClusterOutlined,
  permission: 96
};

const clusterFormation = {
  id: 'util-cluster',
  title: 'Cluster Formation',
  type: 'item',
  url: '/schemes/earas/clusters',
  icon: icons.DeploymentUnitOutlined,
  permission: 11
};

const ClusterFormView = {
  id: 'util-form-view',
  title: 'Form View',
  type: 'item',
  url: '/schemes/earas/Clusters_Form',
  icon: icons.DeliveredProcedureOutlined,
  permission: 17
};

const zoneDetails = {
  id: 'util-zone',
  title: 'Zone Details',
  type: 'item',
  url: '/schemes/earas/zone_details',
  icon: icons.EnvironmentOutlined,
  permission: 4
};

const userApproval = {
  id: 'util-userapproval',
  title: 'User Approval',
  type: 'item',
  url: '/approvals',
  icon: icons.UsergroupAddOutlined,
  permission: 95
};

const userManagement = {
  id: 'util-usermanagement',
  title: 'User Management',
  type: 'item',
  url: '/User_Manage',
  icon: icons.UserSwitchOutlined,
  permission: 93
};

const workallocation = {
  id: 'util-workallocation',
  title: 'Work Allocation Report',
  type: 'item',
  url: '/workallocation',
  icon: icons.FormOutlined,
  permission: 98
};

// =============================
//  PUSH ALL ITEMS (unfiltered)
// =============================

utilities.children.push(
  zoneDetails,
  viewBtr,
  keyPlot,
  clusterFormation,
  ClusterFormView,
  workallocation,
  userApproval,
  userManagement
);

export default utilities;

// const role = authservice.getrole()?.trim() ; 

// const utilities = {
//   id: 'utilities',
//   type: 'group',
//   children: []
// };

// // Define reusable menu items
// const viewBtr = {
//   id: 'util-btr',
//   title: 'View e-BTR',
//   type: 'item',
//   url: '/schemes/earas/btr',
//   icon: icons.TableOutlined,
//   permission: 1
// };

// const keyPlot = {
//   id: 'util-keyplot',
//   title: 'Key Plot List',
//   type: 'item',
//   url: '/schemes/earas/Key_plot_Listing',
//   icon: icons.ClusterOutlined
// };

// const clusterFormation = {
//   id: 'util-cluster',
//   title: 'Cluster Formation',
//   type: 'item',
//   url: '/schemes/earas/clusters',
//   icon: icons.DeploymentUnitOutlined
// };

// const ClusterFormView = {
//   id: 'util-form-view',
//   title: 'Form View',
//   type: 'item',
//   url: '/schemes/earas/Clusters_Form',
//   icon: icons.DeliveredProcedureOutlined
// };

// const zoneDetails = {
//   id: 'util-zone',
//   title: 'Zone Details',
//   type: 'item',
//   url: '/schemes/earas/zone_details',
//   icon: icons.EnvironmentOutlined
// };

// const userApproval = {
//   id: 'util-userapproval',
//   title: 'User Approval',
//   type: 'item',
//   url: '/approvals',
//   icon: icons.UsergroupAddOutlined
// };

// const userManagement = {
//   id: 'util-usermanagement',
//   title: 'User Management',
//   type: 'item',
//   url: '/User_Manage',
//   icon: icons.UserSwitchOutlined
// };


//   const workallocation = {
//       id: 'util-workallocation',
//       title: 'Work Allocation Report',
//       type: 'item',
//       url: '/workallocation',
//       icon: icons.FormOutlined
//     };

// // Role-based logic with fallback
// if (role == 'Super Admin' ||role === 'IT Admin' || role === 'District Level Approver' || role === 'Taluk Level Approver' ) {
//   utilities.children.push(
//     userApproval,
//     userManagement,
//     zoneDetails,
//     // viewBtr,
//     // keyPlot,
//     // clusterFormation
//   );
// } else if (role === 'Field Data Collector') {
//   utilities.children.push(
//     zoneDetails,
//     viewBtr,
//     keyPlot,
//     clusterFormation,
//     ClusterFormView,
//     workallocation
//   );
// } else {
//   // Fallback for undefined/empty/other roles
//   utilities.children.push(zoneDetails);
// }

// export default utilities;