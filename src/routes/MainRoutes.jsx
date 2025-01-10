import { lazy } from 'react';

// project import
import Loadable from 'components/Loadable';
import Dashboard from 'layout/Dashboard';

const Color = Loadable(lazy(() => import('pages/component-overview/color')));
const Typography = Loadable(lazy(() => import('pages/component-overview/typography')));
const Shadow = Loadable(lazy(() => import('pages/component-overview/shadows')));
const DashboardDefault = Loadable(lazy(() => import('pages/dashboard/index')));

// Schems Sub menus
const Schemes = Loadable(lazy(() => import('pages/functional-components/schemas')));
const Earas = Loadable(lazy(() => import('pages/functional-components/earas/earas_list')));
const BTR = Loadable(lazy(() => import('pages/functional-components/earas/Btr')));
const Profile = Loadable(lazy(() => import('pages/profile/Profile')));



// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  element: <Dashboard />,
  children: [
    {
      path: '/',
      element: <DashboardDefault />
    },
    {
      path: 'color',
      element: <Color />
    },
    {
      path: 'dashboard',
      children: [
        {
          path: 'default',
          element: <DashboardDefault />
        }
      ]
    },
    // {
    //   path: 'sample-page',
    //   element: <SamplePage />
    // },
    {
      path: 'shadow',
      element: <Shadow />
    },
    {
      path: 'typography',
      element: <Typography />
    },

    // Tabs Menus

    {
      path: 'schemes',
      element: <Schemes />
    },


    {
      path: 'earas',
      element: <Earas />
    },
    // BTR

    {
      path: 'btr',
      element: <BTR />
    },
    {
      path:'profile',
      element: <Profile />
    }

  ]
};

export default MainRoutes;
