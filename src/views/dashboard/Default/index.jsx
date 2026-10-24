// ==============================|| COMPUTER VISION LAB - DASHBOARD HOME ||============================== //

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid2';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import {
  IconPhoto,
  IconScan,
  IconChartBar,
  IconVector,
  IconBrain,
  IconEye,
  IconLayersIntersect
} from '@tabler/icons-react';

const labs = [
  { id: 1, title: 'Lab 1: Images', description: 'Explore fundamental image loading, display, and pixel manipulation techniques.', icon: IconPhoto, path: '/lab/images', color: '#5e35b1' },
  { id: 2, title: 'Lab 2: Edge Detection', description: 'Apply Sobel, and Canny filters to detect edges in grayscale images.', icon: IconScan, path: '/lab/edge-detection', color: '#00897b' },
  { id: 3, title: 'Lab 3: Histogram', description: 'Analyze and equalize image histograms for brightness and contrast normalization.', icon: IconChartBar, path: '/lab/histogram', color: '#e53935' },
  { id: 4, title: 'Lab 4: SURF Feature Detection', description: 'Detect and match robust keypoints using the SURF algorithm on real images.', icon: IconVector, path: '/lab/surf', color: '#fb8c00' },
  { id: 5, title: 'Lab 5: PCA in CV', description: 'Apply Principal Component Analysis for dimensionality reduction in image datasets.', icon: IconBrain, path: '/lab/pca', color: '#1e88e5' },
  { id: 6, title: 'Lab 6: YOLOv11 Object Detection', description: 'Run real-time object detection using the YOLOv11 deep learning model on uploaded images or live webcam.', icon: IconEye, path: '/lab/yolov11', color: '#43a047' },
  { id: 7, title: 'Lab 7: Segmentation', description: 'Perform semantic and instance segmentation to classify every pixel in an image.', icon: IconLayersIntersect, path: '/lab/segmentation', color: '#8e24aa' }
];

export default function Dashboard() {
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Hero Banner */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)',
          borderRadius: 3,
          p: { xs: 3, md: 5 },
          mb: 4,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -60,
            right: -60,
            width: 280,
            height: 280,
            borderRadius: '50%',
            background: 'rgba(94, 53, 177, 0.15)',
            pointerEvents: 'none'
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: -80,
            left: '30%',
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'rgba(30, 136, 229, 0.12)',
            pointerEvents: 'none'
          }
        }}
      >
        <Chip
          label="Computer Vision Laboratory"
          size="small"
          sx={{
            bgcolor: 'rgba(94,53,177,0.3)',
            color: '#b39ddb',
            fontWeight: 600,
            letterSpacing: 1,
            mb: 2,
            fontSize: '0.7rem'
          }}
        />
        <Typography variant="h2" sx={{ color: '#fff', fontWeight: 800, mb: 1.5, fontSize: { xs: '1.8rem', md: '2.5rem' } }}>
          Welcome to the CV Lab 👁️
        </Typography>
        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.65)', maxWidth: 600, lineHeight: 1.8 }}>
          This platform compiles 7 structured laboratory activities in Computer Vision. Upload your images, run
          processing algorithms, and visualize the results side-by-side — all powered by a FastAPI backend.
        </Typography>
      </Box>

      {/* Lab Cards Grid */}
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 2.5, color: 'text.primary' }}>
        Laboratory Activities
      </Typography>
      <Grid container spacing={3}>
        {labs.map((lab) => {
          const Icon = lab.icon;
          return (
            <Grid key={lab.id} size={{ xs: 12, sm: 6, lg: 4 }}>
              <Card
                component="a"
                href={lab.path}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  textDecoration: 'none',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  transition: 'all 0.25s ease',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 12px 32px ${lab.color}30`,
                    borderColor: lab.color,
                    '& .lab-icon-box': {
                      bgcolor: lab.color,
                      color: '#fff',
                      '& svg': { color: '#fff !important' }
                    }
                  }
                }}
              >
                <CardContent sx={{ p: 3, flexGrow: 1 }}>
                  <Box
                    className="lab-icon-box"
                    sx={{
                      width: 52,
                      height: 52,
                      borderRadius: 2,
                      bgcolor: `${lab.color}18`,
                      color: lab.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2,
                      transition: 'all 0.25s ease',
                      '& svg': {
                        transition: 'color 0.25s ease'
                      }
                    }}
                  >
                    <Icon size={26} color="currentColor" />
                  </Box>
                  <Chip
                    label={`Lab ${lab.id}`}
                    size="small"
                    sx={{
                      bgcolor: `${lab.color}15`,
                      color: lab.color,
                      fontWeight: 700,
                      fontSize: '0.68rem',
                      mb: 1.5,
                      height: 22
                    }}
                  />
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
                    {lab.title.replace(`Lab ${lab.id}: `, '')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    {lab.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
