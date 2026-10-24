// assets
import {
  IconHome,
  IconPhoto,
  IconScan,
  IconChartBar,
  IconVector,
  IconBrain,
  IconEye,
  IconLayersIntersect
} from '@tabler/icons-react';

// constant
const icons = {
  IconHome,
  IconPhoto,
  IconScan,
  IconChartBar,
  IconVector,
  IconBrain,
  IconEye,
  IconLayersIntersect
};

// ==============================|| LABORATORY ACTIVITIES MENU ITEMS ||============================== //

const labs = {
  id: 'laboratory-activities',
  title: 'Navigation',
  type: 'group',
  children: [
    {
      id: 'home',
      title: 'Home',
      type: 'item',
      url: '/',
      icon: icons.IconHome,
      breadcrumbs: false
    },
    {
      id: 'lab-images',
      title: 'Lab 1: Images',
      type: 'item',
      url: '/lab/images',
      icon: icons.IconPhoto,
      breadcrumbs: true
    },
    {
      id: 'lab-edge-detection',
      title: 'Lab 2: Edge Detection',
      type: 'item',
      url: '/lab/edge-detection',
      icon: icons.IconScan,
      breadcrumbs: true
    },
    {
      id: 'lab-histogram',
      title: 'Lab 3: Histogram',
      type: 'item',
      url: '/lab/histogram',
      icon: icons.IconChartBar,
      breadcrumbs: true
    },
    {
      id: 'lab-surf',
      title: 'Lab 4: SURF Feature Detection',
      type: 'item',
      url: '/lab/surf',
      icon: icons.IconVector,
      breadcrumbs: true
    },
    {
      id: 'lab-pca',
      title: 'Lab 5: PCA in CV',
      type: 'item',
      url: '/lab/pca',
      icon: icons.IconBrain,
      breadcrumbs: true
    },
    {
      id: 'lab-yolov11',
      title: 'Lab 6: YOLOv11',
      type: 'item',
      url: '/lab/yolov11',
      icon: icons.IconEye,
      breadcrumbs: true
    },
    {
      id: 'lab-segmentation',
      title: 'Lab 7: Segmentation',
      type: 'item',
      url: '/lab/segmentation',
      icon: icons.IconLayersIntersect,
      breadcrumbs: true
    }
  ]
};

export default labs;
