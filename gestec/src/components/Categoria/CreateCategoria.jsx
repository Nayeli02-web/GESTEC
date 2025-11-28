import { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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

function CreateCategoria() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const [etiquetas, setEtiquetas] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [slas, setSlas] = useState([]);
  
  const [slaMode, setSlaMode] = useState('existente'); // 'existente' o 'personalizado'
  
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
        const [etiquetasData, especialidadesData, slasData] = await Promise.all([
          EtiquetaService.getAll(),
          EspecialidadService.getAll(),
          SLAService.getAll()
        ]);

        setEtiquetas(etiquetasData);
        setEspecialidades(especialidadesData);
        setSlas(slasData);

      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError(t('category.loadingError'));
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Convertir a número si es necesario
    let finalValue = value;
    if (name === 'tiempo_respuesta' || name === 'tiempo_resolucion') {
      finalValue = value === '' ? '' : parseInt(value) || 0;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: finalValue
    }));
    
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSLAModeChange = (e) => {
    setSlaMode(e.target.value);
    // Limpiar campos al cambiar de modo
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
    
    // Validar nombre
    if (!formData.nombre.trim()) {
      newErrors.nombre = t('common.required');
    }
    
    // Validar etiquetas
    if (formData.etiquetas.length === 0) {
      newErrors.etiquetas = t('category.minOnTag');
    }
    
    // Validar especialidades
    if (formData.especialidades.length === 0) {
      newErrors.especialidades = t('category.minOneSpecialty');
    }
    
    // Validar SLA
    if (slaMode === 'existente') {
      if (!formData.sla_id) {
        newErrors.sla = t('category.mustSelectSLA');
      }
    } else {
      // Validar tiempos personalizados
      if (!formData.tiempo_respuesta || formData.tiempo_respuesta <= 0) {
        newErrors.tiempo_respuesta = t('category.responseGreaterZero');
      }
      
      if (!formData.tiempo_resolucion || formData.tiempo_resolucion <= 0) {
        newErrors.tiempo_resolucion = t('category.resolutionGreaterZero');
      }
      
      // Validar que tiempo_resolucion > tiempo_respuesta
      if (formData.tiempo_respuesta && formData.tiempo_resolucion) {
        if (parseInt(formData.tiempo_resolucion) <= parseInt(formData.tiempo_respuesta)) {
          newErrors.tiempo_resolucion = t('category.resolutionGreaterResponse');
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
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim(),
        etiquetas: formData.etiquetas.map(e => parseInt(e)),
        especialidades: formData.especialidades.map(e => parseInt(e)),
      };

      // Agregar SLA según el modo seleccionado
      if (slaMode === 'existente') {
        dataToSend.sla_id = parseInt(formData.sla_id);
      } else {
        dataToSend.tiempo_respuesta = parseInt(formData.tiempo_respuesta);
        dataToSend.tiempo_resolucion = parseInt(formData.tiempo_resolucion);
      }

      await CategoriaService.create(dataToSend);
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/categorias', { replace: true });
      }, 1500);

    } catch (err) {
      console.error('Error al crear categoría:', err);
      setError(t('category.createError'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          {t('category.loadingForm')}
        </Typography>
      </Container>
    );
  }

  // Obtener SLA seleccionado para mostrar sus detalles
  const slaSeleccionado = slas.find(s => s.id === formData.sla_id);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h4" component="h1">
            {t('category.new')}
          </Typography>
          <Button
            component={RouterLink}
            to="/categorias"
            startIcon={<ArrowBackIcon />}
            variant="outlined"
          >
            {t('common.back')}
          </Button>
        </Box>

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {t('category.createdSuccess')} {t('technician.redirecting')}
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
                label={t('category.name')}
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                error={!!errors.nombre}
                helperText={errors.nombre || t('category.namePlaceholder')}
                disabled={submitting}
              />
            </Grid>

            {/* Descripción */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label={t('category.description')}
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                helperText={t('category.descriptionPlaceholder')}
                disabled={submitting}
              />
            </Grid>

            {/* Etiquetas */}
            <Grid item xs={12}>
              <FormControl fullWidth required error={!!errors.etiquetas}>
                <InputLabel>{t('category.associatedTags')}</InputLabel>
                <Select
                  multiple
                  value={formData.etiquetas}
                  onChange={handleEtiquetasChange}
                  input={<OutlinedInput label={t('category.associatedTags')} />}
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
                  <FormHelperText>{t('category.selectTags')}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            {/* Especialidades */}
            <Grid item xs={12}>
              <FormControl fullWidth required error={!!errors.especialidades}>
                <InputLabel>{t('category.requiredSpecialties')}</InputLabel>
                <Select
                  multiple
                  value={formData.especialidades}
                  onChange={handleEspecialidadesChange}
                  input={<OutlinedInput label={t('category.requiredSpecialties')} />}
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
                  <FormHelperText>{t('category.selectSpecialties')}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            {/* Modo de SLA */}
            <Grid item xs={12}>
              <FormControl component="fieldset">
                <FormLabel component="legend">{t('category.slaConfig')}</FormLabel>
                <RadioGroup
                  row
                  value={slaMode}
                  onChange={handleSLAModeChange}
                >
                  <FormControlLabel 
                    value="existente" 
                    control={<Radio />} 
                    label={t('category.existingSLA')} 
                    disabled={submitting}
                  />
                  <FormControlLabel 
                    value="personalizado" 
                    control={<Radio />} 
                    label={t('category.customTimes')} 
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
                    <InputLabel>{t('category.sla')}</InputLabel>
                    <Select
                      name="sla_id"
                      value={formData.sla_id}
                      onChange={handleChange}
                      label={t('category.sla')}
                      disabled={submitting}
                    >
                      <MenuItem value="">
                        <em>{t('category.selectSLA')}</em>
                      </MenuItem>
                      {slas.map((sla) => (
                        <MenuItem key={sla.id} value={sla.id}>
                          {sla.nombre} ({t('category.responseTime').replace(' (horas)', '')}: {sla.tiempo_respuesta}h | {t('category.resolutionTime').replace(' (horas)', '')}: {sla.tiempo_resolucion}h)
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>
                      {errors.sla || t('category.selectSLA')}
                    </FormHelperText>
                  </FormControl>
                </Grid>

                {/* Mostrar detalles del SLA seleccionado */}
                {slaSeleccionado && (
                  <Grid item xs={12}>
                    <Alert severity="info">
                      <Typography variant="body2">
                        <strong>{t('category.slaSelected')}:</strong> {slaSeleccionado.nombre}
                      </Typography>
                      <Typography variant="body2">
                        • {t('category.responseTime')}: {slaSeleccionado.tiempo_respuesta} {t('ticket.hours', { count: slaSeleccionado.tiempo_respuesta })}
                      </Typography>
                      <Typography variant="body2">
                        • {t('category.resolutionTime')}: {slaSeleccionado.tiempo_resolucion} {t('ticket.hours', { count: slaSeleccionado.tiempo_resolucion })}
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
                    label={t('category.responseTime')}
                    name="tiempo_respuesta"
                    value={formData.tiempo_respuesta}
                    onChange={handleChange}
                    error={!!errors.tiempo_respuesta}
                    helperText={errors.tiempo_respuesta || t('category.responseTimePlaceholder')}
                    disabled={submitting}
                    inputProps={{ min: 1 }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    required
                    fullWidth
                    type="number"
                    label={t('category.resolutionTime')}
                    name="tiempo_resolucion"
                    value={formData.tiempo_resolucion}
                    onChange={handleChange}
                    error={!!errors.tiempo_resolucion}
                    helperText={errors.tiempo_resolucion || t('category.resolutionTimePlaceholder')}
                    disabled={submitting}
                    inputProps={{ min: 1 }}
                  />
                </Grid>
                {formData.tiempo_respuesta && formData.tiempo_resolucion && 
                 parseInt(formData.tiempo_resolucion) > parseInt(formData.tiempo_respuesta) && (
                  <Grid item xs={12}>
                    <Alert severity="success">
                      <Typography variant="body2">
                        {t('category.validConfig', { resolution: formData.tiempo_resolucion, response: formData.tiempo_respuesta })}
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
                  {t('common.cancel')}
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={submitting ? <CircularProgress size={20} /> : <SaveIcon />}
                  disabled={submitting}
                >
                  {submitting ? t('category.creating') : t('category.createCategory')}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
}

export default CreateCategoria;
