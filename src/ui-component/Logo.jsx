import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import iconPng from 'assets/images/icon.png';

// ==============================|| LOGO PGRU ||============================== //

export default function Logo() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, userSelect: 'none' }}>
      <Box
        component="img"
        src={iconPng}
        alt="PGRU"
        sx={{
          width: 34,
          height: 34,
          borderRadius: '8px',
          objectFit: 'cover',
          boxShadow: '0 2px 8px rgba(0,0,0,0.18)'
        }}
      />
      <Typography
        variant="h3"
        sx={{
          fontWeight: 800,
          letterSpacing: '0.06em',
          color: 'text.primary',
          fontSize: '1.25rem',
          lineHeight: 1
        }}
      >
        PGRU
      </Typography>
    </Box>
  );
}
