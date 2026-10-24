import { useState } from 'react';
import axios from 'axios';

// material-ui
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
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
  IconDownload
} from '@tabler/icons-react';

const API_ENDPOINT = 'http://127.0.0.1:8000/api/lab1-images';

export default function Lab1() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [operation, setOperation] = useState('grayscale');
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
    formData.append('operation', operation);

    try {
      const response = await axios.post(API_ENDPOINT, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data?.processed_image) {
        setProcessedImage(response.data.processed_image);
      } else {
        setError('Server returned an unexpected response format.');
      }
    } catch (err) {
      console.error('[Lab1] Error processing image:', err);
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
    setOperation('grayscale');
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header Banner */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
          <Chip label="Lab Activity 1" size="small" color="primary" sx={{ fontWeight: 600 }} />
          <Chip label="OpenCV + FastAPI" size="small" variant="outlined" />
        </Stack>
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconPhoto size={28} stroke={1.5} /> Lab 1: Image Manipulation
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Upload an image to apply basic spatial and color transformations (Grayscale, Crop, Resize, Rotate) processed by the FastAPI backend.
        </Typography>
      </Box>

      {/* Control Card: File Upload, Operation Select, Run Button */}
      <Card sx={{ mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Grid container spacing={2} sx={{ alignItems: 'center' }}>
            {/* File Upload Input */}
            <Grid size={{ xs: 12, md: 5 }}>
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

            {/* Operation Dropdown */}
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <FormControl fullWidth size="medium">
                <InputLabel id="operation-select-label">OpenCV Operation</InputLabel>
                <Select
                  labelId="operation-select-label"
                  id="operation-select"
                  value={operation}
                  label="OpenCV Operation"
                  onChange={(e) => setOperation(e.target.value)}
                >
                  <MenuItem value="grayscale">Grayscale (cv2.cvtColor)</MenuItem>
                  <MenuItem value="crop">Crop 200x200 ROI</MenuItem>
                  <MenuItem value="resize">Resize (300x300 px)</MenuItem>
                  <MenuItem value="rotate">Rotate 90° Clockwise</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Actions: Run & Reset */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
                  {loading ? 'Processing...' : 'Run Operation'}
                </Button>
                {selectedFile && (
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={handleReset}
                    sx={{ minWidth: 48, px: 1.5 }}
                    title="Reset"
                  >
                    <IconRefresh size={20} />
                  </Button>
                )}
              </Stack>
            </Grid>
          </Grid>

          {/* Error Banner */}
          {error && (
            <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Side-by-Side Images Display */}
      <Grid container spacing={3}>
        {/* Original Image */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Original Image
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
                  height: 380,
                  bgcolor: 'grey.50',
                  borderRadius: 2,
                  border: '1px dashed',
                  borderColor: 'divider',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  p: 1
                }}
              >
                {previewUrl ? (
                  <Box
                    component="img"
                    src={previewUrl}
                    alt="Original Upload"
                    sx={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain',
                      borderRadius: 1
                    }}
                  />
                ) : (
                  <Stack spacing={1} sx={{ alignItems: 'center', color: 'text.disabled' }}>
                    <IconPhoto size={48} stroke={1.5} />
                    <Typography variant="body2" color="text.secondary">
                      No image uploaded yet
                    </Typography>
                  </Stack>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Processed Output Image */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Processed Result
                </Typography>
                {processedImage && (
                  <Button
                    size="small"
                    startIcon={<IconDownload size={16} />}
                    component="a"
                    href={processedImage}
                    download={`lab1-${operation}.jpg`}
                    sx={{ textTransform: 'none' }}
                  >
                    Download
                  </Button>
                )}
              </Stack>

              <Box
                sx={{
                  width: '100%',
                  height: 380,
                  bgcolor: 'grey.50',
                  borderRadius: 2,
                  border: '1px dashed',
                  borderColor: 'divider',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  position: 'relative',
                  p: 1
                }}
              >
                {loading ? (
                  <Stack spacing={2} sx={{ alignItems: 'center' }}>
                    <CircularProgress size={42} />
                    <Typography variant="body2" color="text.secondary">
                      Running OpenCV {operation}...
                    </Typography>
                  </Stack>
                ) : processedImage ? (
                  <Box
                    component="img"
                    src={processedImage}
                    alt="Processed Result"
                    sx={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain',
                      borderRadius: 1
                    }}
                  />
                ) : (
                  <Stack spacing={1} sx={{ alignItems: 'center', color: 'text.disabled' }}>
                    <IconPhoto size={48} stroke={1.5} />
                    <Typography variant="body2" color="text.secondary">
                      Run an operation to see the processed result
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
