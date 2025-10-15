import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import { Link as RouterLink } from 'react-router-dom';

export default function HeaderAlt() {
  return (
    <AppBar position="static" color="primary">
      <Toolbar sx={{ maxWidth: 1100, width: '100%', margin: '0 auto', px: 2 }}>
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{ color: 'inherit', textDecoration: 'none', fontWeight: 700 }}
        >
          GESTEC
        </Typography>
        <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
          <Button component={RouterLink} to="/" color="inherit">Inicio</Button>
          <Button component={RouterLink} to="/home-tecnico" color="inherit">Datos Técnico</Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
