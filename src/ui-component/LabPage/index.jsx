import { useState, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';

// material-ui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';

// icons
import { IconUpload, IconPlayerPlay, IconX, IconPhoto, IconDownload } from '@tabler/icons-react';

// ==============================|| REUSABLE LAB PAGE COMPONENT ||============================== //

/**
 * LabPage - A reusable component for all Computer Vision lab exercises.
 *
 * @param {string}   title          - The lab title shown in the header (e.g. "Lab 2: Edge Detection").
 * @param {string}   description    - Short description of what this lab does.
 * @param {string}   runButtonLabel - Label text for the execute button (e.g. "Run Edge Detection").
 * @param {string}   apiEndpoint    - FastAPI endpoint to POST the image to (e.g. "http://localhost:8000/api/edge-detection").
 * @param {string}   accentColor    - Hex colour for accent elements specific to this lab.
 * @param {node}     icon           - Tabler icon component to display in the header.
 */
export default function LabPage({ title, description, runButtonLabel, apiEndpoint, accentColor = '#5e35b1', icon: Icon }) {
  // ── State ──────────────────────────────────────────────────────────────────
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [outputUrl, setOutputUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [processingTime, setProcessingTime] = useState(null);
  const fileInputRef = useRef(null);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleFileSelect = useCallback((file) => {
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      setError('Only JPG and PNG images are supported.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be under 10MB.');
      return;
    }

    setError(null);
    setOutputUrl(null);
    setProcessingTime(null);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }, []);

  const handleInputChange = (e) => handleFileSelect(e.target.files?.[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files?.[0]);
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setOutputUrl(null);
    setError(null);
    setProcessingTime(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  /**
   * Task 4 — API Integration
   * Converts the uploaded file to FormData and POSTs to the FastAPI endpoint.
   * The backend is expected to return JSON: { output_image: "<base64_string>" }
   */
  const handleRun = async () => {
    if (!selectedFile) {
      setError('Please upload an image first.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setOutputUrl(null);

    const startTime = performance.now();

    try {
      // ── Option A: FormData (recommended for large images) ─────────────────
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        body: formData
        // Note: Do NOT set Content-Type header — browser sets multipart boundary automatically.
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData?.detail || `Server returned ${response.status}`);
      }

      const data = await response.json();

      // Backend should return: { output_image: "data:image/png;base64,..." }
      // or just the raw base64 string without prefix.
      let imgSrc = data.output_image;
      if (imgSrc && !imgSrc.startsWith('data:')) {
        imgSrc = `data:image/png;base64,${imgSrc}`;
      }

      setOutputUrl(imgSrc);
      setProcessingTime(((performance.now() - startTime) / 1000).toFixed(2));
    } catch (err) {
      console.error('[LabPage] API Error:', err);
      setError(err.message || 'An unexpected error occurred. Is the FastAPI server running?');
    } finally {
      setIsLoading(false);
    }

    // ── Option B: Base64 encoding (alternative approach) ─────────────────────
    // const toBase64 = (file) =>
    //   new Promise((resolve, reject) => {
    //     const reader = new FileReader();
    //     reader.readAsDataURL(file);
    //     reader.onload = () => resolve(reader.result.split(',')[1]);
    //     reader.onerror = reject;
    //   });
    //
    // const base64Image = await toBase64(selectedFile);
    // const response = await fetch(apiEndpoint, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ image: base64Image })
    // });
  };

  const handleDownload = () => {
    if (!outputUrl) return;
    const link = document.createElement('a');
    link.href = outputUrl;
    link.download = `${title.replace(/\s+/g, '_').toLowerCase()}_output.png`;
    link.click();
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          mb: 3,
          p: 3,
          borderRadius: 3,
          background: `linear-gradient(135deg, ${accentColor}18 0%, ${accentColor}08 100%)`,
          border: `1px solid ${accentColor}30`
        }}
      >
        {Icon && (
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2,
              bgcolor: accentColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: `0 8px 24px ${accentColor}50`
            }}
          >
            <Icon size={28} color="#fff" stroke={1.5} />
          </Box>
        )}
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5 }}>
            {title}
          </Typography>
          {description && (
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
              {description}
            </Typography>
          )}
        </Box>
      </Box>

      {/* ── Upload Card ─────────────────────────────────────────────────── */}
      <Card sx={{ mb: 3, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
            Upload Image
          </Typography>

          {/* Drag & Drop Zone */}
          <Box
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => !selectedFile && fileInputRef.current?.click()}
            sx={{
              border: `2px dashed`,
              borderColor: isDragging ? accentColor : selectedFile ? `${accentColor}60` : 'divider',
              borderRadius: 2,
              p: 4,
              textAlign: 'center',
              bgcolor: isDragging ? `${accentColor}08` : selectedFile ? `${accentColor}05` : 'background.default',
              cursor: selectedFile ? 'default' : 'pointer',
              transition: 'all 0.2s ease',
              position: 'relative',
              '&:hover': !selectedFile ? { borderColor: accentColor, bgcolor: `${accentColor}08` } : {}
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png"
              style={{ display: 'none' }}
              onChange={handleInputChange}
              id="lab-file-input"
            />

            {selectedFile ? (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
                <IconPhoto size={20} style={{ color: accentColor }} />
                <Typography variant="body1" sx={{ fontWeight: 600, color: accentColor }}>
                  {selectedFile.name}
                </Typography>
                <Chip
                  label={`${(selectedFile.size / 1024).toFixed(1)} KB`}
                  size="small"
                  sx={{ bgcolor: `${accentColor}15`, color: accentColor }}
                />
                <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleClear(); }} sx={{ ml: 1 }}>
                  <IconX size={16} />
                </IconButton>
              </Box>
            ) : (
              <>
                <IconUpload size={36} style={{ color: accentColor, marginBottom: 8, opacity: 0.7 }} />
                <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
                  Drag & drop an image here, or click to browse
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Accepts JPG and PNG — max 10MB
                </Typography>
              </>
            )}
          </Box>

          {/* Error */}
          {error && (
            <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Run Button */}
          <Box sx={{ mt: 2.5, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              startIcon={isLoading ? <CircularProgress size={18} color="inherit" /> : <IconPlayerPlay size={18} />}
              onClick={handleRun}
              disabled={!selectedFile || isLoading}
              sx={{
                bgcolor: accentColor,
                '&:hover': { bgcolor: `${accentColor}cc` },
                '&:disabled': { bgcolor: `${accentColor}40` },
                fontWeight: 700,
                px: 4,
                borderRadius: 2,
                boxShadow: `0 4px 16px ${accentColor}40`
              }}
            >
              {isLoading ? 'Processing...' : runButtonLabel || 'Run'}
            </Button>

            {outputUrl && (
              <Button
                variant="outlined"
                size="large"
                startIcon={<IconDownload size={18} />}
                onClick={handleDownload}
                sx={{ borderColor: accentColor, color: accentColor, fontWeight: 700, borderRadius: 2 }}
              >
                Download Result
              </Button>
            )}
          </Box>

          {/* Loading Progress */}
          {isLoading && <LinearProgress sx={{ mt: 2, borderRadius: 1, bgcolor: `${accentColor}20`, '& .MuiLinearProgress-bar': { bgcolor: accentColor } }} />}

          {/* Processing time badge */}
          {processingTime && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              ✓ Processed in {processingTime}s
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* ── Side-by-Side Image Preview ───────────────────────────────────── */}
      {(previewUrl || outputUrl) && (
        <>
          <Divider sx={{ mb: 3 }} />
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
            Results
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: 3
            }}
          >
            {/* Original Image */}
            <ImagePanel
              label="Original Image"
              src={previewUrl}
              accentColor="#607d8b"
              empty={!previewUrl}
            />

            {/* Processed Output */}
            <ImagePanel
              label="Processed Output"
              src={outputUrl}
              accentColor={accentColor}
              empty={!outputUrl}
              loading={isLoading}
            />
          </Box>
        </>
      )}
    </Box>
  );
}

