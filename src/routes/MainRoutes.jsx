import { lazy } from 'react';

// project import
import Loadable from 'components/Loadable';
import Dashboard from 'layout/Dashboard';
import PrivateRoute from './PrivateRoute';

const Color = Loadable(lazy(() => import('pages/component-overview/color')));
const WorkAllocation = Loadable(lazy(() => import('pages/component-overview/WorkAllocationForm')));
const Shadow = Loadable(lazy(() => import('pages/component-overview/shadows')));
const DashboardDefault = Loadable(lazy(() => import('pages/dashboard/index')));
const TourDiary = Loadable(lazy(() => import('pages/dashboard/TourDiary')));
const TourDiaryMenu = Loadable(lazy(() => import('pages/dashboard/TourDiaryMenu')));
const AdminTourDiaryApprovals = Loadable(lazy(() => import('pages/dashboard/AdminTourDiary')));


// Schems Sub menus
const Schemes = Loadable(lazy(() => import('pages/functional-components/schemas')));

const UserManage = Loadable(lazy(() => import('pages/functional-components/usermanage')));
const RoleManage = Loadable(lazy(() => import('pages/usermanage/RoleManage')));
const DesignationManage = Loadable(lazy(() => import('pages/usermanage/DesignationManage')));

const RoleDesignation = Loadable(lazy(() => import('pages/usermanage/RoleDesignationTabs')));

const Earas = Loadable(lazy(() => import('pages/functional-components/earas/earas_menus')));
const Zone_Details = Loadable(lazy(() => import('pages/functional-components/earas/ZoneDetails/Zonecontrol')));
const BTR = Loadable(lazy(() => import('pages/functional-components/earas/btr/Btr')));
const BtrListing = Loadable(lazy(() => import('pages/functional-components/earas/BtrListing')));
const BTRWrapper = Loadable(lazy(() => import('pages/functional-components/earas/btr/BTRWrapper')));
const BTRClassifyWrapper = Loadable(lazy(() => import('pages/functional-components/earas/btr/BTRClassifyWrapper')));
const ZoneDetailsWrapper = Loadable(lazy(() => import('pages/functional-components/earas/ZoneDetails/ZoneDetailsWrapper')));

const ClusterForm = Loadable(lazy(() => import('pages/functional-components/earas/cluster_form')));

const Keyplots = Loadable(lazy(() => import('pages/functional-components/earas/keyplots/keyplots')));
const KeyplotsWrapper = Loadable(lazy(() => import('pages/functional-components/earas/keyplots/keyplotsWrapper')));

const Clusters = Loadable(lazy(() => import('pages/functional-components/earas/Cluster/cluster_order')));
const ClustersWrapper = Loadable(lazy(() => import('pages/functional-components/earas/Cluster/clusterWrapper')));
const ClusterRouteWrapper = Loadable(lazy(() => import('pages/functional-components/earas/Cluster/clusterRouteWrapper')));

const ClusterFormView = Loadable(lazy(() => import('pages/functional-components/earas/Cluster/cluster_order_form')));
const ClustersWrapperForm = Loadable(lazy(() => import('pages/functional-components/earas/Cluster/clusterWrapperform')));

const ZoneSettings = Loadable(lazy(() => import('pages/functional-components/earas/ZoneDetails/ZoneSettings')));
const SettingsMenu = Loadable(lazy(() => import('pages/functional-components/earas/SettingsMenu')));
const CCE_crop_selection = Loadable(lazy(() => import('pages/functional-components/earas/CceCropSelection')));
const CropsManagement = Loadable(lazy(() => import('pages/functional-components/earas/CropsManagement')));

const MappingManagement = Loadable(lazy(() => import('pages/functional-components/earas/MappingSettings/MappingMenus')));
const ZoneList = Loadable(lazy(() => import('pages/functional-components/earas/MappingSettings/ZoneListing')));
const ZoneManage = Loadable(lazy(() => import('pages/functional-components/earas/MappingSettings/ZoneManage')));

const Form1_menus = Loadable(lazy(() => import('pages/functional-components/earas/form1/form1menus')));

const Profile = Loadable(lazy(() => import('pages/profile/Profile')));

const RoleList = Loadable(lazy(() => import('pages/usermanage/RoleList')));
const RoleDetail = Loadable(lazy(() => import('pages/usermanage/UserManage')));

// Approvels
const Approvel = Loadable(lazy(() => import('pages/functional-components/approvels/approvelist')));
const ApprovelMenu = Loadable(lazy(() => import('pages/functional-components/approvels/ApprovalMenus')));

const ClusterApprovals = Loadable(lazy(() => import('pages/functional-components/approvels/Cluster_approvals')));

const CCE_menus = Loadable(lazy(() => import('pages/functional-components/earas/cce_menus')));

