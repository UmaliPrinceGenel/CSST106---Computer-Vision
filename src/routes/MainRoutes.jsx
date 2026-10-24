import { lazy } from 'react';

// project imports
import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';

// dashboard / home
const DashboardDefault = Loadable(lazy(() => import('views/dashboard/Default')));

// ── Lab pages (lazy-loaded for performance) ────────────────────────────────
const Lab1Images        = Loadable(lazy(() => import('views/labs/Lab1Images')));
const Lab2EdgeDetection = Loadable(lazy(() => import('views/labs/Lab2EdgeDetection')));
const Lab3Histogram     = Loadable(lazy(() => import('views/labs/Lab3Histogram')));
const Lab4Surf          = Loadable(lazy(() => import('views/labs/Lab4Surf')));
const Lab5Pca           = Loadable(lazy(() => import('views/labs/Lab5Pca')));
const Lab6Yolov8        = Loadable(lazy(() => import('views/labs/Lab6Yolov8')));
const Lab7Segmentation  = Loadable(lazy(() => import('views/labs/Lab7Segmentation')));

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  element: <MainLayout />,
  children: [
    {
      path: '/',
      element: <DashboardDefault />
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

    // ── Laboratory Activity Routes ────────────────────────────────────────
    {
      path: 'lab',
      children: [
        { path: 'images',         element: <Lab1Images /> },
        { path: 'edge-detection', element: <Lab2EdgeDetection /> },
        { path: 'histogram',      element: <Lab3Histogram /> },
        { path: 'surf',           element: <Lab4Surf /> },
        { path: 'pca',            element: <Lab5Pca /> },
        { path: 'pca-eigenfaces', element: <Lab5Pca /> },
        { path: 'yolov11',        element: <Lab6Yolov8 /> },
        { path: 'yolov8',         element: <Lab6Yolov8 /> },
        { path: 'yolo-detection', element: <Lab6Yolov8 /> },
        { path: 'segmentation',   element: <Lab7Segmentation /> }
      ]
    }
  ]
};

export default MainRoutes;
