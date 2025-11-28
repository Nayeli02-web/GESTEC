import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TicketService from '../../services/TicketService';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Rating from '@mui/material/Rating';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import Alert from '@mui/material/Alert';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { useTranslation } from 'react-i18next';

export default function DetailTicket() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    TicketService.getDetalle(id)
      .then((res) => {
        if (mounted) setTicket(res);
      })
      .catch((err) => {
        console.error('Error al cargar ticket:', err);
        setError(err);
      })
      .finally(() => setLoading(false));
    return () => (mounted = false);
  }, [id]);

  const getPrioridadColor = (prioridad) => {
    switch (prioridad?.toLowerCase()) {
      case 'alta': return 'error';
      case 'media': return 'warning';
      case 'baja': return 'success';
      default: return 'default';
    }
  };

  const getPrioridadLabel = (prioridad) => {
    switch (prioridad?.toLowerCase()) {
      case 'alta': return t('ticket.high');
      case 'media': return t('ticket.medium');
      case 'baja': return t('ticket.low');
      default: return prioridad;
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'resuelto': return 'success';
      case 'cerrado': return 'default';
      case 'en_proceso': return 'info';
      case 'asignado': return 'warning';
      case 'pendiente': return 'error';
      default: return 'default';
    }
  };

  const getEstadoLabel = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'resuelto': return t('ticket.resolved');
      case 'cerrado': return t('ticket.closed');
      case 'en_proceso': return t('ticket.inProgress');
      case 'asignado': return t('ticket.assigned');
      case 'pendiente': return t('ticket.pending');
      default: return estado;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 3, mb: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/tickets')}
        sx={{ mb: 2 }}
      >
        {t('ticket.backToList')}
      </Button>

      {loading ? (
        <Paper sx={{ p: 3 }}>
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        </Paper>
      ) : error ? (
        <Alert severity="error">{t('ticket.loadingError')}</Alert>
      ) : !ticket ? (
        <Alert severity="warning">{t('ticket.notFound')}</Alert>
      ) : (
        <>
          {/* Encabezado Principal */}
          <Paper sx={{ p: 3, mb: 2 }} elevation={3}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                  {ticket.titulo}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Ticket #{ticket.id} • {t('ticket.creationDate')}: {new Date(ticket.fecha_creacion).toLocaleString()}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column', alignItems: 'flex-end' }}>
                <Chip 
                  label={`${t('ticket.priority')}: ${getPrioridadLabel(ticket.prioridad)}`} 
                  color={getPrioridadColor(ticket.prioridad)}
                  size="medium"
                />
                <Chip 
                  label={`${t('ticket.state')}: ${getEstadoLabel(ticket.estado)}`} 
                  color={getEstadoColor(ticket.estado)}
                  size="medium"
                  variant="outlined"
                />
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Descripción */}
            <Typography variant="h6" gutterBottom>
              {t('ticket.description')}
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {ticket.descripcion || t('ticket.noDescription')}
            </Typography>
          </Paper>

          <Grid container spacing={2}>
            {/* Información del Usuario y Técnico */}
            <Grid item xs={12} md={6}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary">
                    {t('ticket.requestingUser')}
                  </Typography>
                  <Typography variant="body1"><strong>{t('technician.name')}:</strong> {ticket.cliente?.nombre}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {ticket.cliente?.correo}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary">
                    {t('ticket.assignedTechnician')}
                  </Typography>
                  {ticket.tecnico ? (
                    <>
                      <Typography variant="body1"><strong>{t('technician.name')}:</strong> {ticket.tecnico.nombre}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {ticket.tecnico.correo}
                      </Typography>
                    </>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      {t('ticket.noTechnician')}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Categoría y Fechas */}
            <Grid item xs={12} md={6}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary">
                    {t('ticket.category')}
                  </Typography>
                  <Chip 
                    label={ticket.categoria?.nombre || t('ticket.noCategory')} 
                    color="secondary" 
                    variant="outlined"
                    size="medium"
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary">
                    {t('ticket.resolved')}
                  </Typography>
                  {ticket.fecha_cierre ? (
                    <>
                      <Typography variant="body2">
                        <strong>{t('ticket.closingDate')}:</strong> {new Date(ticket.fecha_cierre).toLocaleString()}
                      </Typography>
                      <Typography variant="body2">
                        <strong>{t('ticket.resolutionDays')}:</strong> {ticket.dias_resolucion} {t('ticket.days')}
                      </Typography>
                    </>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      {t('ticket.inProcessStatus')}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* SLA y Cumplimiento */}
            {ticket.sla && (
              <Grid item xs={12}>
                <Card elevation={2}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="primary">
                      {t('ticket.slaInfo')} - {ticket.sla.nombre}
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body2" color="text.secondary">
                          {t('ticket.responseTime')}
                        </Typography>
                        <Typography variant="h6">{ticket.sla.tiempo_respuesta} min</Typography>
                        {ticket.cumplimiento_respuesta && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                            {ticket.cumplimiento_respuesta === 'Cumplido' ? (
                              <>
                                <CheckCircleIcon color="success" fontSize="small" />
                                <Typography variant="body2" color="success.main">
                                  {t('ticket.fulfilled')}
                                </Typography>
                              </>
                            ) : (
                              <>
                                <CancelIcon color="error" fontSize="small" />
                                <Typography variant="body2" color="error.main">
                                  {t('ticket.notFulfilled')}
                                </Typography>
                              </>
                            )}
                          </Box>
                        )}
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body2" color="text.secondary">
                          {t('ticket.resolutionTime')}
                        </Typography>
                        <Typography variant="h6">{ticket.sla.tiempo_resolucion} min</Typography>
                        {ticket.cumplimiento_resolucion && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                            {ticket.cumplimiento_resolucion === 'Cumplido' ? (
                              <>
                                <CheckCircleIcon color="success" fontSize="small" />
                                <Typography variant="body2" color="success.main">
                                  {t('ticket.fulfilled')}
                                </Typography>
                              </>
                            ) : (
                              <>
                                <CancelIcon color="error" fontSize="small" />
                                <Typography variant="body2" color="error.main">
                                  {t('ticket.notFulfilled')}
                                </Typography>
                              </>
                            )}
                          </Box>
                        )}
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Historial de Estados */}
            {ticket.historial && ticket.historial.length > 0 && (
              <Grid item xs={12}>
                <Card elevation={2}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="primary">
                      {t('ticket.history')}
                    </Typography>
                    {ticket.historial.map((cambio, idx) => (
                      <Box key={cambio.id} sx={{ mb: 2, pb: 2, borderBottom: idx < ticket.historial.length - 1 ? '1px solid #eee' : 'none' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Chip label={cambio.estado_anterior} size="small" variant="outlined" />
                            <Typography>→</Typography>
                            <Chip label={cambio.estado_nuevo} size="small" color="primary" />
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(cambio.fecha).toLocaleString()}
                          </Typography>
                        </Box>
                        {cambio.observacion && (
                          <Typography variant="body2" color="text.secondary">
                            {cambio.observacion}
                          </Typography>
                        )}
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Evidencias/Imágenes */}
            {ticket.imagenes && ticket.imagenes.length > 0 && (
              <Grid item xs={12}>
                <Card elevation={2}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="primary">
                      {t('ticket.evidence')}
                    </Typography>
                    <ImageList sx={{ width: '100%', height: 'auto' }} cols={3} rowHeight={164}>
                      {ticket.imagenes.map((img) => (
                        <ImageListItem key={img.id}>
                          <img
                            src={`${img.ruta}?w=164&h=164&fit=crop&auto=format`}
                            srcSet={`${img.ruta}?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}
                            alt={img.nombre_archivo}
                            loading="lazy"
                          />
                        </ImageListItem>
                      ))}
                    </ImageList>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Valoración */}
            {ticket.valoracion && (
              <Grid item xs={12}>
                <Card elevation={2}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="primary">
                      {t('ticket.ratings')}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Rating 
                        value={parseInt(ticket.valoracion.puntuacion)} 
                        readOnly 
                        size="large"
                      />
                      <Typography variant="h6">
                        {ticket.valoracion.puntuacion}/5
                      </Typography>
                    </Box>
                    {ticket.valoracion.comentario && (
                      <Typography variant="body1" color="text.secondary">
                        "{ticket.valoracion.comentario}"
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                      {t('ticket.ratedOn')}: {new Date(ticket.valoracion.fecha).toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        </>
      )}
    </Container>
  );
}
