import { RouterProvider } from 'react-router-dom';

// project import
import router from 'routes';
import ThemeCustomization from 'themes';

import ScrollTop from 'components/ScrollTop';

// import { UserAccessProvider } from './contexts/auth-reducer/universal/UserAccessContext';



// ==============================|| APP - THEME, ROUTER, LOCAL ||============================== //

export default function App() {
  return (
    <ThemeCustomization>
      {/* <UserAccessProvider> */}
        <ScrollTop>
          <RouterProvider router={router} />
      </ScrollTop>
      {/* </UserAccessProvider> */}
    </ThemeCustomization>
  );
}
