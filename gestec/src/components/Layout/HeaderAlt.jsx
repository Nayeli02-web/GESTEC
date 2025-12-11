import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import LogoutIcon from '@mui/icons-material/Logout';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import LanguageSwitcher from '../LanguageSwitcher';
import NotificacionesMenu from '../Notificaciones/NotificacionesMenu';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../Auth/AuthContext';

export default function HeaderAlt() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

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
        <Box sx={{ ml: 'auto', display: 'flex', gap: 1, alignItems: 'center' }}>
          {/* Inicio - Para todos */}
          <Button component={RouterLink} to="/" color="inherit">
            {t('navigation.home')}
          </Button>
          
          {/* Opciones para ADMINISTRADORES - pueden ver todo */}
          {user?.rol_id === 1 && (
            <>
              <Button component={RouterLink} to="/dashboard" color="inherit">
                Dashboard
              </Button>
              <Button component={RouterLink} to="/tickets" color="inherit">
                {t('navigation.tickets')}
              </Button>
              <Button component={RouterLink} to="/asignaciones" color="inherit">
                {t('navigation.assignments')}
              </Button>
              <Button component={RouterLink} to="/tecnicos" color="inherit">
                {t('navigation.technicians')}
              </Button>
              <Button component={RouterLink} to="/usuarios" color="inherit">
                Usuarios
              </Button>
              <Button component={RouterLink} to="/categorias" color="inherit">
                {t('navigation.categories')}
              </Button>
            </>
          )}
          
          {/* Opciones para TÉCNICOS - todos los tickets y asignaciones */}
          {user?.rol_id === 3 && (
            <>
              <Button component={RouterLink} to="/tickets" color="inherit">
                {t('navigation.tickets')}
              </Button>
              <Button component={RouterLink} to="/asignaciones" color="inherit">
                {t('navigation.assignments')}
              </Button>
            </>
          )}
          
          {/* Opciones para CLIENTES - solo tickets */}
          {user?.rol_id === 2 && (
            <Button component={RouterLink} to="/tickets" color="inherit">
              {t('navigation.tickets')}
            </Button>
          )}
          
          <LanguageSwitcher />
          
          {/* Notificaciones - para todos los usuarios autenticados */}
          {user && <NotificacionesMenu />}
          
          {/* Usuario y cerrar sesión */}
          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
              <Typography variant="body2" sx={{ color: 'inherit' }}>
                {user.nombre}
              </Typography>
              <IconButton 
                color="inherit" 
                onClick={handleLogout}
                title="Cerrar sesión"
                size="small"
              >
                <LogoutIcon />
              </IconButton>
            </Box>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