const CCE_plotlist = Loadable(lazy(() => import('pages/functional-components/earas/cce_plotlist')));

const AvailableCcePlots = Loadable(lazy(() => import('pages/functional-components/earas/form1/AvailableCcePlotsTable')));

// planB
const KeyPlotEntry = Loadable(lazy(() => import('pages/functional-components/earas/KeyPlotEntry')));
const KeyPlotEntryNonBtr = Loadable(lazy(() => import('pages/functional-components/earas/KeyPlotEntryNonBtr')));
const KeyplotListing = Loadable(lazy(() => import('pages/functional-components/earas/keyplots/KeyPlotListing')));

const ClusterManualEntry = Loadable(lazy(() => import('pages/functional-components/earas/ClusterManualEntry')));
const ClusterManualEntryNonBtr = Loadable(lazy(() => import('pages/functional-components/earas/ClusterManualEntryNonBtr')));

const CceView = Loadable(lazy(() => import('pages/functional-components/earas/cce/cceview')));
const CceReport = Loadable(lazy(() => import('pages/functional-components/earas/cce/CceReport')));

const UserAdvancedTourDiarySubmissions = Loadable(lazy(() => import('pages/dashboard/UserAdvancedTourDiarySubmissions')));
const UserTourDiarySubmissions = Loadable(lazy(() => import('pages/dashboard/UserTourDiarySubmissions')));
const UserAdvancedTourDiaryDetail = Loadable(lazy(() => import('pages/dashboard/UserAdvancedTourDiaryDetail')));
const UserTourDiaryDetail = Loadable(lazy(() => import('pages/dashboard/UserTourDiaryDetail')));
const ActualTourDiary = Loadable(lazy(() => import('pages/dashboard/ActualTourDiary')));

const KeralaReportList = Loadable(lazy(() => import('pages/functional-components/earas/Report/clusterReport/KeralaClusterReportList')));
const TalukClusterReport = Loadable(lazy(() => import('pages/functional-components/earas/Report/clusterReport/TalukClusterReport')));
const ZoneClusterReport = Loadable(lazy(() => import('pages/functional-components/earas/Report/clusterReport/ZoneClusterReport')));
const ReportMenu = Loadable(lazy(() => import('pages/functional-components/earas/Report/ReportMenu')));

const KeralaFormReportList = Loadable(lazy(() => import('pages/functional-components/earas/Report/formReport/KeralaFormReportList')));
const TalukFormReport = Loadable(lazy(() => import('pages/functional-components/earas/Report/formReport/TalukFormReport')));
const BlockFormReport = Loadable(lazy(() => import('pages/functional-components/earas/Report/formReport/BlockFormReport')));
const ZoneFormReport = Loadable(lazy(() => import('pages/functional-components/earas/Report/formReport/ZoneFormReport')));
const Form5 = Loadable(lazy(() => import('pages/functional-components/earas/Report/Form5')));

const KeralaForm2 = Loadable(lazy(() => import('pages/functional-components/earas/Report/Form2/KeralaForm2')));
const TalukForm2 = Loadable(lazy(() => import('pages/functional-components/earas/Report/Form2/TalukForm2')));
const ZoneForm2 = Loadable(lazy(() => import('pages/functional-components/earas/Report/Form2/ZoneForm2')));
const Form2 = Loadable(lazy(() => import('pages/functional-components/earas/Report/Form2/Form2')));

