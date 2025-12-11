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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import UsuarioService from '../../services/UsuarioService';
import { useAuth } from '../Auth/AuthContext';

export default function CreateUsuario() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    telefono: '',
    contrasena: '',
    confirmarContrasena: '',
    rol_id: 2, // Cliente por defecto
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isAdmin) {
    navigate('/');
    return null;
  }

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

    // Validar longitud de contraseña
    if (formData.contrasena.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      setLoading(false);
      return;
    }

    // Validar complejidad de contraseña
    const tieneLetra = /[a-zA-Z]/.test(formData.contrasena);
    const tieneNumero = /[0-9]/.test(formData.contrasena);
    if (!tieneLetra || !tieneNumero) {
      setError('La contraseña debe contener al menos una letra y un número');
      setLoading(false);
      return;
    }

    try {
      const response = await UsuarioService.create({
        nombre: formData.nombre,
        correo: formData.correo,
        telefono: formData.telefono,
        contrasena: formData.contrasena,
        rol_id: formData.rol_id,
      });

      if (response.status === 201) {
        navigate('/usuarios', {
          state: { message: 'Usuario creado exitosamente' },
        });
      } else {
        setError(response.message || 'Error al crear usuario');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error al crear usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Crear Nuevo Usuario
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Completa todos los campos para crear un nuevo usuario en el sistema
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
            label="Contraseña"
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
            label="Confirmar Contraseña"
            name="confirmarContrasena"
            type="password"
            value={formData.confirmarContrasena}
            onChange={handleChange}
            required
            sx={{ mb: 3 }}
          />

          <Box display="flex" gap={2}>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{ flex: 1 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Crear Usuario'}
            </Button>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => navigate('/usuarios')}
              disabled={loading}
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
