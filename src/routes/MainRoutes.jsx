import { lazy } from 'react';

// project import
import Loadable from 'components/Loadable';
import Dashboard from 'layout/Dashboard';
import PrivateRoute from './PrivateRoute';

const Color = Loadable(lazy(() => import('pages/component-overview/color')));
const Typography = Loadable(lazy(() => import('pages/component-overview/typography')));
const Shadow = Loadable(lazy(() => import('pages/component-overview/shadows')));
const DashboardDefault = Loadable(lazy(() => import('pages/dashboard/index')));

// Schems Sub menus
const Schemes = Loadable(lazy(() => import('pages/functional-components/schemes/schemas')));
// const Earas = Loadable(lazy(() => import('pages/functional-components/earas/earas_list')));
const Earas = Loadable(lazy(() => import('pages/functional-components/schemes/earas/earas_menus')));
const BTR = Loadable(lazy(() => import('pages/functional-components/schemes/earas/Btr')));
const Profile = Loadable(lazy(() => import('pages/profile/Profile')));

const RoleDetail = Loadable(lazy(() => import('pages/roles/Roles')));

// Approvels
const Approvel = Loadable(lazy(() => import('pages/functional-components/approvels/approvelist')));


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
      ),
    },
    {
      path: 'color',
      element: (
        <PrivateRoute>
          <Color />
        </PrivateRoute>
      ),
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
      ),
    },
    {
      path: 'typography',
      element: (
        <PrivateRoute>
          <Typography />
        </PrivateRoute>
      ),
    },
    {
      path: 'schemes',
      element: (
        <PrivateRoute>
          <Schemes />
        </PrivateRoute>
      ),
    },
    {
      path: 'schemes/earas',
      element: (
        <PrivateRoute>
          <Earas />
        </PrivateRoute>
      ),
    },
    {
      path: 'profile',
      element: (
        <PrivateRoute>
          <Profile />
        </PrivateRoute>
      ),
    },

    {
      path: 'role',
      element: (
        <PrivateRoute>
          <RoleDetail />
        </PrivateRoute>
      ),
    },

    {
      path: '/schemes/earas/btr',
      element: (
        <PrivateRoute>
          <BTR />
        </PrivateRoute>
      ),
    },
    {
      path: 'approvals',
      element: (
        <PrivateRoute>
          <Approvel />
        </PrivateRoute>
      ),
    },
  ],
};


export default MainRoutes;