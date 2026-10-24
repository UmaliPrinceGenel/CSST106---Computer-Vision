import { useState } from 'react';
import axios from 'axios';

// material-ui
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import LayersIcon from '@mui/icons-material/Layers';

// assets / icons
import {
  IconLayersIntersect,
  IconUpload,
  IconPlayerPlay,
  IconRefresh,
  IconDownload,
  IconPhoto,
  IconAdjustments,
  IconBrandOpenai,
  IconWaveSine,
  IconVectorTriangle,
  IconBorderAll
} from '@tabler/icons-react';

const API_ENDPOINT = 'http://127.0.0.1:8000/api/lab7-segmentation';

export default function Lab7() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // File upload selection handler
  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setResults(null);
      setError(null);
    }
  };

  // Run segmentation pipeline
  const handleRunSegmentation = async () => {
    if (!file) {
      setError('Please select an image file to segment.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(API_ENDPOINT, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data && response.data.semantic_image) {
        setResults(response.data);
      } else if (response.data?.error) {
        setError(response.data.error);
      } else {
        setError('Server returned an unexpected response format.');
      }
    } catch (err) {
      console.error('[Lab7] Segmentation error:', err);
      const message =
        err.response?.data?.detail ||
        err.message ||
        'Failed to connect to FastAPI backend at http://127.0.0.1:8000. Is the server running?';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset state
  const handleReset = () => {
    setFile(null);
    setPreviewUrl(null);
    setResults(null);
    setError(null);
  };

  // Segmentation cards configuration
  const segmentationCards = results
    ? [
        {
          key: 'otsu',
          title: 'Global Thresholding',
          subtitle: "Otsu's Binarization",
          description: 'Calculates optimal global threshold by maximizing inter-class pixel variance.',
          badge: "Otsu's Method",
          badgeColor: 'primary',
          image: results.otsu_image,
          icon: IconAdjustments
        },
        {
          key: 'adaptive',
          title: 'Adaptive Thresholding',
          subtitle: 'Gaussian Local Threshold',
          description: 'Calculates dynamic thresholds over localized windows to handle uneven lighting.',
          badge: 'Adaptive Gaussian',
          badgeColor: 'info',
          image: results.adaptive_image,
          icon: IconBorderAll
        },
        {
          key: 'watershed',
          title: 'Watershed Region',
          subtitle: 'Topological Segmentation',
          description: 'Uses distance transform & connected components; boundary ridges highlighted in red.',
          badge: 'Region Watershed',
          badgeColor: 'error',
          image: results.watershed_image,
          icon: IconWaveSine
        },
        {
          key: 'canny',
          title: 'Canny Edges',
          subtitle: 'Multi-Stage Edge Filter',
          description: 'Gradient intensity calculation with non-maximum suppression and hysteresis.',
          badge: 'Canny Filter',
          badgeColor: 'warning',
          image: results.canny_image,
          icon: IconLayersIntersect
        },
        {
          key: 'contours',
          title: 'Edge Contours',
          subtitle: 'Boundary Vector Contours',
          description: 'Finds structural continuous boundaries from Canny edges and draws them in green.',
          badge: 'Green Contours',
          badgeColor: 'success',
          image: results.contours_image,
          icon: IconVectorTriangle
        },
        {
          key: 'semantic',
          title: 'Semantic DeepLabV3',
          subtitle: 'Deep Learning Segmentation',
          description: 'Pixel-level semantic classification using DeepLabV3-ResNet50 with Jet colormap overlay.',
          badge: 'DeepLabV3 ResNet50',
          badgeColor: 'secondary',
          image: results.semantic_image,
          icon: IconBrandOpenai
        }
      ]
    : [];

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header Banner */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
          <Chip label="Lab Activity 7" size="small" color="primary" sx={{ fontWeight: 600 }} />
          <Chip label="Image Segmentation" size="small" color="primary" variant="outlined" />
          <Chip label="DeepLabV3 / Watershed" size="small" color="secondary" variant="outlined" />
        </Stack>
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          <LayersIcon sx={{ fontSize: 28 }} /> Lab 7: Segmentation Technique
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Apply thresholding, region-based, edge-based, and semantic segmentation techniques to extract and classify image features.
        </Typography>
      </Box>

      {/* Input & Action Control Section */}
      <Card sx={{ mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>

        {/* Input & Action Control Section */}
        <Grid container spacing={3} sx={{ alignItems: 'center', mb: 1 }}>
          <Grid item xs={12} md={7}>
            <Box
              sx={{
                p: 3,
                border: '2px dashed',
                borderColor: file ? 'primary.main' : 'divider',
                borderRadius: 2,
                bgcolor: file ? 'primary.lighter' : 'grey.50',
                textAlign: 'center',
                transition: 'border-color 0.2s ease'
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                Upload Image for Segmentation
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                Supports PNG, JPG, JPEG, and WEBP formats
              </Typography>
              <Button
                variant={file ? 'contained' : 'outlined'}
                component="label"
                color="primary"
                startIcon={<IconUpload size={18} />}
                sx={{ textTransform: 'none' }}
              >
                {file ? `Selected: ${file.name}` : 'Choose Image'}
                <input type="file" hidden accept="image/*" onChange={handleFileChange} />
              </Button>
              {file && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  Size: {(file.size / 1024).toFixed(1)} KB
                </Typography>
              )}
            </Box>
          </Grid>

          <Grid item xs={12} md={5}>
            <Stack spacing={1.5}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                disabled={!file || isLoading}
                onClick={handleRunSegmentation}
                startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <IconPlayerPlay size={20} />}
                sx={{ py: 1.5, textTransform: 'none', fontWeight: 600, borderRadius: 1.5 }}
              >
                {isLoading ? 'Processing Segmentation (DeepLabV3)...' : 'Run Segmentation'}
              </Button>

              {(file || results) && (
                <Button
                  variant="outlined"
                  color="inherit"
                  onClick={handleReset}
                  startIcon={<IconRefresh size={18} />}
                  sx={{ textTransform: 'none', borderRadius: 1.5 }}
                >
                  Reset
                </Button>
              )}
            </Stack>
          </Grid>
        </Grid>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        </CardContent>
      </Card>

      {/* Loading Progress State */}
      {isLoading && (
        <Card sx={{ mt: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <CardContent sx={{ py: 6, textAlign: 'center' }}>
            <CircularProgress size={56} sx={{ mb: 2 }} />
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
              Executing 6 Segmentation Pipelines...
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 520, mx: 'auto' }}>
              Computing Otsu, Adaptive Gaussian, Marker-Controlled Watershed, Canny Edges, Contours, and DeepLabV3-ResNet50 Semantic Neural Network inference.
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Results UI Grid */}
      {results && !isLoading && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconLayersIntersect size={26} /> Segmentation Comparison Results
          </Typography>

          <Grid container spacing={3}>
            {/* 1. Original Benchmark Image Card */}
            {previewUrl && (
              <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ height: '100%', border: '1px solid', borderColor: 'divider', borderRadius: 2, display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        Original Input
                      </Typography>
                      <Chip label="Source Image" size="small" variant="outlined" color="default" sx={{ fontWeight: 600 }} />
                    </Stack>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                      Benchmark input image used across all segmentation algorithms
                    </Typography>

                    <Box
                      sx={{
                        width: '100%',
                        height: 250,
                        bgcolor: 'grey.100',
                        borderRadius: 1.5,
                        border: '1px solid',
                        borderColor: 'divider',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        mb: 2
                      }}
                    >
                      <Box
                        component="img"
                        src={previewUrl}
                        alt="Original Input"
                        className="w-full object-contain"
                        sx={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                      />
                    </Box>

                    <Typography variant="caption" color="text.secondary" sx={{ mt: 'auto', textAlign: 'center', display: 'block' }}>
                      {file ? `${file.name} (${(file.size / 1024).toFixed(1)} KB)` : 'Original'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* 2. Six Segmentation Output Technique Cards */}
            {segmentationCards.map((card) => {
              const IconComp = card.icon;
              return (
                <Grid item xs={12} sm={6} md={4} key={card.key}>
                  <Card sx={{ height: '100%', border: '1px solid', borderColor: 'divider', borderRadius: 2, display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                        <Typography variant="h5" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.8 }}>
                          <IconComp size={18} /> {card.title}
                        </Typography>
                        <Chip label={card.badge} size="small" color={card.badgeColor} sx={{ fontWeight: 600, fontSize: '0.72rem' }} />
                      </Stack>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2, minHeight: 32 }}>
                        {card.description}
                      </Typography>

                      <Box
                        sx={{
                          width: '100%',
                          height: 250,
                          bgcolor: '#111',
                          borderRadius: 1.5,
                          border: '1px solid',
                          borderColor: 'divider',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden',
                          mb: 2,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                        }}
                      >
                        <Box
                          component="img"
                          src={card.image}
                          alt={card.title}
                          className="w-full object-contain"
                          sx={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                        />
                      </Box>

                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<IconDownload size={15} />}
                        component="a"
                        href={card.image}
                        download={`segmentation-${card.key}.jpg`}
                        sx={{ mt: 'auto', textTransform: 'none', width: '100%' }}
                      >
                        Download {card.subtitle}
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      )}

      {/* Empty State */}
      {!results && !isLoading && (
        <Card sx={{ mt: 3, border: '1px dashed', borderColor: 'divider', borderRadius: 2 }}>
          <CardContent sx={{ py: 8, textAlign: 'center' }}>
            <Stack spacing={1.5} sx={{ alignItems: 'center', color: 'text.disabled' }}>
              <IconPhoto size={60} stroke={1.5} />
              <Typography variant="h4" color="text.secondary" sx={{ fontWeight: 600 }}>
                No segmentation results yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 460 }}>
                Upload an image above and click &quot;Run Segmentation&quot; to generate Otsu, Adaptive, Watershed, Canny, Contour, and DeepLabV3 segmentation outputs.
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
