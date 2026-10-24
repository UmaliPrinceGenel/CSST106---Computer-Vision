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
import Divider from '@mui/material/Divider';

// assets / icons
import {
  IconBrain,
  IconPlayerPlay,
  IconRefresh,
  IconDownload,
  IconFileAnalytics,
  IconPhoto
} from '@tabler/icons-react';

const API_ENDPOINT = 'http://127.0.0.1:8000/api/lab5-pca';

export default function Lab5() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  // Trigger PCA training & Eigenface generation
  const handleRunPca = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(API_ENDPOINT);

      if (response.data?.eigenfaces_image) {
        setResult(response.data);
      } else if (response.data?.error) {
        setError(response.data.error);
      } else {
        setError('Server returned an unexpected response format.');
      }
    } catch (err) {
      console.error('[Lab5] Error running PCA:', err);
      const message =
        err.response?.data?.detail ||
        err.message ||
        'Failed to connect to FastAPI backend at http://127.0.0.1:8000. Is the server running?';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Reset results
  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header Banner */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
          <Chip label="Lab Activity 5" size="small" color="primary" sx={{ fontWeight: 600 }} />
          <Chip label="Eigenfaces" size="small" variant="outlined" />
          <Chip label="PCA + SVM Classifier" size="small" color="secondary" variant="outlined" />
        </Stack>
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconBrain size={28} /> Lab 5: Facial Recognition using PCA (Eigenfaces)
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Apply Principal Component Analysis (PCA) for facial feature extraction and dimensionality reduction on the LFW (Labeled Faces in the Wild) dataset, then evaluate an RBF Support Vector Machine (SVM) classifier.
        </Typography>
      </Box>

      {/* Control Card: Large Action Button */}
      <Card sx={{ mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ alignItems: { xs: 'stretch', sm: 'center' } }}
          >
            <Button
              variant="contained"
              color="primary"
              size="large"
              disabled={loading}
              onClick={handleRunPca}
              startIcon={loading ? <CircularProgress size={22} color="inherit" /> : <IconPlayerPlay size={22} />}
              sx={{
                px: 4,
                py: 1.5,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem',
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(33, 150, 243, 0.25)'
              }}
            >
              {loading ? 'Training Model & Computing PCA...' : 'Run PCA & Train Model'}
            </Button>

            {result && (
              <Button
                variant="outlined"
                color="secondary"
                size="large"
                onClick={handleReset}
                startIcon={<IconRefresh size={18} />}
                sx={{ textTransform: 'none', borderRadius: 2, py: 1.5 }}
              >
                Reset
              </Button>
            )}
          </Stack>

          {/* Loading indicator with status message */}
          {loading && (
            <Box sx={{ mt: 2.5, p: 2, bgcolor: 'primary.lighter', borderRadius: 2, border: '1px solid', borderColor: 'primary.light' }}>
              <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                <CircularProgress size={24} color="primary" />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'primary.dark' }}>
                    Model computation in progress...
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Loading LFW dataset, extracting 150 principal components (Eigenfaces), and training the RBF SVM classifier.
                  </Typography>
                </Box>
              </Stack>
            </Box>
          )}

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Results Section */}
      {result ? (
        <Grid container spacing={3}>
          {/* 1. Dataset Summary & Classification Report in <pre> tags */}
          <Grid size={{ xs: 12 }}>
            <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
              <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                <Typography variant="h4" sx={{ fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconFileAnalytics size={22} /> Model Evaluation & Metrics
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                  Dataset characteristics and detailed classification report of the trained SVM model on the test partition.
                </Typography>

                <Grid container spacing={2}>
                  {/* Dataset Summary Box */}
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        Dataset Summary
                      </Typography>
                      <Box
                        component="pre"
                        sx={{
                          p: 2,
                          bgcolor: '#0f172a',
                          color: '#38bdf8',
                          borderRadius: 2,
                          fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                          fontSize: '0.875rem',
                          lineHeight: 1.6,
                          overflowX: 'auto',
                          m: 0,
                          flexGrow: 1,
                          border: '1px solid #1e293b'
                        }}
                      >
                        {result.dataset_summary}
                      </Box>
                    </Box>
                  </Grid>

                  {/* Classification Report Box */}
                  <Grid size={{ xs: 12, md: 8 }}>
                    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        Classification Report (Precision, Recall, F1-Score)
                      </Typography>
                      <Box
                        component="pre"
                        sx={{
                          p: 2,
                          bgcolor: '#0f172a',
                          color: '#e2e8f0',
                          borderRadius: 2,
                          fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                          fontSize: '0.85rem',
                          lineHeight: 1.5,
                          overflowX: 'auto',
                          m: 0,
                          flexGrow: 1,
                          border: '1px solid #1e293b'
                        }}
                      >
                        {result.classification_report}
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* 2. Eigenfaces Plot: Full Width <img> Tag Stacked Vertically */}
          <Grid size={{ xs: 12 }}>
            <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
              <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>
                      First 12 Eigenfaces (PCA Components)
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Orthonormal basis vectors representing the most significant facial variations across the LFW dataset
                    </Typography>
                  </Box>

                  {result.eigenfaces_image && (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<IconDownload size={16} />}
                      component="a"
                      href={result.eigenfaces_image}
                      download="eigenfaces-gallery.png"
                      sx={{ textTransform: 'none' }}
                    >
                      Download Plot
                    </Button>
                  )}
                </Stack>

                <Box
                  sx={{
                    width: '100%',
                    bgcolor: 'grey.50',
                    borderRadius: 2,
                    border: '1px dashed',
                    borderColor: 'divider',
                    p: { xs: 1, md: 2 },
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  <Box
                    component="img"
                    src={result.eigenfaces_image}
                    alt="First 12 Eigenfaces"
                    className="w-full object-contain"
                    sx={{
                      width: '100%',
                      maxWidth: '100%',
                      height: 'auto',
                      objectFit: 'contain',
                      display: 'block',
                      borderRadius: 1,
                      boxShadow: '0 4px 14px rgba(0,0,0,0.06)'
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* 3. Failures Plot: Full Width <img> Tag Stacked Vertically */}
          <Grid size={{ xs: 12 }}>
            <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
              <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>
                      Classification Failures (Predicted vs. True)
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Sample faces from the test set where the SVM model predicted incorrectly (P = Predicted, T = True)
                    </Typography>
                  </Box>

                  {result.failures_image && (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<IconDownload size={16} />}
                      component="a"
                      href={result.failures_image}
                      download="pca-svm-failures.png"
                      sx={{ textTransform: 'none' }}
                    >
                      Download Plot
                    </Button>
                  )}
                </Stack>

                <Box
                  sx={{
                    width: '100%',
                    bgcolor: 'grey.50',
                    borderRadius: 2,
                    border: '1px dashed',
                    borderColor: 'divider',
                    p: { xs: 1, md: 2 },
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  <Box
                    component="img"
                    src={result.failures_image}
                    alt="Classification Failures"
                    className="w-full object-contain"
                    sx={{
                      width: '100%',
                      maxWidth: '100%',
                      height: 'auto',
                      objectFit: 'contain',
                      display: 'block',
                      borderRadius: 1,
                      boxShadow: '0 4px 14px rgba(0,0,0,0.06)'
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      ) : (
        /* Empty State */
        <Card sx={{ border: '1px dashed', borderColor: 'divider', borderRadius: 2 }}>
          <CardContent sx={{ py: 8, textAlign: 'center' }}>
            <Stack spacing={1.5} sx={{ alignItems: 'center', color: 'text.disabled' }}>
              <IconPhoto size={64} stroke={1.5} />
              <Typography variant="h5" color="text.secondary" sx={{ fontWeight: 600 }}>
                No model training results yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 480 }}>
                Click &quot;Run PCA & Train Model&quot; above to fetch the LFW dataset, extract Eigenfaces, and evaluate the SVM classifier.
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
