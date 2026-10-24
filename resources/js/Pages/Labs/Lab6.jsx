import { useState, useRef, useEffect, useCallback } from 'react';
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
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';


// assets / icons
import {
  IconEye,
  IconUpload,
  IconCamera,
  IconPlayerPlay,
  IconRefresh,
  IconDownload,
  IconVideoOff,
  IconPhoto
} from '@tabler/icons-react';

const API_ENDPOINT = 'http://127.0.0.1:8000/api/lab6-yolo';

export default function Lab6() {
  // Mode selection: 0 = "Upload Image", 1 = "Use Webcam"
  const [mode, setMode] = useState(0);

  // File upload state (Mode 1)
  const [file, setFile] = useState(null);

  // Webcam state (Mode 2)
  const [capturedBlob, setCapturedBlob] = useState(null);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [webcamError, setWebcamError] = useState(null);

  // Preview, processing, and output state
  const [previewUrl, setPreviewUrl] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);

  // Loading state: strictly starts as false and is ONLY true during active axios requests
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // DOM references for video, canvas snapshot, and media stream
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Stop webcam tracks helper to release hardware and prevent memory leaks
  const stopWebcam = useCallback(() => {
    try {
      if (streamRef.current) {
        const tracks = streamRef.current.getTracks();
        tracks.forEach((track) => {
          try {
            track.stop();
          } catch (e) {
            console.warn('[Lab6] Error stopping track:', e);
          }
        });
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    } catch (err) {
      console.warn('[Lab6] Error during webcam cleanup:', err);
    } finally {
      setIsWebcamActive(false);
    }
  }, []);

  // Start webcam: explicitly invoked on button click, with comprehensive try/catch
  const startWebcam = async () => {
    setWebcamError(null);

    if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setWebcamError('Webcam access is not supported by your browser or environment.');
      setIsWebcamActive(false);
      return;
    }

    try {
      // Release any previously opened stream first
      stopWebcam();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play?.().catch((playErr) => {
          console.warn('[Lab6] Video playback interrupted:', playErr);
        });
      }

      setIsWebcamActive(true);
    } catch (err) {
      console.error('[Lab6] Webcam initialization failed:', err);
      stopWebcam();

      let message = 'Unable to access the camera.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        message = 'Camera permission was denied. Please allow camera access in your browser settings.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        message = 'No camera device was detected on your system.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        message = 'Camera is currently in use by another application. Please close other camera apps and try again.';
      } else if (err.message) {
        message = `Camera error: ${err.message}`;
      }

      setWebcamError(message);
    }
  };

  // Switch modes: automatically release camera when switching to Upload mode
  const handleModeChange = (event, newMode) => {
    setMode(newMode);
    setError(null);
    setWebcamError(null);
    if (newMode !== 1) {
      stopWebcam();
    }
  };

  // Cleanup webcam stream when component unmounts (Strictly avoids auto-starting on mount)
  useEffect(() => {
    return () => {
      stopWebcam();
    };
  }, [stopWebcam]);

  // File upload selection handler
  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setProcessedImage(null);
      setError(null);
    }
  };

  // Send image to FastAPI YOLOv11 backend via exact endpoint
  const executeDetection = async (targetData, filename = 'image.jpg') => {
    if (!targetData) {
      setError('Please select an image file or capture a webcam frame first.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', targetData, filename);

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
      console.error('[Lab6] YOLOv11 inference error:', err);
      const message =
        err.response?.data?.detail ||
        err.message ||
        'Failed to connect to FastAPI backend at http://127.0.0.1:8000. Please ensure the Python server is running.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Webcam snapshot & detect handler
  const handleCaptureAndDetect = () => {
    if (!videoRef.current || !canvasRef.current || !isWebcamActive) {
      setError('Webcam is not active. Please click "Start Webcam" first.');
      return;
    }

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      const width = video.videoWidth || 640;
      const height = video.videoHeight || 480;

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setError('Failed to get 2D canvas context for frame capture.');
        return;
      }

      ctx.drawImage(video, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            setCapturedBlob(blob);
            setPreviewUrl(URL.createObjectURL(blob));
            // Send frame directly to YOLOv11 backend
            executeDetection(blob, 'webcam_capture.jpg');
          } else {
            setError('Failed to capture frame from webcam.');
          }
        },
        'image/jpeg',
        0.95
      );
    } catch (err) {
      console.error('[Lab6] Frame capture error:', err);
      setError('An error occurred while capturing frame from the webcam.');
    }
  };

  // Reset all state
  const handleReset = () => {
    setFile(null);
    setCapturedBlob(null);
    setPreviewUrl(null);
    setProcessedImage(null);
    setError(null);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header Banner */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
          <Chip label="Lab Activity 6" size="small" color="primary" sx={{ fontWeight: 600 }} />
          <Chip label="Object Detection" size="small" color="primary" variant="outlined" />
          <Chip label="YOLOv11 Custom" size="small" color="secondary" variant="outlined" />
        </Stack>
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          <CenterFocusStrongIcon sx={{ fontSize: 28 }} /> Lab 6: YOLOv11 Object Detection
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Upload an image or use the live webcam feed to detect face masks using a custom-trained YOLOv11 model.
        </Typography>
      </Box>

      {/* Control Card */}
      <Card sx={{ mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        {/* Mode Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: { xs: 2, md: 3 }, pt: 1.5 }}>
          <Tabs value={mode} onChange={handleModeChange} aria-label="YOLOv11 Input Mode">
            <Tab
              icon={<IconUpload size={18} />}
              iconPosition="start"
              label="Upload Image"
              sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.95rem' }}
            />
            <Tab
              icon={<IconCamera size={18} />}
              iconPosition="start"
              label="Use Webcam"
              sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.95rem' }}
            />
          </Tabs>
        </Box>

        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          {/* ── Mode 1: Upload Image ─────────────────────────────────── */}
        {mode === 0 && (
          <Grid container spacing={3} sx={{ alignItems: 'center', mb: 2 }}>
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
                  Select Image for YOLOv11 Detection
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
                  onClick={() => executeDetection(file, file.name)}
                  startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <IconPlayerPlay size={20} />}
                  sx={{ py: 1.5, textTransform: 'none', fontWeight: 600, borderRadius: 1.5 }}
                >
                  {isLoading ? 'Running YOLOv11 Detection...' : 'Run YOLOv11 Detection'}
                </Button>

                {(file || processedImage) && (
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
        )}

        {/* ── Mode 2: Use Webcam ──────────────────────────────────── */}
        {mode === 1 && (
          <Box sx={{ mb: 2 }}>
            {webcamError && (
              <Alert severity="warning" sx={{ mb: 2 }} onClose={() => setWebcamError(null)}>
                {webcamError}
              </Alert>
            )}

            <Grid container spacing={3}>
              {/* Live Video Feed Container */}
              <Grid item xs={12} md={7}>
                <Box
                  sx={{
                    position: 'relative',
                    width: '100%',
                    minHeight: 320,
                    bgcolor: '#111',
                    borderRadius: 2,
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.12)'
                  }}
                >
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{
                      width: '100%',
                      height: 'auto',
                      maxHeight: 380,
                      objectFit: 'contain',
                      display: isWebcamActive ? 'block' : 'none'
                    }}
                  />

                  {!isWebcamActive && (
                    <Stack spacing={2} sx={{ alignItems: 'center', color: 'grey.500', p: 4, textAlign: 'center' }}>
                      <IconVideoOff size={48} />
                      <Typography variant="body2" sx={{ color: 'grey.400' }}>
                        Camera is currently inactive. Click below to begin video stream.
                      </Typography>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={startWebcam}
                        startIcon={<IconCamera size={18} />}
                        sx={{ textTransform: 'none', fontWeight: 600 }}
                      >
                        Start Webcam
                      </Button>
                    </Stack>
                  )}
                </Box>

                {/* Hidden snapshot canvas */}
                <canvas ref={canvasRef} style={{ display: 'none' }} />
              </Grid>

              {/* Webcam Controls & Actions */}
              <Grid item xs={12} md={5}>
                <Stack spacing={2} sx={{ height: '100%', justifyContent: 'center' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Live Webcam Controls
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Point your camera towards objects and click &quot;Capture & Detect&quot; to grab the current frame and execute YOLOv11 neural network inference.
                  </Typography>

                  <Button
                    variant="contained"
                    color="secondary"
                    size="large"
                    disabled={!isWebcamActive || isLoading}
                    onClick={handleCaptureAndDetect}
                    startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <IconCamera size={20} />}
                    sx={{ py: 1.5, textTransform: 'none', fontWeight: 600, borderRadius: 1.5 }}
                  >
                    {isLoading ? 'Running YOLOv11 Inference...' : 'Capture & Detect'}
                  </Button>

                  <Stack direction="row" spacing={1.5}>
                    {isWebcamActive ? (
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={stopWebcam}
                        startIcon={<IconVideoOff size={16} />}
                        sx={{ textTransform: 'none' }}
                      >
                        Stop Webcam
                      </Button>
                    ) : (
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={startWebcam}
                        startIcon={<IconCamera size={16} />}
                        sx={{ textTransform: 'none' }}
                      >
                        Start Webcam
                      </Button>
                    )}

                    {(capturedBlob || processedImage) && (
                      <Button
                        variant="outlined"
                        color="inherit"
                        onClick={handleReset}
                        startIcon={<IconRefresh size={16} />}
                        sx={{ textTransform: 'none' }}
                      >
                        Reset
                      </Button>
                    )}
                  </Stack>
                </Stack>
              </Grid>
            </Grid>
          </Box>
        )}

          {/* General Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Results Section */}
      <Box sx={{ mt: 3 }}>
        <Grid container spacing={3}>
          {/* Input Preview Thumbnail (if any frame/file chosen) */}
          {previewUrl && (
            <Grid item xs={12} md={4}>
              <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Input / Captured Frame
                  </Typography>
                  <Box
                    sx={{
                      width: '100%',
                      height: 260,
                      bgcolor: 'grey.50',
                      borderRadius: 1.5,
                      border: '1px solid',
                      borderColor: 'divider',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      p: 1
                    }}
                  >
                    <Box
                      component="img"
                      src={previewUrl}
                      alt="Input Preview"
                      sx={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', borderRadius: 1 }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Full-Width YOLOv11 Annotated Output Card */}
          <Grid item xs={12} md={previewUrl ? 8 : 12}>
            <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
              <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>
                      YOLOv11 Detection Output
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Bounding boxes, class labels, and confidence metrics rendered by YOLOv11
                    </Typography>
                  </Box>

                  {processedImage && (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<IconDownload size={16} />}
                      component="a"
                      href={processedImage}
                      download="yolov11-detected-result.jpg"
                      sx={{ textTransform: 'none' }}
                    >
                      Download Output
                    </Button>
                  )}
                </Stack>

                <Box
                  sx={{
                    width: '100%',
                    minHeight: 360,
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
                  {isLoading ? (
                    <Stack spacing={2} sx={{ alignItems: 'center', py: 6 }}>
                      <CircularProgress size={48} />
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        Running YOLOv11 neural network inference...
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Detecting objects and rendering bounding box annotations
                      </Typography>
                    </Stack>
                  ) : processedImage ? (
                    <Box
                      component="img"
                      src={processedImage}
                      alt="YOLOv11 Object Detection Result"
                      className="w-full object-contain"
                      sx={{
                        width: '100%',
                        maxWidth: '100%',
                        height: 'auto',
                        maxHeight: 650,
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
                        No detection performed yet
                      </Typography>
                      <Typography variant="body2" color="text.disabled">
                        Upload an image or start the webcam to capture and detect objects
                      </Typography>
                    </Stack>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
