// project import
import NavCard from './NavCard';
import Navigation from './Navigation';
import SimpleBar from 'components/third-party/SimpleBar';

// ==============================|| DRAWER CONTENT ||============================== //

export default function DrawerContent() {
  return (
    <>
     <SimpleBar
      sx={{
        TextDecoder:'none',
        backgroundColor:"#05307a",
        // backgroundImage: 'linear-gradient(to top, #f3e7e9 0%, #e3eeff 99%, #e3eeff 100%);', // Gradient background
        '& .simplebar-content': {
          display: 'flex',
          flexDirection: 'column',
        },
        height: '100%', // Ensures the gradient covers the full height of the container
      }}
    >
        <Navigation />
        {/* <NavCard /> */}
        
      </SimpleBar>
    </>
  );
}