const SettingsTabsPage = Loadable(lazy(() => import('pages/functional-components/earas/SettingsTabsPage')));
const DistrictSettingss = Loadable(lazy(() => import('pages/functional-components/earas/settings/DistrictSettings')));
const TalukSettings = Loadable(lazy(() => import('pages/functional-components/earas/settings/TalukSettings')));
const VillageSettings = Loadable(lazy(() => import('pages/functional-components/earas/settings/VillageSettings')));
const MasterZoneSettings = Loadable(lazy(() => import('pages/functional-components/earas/settings/MasterZoneSettings')));

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
      path: 'Report',
      element: (
        <PrivateRoute>
          <ReportMenu />
        </PrivateRoute>
      )
    },
    {
      path: 'kerala_cluster_report',
      element: (
        <PrivateRoute>
          <KeralaReportList />
        </PrivateRoute>
      )
    },
    {
      path: 'kerala_cluster_report/taluk_cluster_report/:districtName?',
      element: (
        <PrivateRoute>
          <TalukClusterReport />
        </PrivateRoute>
      )
    },
    {
      path: 'FormReport/Kerala',
      element: (
        <PrivateRoute>
          <KeralaFormReportList />
        </PrivateRoute>
      )
    },
    {
      // MODIFIED: Added :blockName parameter
      path: 'kerala_cluster_report/taluk_cluster_report/zone_cluster_report/:districtName/:talukName',
      element: (
        <PrivateRoute>
          <ZoneClusterReport />
        </PrivateRoute>
      )
    },
    {
      path: 'kerala_form_report/taluk_form_report/:districtName',
      element: <PrivateRoute><TalukFormReport /></PrivateRoute>
    },
    {
      path: 'kerala_form_report/block_form_report/:districtName/:talukName',
      element: <PrivateRoute><BlockFormReport /></PrivateRoute>
    },
    {
      path: 'kerala_form_report/zone_form_report/:districtName/:talukName/:blockName',
      element: <PrivateRoute><ZoneFormReport /></PrivateRoute>
    },
    {
      path: 'tourdiary',
      element: (
        <PrivateRoute>
          <TourDiaryMenu />
        </PrivateRoute>
      )
    },
    {
      path: 'tourdiary/advanced',
      element: (
        <PrivateRoute>
          <TourDiary />
        </PrivateRoute>
      )
    },
    {
      path: 'tourdiary/basic',
      element: (
        <PrivateRoute>
          <TourDiary />
        </PrivateRoute>
      )
    },
    {
      path: 'approval_manage/tourdiary',
      element: (
        <PrivateRoute>
          <AdminTourDiaryApprovals />
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
      path: '/User_Manage/Manage_Users',
      element: (
        <PrivateRoute>
          <RoleList />
        </PrivateRoute>
      )
    },
    {
      path: '/User_Manage/Manage_Users/User_Details',
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
      path: '/User_Manage/RoleDesignation',
      element: (
        <PrivateRoute>
          <RoleDesignation />
        </PrivateRoute>
      )
    },
    {
      path: '/schemes/earas/btr_list',
      element: (
        <PrivateRoute>
          <BtrListing />
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
      path: '/schemes/earas/Zone_Details/btr/:zoneId',
      element: (
        <PrivateRoute>
          <BTRWrapper />
        </PrivateRoute>
      )
    },
    {
      path: '/schemes/earas/btr/btr_classify_wrapper',
      element: (
        <PrivateRoute>
          <BTRClassifyWrapper />
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
      path: '/schemes/earas/Zone_Details/:zoneId',
      element: (
        <PrivateRoute>
          <ZoneDetailsWrapper />
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
      path: '/schemes/earas/Zone_Details/Key_plots/:zoneId',
      element: (
        <PrivateRoute>
          <KeyplotsWrapper />
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
      path: '/schemes/earas/Key_plot_Listing',
      element: (
        <PrivateRoute>
          <KeyplotListing />
        </PrivateRoute>
      )
    },
    {
      path: '/schemes/earas/Zone_Details/Clusters/:zoneId',
      element: (
        <PrivateRoute>
          <ClustersWrapper />
        </PrivateRoute>
      )
    },
    {
      path: '/schemes/earas/cluster-route-wrapper',
      element: (
        <PrivateRoute>
          <ClusterRouteWrapper />
        </PrivateRoute>
      )
    },
    {
      path: '/schemes/earas/Clusters/:zoneId/Manual_Entry',
      element: (
        <PrivateRoute>
          <ClusterManualEntry />
        </PrivateRoute>
      )
    },
    {
      path: '/schemes/earas/Clusters/:zoneId/Manual_Entry_Non_BTR',
      element: (
        <PrivateRoute>
          <ClusterManualEntryNonBtr />
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
      path: '/schemes/earas/cluster_manual_entry',
      element: (
        <PrivateRoute>
          <ClusterManualEntry />
        </PrivateRoute>
      )
    },
    {
      path: '/schemes/earas/cluster_manual_entry_Non_BTR',
      element: (
        <PrivateRoute>
          <ClusterManualEntryNonBtr />
        </PrivateRoute>
      )
    },
    {
      path: '/schemes/earas/Zone_Details/Clusters_Form/:zoneId',
      element: (
        <PrivateRoute>
          <ClustersWrapperForm />
        </PrivateRoute>
      )
    },
    {
      path: '/schemes/earas/Clusters_Form',
      element: (
        <PrivateRoute>
          <ClusterFormView />
        </PrivateRoute>
      )
    },
    {
      path: '/schemes/earas/Clusters_Form/:zoneId/ClusterFormView',
      element: (
        <PrivateRoute>
          <Form1_menus />
        </PrivateRoute>
      )
    },
    {
      path: '/schemes/earas/Clusters_Form/ClusterFormView',
      element: (
        <PrivateRoute>
          <Form1_menus />
        </PrivateRoute>
      )
    },
    {
      path: '/schemes/earas/Zone_Details/Clusters_Form/:zoneId/ClusterFormView',
      element: (
        <PrivateRoute>
          <Form1_menus />
        </PrivateRoute>
      )
    },
    {
      path: '/schemes/earas/form1',
      element: (
        <PrivateRoute>
          <Form1_menus />
        </PrivateRoute>
      )
    },
    {
      path: '/schemes/earas/earas_management/CCE_crop_selection',
      element: (
        <PrivateRoute>
          <CCE_crop_selection />
        </PrivateRoute>
      )
    },
     {
      path: '/schemes/earas/earas_management/crops_management',
      element: (
        <PrivateRoute>
          <CropsManagement />
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
      path: '/schemes/earas/earas_management/zonesettings',
      element: (
        <PrivateRoute>
          <ZoneSettings />
        </PrivateRoute>
      )
    },
    {
      path: '/schemes/earas/earas_management',
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
      path: '/approval_manage',
      element: (
        <PrivateRoute>
          <ApprovelMenu />
        </PrivateRoute>
      )
    },
    {
      path: 'approval_manage/approvals',
      element: (
        <PrivateRoute>
          <Approvel />
        </PrivateRoute>
      )
    },
    {
      path: 'approval_manage/cluster_approvals',
      element: (
        <PrivateRoute>
          <ClusterApprovals />
        </PrivateRoute>
      )
    },
    {
      path: '/schemes/earas/cce/cceview',
      element: (
        <PrivateRoute>
          <CceView />
        </PrivateRoute>
      )
    },
    {
  path: 'approval_manage/tourdiary/user-submissions',
  element: (
    <PrivateRoute>
      <UserAdvancedTourDiarySubmissions />
    </PrivateRoute>
  )
},
{
  path: 'approval_manage/tourdiary/user-submissions',
  element: (
    <PrivateRoute>
      <UserTourDiarySubmissions />
    </PrivateRoute>
  )
},
{
  path: 'approval_manage/advancedtourdiary/user-details',
  element: (
    <PrivateRoute>
      <UserAdvancedTourDiaryDetail />
    </PrivateRoute>
  )
},
{
  path: 'approval_manage/tourdiary/user-details',
  element: (
    <PrivateRoute>
      <UserTourDiaryDetail />
    </PrivateRoute>
  )
},
{
  path: 'tourdiary/actual_tour_diary',
  element: (
    <PrivateRoute>
      <ActualTourDiary />
    </PrivateRoute>
  )
},
    {
      path: '/schemes/earas/cce/CceReport',
      element: (
        <PrivateRoute>
          <CceReport />
        </PrivateRoute>
      )
    },
    {
      path: '/schemes/earas/cce/Form5',
      element: (
        <PrivateRoute>
          <Form5 />
        </PrivateRoute>
      )
    },
    {
      path: '/schemes/earas/cce/KeralaForm2',
      element: (
        <PrivateRoute>
          <KeralaForm2 />
        </PrivateRoute>
      )
    },
    {
      path: '/schemes/earas/cce/TalukForm2',
      element: (
        <PrivateRoute>
          <TalukForm2 />
        </PrivateRoute>
      )
    },
    {
      path: '/schemes/earas/cce/ZoneForm2',
      element: (
        <PrivateRoute>
          <ZoneForm2 />
        </PrivateRoute>
      )
    },
    {
      path: '/schemes/earas/cce/Form2',
      element: (
        <PrivateRoute>
          <Form2 />
        </PrivateRoute>
      )
    },
    {
      path: '/schemes/earas/Mapping_Management',
      element: (
        <PrivateRoute>
          <MappingManagement />
        </PrivateRoute>
      )
    },
    {
      path: '/schemes/earas/Mapping_Management/ZoneListing',
      element: (
        <PrivateRoute>
          <ZoneList />
        </PrivateRoute>
      )
    },
     {
      path: '/schemes/earas/Mapping_Management/ZoneListing/ZoneManage/:zoneId',
      element: (
        <PrivateRoute>
          <ZoneManage />
        </PrivateRoute>
      )
    },
    {
      path: '/schemes/earas/district_settings',
      element: (
        <PrivateRoute>
          <DistrictSettingss />
        </PrivateRoute>
      )
    },
    {
      path: '/schemes/earas/Settings_Tabs_Page',
      element: (
        <PrivateRoute>
          <SettingsTabsPage />
        </PrivateRoute>
      )
    },
  {
  path: '/schemes/earas/taluk_settings',
  element: (
    <PrivateRoute> 
      <TalukSettings />
    </PrivateRoute>
  )
  },
  {
  path: '/schemes/earas/village_settings',
  element: (
    <PrivateRoute> 
      <VillageSettings />
    </PrivateRoute>
  )
  },
  {
  path: '/schemes/earas/master_zone_settings',
  element: (
    <PrivateRoute> 
      <MasterZoneSettings />
    </PrivateRoute>
  )
  },
  ]
};

export default MainRoutes;