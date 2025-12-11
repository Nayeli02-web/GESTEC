import { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Link as MuiLink,
} from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useTranslation } from 'react-i18next';

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    correo: '',
    contrasena: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(formData.correo, formData.contrasena);
      
      if (result.status === 200) {
        // Todos los usuarios van al inicio después del login
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          {t('login.title', 'Iniciar Sesión')}
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <TextField
            fullWidth
            label={t('login.email', 'Correo Electrónico')}
            name="correo"
            type="email"
            value={formData.correo}
            onChange={handleChange}
            required
            autoFocus
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label={t('login.password', 'Contraseña')}
            name="contrasena"
            type="password"
            value={formData.contrasena}
            onChange={handleChange}
            required
            sx={{ mb: 3 }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ mb: 2 }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              t('login.submit', 'Iniciar Sesión')
            )}
          </Button>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2">
              {t('login.noAccount', '¿No tienes cuenta?')}{' '}
              <MuiLink component={Link} to="/register" underline="hover">
                {t('login.register', 'Regístrate aquí')}
              </MuiLink>
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Credenciales de prueba */}
      <Paper elevation={1} sx={{ p: 2, mt: 2, bgcolor: 'info.light' }}>
        <Typography variant="subtitle2" gutterBottom>
          Credenciales de Prueba:
        </Typography>
        <Typography variant="body2">
          <strong>Admin:</strong> admin@correo.com / 12345
        </Typography>
        <Typography variant="body2">
          <strong>Cliente:</strong> carlos@correo.com / 12345
        </Typography>
        <Typography variant="body2">
          <strong>Técnico:</strong> pedro@correo.com / 12345
        </Typography>
      </Paper>
    </Container>
  );
}
