import { useState } from 'react';
import axios from 'axios';

// material-ui
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid2';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';

// assets / icons
import {
  IconUpload,
  IconPlayerPlay,
  IconPhoto,
  IconRefresh,
  IconDownload,
  IconChartBar
} from '@tabler/icons-react';
import BarChartIcon from '@mui/icons-material/BarChart';

const API_ENDPOINT = 'http://127.0.0.1:8000/api/lab3-histogram';

export default function Lab3() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle local image file selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setProcessedImage(null);
      setError(null);
    }
  };

  // Submit multipart form data to FastAPI backend
  const handleProcessImage = async () => {
    if (!selectedFile) {
      setError('Please select an image file first.');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post(API_ENDPOINT, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data?.processed_image) {
        setProcessedImage(response.data.processed_image);
      } else if (response.data?.error) {
        setError(response.data.error);
      } else {
        setError('Server returned an unexpected response format.');
      }
    } catch (err) {
      console.error('[Lab3] Error processing histogram:', err);
      const message =
        err.response?.data?.detail ||
        err.message ||
        'Failed to connect to FastAPI backend at http://127.0.0.1:8000. Is the server running?';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setProcessedImage(null);
    setError(null);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header Banner */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
          <Chip label="Lab Activity 3" size="small" color="primary" sx={{ fontWeight: 600 }} />
          <Chip label="Image Normalization" size="small" color="primary" variant="outlined" />
          <Chip label="CLAHE & Global" size="small" color="secondary" variant="outlined" />
        </Stack>
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          <BarChartIcon sx={{ fontSize: 28 }} /> Lab 3: Histogram
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Analyze and equalize image histograms for brightness and contrast normalization using CLAHE and global equalization.
        </Typography>
      </Box>

      {/* Control Card: File Upload & Action Button */}
      <Card sx={{ mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Grid container spacing={2} sx={{ alignItems: 'center' }}>
            {/* File Upload Input */}
            <Grid size={{ xs: 12, md: 8 }}>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                startIcon={<IconUpload size={20} />}
                sx={{
                  py: 1.5,
                  textTransform: 'none',
                  borderStyle: 'dashed',
                  borderWidth: 2,
                  '&:hover': { borderWidth: 2 }
                }}
              >
                {selectedFile ? selectedFile.name : 'Choose Image (JPG, PNG, WEBP)'}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </Button>
            </Grid>

            {/* Actions: Run & Reset */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  disabled={!selectedFile || loading}
                  onClick={handleProcessImage}
                  startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <IconPlayerPlay size={20} />}
                  sx={{ py: 1.5, textTransform: 'none', fontWeight: 600 }}
                >
                  {loading ? 'Processing...' : 'Run Histogram Equalization'}
                </Button>
                {selectedFile && (
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={handleReset}
                    sx={{ minWidth: 48, px: 1.5 }}
                    title="Reset Form"
                  >
                    <IconRefresh size={20} />
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

      {/* Results Section: Vertically Stacked (100% width each) */}
      <Grid container spacing={3}>
        {/* 1. Original Input Image (Full Width 100%) */}
        {previewUrl && (
          <Grid size={{ xs: 12 }}>
            <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
              <CardContent sx={{ p: 2.5 }}>
                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    Original Input Image
                  </Typography>
                  {selectedFile && (
                    <Chip
                      label={`${(selectedFile.size / 1024).toFixed(1)} KB`}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Stack>

                <Box
                  sx={{
                    width: '100%',
                    bgcolor: 'grey.50',
                    borderRadius: 2,
                    border: '1px dashed',
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 2
                  }}
                >
                  <Box
                    component="img"
                    src={previewUrl}
                    alt="Original Input Preview"
                    sx={{
                      maxHeight: 380,
                      maxWidth: '100%',
                      height: 'auto',
                      objectFit: 'contain',
                      borderRadius: 1
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* 2. Processed 3x2 Matplotlib Output Grid (Full Width 100%) */}
        <Grid size={{ xs: 12 }}>
          <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    Histogram & Contrast Analysis Grid (3x2 Output)
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Left: Original, Global Equalization, CLAHE | Right: Corresponding 256-bin Intensity Histograms
                  </Typography>
                </Box>

                {processedImage && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<IconDownload size={16} />}
                    component="a"
                    href={processedImage}
                    download="lab3-histogram-comparison.png"
                    sx={{ textTransform: 'none' }}
                  >
                    Download Plot
                  </Button>
                )}
              </Stack>

              <Box
                sx={{
                  width: '100%',
                  minHeight: 450,
                  bgcolor: 'grey.50',
                  borderRadius: 2,
                  border: '1px dashed',
                  borderColor: 'divider',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: { xs: 1, md: 2 }
                }}
              >
                {loading ? (
                  <Stack spacing={2} sx={{ alignItems: 'center', py: 6 }}>
                    <CircularProgress size={48} />
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      Generating high-resolution 3x2 comparison grid...
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Computing Global Equalization, CLAHE, and 256-bin histogram distributions
                    </Typography>
                  </Stack>
                ) : processedImage ? (
                  <Box
                    component="img"
                    src={processedImage}
                    alt="3x2 Histogram Analysis Plot"
                    sx={{
                      width: '100%',
                      maxWidth: '100%',
                      height: 'auto',
                      objectFit: 'contain',
                      display: 'block',
                      borderRadius: 1,
                      boxShadow: '0 4px 14px rgba(0,0,0,0.08)'
                    }}
                  />
                ) : (
                  <Stack spacing={1.5} sx={{ alignItems: 'center', color: 'text.disabled', py: 6 }}>
                    <IconPhoto size={56} stroke={1.5} />
                    <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                      No results generated yet
                    </Typography>
                    <Typography variant="body2" color="text.disabled">
                      Upload an image and click &quot;Run Histogram Equalization&quot; to generate the full-width 3x2 comparison grid
                    </Typography>
                  </Stack>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
