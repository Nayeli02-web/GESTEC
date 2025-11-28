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
  OutlinedInput,
  Chip,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TecnicoService from '../../services/TecnicoService';
import EspecialidadService from '../../services/EspecialidadService';
import { useTranslation } from 'react-i18next';

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

function EditTecnico() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [especialidades, setEspecialidades] = useState([]);
  
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    telefono: '',
    especialidades: [],
    disponible: 1,
    carga_actual: 0,
  });

  const [errors, setErrors] = useState({
    nombre: '',
    correo: '',
    especialidades: '',
  });

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        setError(null);

        // Cargar especialidades disponibles
        const especialidadesData = await EspecialidadService.getAll();
        setEspecialidades(especialidadesData);

        // Cargar datos del técnico
        const tecnicoData = await TecnicoService.getDetalle(id);
        
        if (!tecnicoData) {
          setError(t('technician.notFound'));
          return;
        }

        // Precargar formulario con datos actuales
        setFormData({
          nombre: tecnicoData.nombre || '',
          correo: tecnicoData.correo || '',
          telefono: tecnicoData.telefono || '',
          especialidades: tecnicoData.especialidades?.map(e => e.id) || [],
          disponible: tecnicoData.disponible !== undefined ? tecnicoData.disponible : 1,
          carga_actual: tecnicoData.carga_trabajo || 0,
        });

      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError(t('technician.loadingError'));
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Convertir a número si es el campo disponible
    const finalValue = name === 'disponible' ? parseInt(value) : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: finalValue
    }));
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleEspecialidadesChange = (event) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      especialidades: typeof value === 'string' ? value.split(',') : value,
    }));
    // Limpiar error
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
    
    // Validar correo
    if (!formData.correo.trim()) {
      newErrors.correo = t('common.required');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.correo)) {
        newErrors.correo = t('common.invalidEmail');
      }
    }
    
    // Validar especialidades
    if (formData.especialidades.length === 0) {
      newErrors.especialidades = t('technician.minOneSpecialty');
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
        correo: formData.correo.trim(),
        telefono: formData.telefono.trim(),
        especialidades: formData.especialidades.map(e => parseInt(e)),
        disponible: parseInt(formData.disponible),
      };

      await TecnicoService.update(dataToSend);
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/tecnicos', { replace: true });
      }, 1500);

    } catch (err) {
      console.error('Error al actualizar técnico:', err);
      setError(t('technician.updateError'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          {t('common.loading')}
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
          to="/tecnicos"
          startIcon={<ArrowBackIcon />}
          sx={{ mt: 2 }}
        >
          {t('technician.backToList')}
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h4" component="h1">
            {t('technician.edit')}
          </Typography>
          <Button
            component={RouterLink}
            to="/tecnicos"
            startIcon={<ArrowBackIcon />}
            variant="outlined"
          >
            {t('common.back')}
          </Button>
        </Box>

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {t('technician.updatedSuccess')} {t('technician.redirecting')}
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
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                label={t('technician.name')}
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                error={!!errors.nombre}
                helperText={errors.nombre}
                disabled={submitting}
              />
            </Grid>

            {/* Correo */}
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                label={t('technician.email')}
                name="correo"
                type="email"
                value={formData.correo}
                onChange={handleChange}
                error={!!errors.correo}
                helperText={errors.correo}
                disabled={submitting}
              />
            </Grid>

            {/* Teléfono */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('technician.phone')}
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                disabled={submitting}
              />
            </Grid>

            {/* Disponible */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>{t('technician.availability')}</InputLabel>
                <Select
                  name="disponible"
                  value={formData.disponible}
                  onChange={handleChange}
                  label={t('technician.availability')}
                  disabled={submitting}
                >
                  <MenuItem value={1}>{t('technician.available')}</MenuItem>
                  <MenuItem value={0}>{t('technician.notAvailable')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Especialidades */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required error={!!errors.especialidades}>
                <InputLabel>{t('technician.specialties')}</InputLabel>
                <Select
                  multiple
                  value={formData.especialidades}
                  onChange={handleEspecialidadesChange}
                  input={<OutlinedInput label={t('technician.specialties')} />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => {
                        const esp = especialidades.find(e => e.id === value);
                        return (
                          <Chip
                            key={value}
                            label={esp ? esp.nombre : value}
                            size="small"
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
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                    {errors.especialidades}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            {/* Carga Actual (solo lectura) */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Carga Actual"
                value={`${formData.carga_actual} tickets`}
                disabled
                helperText="Este campo no es editable"
              />
            </Grid>

            {/* Botón Guardar */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  component={RouterLink}
                  to="/tecnicos"
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
                  {submitting ? t('common.saving') : t('common.saveChanges')}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
}

export default EditTecnico;
