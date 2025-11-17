import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
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
  OutlinedInput,
  Chip,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CategoriaService from '../../services/CategoriaService';
import EtiquetaService from '../../services/EtiquetaService';
import EspecialidadService from '../../services/EspecialidadService';
import SLAService from '../../services/SLAService';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

function EditCategoria() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const [etiquetas, setEtiquetas] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [slas, setSlas] = useState([]);
  
  const [slaMode, setSlaMode] = useState('existente');
  
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    etiquetas: [],
    especialidades: [],
    sla_id: '',
    tiempo_respuesta: '',
    tiempo_resolucion: '',
  });

  const [errors, setErrors] = useState({
    nombre: '',
    etiquetas: '',
    especialidades: '',
    sla: '',
    tiempo_respuesta: '',
    tiempo_resolucion: '',
  });

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        setError(null);

        // Cargar datos en paralelo
        const [etiquetasData, especialidadesData, slasData, categoriaData] = await Promise.all([
          EtiquetaService.getAll(),
          EspecialidadService.getAll(),
          SLAService.getAll(),
          CategoriaService.getDetalle(id)
        ]);

        if (!categoriaData) {
          setError('Categoría no encontrada');
          return;
        }

        console.log('Datos de categoría recibidos:', categoriaData);
        console.log('Etiquetas disponibles:', etiquetasData);
        console.log('Etiquetas de la categoría:', categoriaData.etiquetas);

        setEtiquetas(etiquetasData);
        setEspecialidades(especialidadesData);
        setSlas(slasData);

        // Precargar formulario con datos actuales
        setFormData({
          nombre: categoriaData.nombre || '',
          descripcion: categoriaData.descripcion || '',
          etiquetas: (categoriaData.etiquetas || []).map(e => e.id),
          especialidades: (categoriaData.especialidades || []).map(e => e.id),
          sla_id: categoriaData.sla?.id || '',
          tiempo_respuesta: '',
          tiempo_resolucion: '',
        });

        // Si tiene SLA, establecer modo existente
        if (categoriaData.sla?.id) {
          setSlaMode('existente');
        }

      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('Error al cargar los datos de la categoría');
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    let finalValue = value;
    if (name === 'tiempo_respuesta' || name === 'tiempo_resolucion') {
      finalValue = value === '' ? '' : parseInt(value) || 0;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: finalValue
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSLAModeChange = (e) => {
    setSlaMode(e.target.value);
    setFormData(prev => ({
      ...prev,
      sla_id: '',
      tiempo_respuesta: '',
      tiempo_resolucion: '',
    }));
    setErrors(prev => ({
      ...prev,
      sla: '',
      tiempo_respuesta: '',
      tiempo_resolucion: '',
    }));
  };

  const handleEtiquetasChange = (event) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      etiquetas: typeof value === 'string' ? value.split(',') : value,
    }));
    if (errors.etiquetas) {
      setErrors(prev => ({ ...prev, etiquetas: '' }));
    }
  };

  const handleEspecialidadesChange = (event) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      especialidades: typeof value === 'string' ? value.split(',') : value,
    }));
    if (errors.especialidades) {
      setErrors(prev => ({ ...prev, especialidades: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    }
    
    if (formData.etiquetas.length === 0) {
      newErrors.etiquetas = 'Debe seleccionar al menos una etiqueta';
    }
    
    if (formData.especialidades.length === 0) {
      newErrors.especialidades = 'Debe seleccionar al menos una especialidad';
    }
    
    if (slaMode === 'existente') {
      if (!formData.sla_id) {
        newErrors.sla = 'Debe seleccionar un SLA';
      }
    } else {
      if (!formData.tiempo_respuesta || formData.tiempo_respuesta <= 0) {
        newErrors.tiempo_respuesta = 'El tiempo de respuesta debe ser mayor a cero';
      }
      
      if (!formData.tiempo_resolucion || formData.tiempo_resolucion <= 0) {
        newErrors.tiempo_resolucion = 'El tiempo de resolución debe ser mayor a cero';
      }
      
      if (formData.tiempo_respuesta && formData.tiempo_resolucion) {
        if (parseInt(formData.tiempo_resolucion) <= parseInt(formData.tiempo_respuesta)) {
          newErrors.tiempo_resolucion = 'El tiempo de resolución debe ser mayor que el tiempo de respuesta';
        }
      }
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
        id: parseInt(id),
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim(),
        etiquetas: formData.etiquetas.map(e => parseInt(e)),
        especialidades: formData.especialidades.map(e => parseInt(e)),
      };

      if (slaMode === 'existente') {
        dataToSend.sla_id = parseInt(formData.sla_id);
      } else {
        dataToSend.tiempo_respuesta = parseInt(formData.tiempo_respuesta);
        dataToSend.tiempo_resolucion = parseInt(formData.tiempo_resolucion);
      }

      await CategoriaService.update(dataToSend);
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/categorias', { replace: true });
      }, 1500);

    } catch (err) {
      console.error('Error al actualizar categoría:', err);
      setError('Error al actualizar la categoría. Por favor, intente nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Cargando datos de la categoría...
        </Typography>
      </Container>
    );
  }

  if (error && !formData.nombre) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button
          component={RouterLink}
          to="/categorias"
          startIcon={<ArrowBackIcon />}
          sx={{ mt: 2 }}
        >
          Volver a Categorías
        </Button>
      </Container>
    );
  }

  const slaSeleccionado = slas.find(s => s.id === formData.sla_id);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h4" component="h1">
            Modificar Categoría
          </Typography>
          <Button
            component={RouterLink}
            to="/categorias"
            startIcon={<ArrowBackIcon />}
            variant="outlined"
          >
            Volver
          </Button>
        </Box>

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            ¡Categoría actualizada exitosamente! Redirigiendo...
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Nombre */}
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Nombre de la Categoría"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                error={!!errors.nombre}
                helperText={errors.nombre || 'Ejemplo: Red de Oficina, Equipos de Cómputo'}
                disabled={submitting}
              />
            </Grid>

            {/* Descripción */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Descripción"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                helperText="Descripción opcional de la categoría"
                disabled={submitting}
              />
            </Grid>

            {/* Etiquetas */}
            <Grid item xs={12}>
              <FormControl fullWidth required error={!!errors.etiquetas}>
                <InputLabel>Etiquetas Asociadas</InputLabel>
                <Select
                  multiple
                  value={formData.etiquetas}
                  onChange={handleEtiquetasChange}
                  input={<OutlinedInput label="Etiquetas Asociadas" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => {
                        const etiqueta = etiquetas.find(e => e.id === value);
                        return (
                          <Chip
                            key={value}
                            label={etiqueta ? etiqueta.nombre : value}
                            size="small"
                          />
                        );
                      })}
                    </Box>
                  )}
                  MenuProps={MenuProps}
                  disabled={submitting}
                >
                  {etiquetas.map((etiq) => (
                    <MenuItem key={etiq.id} value={etiq.id}>
                      {etiq.nombre}
                    </MenuItem>
                  ))}
                </Select>
                {errors.etiquetas && (
                  <FormHelperText>{errors.etiquetas}</FormHelperText>
                )}
                {!errors.etiquetas && (
                  <FormHelperText>Seleccione las etiquetas que pertenecen a esta categoría</FormHelperText>
                )}
              </FormControl>
            </Grid>

            {/* Especialidades */}
            <Grid item xs={12}>
              <FormControl fullWidth required error={!!errors.especialidades}>
                <InputLabel>Especialidades Requeridas</InputLabel>
                <Select
                  multiple
                  value={formData.especialidades}
                  onChange={handleEspecialidadesChange}
                  input={<OutlinedInput label="Especialidades Requeridas" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => {
                        const esp = especialidades.find(e => e.id === value);
                        return (
                          <Chip
                            key={value}
                            label={esp ? esp.nombre : value}
                            size="small"
                            color="primary"
                          />
                        );
                      })}
                    </Box>
                  )}
                  MenuProps={MenuProps}
                  disabled={submitting}
                >
                  {especialidades.map((esp) => (
                    <MenuItem key={esp.id} value={esp.id}>
                      {esp.nombre}
                    </MenuItem>
                  ))}
                </Select>
                {errors.especialidades && (
                  <FormHelperText>{errors.especialidades}</FormHelperText>
                )}
                {!errors.especialidades && (
                  <FormHelperText>Seleccione las especialidades necesarias para esta categoría</FormHelperText>
                )}
              </FormControl>
            </Grid>

            {/* Modo de SLA */}
            <Grid item xs={12}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Configuración de SLA</FormLabel>
                <RadioGroup
                  row
                  value={slaMode}
                  onChange={handleSLAModeChange}
                >
                  <FormControlLabel 
                    value="existente" 
                    control={<Radio />} 
                    label="Seleccionar SLA Existente" 
                    disabled={submitting}
                  />
                  <FormControlLabel 
                    value="personalizado" 
                    control={<Radio />} 
                    label="Establecer Tiempos Personalizados" 
                    disabled={submitting}
                  />
                </RadioGroup>
              </FormControl>
            </Grid>

            {/* SLA Existente */}
            {slaMode === 'existente' && (
              <>
                <Grid item xs={12}>
                  <FormControl fullWidth required error={!!errors.sla}>
                    <InputLabel>SLA</InputLabel>
                    <Select
                      name="sla_id"
                      value={formData.sla_id}
                      onChange={handleChange}
                      label="SLA"
                      disabled={submitting}
                    >
                      <MenuItem value="">
                        <em>Seleccione un SLA</em>
                      </MenuItem>
                      {slas.map((sla) => (
                        <MenuItem key={sla.id} value={sla.id}>
                          {sla.nombre} (Respuesta: {sla.tiempo_respuesta}h | Resolución: {sla.tiempo_resolucion}h)
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>
                      {errors.sla || 'Seleccione el nivel de servicio para esta categoría'}
                    </FormHelperText>
                  </FormControl>
                </Grid>

                {slaSeleccionado && (
                  <Grid item xs={12}>
                    <Alert severity="info">
                      <Typography variant="body2">
                        <strong>SLA Seleccionado:</strong> {slaSeleccionado.nombre}
                      </Typography>
                      <Typography variant="body2">
                        • Tiempo de Respuesta: {slaSeleccionado.tiempo_respuesta} horas
                      </Typography>
                      <Typography variant="body2">
                        • Tiempo de Resolución: {slaSeleccionado.tiempo_resolucion} horas
                      </Typography>
                    </Alert>
                  </Grid>
                )}
              </>
            )}

            {/* SLA Personalizado */}
            {slaMode === 'personalizado' && (
              <>
                <Grid item xs={12} md={6}>
                  <TextField
                    required
                    fullWidth
                    type="number"
                    label="Tiempo de Respuesta (horas)"
                    name="tiempo_respuesta"
                    value={formData.tiempo_respuesta}
                    onChange={handleChange}
                    error={!!errors.tiempo_respuesta}
                    helperText={errors.tiempo_respuesta || 'Tiempo máximo para primera respuesta'}
                    disabled={submitting}
                    inputProps={{ min: 1 }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    required
                    fullWidth
                    type="number"
                    label="Tiempo de Resolución (horas)"
                    name="tiempo_resolucion"
                    value={formData.tiempo_resolucion}
                    onChange={handleChange}
                    error={!!errors.tiempo_resolucion}
                    helperText={errors.tiempo_resolucion || 'Tiempo máximo para resolver el ticket'}
                    disabled={submitting}
                    inputProps={{ min: 1 }}
                  />
                </Grid>
                {formData.tiempo_respuesta && formData.tiempo_resolucion && 
                 parseInt(formData.tiempo_resolucion) > parseInt(formData.tiempo_respuesta) && (
                  <Grid item xs={12}>
                    <Alert severity="success">
                      <Typography variant="body2">
                        ✓ Configuración válida: El tiempo de resolución ({formData.tiempo_resolucion}h) es mayor que el tiempo de respuesta ({formData.tiempo_respuesta}h)
                      </Typography>
                    </Alert>
                  </Grid>
                )}
              </>
            )}

            {/* Botones */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  component={RouterLink}
                  to="/categorias"
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
                  {submitting ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
}

export default EditCategoria;
