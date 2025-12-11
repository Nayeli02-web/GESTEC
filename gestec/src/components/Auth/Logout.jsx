import { useEffect, useState } from 'react';
import { Container, Paper, Typography, CircularProgress, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useTranslation } from 'react-i18next';

export default function Logout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleLogout = async () => {
      try {
        await logout();
        setMessage(t('logout.success', 'Sesión cerrada exitosamente'));
        
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } catch (err) {
        setMessage(t('logout.error', 'Error al cerrar sesión'));
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      }
    };

    handleLogout();
  }, [navigate, t, logout]);

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('logout.title', 'Cerrando Sesión')}
        </Typography>
        
        <Box sx={{ my: 3 }}>
          <CircularProgress />
        </Box>

        {message && (
          <Typography variant="body1" color="text.secondary">
            {message}
          </Typography>
        )}
      </Paper>
    </Container>
  );
}
