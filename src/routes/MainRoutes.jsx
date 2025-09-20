import { lazy } from 'react';

// project import
import Loadable from 'components/Loadable';
import Dashboard from 'layout/Dashboard';
import PrivateRoute from './PrivateRoute';

const Color = Loadable(lazy(() => import('pages/component-overview/color')));
const WorkAllocation = Loadable(lazy(() => import('pages/component-overview/WorkAllocationForm')));
const Shadow = Loadable(lazy(() => import('pages/component-overview/shadows')));
const DashboardDefault = Loadable(lazy(() => import('pages/dashboard/index')));

// Schems Sub menus
const Schemes = Loadable(lazy(() => import('pages/functional-components/schemas')));

const UserManage = Loadable(lazy(() => import('pages/functional-components/usermanage')));
const RoleManage = Loadable(lazy(() => import('pages/usermanage/RoleManage')));
const DesignationManage = Loadable(lazy(() => import('pages/usermanage/DesignationManage')));

const RoleDesignation = Loadable(lazy(() => import('pages/usermanage/RoleDesignationTabs')));

// const Earas = Loadable(lazy(() => import('pages/functional-components/earas/earas_list')));
const Earas = Loadable(lazy(() => import('pages/functional-components/earas/earas_menus')));
const Zone_Details = Loadable(lazy(() => import('pages/functional-components/earas/zone_details')));
const BTR = Loadable(lazy(() => import('pages/functional-components/earas/Btr')));
const ClusterForm = Loadable(lazy(() => import('pages/functional-components/earas/cluster_form')));
const Keyplots = Loadable(lazy(() => import('pages/functional-components/earas/keyplots')));
const KeyplotListing = Loadable(lazy(() => import('pages/functional-components/earas/keyplotListing')));
const KeyPlotEntry = Loadable(lazy(() => import('pages/functional-components/earas/KeyPlotEntry')));
const KeyPlotEntryNonBtr = Loadable(lazy(() => import('pages/functional-components/earas/KeyPlotEntryNonBtr')));

const ClusterManualEntryList = Loadable(lazy(() => import('pages/functional-components/earas/ClusterManualEntryList')));

const ClusterManualEntry = Loadable(lazy(() => import('pages/functional-components/earas/ClusterManualEntry')));

const Clusters = Loadable(lazy(() => import('pages/functional-components/earas/cluster_order')));

const ZoneSettings = Loadable(lazy(() => import('pages/functional-components/earas/ZoneSettings')));
const SettingsMenu = Loadable(lazy(() => import('pages/functional-components/earas/SettingsMenu')));
const CCE_crop_selection = Loadable(lazy(() => import('pages/functional-components/earas/CceCropSelection')));

const Profile = Loadable(lazy(() => import('pages/profile/Profile')));

const RoleList = Loadable(lazy(() => import('pages/usermanage/RoleList')));
const RoleDetail = Loadable(lazy(() => import('pages/usermanage/Roles')));

// Approvels
const Approvel = Loadable(lazy(() => import('pages/functional-components/approvels/approvelist')));

