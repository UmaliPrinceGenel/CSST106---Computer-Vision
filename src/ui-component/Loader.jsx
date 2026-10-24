// material-ui
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

// ==============================|| LOADER ||============================== //

export default function Loader() {
  return (
    <>
      <Box sx={{ position: 'fixed', top: 0, left: 0, zIndex: 2000, width: '100%' }}>
        <LinearProgress color="primary" />
      </Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          width: '100%'
        }}
      >
        <CircularProgress size={42} thickness={4} color="primary" />
      </Box>
    </>
  );
}

