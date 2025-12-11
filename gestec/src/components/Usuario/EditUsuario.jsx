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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import UsuarioService from '../../services/UsuarioService';
import { useAuth } from '../Auth/AuthContext';

export default function EditUsuario() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isAdmin } = useAuth();
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    telefono: '',
    rol_id: 2,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadUsuario = useCallback(async () => {
    try {
      setLoading(true);
      const response = await UsuarioService.getById(id);
      if (response.status === 200 && response.result) {
        const usuario = response.result;
        setFormData({
          nombre: usuario.nombre || '',
          correo: usuario.correo || '',
          telefono: usuario.telefono || '',
          rol_id: usuario.rol_id || 2,
        });
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

    try {
      const response = await UsuarioService.update(id, formData);

      if (response.status === 200) {
        navigate('/usuarios', {
          state: { message: 'Usuario actualizado exitosamente' },
        });
      } else {
        setError(response.message || 'Error al actualizar usuario');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error al actualizar usuario');
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
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Editar Usuario
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Actualiza los datos del usuario (sin cambiar la contraseña)
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <TextField
            fullWidth
            label="Nombre Completo"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
            autoFocus
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Correo Electrónico"
            name="correo"
            type="email"
            value={formData.correo}
            onChange={handleChange}
            required
            helperText="Debe ser un correo electrónico válido"
            inputProps={{
              pattern: '[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$',
            }}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Teléfono (Opcional)"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth sx={{ mb: 3 }}>
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

          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Nota:</strong> Para cambiar la contraseña del usuario, usa la opción
              &quot;Cambiar contraseña&quot; desde la lista de usuarios.
            </Typography>
          </Alert>

          <Box display="flex" gap={2}>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={submitting}
              sx={{ flex: 1 }}
            >
              {submitting ? <CircularProgress size={24} color="inherit" /> : 'Guardar Cambios'}
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
