import { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Box,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  FormHelperText,
  Snackbar,
  AlertTitle,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TicketService from '../../services/TicketService';
import EtiquetaService from '../../services/EtiquetaService';

// Variable de usuario simulado (mientras no hay autenticación)
const USUARIO_ID = 1; // ID del usuario logueado

function CreateTicket() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [etiquetas, setEtiquetas] = useState([]);
  const [usuarioInfo, setUsuarioInfo] = useState({ nombre: '', correo: '' });
  
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    prioridad: 'media',
    etiqueta_id: '',
    categoria_nombre: '',
    fecha_creacion: new Date().toLocaleString('es-CR'),
  });

  const [errors, setErrors] = useState({
    titulo: '',
    descripcion: '',
    etiqueta_id: '',
  });

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        setError(null);

        // Cargar etiquetas
        const etiquetasData = await EtiquetaService.getAll();
        setEtiquetas(etiquetasData);

        // Simular información del usuario (normalmente vendría del sistema de autenticación)
        // Usuario ID 1: María López (Cliente)
        setUsuarioInfo({
          nombre: 'María López',
          correo: 'maria@correo.com'
        });

      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('Error al cargar los datos necesarios');
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleEtiquetaChange = (e) => {
    const etiqueta_id = e.target.value;
    const etiqueta = etiquetas.find(et => et.id === etiqueta_id);
    
    setFormData(prev => ({
      ...prev,
      etiqueta_id,
      categoria_nombre: etiqueta ? etiqueta.categoria_nombre : ''
    }));

    // Limpiar error
    if (errors.etiqueta_id) {
      setErrors(prev => ({ ...prev, etiqueta_id: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validar título
    if (!formData.titulo.trim()) {
      newErrors.titulo = 'El título es obligatorio';
    } else if (formData.titulo.trim().length < 5) {
      newErrors.titulo = 'El título debe tener al menos 5 caracteres';
    }
    
    // Validar descripción
    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es obligatoria';
    } else if (formData.descripcion.trim().length < 10) {
      newErrors.descripcion = 'La descripción debe tener al menos 10 caracteres';
    }
    
    // Validar etiqueta
    if (!formData.etiqueta_id) {
      newErrors.etiqueta_id = 'Debe seleccionar una etiqueta';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const dataToSend = {
        titulo: formData.titulo.trim(),
        descripcion: formData.descripcion.trim(),
        prioridad: formData.prioridad,
        etiqueta_id: parseInt(formData.etiqueta_id),
        cliente_id: USUARIO_ID, // Usuario simulado
      };

      await TicketService.create(dataToSend);
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/tickets', { replace: true });
      }, 1500);

    } catch (err) {
      console.error('Error al crear ticket:', err);
      setError('Error al crear el ticket. Por favor, intente nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Cargando formulario...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h4" component="h1">
            Crear Nuevo Ticket
          </Typography>
          <Button
            component={RouterLink}
            to="/tickets"
            startIcon={<ArrowBackIcon />}
            variant="outlined"
          >
            Volver
          </Button>
        </Box>

        <Snackbar
          open={success}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          sx={{ mt: 8 }}
        >
          <Alert 
            severity="success" 
            icon={<CheckCircleIcon fontSize="large" />}
            sx={{ 
              fontSize: '1.1rem',
              minWidth: '400px',
              '& .MuiAlert-icon': {
                fontSize: '2.5rem'
              }
            }}
          >
            <AlertTitle sx={{ fontSize: '1.3rem', fontWeight: 'bold' }}>
              ¡Éxito!
            </AlertTitle>
            Ticket creado exitosamente. Redirigiendo a la lista de tickets...
          </Alert>
        </Snackbar>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Usuario Solicitante - No editable */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Usuario Solicitante"
                value={usuarioInfo.nombre}
                disabled
                helperText="Usuario actual del sistema"
              />
            </Grid>

            {/* Correo del Usuario - No editable */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Correo"
                value={usuarioInfo.correo}
                disabled
                helperText="Correo del usuario solicitante"
              />
            </Grid>

            {/* Título */}
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Título del Ticket"
                name="titulo"
                value={formData.titulo}
                onChange={handleChange}
                error={!!errors.titulo}
                helperText={errors.titulo || 'Resumen breve del problema'}
                disabled={submitting}
                inputProps={{ maxLength: 150 }}
              />
            </Grid>

            {/* Descripción */}
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                multiline
                rows={4}
                label="Descripción"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                error={!!errors.descripcion}
                helperText={errors.descripcion || 'Describa detalladamente el problema'}
                disabled={submitting}
                inputProps={{ maxLength: 250 }}
              />
            </Grid>

            {/* Prioridad */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Prioridad</InputLabel>
                <Select
                  name="prioridad"
                  value={formData.prioridad}
                  onChange={handleChange}
                  label="Prioridad"
                  disabled={submitting}
                >
                  <MenuItem value="baja">Baja</MenuItem>
                  <MenuItem value="media">Media</MenuItem>
                  <MenuItem value="alta">Alta</MenuItem>
                </Select>
                <FormHelperText>Nivel de urgencia del ticket</FormHelperText>
              </FormControl>
            </Grid>

            {/* Etiqueta */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required error={!!errors.etiqueta_id}>
                <InputLabel>Etiqueta</InputLabel>
                <Select
                  value={formData.etiqueta_id}
                  onChange={handleEtiquetaChange}
                  label="Etiqueta"
                  disabled={submitting}
                >
                  <MenuItem value="">
                    <em>Seleccione una etiqueta</em>
                  </MenuItem>
                  {etiquetas.map((etiqueta) => (
                    <MenuItem key={etiqueta.id} value={etiqueta.id}>
                      {etiqueta.nombre}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>
                  {errors.etiqueta_id || 'Seleccione la etiqueta que mejor describa el problema'}
                </FormHelperText>
              </FormControl>
            </Grid>

            {/* Categoría - No editable, se muestra automáticamente */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Categoría Asignada"
                value={formData.categoria_nombre || 'Seleccione una etiqueta primero'}
                disabled
                helperText="Categoría determinada por la etiqueta seleccionada"
              />
            </Grid>

            {/* Fecha de Creación - No editable */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Fecha de Creación"
                value={formData.fecha_creacion}
                disabled
                helperText="Fecha y hora actual"
              />
            </Grid>

            {/* Estado - No editable */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Estado Inicial"
                value="Pendiente"
                disabled
                helperText="El ticket se creará con estado 'Pendiente'"
              />
            </Grid>

            {/* Botones */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  component={RouterLink}
                  to="/tickets"
                  variant="outlined"
                  disabled={submitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={submitting ? <CircularProgress size={20} /> : <SaveIcon />}
                  disabled={submitting}
                >
                  {submitting ? 'Creando...' : 'Crear Ticket'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
}

export default CreateTicket;
