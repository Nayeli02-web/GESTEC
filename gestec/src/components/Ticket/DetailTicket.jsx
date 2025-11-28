import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';

export default function DetailTicket() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Obtener la ruta de origen, por defecto /tickets
  const fromPath = location.state?.from || '/tickets';

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

  // Formatear tiempo 
  const formatearTiempo = (horas) => {
    if (!horas) return 'N/A';
    return t('ticket.hours', { count: horas });
  };

  const getPrioridadLabel = (prioridad) => {
    switch (prioridad?.toLowerCase()) {
      case 'alta': return t('ticket.high');
      case 'media': return t('ticket.medium');
      case 'baja': return t('ticket.low');
      default: return prioridad;
    }
  };

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

  const getPrioridadColor = (prioridad) => {
    switch (prioridad?.toLowerCase()) {
      case 'alta': return 'error';
      case 'media': return 'warning';
      case 'baja': return 'success';
      default: return 'default';
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

  return (
    <Container maxWidth="lg" sx={{ mt: 3, mb: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(fromPath)}
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
        <Alert severity="error">{t('ticket.loadingData')}</Alert>
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
                  <Typography variant="body1"><strong>{t('ticket.name')}:</strong> {ticket.cliente?.nombre}</Typography>
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
                      <Typography variant="body1"><strong>{t('ticket.name')}:</strong> {ticket.tecnico.nombre}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {ticket.tecnico.correo}
                      </Typography>
                    </>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      {t('ticket.noTechnicianAssigned')}
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
                    {t('ticket.associatedCategory')}
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
                    {t('ticket.resolution')}
                  </Typography>
                  {ticket.fecha_cierre ? (
                    <>
                      <Typography variant="body2">
                        <strong>{t('ticket.closureDate')}:</strong> {new Date(ticket.fecha_cierre).toLocaleString()}
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
                      SLA - {ticket.sla.nombre}
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="text.secondary">
                          {t('ticket.slaResponseTime')}
                        </Typography>
                        <Typography variant="h6">{formatearTiempo(ticket.sla.tiempo_respuesta)}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="text.secondary">
                          {t('ticket.responseDeadlineLabel')}
                        </Typography>
                        <Typography variant="h6" color="error.main">
                          {ticket.sla.fecha_limite_respuesta 
                            ? new Date(ticket.sla.fecha_limite_respuesta).toLocaleString('es-CR')
                            : 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="text.secondary">
                          {t('ticket.slaResolutionTimeLabel')}
                        </Typography>
                        <Typography variant="h6">{formatearTiempo(ticket.sla.tiempo_resolucion)}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="text.secondary">
                          {t('ticket.resolutionDeadlineLabel')}
                        </Typography>
                        <Typography variant="h6" color="error.main">
                          {ticket.sla.fecha_limite_resolucion 
                            ? new Date(ticket.sla.fecha_limite_resolucion).toLocaleString('es-CR')
                            : 'N/A'}
                        </Typography>
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
                      {t('ticket.stateHistory')}
                    </Typography>
                    <List>
                      {ticket.historial.map((cambio, idx) => (
                        <div key={cambio.id}>
                          <ListItem>
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                  <Chip label={getEstadoLabel(cambio.estado_anterior)} size="small" variant="outlined" />
                                  <Typography>→</Typography>
                                  <Chip label={getEstadoLabel(cambio.estado_nuevo)} size="small" color="primary" />
                                </Box>
                              }
                              secondary={
                                <>
                                  <Typography variant="caption" display="block" color="text.secondary">
                                    {new Date(cambio.fecha).toLocaleString()}
                                  </Typography>
                                  {cambio.observacion && (
                                    <Typography variant="body2" color="text.secondary">
                                      {cambio.observacion}
                                    </Typography>
                                  )}
                                </>
                              }
                            />
                          </ListItem>
                          {idx < ticket.historial.length - 1 && <Divider />}
                        </div>
                      ))}
                    </List>
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
            <Grid item xs={12}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary">
                    {t('ticket.serviceRating')}
                  </Typography>
                  {ticket.valoracion ? (
                    <>
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
                          {ticket.valoracion.comentario}
                        </Typography>
                      )}
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                        {t('ticket.ratedOn')}: {new Date(ticket.valoracion.fecha).toLocaleString()}
                      </Typography>
                    </>
                  ) : (
                    <Alert severity="info">
                      {t('ticket.notRatedYet')}
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </Container>
  );
}
