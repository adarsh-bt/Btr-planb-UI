import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import DirectionsWalkOutlinedIcon from '@mui/icons-material/DirectionsWalkOutlined';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';

const projectMonitoringMenu = {
  id: 'project-monitoring',
  title: 'Project Monitoring',
  type: 'group',
  children: [
    {
      id: 'dashboard-overview',
      title: 'Dashboard',
      type: 'item',
      url: '/',
      icon: DashboardOutlinedIcon,
      breadcrumbs: false
    },
    {
      id: 'tour-diary',
      title: 'Tour Diary',
      type: 'item',
      url: '/tour-diary',
      icon: MenuBookOutlinedIcon,
      breadcrumbs: true
    },
    {
      id: 'actual-tour',
      title: 'Actual Tour',
      type: 'item',
      url: '/actual-tour',
      icon: DirectionsWalkOutlinedIcon,
      breadcrumbs: true
    },
    {
      id: 'work-allocation',
      title: 'Work Allocation',
      type: 'item',
      url: '/work-allocation',
      icon: AssignmentTurnedInOutlinedIcon,
      breadcrumbs: true
    },
    {
      id: 'key-plot',
      title: 'Key Plot / CCE',
      type: 'item',
      url: '/key-plot',
      icon: TaskAltOutlinedIcon,
      breadcrumbs: true
    },
    {
      id: 'reports-module',
      title: 'Reports',
      type: 'item',
      url: '/reports',
      icon: AssessmentOutlinedIcon,
      breadcrumbs: true
    }
  ]
};

export default projectMonitoringMenu;
