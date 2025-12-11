import { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import UsuarioService from '../../services/UsuarioService';
import { useAuth } from '../Auth/AuthContext';

export default function ChangePassword() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isAdmin } = useAuth();
  const [formData, setFormData] = useState({
    password: '',
    confirmarPassword: '',
  });
  const [usuario, setUsuario] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadUsuario = useCallback(async () => {
    try {
      setLoading(true);
      const response = await UsuarioService.getById(id);
      if (response.status === 200 && response.result) {
        setUsuario(response.result);
      } else {
        setError('Usuario no encontrado');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error al cargar usuario');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    loadUsuario();
  }, [isAdmin, navigate, loadUsuario]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    // Validar que las contraseñas coincidan
    if (formData.password !== formData.confirmarPassword) {
      setError('Las contraseñas no coinciden');
      setSubmitting(false);
      return;
    }

    // Validar longitud de contraseña
    if (formData.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      setSubmitting(false);
      return;
    }

    // Validar complejidad de contraseña
    const tieneLetra = /[a-zA-Z]/.test(formData.password);
    const tieneNumero = /[0-9]/.test(formData.password);
    if (!tieneLetra || !tieneNumero) {
      setError('La contraseña debe contener al menos una letra y un número');
      setSubmitting(false);
      return;
    }

    try {
      const response = await UsuarioService.updatePassword(id, formData.password);

      if (response.status === 200) {
        navigate('/usuarios', {
          state: { message: 'Contraseña actualizada exitosamente' },
        });
      } else {
        setError(response.message || 'Error al actualizar contraseña');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error al actualizar contraseña');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Cambiar Contraseña
        </Typography>

        {usuario && (
          <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Usuario:</strong> {usuario.nombre}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Correo:</strong> {usuario.correo}
            </Typography>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Importante:</strong> La nueva contraseña debe cumplir con los requisitos de
            seguridad: mínimo 8 caracteres, incluir letras y números.
          </Typography>
        </Alert>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <TextField
            fullWidth
            label="Nueva Contraseña"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            autoFocus
            helperText="Mínimo 8 caracteres, debe incluir letras y números"
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Confirmar Nueva Contraseña"
            name="confirmarPassword"
            type="password"
            value={formData.confirmarPassword}
            onChange={handleChange}
            required
            sx={{ mb: 3 }}
          />

          <Box display="flex" gap={2}>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={submitting}
              sx={{ flex: 1 }}
            >
              {submitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Cambiar Contraseña'
              )}
            </Button>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => navigate('/usuarios')}
              disabled={submitting}
              sx={{ flex: 1 }}
            >
              Cancelar
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}