// ── Sub-component: image display panel ────────────────────────────────────────
function ImagePanel({ label, src, accentColor, empty, loading }) {
  return (
    <Card
      sx={{
        borderRadius: 2,
        border: '1px solid',
        borderColor: src ? `${accentColor}40` : 'divider',
        overflow: 'hidden'
      }}
    >
      {/* Panel Header */}
      <Box
        sx={{
          px: 2.5,
          py: 1.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          bgcolor: src ? `${accentColor}08` : 'background.paper'
        }}
      >
        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: src ? accentColor : 'text.disabled' }} />
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: src ? accentColor : 'text.secondary' }}>
          {label}
        </Typography>
      </Box>

      {/* Image Area */}
      <Box
        sx={{
          minHeight: 280,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          p: src ? 0 : 3,
          position: 'relative'
        }}
      >
        {loading && !src && (
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={40} sx={{ color: accentColor, mb: 1 }} />
            <Typography variant="caption" color="text.secondary" display="block">
              Waiting for response...
            </Typography>
          </Box>
        )}

        {!loading && empty && !src && (
          <Box sx={{ textAlign: 'center', opacity: 0.4 }}>
            <IconPhoto size={48} style={{ color: '#9e9e9e' }} />
            <Typography variant="caption" color="text.disabled" display="block" sx={{ mt: 1 }}>
              {label === 'Processed Output' ? 'Output will appear here after processing' : 'No image selected'}
            </Typography>
          </Box>
        )}

        {src && (
          <Box
            component="img"
            src={src}
            alt={label}
            sx={{
              width: '100%',
              maxWidth: '100%',
              height: 'auto',
              objectFit: 'contain',
              display: 'block'
            }}
          />
        )}
      </Box>
    </Card>
  );
}

LabPage.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  runButtonLabel: PropTypes.string,
  apiEndpoint: PropTypes.string.isRequired,
  accentColor: PropTypes.string,
  icon: PropTypes.elementType
};

ImagePanel.propTypes = {
  label: PropTypes.string.isRequired,
  src: PropTypes.string,
  accentColor: PropTypes.string,
  empty: PropTypes.bool,
  loading: PropTypes.bool
};
