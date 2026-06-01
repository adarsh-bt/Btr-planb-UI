import { RouterProvider } from 'react-router-dom';

// project import
import router from 'routes';
import ThemeCustomization from 'themes';

import ScrollTop from 'components/ScrollTop';
// import { PermissionProvider } from 'contexts/PermissionContext';



// ==============================|| APP - THEME, ROUTER, LOCAL ||============================== //

export default function App() {
  return (
    <ThemeCustomization>
      {/* <PermissionProvider> */}
        <ScrollTop>
          <RouterProvider router={router} />
      </ScrollTop>
      {/* </PermissionProvider> */}
    </ThemeCustomization>
  );
}
