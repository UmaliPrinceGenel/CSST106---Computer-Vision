// material-ui
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { Link as RouterLink } from 'react-router-dom';

// project imports
import LogoSection from '../LogoSection';

import { handlerDrawerOpen, useGetMenuMaster } from 'api/menu';

// assets
import { IconHome, IconMenu2 } from '@tabler/icons-react';

// ==============================|| MAIN NAVBAR / HEADER ||============================== //

export default function Header() {
  const theme = useTheme();
  const downMD = useMediaQuery(theme.breakpoints.down('md'));

  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster?.isDashboardDrawerOpened;

  return (
    <>
      {/* logo & toggler button */}
      <Box sx={{ width: downMD ? 'auto' : 228, display: 'flex', alignItems: 'center' }}>
        <Box component="span" sx={{ display: { xs: 'none', md: 'block' }, flexGrow: 1 }}>
          <LogoSection />
        </Box>
        <Avatar
          variant="rounded"
          sx={{
            ...theme.typography.commonAvatar,
            ...theme.typography.mediumAvatar,
            overflow: 'hidden',
            transition: 'all .2s ease-in-out',
            bgcolor: 'secondary.light',
            color: 'secondary.dark',
            '&:hover': {
              bgcolor: 'secondary.dark',
              color: 'secondary.light'
            }
          }}
          onClick={() => handlerDrawerOpen(!drawerOpen)}
          color="inherit"
        >
          <IconMenu2 stroke={1.5} size="20px" />
        </Avatar>
      </Box>

      {/* navbar Home link */}
      <Button
        component={RouterLink}
        to="/"
        startIcon={<IconHome size={20} />}
        sx={{
          ml: { xs: 1, sm: 2 },
          color: 'text.primary',
          fontWeight: 600,
          fontSize: '0.95rem',
          textTransform: 'none',
          borderRadius: 2,
          px: 2,
          py: 0.8,
          '&:hover': {
            bgcolor: 'secondary.light',
            color: 'secondary.dark'
          }
        }}
      >
        Home
      </Button>

      <Box sx={{ flexGrow: 1 }} />
    </>
  );
}
