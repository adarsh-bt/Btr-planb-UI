// material-ui
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project import
import NavGroup from './NavGroup';
import menuItem from 'menu-items';
import { usePermission } from 'contexts/auth-reducer/usePermission';

// ==============================|| DRAWER CONTENT - NAVIGATION ||============================== //

export default function Navigation() {
  const { hasPermission } = usePermission();
// console.log("User permissions:", userPermission); // whatever your hook reads


  // Filter each menu item based on its permission
  const filterByPermission = (item) => {
    // If item has a permission number, but user doesn't have that permission → hide it
    if (item.permission && !hasPermission(item.permission)) {
      return false;
    }
    return true;
  };

  // Filter children inside each group
  const filteredGroups = menuItem.items.map((group) => ({
    ...group,
    children: group.children?.filter(filterByPermission)
  }));

  // Render filtered groups
  const navGroups = filteredGroups.map((item) => {
    switch (item.type) {
      case 'group':
        return <NavGroup key={item.id} item={item} />;
      default:
        return (
          <Typography key={item.id} variant="h6" color="error" align="center">
            Fix - Navigation Group
          </Typography>
        );
    }
  });

  return <Box sx={{ pt: 2 }}>{navGroups}</Box>;
}
