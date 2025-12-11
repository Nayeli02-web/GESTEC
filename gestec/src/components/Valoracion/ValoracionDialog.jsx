import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Rating,
  TextField,
  Box,
  Typography,
  Alert
} from '@mui/material';
import ValoracionService from '../../services/ValoracionService';

export default function ValoracionDialog({ open, onClose, ticket, onSuccess }) {
  const [puntuacion, setPuntuacion] = useState(0);
  const [comentario, setComentario] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');

    // Validación: puntuación requerida
    if (puntuacion === 0) {
      setError('Debe seleccionar una puntuación');
      return;
    }

    // Validación: rango 1-5
    if (puntuacion < 1 || puntuacion > 5) {
      setError('La puntuación debe estar entre 1 y 5 estrellas');
      return;
    }

    setLoading(true);

    try {
      const response = await ValoracionService.crear(ticket.id, {
        puntuacion,
        comentario: comentario.trim()
      });

      if (response.success) {
        onSuccess('Valoración registrada exitosamente');
        handleClose();
      } else {
        setError(response.message || 'Error al crear valoración');
      }
    } catch (error) {
      console.error('Error al crear valoración:', error);
      setError('Error de conexión al crear valoración');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPuntuacion(0);
    setComentario('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Valorar Servicio</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
          {error && (
            <Alert severity="error" onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Ticket #{ticket?.id} - {ticket?.titulo}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Técnico: {ticket?.tecnico_nombre}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <Typography component="legend">Puntuación *</Typography>
            <Rating
              name="puntuacion"
              value={puntuacion}
              onChange={(event, newValue) => setPuntuacion(newValue)}
              size="large"
              disabled={loading}
            />
            <Typography variant="caption" color="text.secondary">
              Seleccione de 1 a 5 estrellas
            </Typography>
          </Box>

          <TextField
            label="Comentario (opcional)"
            multiline
            rows={4}
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            disabled={loading}
            placeholder="Comparta su experiencia con el servicio recibido..."
            inputProps={{ maxLength: 500 }}
            helperText={`${comentario.length}/500 caracteres`}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? 'Enviando...' : 'Enviar Valoración'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

ValoracionDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  ticket: PropTypes.shape({
    id: PropTypes.number,
    titulo: PropTypes.string,
    tecnico_nombre: PropTypes.string
  }),
  onSuccess: PropTypes.func.isRequired
};
