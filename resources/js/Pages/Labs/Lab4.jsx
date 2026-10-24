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
  IconVector
} from '@tabler/icons-react';

export default function Lab4() {
  // State for holding two distinct image files
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);

  // Previews and execution state
  const [preview1, setPreview1] = useState(null);
  const [preview2, setPreview2] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // File 1 selection handler (Target)
  const handleFile1Change = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile1(file);
      setPreview1(URL.createObjectURL(file));
      setProcessedImage(null);
      setError(null);
    }
  };

  // File 2 selection handler (Scene)
  const handleFile2Change = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile2(file);
      setPreview2(URL.createObjectURL(file));
      setProcessedImage(null);
      setError(null);
    }
  };

  // Submission handler with FormData appending file1 and file2
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!file1 || !file2) {
      setError('Please upload both Image 1 (Target) and Image 2 (Scene) before running.');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file1', file1);
    formData.append('file2', file2);

    try {
      // Absolute URL to FastAPI server to avoid 404 proxy or port mismatch errors
      const response = await axios.post('http://127.0.0.1:8000/api/lab4-feature-matching', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data?.processed_image || response.data?.output_image) {
        setProcessedImage(response.data.processed_image || response.data.output_image);
      } else if (response.data?.error) {
        setError(response.data.error);
      } else {
        setError('Server returned an unexpected response format.');
      }
    } catch (err) {
      console.error('[Lab4] Error running feature matching:', err);
      const message =
        err.response?.data?.detail ||
        err.message ||
        'Failed to connect to FastAPI backend at http://127.0.0.1:8000. Please ensure the server is active.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Reset all state
  const handleReset = () => {
    setFile1(null);
    setFile2(null);
    setPreview1(null);
    setPreview2(null);
    setProcessedImage(null);
    setError(null);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header Banner */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
          <Chip label="Lab Activity 4" size="small" color="primary" sx={{ fontWeight: 600 }} />
          <Chip label="Two-Image Matching" size="small" variant="outlined" />
          <Chip label="SURF / SIFT & ORB" size="small" color="secondary" variant="outlined" />
        </Stack>
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconVector size={28} /> Lab 4: Feature Detection & Matching
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Upload two overlapping images (Target and Scene) to extract scale-invariant keypoints (SURF/SIFT and ORB) and calculate pairwise descriptor correspondences using Brute-Force Matching.
        </Typography>
      </Box>

      {/* Control Card: TWO Distinct File Inputs */}
      <Card sx={{ mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            Image Inputs (Dual Upload)
          </Typography>

          <Grid container spacing={3}>
            {/* Input 1: Upload Image 1 (Target) */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box
                sx={{
                  p: 2,
                  border: '1.5px dashed',
                  borderColor: file1 ? 'primary.main' : 'divider',
                  borderRadius: 2,
                  bgcolor: file1 ? 'primary.lighter' : 'background.paper',
                  textAlign: 'center'
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  Upload Image 1 (Target)
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                  The query object or template to detect
                </Typography>
                <Button
                  variant={file1 ? 'contained' : 'outlined'}
                  component="label"
                  color="primary"
                  startIcon={<IconUpload size={18} />}
                  sx={{ textTransform: 'none' }}
                >
                  {file1 ? file1.name : 'Choose Target Image'}
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleFile1Change}
                  />
                </Button>
                {file1 && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                    {(file1.size / 1024).toFixed(1)} KB
                  </Typography>
                )}
              </Box>
            </Grid>

            {/* Input 2: Upload Image 2 (Scene) */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box
                sx={{
                  p: 2,
                  border: '1.5px dashed',
                  borderColor: file2 ? 'secondary.main' : 'divider',
                  borderRadius: 2,
                  bgcolor: file2 ? 'secondary.lighter' : 'background.paper',
                  textAlign: 'center'
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  Upload Image 2 (Scene)
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                  The environment containing the target object
                </Typography>
                <Button
                  variant={file2 ? 'contained' : 'outlined'}
                  component="label"
                  color="secondary"
                  startIcon={<IconUpload size={18} />}
                  sx={{ textTransform: 'none' }}
                >
                  {file2 ? file2.name : 'Choose Scene Image'}
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleFile2Change}
                  />
                </Button>
                {file2 && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                    {(file2.size / 1024).toFixed(1)} KB
                  </Typography>
                )}
              </Box>
            </Grid>

            {/* Action Buttons: Execute & Reset */}
            <Grid size={{ xs: 12 }}>
              <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'flex-start', alignItems: 'center' }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={!file1 || !file2 || loading}
                  onClick={handleSubmit}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <IconPlayerPlay size={20} />}
                  sx={{ px: 4, py: 1.2, textTransform: 'none', fontWeight: 600, borderRadius: 1.5 }}
                >
                  {loading ? 'Processing Feature Matching...' : 'Run Feature Matching'}
                </Button>

                {(file1 || file2 || processedImage) && (
                  <Button
                    variant="outlined"
                    color="inherit"
                    size="large"
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

      {/* Results Section */}
      <Grid container spacing={3}>
        {/* Input Images Preview Cards */}
        {(preview1 || preview2) && (
          <Grid size={{ xs: 12 }}>
            <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                  Selected Input Images
                </Typography>

                <Grid container spacing={2}>
                  {/* Image 1 (Target) Preview */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Box
                      sx={{
                        width: '100%',
                        height: 220,
                        bgcolor: 'grey.50',
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        p: 1
                      }}
                    >
                      {preview1 ? (
                        <Box
                          component="img"
                          src={preview1}
                          alt="Target Image Preview"
                          sx={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', borderRadius: 1 }}
                        />
                      ) : (
                        <Typography variant="caption" color="text.disabled">
                          Target Image not selected
                        </Typography>
                      )}
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, textAlign: 'center' }}>
                      Image 1 (Target): {file1 ? file1.name : 'None'}
                    </Typography>
                  </Grid>

                  {/* Image 2 (Scene) Preview */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Box
                      sx={{
                        width: '100%',
                        height: 220,
                        bgcolor: 'grey.50',
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        p: 1
                      }}
                    >
                      {preview2 ? (
                        <Box
                          component="img"
                          src={preview2}
                          alt="Scene Image Preview"
                          sx={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', borderRadius: 1 }}
                        />
                      ) : (
                        <Typography variant="caption" color="text.disabled">
                          Scene Image not selected
                        </Typography>
                      )}
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, textAlign: 'center' }}>
                      Image 2 (Scene): {file2 ? file2.name : 'None'}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Full-Width Feature Detection & Matching 1x3 Output Plot */}
        <Grid size={{ xs: 12 }}>
          <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    Feature Detection & Matching Grid (1x3 Output)
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Image 1 Primary Keypoints | Image 1 ORB Keypoints | Top 50 Feature Matches
                  </Typography>
                </Box>

                {processedImage && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<IconDownload size={16} />}
                    component="a"
                    href={processedImage}
                    download="lab4-feature-matching-plot.png"
                    sx={{ textTransform: 'none' }}
                  >
                    Download Plot
                  </Button>
                )}
              </Stack>

              <Box
                sx={{
                  width: '100%',
                  minHeight: 380,
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
                      Computing scale-invariant keypoints & Brute-Force matching...
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Extracting SURF/SIFT descriptors, ORB corners, and generating 20x6 Matplotlib figure
                    </Typography>
                  </Stack>
                ) : processedImage ? (
                  <Box
                    component="img"
                    src={processedImage}
                    alt="Feature Detection & Matching 1x3 Plot"
                    className="w-full object-contain"
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
                      No feature matches generated yet
                    </Typography>
                    <Typography variant="body2" color="text.disabled">
                      Select two images above and click &quot;Run Feature Matching&quot; to view the 3-panel comparison grid
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