const CCE_menus = Loadable(lazy(() => import('pages/functional-components/earas/cce_menus')));
const CCE_plotlist = Loadable(lazy(() => import('pages/functional-components/earas/cce_plotlist')));
const AvailableCcePlots = Loadable(lazy(() => import('pages/functional-components/form1/AvailableCcePlotsTable')));

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  element: (
    <PrivateRoute>
      <Dashboard />
    </PrivateRoute>
  ),
  children: [
    {
      path: '/',
      element: (
        <PrivateRoute>
          <DashboardDefault />
        </PrivateRoute>
      )
    },
    {
      path: 'color',
      element: (
        <PrivateRoute>
          <Color />
        </PrivateRoute>
      )
    },
    // {
    //   path: 'dashboard',
    //   children: [
    //     {
    //       path: 'default',
    //       element: (
    //         <PrivateRoute>
    //           <DashboardDefault />
    //         </PrivateRoute>
    //       ),
    //     },
    //   ],
    // },
    // Add more routes with PrivateRoute as needed
    {
      path: 'shadow',
      element: (
        <PrivateRoute>
          <Shadow />
        </PrivateRoute>
      )
    },
    {
      path: 'workallocation',
      element: (
        <PrivateRoute>
          <WorkAllocation />
        </PrivateRoute>
      )
    },
    {
      path: 'schemes',
      element: (
        <PrivateRoute>
          <Schemes />
        </PrivateRoute>
      )
    },

    {
      path: 'User_Manage',
      element: (
        <PrivateRoute>
          <UserManage />
        </PrivateRoute>
      )
    },
    {
      path: 'schemes/earas',
      element: (
        <PrivateRoute>
          <Earas />
        </PrivateRoute>
      )
    },

    {
      path: 'profile',
      element: (
        <PrivateRoute>
          <Profile />
        </PrivateRoute>
      )
    },

    {
      path: 'rolelist',
      element: (
        <PrivateRoute>
          <RoleList />
        </PrivateRoute>
      )
    },

    {
      path: 'role',
      element: (
        <PrivateRoute>
          <RoleDetail />
        </PrivateRoute>
      )
    },

    {
      path: '/rolemanage',
      element: (
        <PrivateRoute>
          <RoleManage />
        </PrivateRoute>
      )
    },
    {
      path: '/designationmanage',
      element: (
        <PrivateRoute>
          <DesignationManage />
        </PrivateRoute>
      )
    },

    {
      path: '/RoleDesignation',
      element: (
        <PrivateRoute>
          <RoleDesignation />
        </PrivateRoute>
      )
    },

    {
      path: '/schemes/earas/btr',
      element: (
        <PrivateRoute>
          <BTR />
        </PrivateRoute>
      )
    },
    {
      path: '/schemes/earas/Zone_Details',
      element: (
        <PrivateRoute>
          <Zone_Details />
        </PrivateRoute>
      )
    },
    {
      path: '/schemes/earas/cluster',
      element: (
        <PrivateRoute>
          <ClusterForm />
        </PrivateRoute>
      )
    },
    {
      path: '/schemes/earas/Key_plots',
      element: (
        <PrivateRoute>
          <Keyplots />
        </PrivateRoute>
      )
    },
    {
      path: '/schemes/earas/Key_plot_Listing',
      element: (
        <PrivateRoute>
          <KeyplotListing />
        </PrivateRoute>
      )
    },
    {
      path: '/schemes/earas/Key_plot_entry',
      element: (
        <PrivateRoute>
          <KeyPlotEntry />
        </PrivateRoute>
      )
    },
    {
      path: '/schemes/earas/Non_BTR_Key_plot_entry',
      element: (
        <PrivateRoute>
          <KeyPlotEntryNonBtr />
        </PrivateRoute>
      )
    },
    {
      path: '/schemes/earas/cluster_manual_entry',
      element: (
        <PrivateRoute>
          <ClusterManualEntry />
        </PrivateRoute>
      )
    },
    {
      path: '/schemes/earas/cluster_manual_entry_List',
      element: (
        <PrivateRoute>
          <ClusterManualEntryList />
        </PrivateRoute>
      )
    },
     {
      path: '/schemes/earas/Clusters',
      element: (
        <PrivateRoute>
          <Clusters />
        </PrivateRoute>
      )
    },
    {
      path: '/schemes/earas/CCE_crop_selection',
      element: (
        <PrivateRoute>
          <CCE_crop_selection/>
        </PrivateRoute>
      )
    },
    {
      path: '/schemes/earas/CCE_Menus',
      element: (
        <PrivateRoute>
          <CCE_menus />
        </PrivateRoute>
      )
    },
    {
      path: '/schemes/earas/CCE plotlist',
      element: (
        <PrivateRoute>
          <CCE_plotlist />
        </PrivateRoute>
      )
    },
    {
      path: '/schemes/earas/zonesettings',
      element: (
        <PrivateRoute>
          <ZoneSettings />
        </PrivateRoute>
      )
    },
    {
      path: '/schemes/earas/settings_menu',
      element: (
        <PrivateRoute>
          <SettingsMenu />
        </PrivateRoute>
      )
    },
    {
      path: '/schemes/AvailableCcePlots',
      element: (
        <PrivateRoute>
          <AvailableCcePlots />
        </PrivateRoute>
      )
    },
    {
      path: 'approvals',
      element: (
        <PrivateRoute>
          <Approvel />
        </PrivateRoute>
      )
    }
  ]
};

export default MainRoutes;
