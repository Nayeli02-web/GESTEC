import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  AlertTitle,
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Chip,
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import { useAuth } from '../Auth/AuthContext';

// Flujo estricto de estados
const ESTADO_FLUJO = {
  'pendiente': { siguiente: 'asignado', label: 'Pendiente', requiresTechnician: false },
  'asignado': { siguiente: 'en_proceso', label: 'Asignado', requiresTechnician: true },
  'en_proceso': { siguiente: 'resuelto', label: 'En Proceso', requiresTechnician: true },
  'resuelto': { siguiente: 'cerrado', label: 'Resuelto', requiresTechnician: true },
  'cerrado': { siguiente: null, label: 'Cerrado', requiresTechnician: true }
};

const ESTADOS_ORDEN = ['pendiente', 'asignado', 'en_proceso', 'resuelto', 'cerrado'];

export default function UpdateStatusDialog({ open, onClose, ticket, onUpdate }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [comentario, setComentario] = useState('');
  const [nuevoEstado, setNuevoEstado] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [imagenFile, setImagenFile] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);

  useEffect(() => {
    if (open && ticket) {
      // Resetear al abrir
      setComentario('');
      setError('');
      setImagenFile(null);
      setImagenPreview(null);
      
      // Establecer el siguiente estado válido automáticamente
      const estadoActual = ticket.estado?.toLowerCase();
      const siguienteEstado = ESTADO_FLUJO[estadoActual]?.siguiente;
      setNuevoEstado(siguienteEstado || '');
    }
  }, [open, ticket]);

  const getEstadoLabel = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'pendiente': return t('ticket.pending');
      case 'asignado': return t('ticket.assigned');
      case 'en_proceso': return t('ticket.inProgress');
      case 'resuelto': return t('ticket.resolved');
      case 'cerrado': return t('ticket.closed');
      default: return estado;
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        setError(t('ticket.invalidImageType') || 'El archivo debe ser una imagen');
        return;
      }
      
      // Validar tamaño (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError(t('ticket.imageTooLarge') || 'La imagen no debe superar los 5MB');
        return;
      }
      
      setImagenFile(file);
      setError('');
      
      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagenPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateTransition = () => {
    if (!ticket) return 'Ticket no disponible';

    const estadoActual = ticket.estado?.toLowerCase();
    const estadoActualConfig = ESTADO_FLUJO[estadoActual];

    // 1. Verificar si el estado ya está cerrado
    if (estadoActual === 'cerrado') {
      return t('ticket.alreadyClosed') || 'El ticket ya está cerrado y no puede ser modificado';
    }

    // 2. Verificar que haya un siguiente estado válido
    if (!estadoActualConfig?.siguiente) {
      return 'No hay estados siguientes disponibles';
    }

    // 3. Verificar que se seleccionó un estado
    if (!nuevoEstado) {
      return t('ticket.selectNewState') || 'Debe seleccionar un nuevo estado';
    }

    // 4. Validar que no se saltan etapas
    const indexActual = ESTADOS_ORDEN.indexOf(estadoActual);
    const indexNuevo = ESTADOS_ORDEN.indexOf(nuevoEstado);
    
    if (indexNuevo !== indexActual + 1) {
      return t('ticket.cannotSkipStages') || 'No se puede saltar etapas del flujo. Debe avanzar al siguiente estado en orden';
    }

    // 5. Verificar que hay técnico asignado (excepto en estado Pendiente)
    if (estadoActual !== 'pendiente') {
      if (!ticket.tecnico_id && !ticket.tecnico?.id) {
        return t('ticket.requiresTechnician') || 'No se puede avanzar el ticket sin un técnico asignado';
      }
    }

    // 6. Verificar comentario obligatorio
    if (!comentario.trim()) {
      return t('ticket.commentRequired') || 'Debe registrar un comentario que justifique la transición';
    }

    if (comentario.trim().length < 10) {
      return t('ticket.commentTooShort') || 'El comentario debe tener al menos 10 caracteres';
    }

    // 7. Verificar imagen obligatoria (comentado temporalmente hasta ejecutar migración)
    // if (!imagenFile) {
    //   return t('ticket.imageRequired') || 'Debe adjuntar una imagen como evidencia del cambio';
    // }

    return null;
  };

  const handleSubmit = async () => {
    setError('');

    // Validar transición
    const validationError = validateTransition();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      // Validar que haya un usuario autenticado
      if (!user || !user.id) {
        throw new Error('Usuario no autenticado');
      }

      // Obtener rol del usuario
      const getRolName = (rol_id) => {
        switch (rol_id) {
          case 1: return 'Administrador';
          case 2: return 'Cliente';
          case 3: return 'Tecnico';
          default: return 'Cliente';
        }
      };

      const rol_usuario = getRolName(user.rol_id);

      // Crear FormData para enviar la imagen
      const formData = new FormData();
      formData.append('nuevoEstado', nuevoEstado);
      formData.append('comentario', comentario.trim());
      formData.append('usuario_id', user.id);
      formData.append('rol_usuario', rol_usuario);
      if (imagenFile) {
        formData.append('imagen', imagenFile);
      }

      await onUpdate(formData);

      // Cerrar diálogo
      onClose();
    } catch (err) {
      console.error('Error al actualizar estado:', err);
      setError(err.message || t('ticket.updateError') || 'Error al actualizar el estado del ticket');
    } finally {
      setLoading(false);
    }
  };

  const getEstadosDisponibles = () => {
    if (!ticket) return [];

    const estadoActual = ticket.estado?.toLowerCase();
    const estadoActualConfig = ESTADO_FLUJO[estadoActual];

    // Solo el siguiente estado en el flujo
    if (estadoActualConfig?.siguiente) {
      return [estadoActualConfig.siguiente];
    }

    return [];
  };

  const getCurrentStepIndex = () => {
    if (!ticket) return 0;
    const estadoActual = ticket.estado?.toLowerCase();
    return ESTADOS_ORDEN.indexOf(estadoActual);
  };

  if (!ticket) return null;

  const estadoActual = ticket.estado?.toLowerCase();
  const estadosDisponibles = getEstadosDisponibles();
  const currentStep = getCurrentStepIndex();

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <InfoIcon color="primary" />
          <Typography variant="h6">
            {t('ticket.updateStatus') || 'Actualizar Estado del Ticket'}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Información del ticket */}
        <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            <strong>Ticket #</strong>{ticket.id} - {ticket.titulo}
          </Typography>
          <Box display="flex" gap={1} mt={1}>
            <Chip 
              label={`${t('ticket.state')}: ${getEstadoLabel(estadoActual)}`}
              color={estadoActual === 'pendiente' ? 'error' : estadoActual === 'cerrado' ? 'default' : 'primary'}
              size="small"
            />
            {ticket.tecnico ? (
              <Chip 
                label={`${t('ticket.assignedTechnician')}: ${ticket.tecnico.nombre}`}
                color="success"
                size="small"
              />
            ) : (
              <Chip 
                label={t('ticket.noTechnicianAssigned') || 'Sin técnico asignado'}
                color="warning"
                size="small"
              />
            )}
          </Box>
        </Box>

        {/* Flujo de estados (Stepper) */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            {t('ticket.statusFlow') || 'Flujo de Estados'}
          </Typography>
          <Stepper activeStep={currentStep} alternativeLabel>
            {ESTADOS_ORDEN.map((estado) => (
              <Step key={estado}>
                <StepLabel>{getEstadoLabel(estado)}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {/* Alertas de validación */}
        {estadoActual === 'cerrado' && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <AlertTitle>{t('ticket.closed') || 'Ticket Cerrado'}</AlertTitle>
            {t('ticket.alreadyClosed') || 'Este ticket ya está cerrado y no puede ser modificado.'}
          </Alert>
        )}

        {estadoActual !== 'pendiente' && !ticket.tecnico_id && !ticket.tecnico?.id && (
          <Alert severity="warning" sx={{ mb: 2 }} icon={<WarningIcon />}>
            <AlertTitle>{t('common.warning') || 'Advertencia'}</AlertTitle>
            {t('ticket.requiresTechnician') || 'No se puede avanzar sin un técnico asignado.'}
          </Alert>
        )}

        {estadosDisponibles.length === 0 && estadoActual !== 'cerrado' && (
          <Alert severity="info" sx={{ mb: 2 }}>
            {t('ticket.noAvailableStates') || 'No hay estados disponibles para transición.'}
          </Alert>
        )}

        {/* Selector de nuevo estado */}
        {estadosDisponibles.length > 0 && (
          <>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>{t('ticket.newStatus') || 'Nuevo Estado'}</InputLabel>
              <Select
                value={nuevoEstado}
                onChange={(e) => setNuevoEstado(e.target.value)}
                label={t('ticket.newStatus') || 'Nuevo Estado'}
                disabled={loading}
              >
                {estadosDisponibles.map((estado) => (
                  <MenuItem key={estado} value={estado}>
                    {getEstadoLabel(estado)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Campo de comentario obligatorio */}
            <TextField
              fullWidth
              multiline
              rows={4}
              label={`${t('ticket.comment') || 'Comentario'} *`}
              placeholder={t('ticket.commentPlaceholder') || 'Describa la razón del cambio de estado (mínimo 10 caracteres)'}
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              disabled={loading}
              required
              helperText={
                comentario.trim().length > 0 
                  ? `${comentario.trim().length} caracteres (mínimo 10)`
                  : t('ticket.commentRequired') || 'El comentario es obligatorio'
              }
              error={comentario.trim().length > 0 && comentario.trim().length < 10}
              sx={{ mb: 2 }}
            />

            {/* Campo de imagen obligatorio */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                {t('ticket.imageEvidence') || 'Imagen de Evidencia'} (Recomendado)
              </Typography>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                disabled={loading}
              >
                {imagenFile ? imagenFile.name : t('ticket.selectImage') || 'Seleccionar Imagen'}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </Button>
              {!imagenFile && (
                <Typography variant="caption" color="warning.main" display="block" sx={{ mt: 0.5 }}>
                  Se recomienda adjuntar una imagen como evidencia del cambio
                </Typography>
              )}
              {imagenPreview && (
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <img 
                    src={imagenPreview} 
                    alt="Preview" 
                    style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8 }}
                  />
                </Box>
              )}
            </Box>

            {/* Reglas del flujo */}
            <Box sx={{ mt: 2, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
              <Typography variant="caption" display="block" gutterBottom>
                <strong>{t('ticket.transitionRules') || 'Reglas de Transición'}:</strong>
              </Typography>
              <Typography variant="caption" display="block">
                • {t('ticket.rule1') || 'No se puede saltar etapas del flujo'}
              </Typography>
              <Typography variant="caption" display="block">
                • {t('ticket.rule2') || 'Se requiere técnico asignado (excepto desde Pendiente)'}
              </Typography>
              <Typography variant="caption" display="block">
                • {t('ticket.rule3') || 'El comentario es obligatorio para justificar el cambio'}
              </Typography>
            </Box>
          </>
        )}

        {/* Mostrar errores */}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          {t('common.cancel') || 'Cancelar'}
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          disabled={loading || estadosDisponibles.length === 0 || estadoActual === 'cerrado'}
        >
          {loading ? (t('common.updating') || 'Actualizando...') : (t('ticket.updateStatus') || 'Actualizar Estado')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
