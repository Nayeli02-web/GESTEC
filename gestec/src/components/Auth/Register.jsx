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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useTranslation } from 'react-i18next';

export default function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    contrasena: '',
    confirmarContrasena: '',
    rol_id: 2, // Por defecto Cliente
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

    // Validar que las contraseñas coincidan
    if (formData.contrasena !== formData.confirmarContrasena) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    // Validar longitud de contraseña (mínimo 8 caracteres)
    if (formData.contrasena.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      setLoading(false);
      return;
    }

    // Validar complejidad de contraseña (al menos una letra y un número)
    const tieneLetra = /[a-zA-Z]/.test(formData.contrasena);
    const tieneNumero = /[0-9]/.test(formData.contrasena);
    if (!tieneLetra || !tieneNumero) {
      setError('La contraseña debe contener al menos una letra y un número');
      setLoading(false);
      return;
    }

    try {
      const result = await register(
        formData.nombre,
        formData.correo,
        formData.contrasena,
        formData.rol_id
      );
      
      if (result.status === 201) {
        // Registro exitoso, redirigir a login
        navigate('/login', {
          state: { message: 'Registro exitoso. Por favor inicia sesión.' }
        });
      }
    } catch (err) {
      setError(err.message || 'Error al registrarse. Intenta con otro correo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          {t('register.title', 'Registrarse')}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
          Crea tu cuenta en el sistema
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <TextField
            fullWidth
            label={t('register.name', 'Nombre Completo')}
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
            autoFocus
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label={t('register.email', 'Correo Electrónico')}
            name="correo"
            type="email"
            value={formData.correo}
            onChange={handleChange}
            required
            helperText="Debe ser un correo electrónico válido"
            inputProps={{
              pattern: "[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$"
            }}
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="rol-label">Rol</InputLabel>
            <Select
              labelId="rol-label"
              name="rol_id"
              value={formData.rol_id}
              onChange={handleChange}
              label="Rol"
              required
            >
              <MenuItem value={1}>Administrador</MenuItem>
              <MenuItem value={2}>Cliente</MenuItem>
              <MenuItem value={3}>Técnico</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label={t('register.password', 'Contraseña')}
            name="contrasena"
            type="password"
            value={formData.contrasena}
            onChange={handleChange}
            required
            helperText="Mínimo 8 caracteres, debe incluir letras y números"
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label={t('register.confirmPassword', 'Confirmar Contraseña')}
            name="confirmarContrasena"
            type="password"
            value={formData.confirmarContrasena}
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
              t('register.submit', 'Registrarse')
            )}
          </Button>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2">
              {t('register.hasAccount', '¿Ya tienes cuenta?')}{' '}
              <MuiLink component={Link} to="/login" underline="hover">
                {t('register.login', 'Inicia sesión aquí')}
              </MuiLink>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}
