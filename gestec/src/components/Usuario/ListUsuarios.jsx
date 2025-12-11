import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Typography,
  Box,
  IconButton,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  VpnKey as VpnKeyIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import UsuarioService from '../../services/UsuarioService';
import { useAuth } from '../Auth/AuthContext';

export default function ListUsuarios() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, usuario: null });

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    // Mostrar mensaje de éxito si viene de otra página
    if (location.state?.message) {
      setSuccess(location.state.message);
      // Limpiar el estado de navegación
      window.history.replaceState({}, document.title);
    }
    loadUsuarios();
  }, [isAdmin, navigate, location]);

  const loadUsuarios = async () => {
    try {
      setLoading(true);
      const response = await UsuarioService.getAll();
      if (response.status === 200) {
        setUsuarios(response.result);
      } else {
        setError(response.message || 'Error al cargar usuarios');
      }
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
      setError('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await UsuarioService.delete(deleteDialog.usuario.id);
      if (response.status === 200) {
        setSuccess('Usuario eliminado exitosamente');
        loadUsuarios();
      } else {
        setError(response.message || 'Error al eliminar usuario');
      }
    } catch (err) {
      console.error('Error al eliminar:', err);
      setError('Error al eliminar usuario');
    } finally {
      setDeleteDialog({ open: false, usuario: null });
    }
  };

  const getRolColor = (rol) => {
    switch (rol) {
      case 'Administrador':
        return 'error';
      case 'Técnico':
      case 'Tecnico':
        return 'primary';
      case 'Cliente':
        return 'success';
      default:
        return 'default';
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
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1">
            Gestión de Usuarios
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate('/usuarios/crear')}
          >
            Crear Usuario
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell>Correo</TableCell>
                <TableCell>Teléfono</TableCell>
                <TableCell>Rol</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {usuarios.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No hay usuarios registrados
                  </TableCell>
                </TableRow>
              ) : (
                usuarios.map((usuario) => (
                  <TableRow key={usuario.id} hover>
                    <TableCell>{usuario.id}</TableCell>
                    <TableCell>{usuario.nombre}</TableCell>
                    <TableCell>{usuario.correo}</TableCell>
                    <TableCell>{usuario.telefono || 'N/A'}</TableCell>
                    <TableCell>
                      <Chip
                        label={usuario.rol_nombre}
                        color={getRolColor(usuario.rol_nombre)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => navigate(`/usuarios/editar/${usuario.id}`)}
                        title="Editar"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="warning"
                        onClick={() => navigate(`/usuarios/cambiar-password/${usuario.id}`)}
                        title="Cambiar contraseña"
                      >
                        <VpnKeyIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setDeleteDialog({ open: true, usuario })}
                        title="Eliminar"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Dialog de confirmación de eliminación */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, usuario: null })}
      >
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar al usuario{' '}
            <strong>{deleteDialog.usuario?.nombre}</strong>? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, usuario: null })}>
            Cancelar
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
