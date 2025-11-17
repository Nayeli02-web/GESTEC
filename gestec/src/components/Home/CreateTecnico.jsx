import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TecnicoService from '../../services/TecnicoService';
import EspecialidadService from '../../services/EspecialidadService';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import OutlinedInput from '@mui/material/OutlinedInput';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';

export default function CreateTecnico() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingEspecialidades, setLoadingEspecialidades] = useState(true);
  const [especialidades, setEspecialidades] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    telefono: '',
    contrasena: '12345', // contraseña por defecto
    disponible: 1,
    especialidades: []
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Cargar especialidades desde la BD
    EspecialidadService.getAll()
      .then((res) => {
        const list = Array.isArray(res) ? res : [];
        setEspecialidades(list);
      })
      .catch((err) => {
        console.error('Error al cargar especialidades:', err);
        setError('No se pudieron cargar las especialidades');
      })
      .finally(() => setLoadingEspecialidades(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar error del campo al editar
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleEspecialidadesChange = (event) => {
    const { value } = event.target;
    setFormData(prev => ({
      ...prev,
      especialidades: typeof value === 'string' ? value.split(',') : value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    }
    
    if (!formData.correo.trim()) {
      newErrors.correo = 'El correo es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
      newErrors.correo = 'El formato del correo no es válido';
    }
    
    if (formData.especialidades.length === 0) {
      newErrors.especialidades = 'Debe seleccionar al menos una especialidad';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await TecnicoService.create(formData);
      setSuccess(true);
      setTimeout(() => {
        navigate('/tecnicos');
      }, 1500);
    } catch (err) {
      console.error('Error al crear técnico:', err);
      setError('Error al crear el técnico. Verifique que el correo no esté registrado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 3, mb: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/tecnicos')}
        sx={{ mb: 2 }}
      >
        Volver a Técnicos
      </Button>

      <Paper sx={{ p: 3 }} elevation={3}>
        <Typography variant="h4" component="h1" gutterBottom color="primary">
          Crear Nuevo Técnico
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Complete el formulario para registrar un nuevo técnico en el sistema
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Técnico creado exitosamente. Redirigiendo...
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={3}>
            {/* Nombre completo */}
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Nombre Completo"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                error={!!errors.nombre}
                helperText={errors.nombre}
                disabled={loading}
              />
            </Grid>

            {/* Correo electrónico */}
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                type="email"
                label="Correo Electrónico"
                name="correo"
                value={formData.correo}
                onChange={handleChange}
                error={!!errors.correo}
                helperText={errors.correo}
                disabled={loading}
              />
            </Grid>

            {/* Teléfono */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Teléfono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                disabled={loading}
                helperText="Opcional"
              />
            </Grid>

            {/* Especialidades */}
            <Grid item xs={12}>
              <FormControl fullWidth required error={!!errors.especialidades}>
                <InputLabel id="especialidades-label">Especialidades</InputLabel>
                {loadingEspecialidades ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                    <CircularProgress size={24} />
                  </Box>
                ) : (
                  <Select
                    labelId="especialidades-label"
                    id="especialidades"
                    multiple
                    value={formData.especialidades}
                    onChange={handleEspecialidadesChange}
                    input={<OutlinedInput label="Especialidades" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => {
                          const esp = especialidades.find(e => e.id === value);
                          return <Chip key={value} label={esp?.nombre || value} />;
                        })}
                      </Box>
                    )}
                    disabled={loading}
                  >
                    {especialidades.map((esp) => (
                      <MenuItem key={esp.id} value={esp.id}>
                        {esp.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                )}
                {errors.especialidades && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                    {errors.especialidades}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            {/* Estado (Disponibilidad) */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="estado-label">Estado</InputLabel>
                <Select
                  labelId="estado-label"
                  id="disponible"
                  name="disponible"
                  value={formData.disponible}
                  label="Estado"
                  onChange={handleChange}
                  disabled={loading}
                >
                  <MenuItem value={1}>Disponible</MenuItem>
                  <MenuItem value={0}>No Disponible</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Carga Actual (solo lectura) */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Carga Actual"
                value="0 tickets"
                disabled
                helperText="Se actualiza automáticamente al asignar tickets"
              />
            </Grid>

            {/* Botones */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/tecnicos')}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                  disabled={loading}
                >
                  {loading ? 'Guardando...' : 'Crear Técnico'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
}
