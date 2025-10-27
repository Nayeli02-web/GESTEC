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
        {/* Logo y título */}
        <Box 
          component={RouterLink} 
          to="/" 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1.5,
            textDecoration: 'none',
            color: 'inherit'
          }}
        >
          <Box
            component="img"
            src="http://localhost:81/GESTEC/uploads/logo.jpg"
            alt="GESTEC Logo"
            sx={{
              height: 40,
              width: 40,
              borderRadius: '50%',
              objectFit: 'cover',
              backgroundColor: 'white',
              padding: '2px'
            }}
          />
          <Typography
            variant="h6"
            sx={{ fontWeight: 700 }}
          >
            GESTEC
          </Typography>
        </Box>
        
        {/* Botones de navegación */}
        <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
          <Button component={RouterLink} to="/" color="inherit">Inicio</Button>
          <Button component={RouterLink} to="/asignaciones" color="inherit">Asignaciones</Button>
          <Button component={RouterLink} to="/tickets" color="inherit">Tickets</Button>
          <Button component={RouterLink} to="/tecnicos" color="inherit">Técnicos</Button>
          <Button component={RouterLink} to="/categorias" color="inherit">Categorías</Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
