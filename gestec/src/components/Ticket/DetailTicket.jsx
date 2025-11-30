import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import TicketService from '../../services/TicketService';
import UpdateStatusDialog from './UpdateStatusDialog';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Rating from '@mui/material/Rating';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import PersonIcon from '@mui/icons-material/Person';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import ImageIcon from '@mui/icons-material/Image';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

export default function DetailTicket() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // Obtener la ruta de origen, por defecto /tickets
  const fromPath = location.state?.from || '/tickets';

  const loadTicket = () => {
    setLoading(true);
    TicketService.getDetalle(id)
      .then((res) => {
        setTicket(res);
      })
      .catch((err) => {
        console.error('Error al cargar ticket:', err);
        setError(err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTicket();
  }, [id]);

  const handleUpdateStatus = async (formData) => {
    try {
      await TicketService.updateEstado(id, formData);
      setSuccessMessage(t('ticket.updateSuccess') || 'Estado del ticket actualizado exitosamente');
      // Recargar el ticket para ver los cambios
      loadTicket();
    } catch (err) {
      console.error('Error al actualizar estado:', err);
      throw err;
    }
  };

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

  const handleOpenImageDialog = (imageUrl) => {
    setSelectedImage(imageUrl);
    setImageDialogOpen(true);
  };

  const handleCloseImageDialog = () => {
    setImageDialogOpen(false);
    setSelectedImage(null);
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    // Si ya tiene el prefijo completo, devolverlo tal cual
    if (imagePath.startsWith('http')) return imagePath;
    // Si comienza con /uploads, construir la URL completa con puerto 81
    if (imagePath.startsWith('/uploads')) {
      return `http://localhost:81/GESTEC${imagePath}`;
    }
    // Si no tiene el prefijo, agregarlo
    return `http://localhost:81/GESTEC/${imagePath}`;
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 3, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(fromPath)}
        >
          {t('ticket.backToList')}
        </Button>
        
        {ticket && ticket.estado?.toLowerCase() !== 'cerrado' && (
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => setOpenUpdateDialog(true)}
            color="primary"
          >
            {t('ticket.updateStatus')}
          </Button>
        )}
      </Box>

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
                    <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AccessTimeIcon />
                      {t('ticket.stateHistory')}
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      {ticket.historial.map((cambio, idx) => (
                        <Card 
                          key={cambio.id} 
                          variant="outlined" 
                          sx={{ 
                            mb: 2, 
                            borderLeft: 4, 
                            borderLeftColor: 'primary.main',
                            '&:last-child': { mb: 0 }
                          }}
                        >
                          <CardContent>
                            {/* Estado Transition */}
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 2 }}>
                              <Chip 
                                label={getEstadoLabel(cambio.estado_anterior)} 
                                size="small" 
                                color={getEstadoColor(cambio.estado_anterior)}
                                variant="outlined" 
                              />
                              <Typography variant="body2" color="text.secondary">→</Typography>
                              <Chip 
                                label={getEstadoLabel(cambio.estado_nuevo)} 
                                size="small" 
                                color={getEstadoColor(cambio.estado_nuevo)}
                              />
                            </Box>

                            {/* User and Date Info */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                                  <PersonIcon fontSize="small" />
                                </Avatar>
                                <Box>
                                  <Typography variant="body2" fontWeight="medium">
                                    {cambio.usuario_nombre || t('ticket.unknownUser')}
                                  </Typography>
                                  {cambio.usuario_email && (
                                    <Typography variant="caption" color="text.secondary">
                                      {cambio.usuario_email}
                                    </Typography>
                                  )}
                                </Box>
                              </Box>
                              <Box sx={{ ml: 'auto' }}>
                                <Typography variant="caption" color="text.secondary">
                                  {new Date(cambio.fecha).toLocaleString('es-ES', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </Typography>
                              </Box>
                            </Box>

                            {/* Comment/Observation */}
                            {cambio.observacion && (
                              <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                                <Typography variant="body2" fontWeight="medium" gutterBottom>
                                  {t('ticket.comment')}:
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {cambio.observacion}
                                </Typography>
                              </Box>
                            )}

                            {/* Image Evidence */}
                            {cambio.imagen_evidencia && (
                              <Box sx={{ mt: 2 }}>
                                {console.log('Rendering image for cambio:', cambio.id, 'Path:', cambio.imagen_evidencia, 'URL:', getImageUrl(cambio.imagen_evidencia))}
                                <Typography variant="body2" fontWeight="medium" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <ImageIcon fontSize="small" color="primary" />
                                  {t('ticket.evidenceImage')}:
                                </Typography>
                                <Box 
                                  component="img"
                                  src={getImageUrl(cambio.imagen_evidencia)}
                                  alt={t('ticket.evidenceImage')}
                                  onError={(e) => {
                                    console.error('Error loading image:', cambio.imagen_evidencia);
                                    console.error('Full URL:', getImageUrl(cambio.imagen_evidencia));
                                    console.error('Error event:', e);
                                  }}
                                  sx={{ 
                                    maxWidth: 200, 
                                    maxHeight: 150, 
                                    objectFit: 'cover',
                                    borderRadius: 1,
                                    cursor: 'pointer',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    '&:hover': {
                                      opacity: 0.8,
                                      boxShadow: 2
                                    }
                                  }}
                                  onClick={() => handleOpenImageDialog(getImageUrl(cambio.imagen_evidencia))}
                                />
                              </Box>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </Box>
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

      {/* Diálogo de actualización de estado */}
      <UpdateStatusDialog
        open={openUpdateDialog}
        onClose={() => setOpenUpdateDialog(false)}
        ticket={ticket}
        onUpdate={handleUpdateStatus}
      />

      {/* Snackbar de éxito */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      </Snackbar>

      {/* Image Viewer Dialog */}
      <Dialog
        open={imageDialogOpen}
        onClose={handleCloseImageDialog}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {t('ticket.evidenceImage')}
          <IconButton onClick={handleCloseImageDialog} edge="end">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedImage && (
            <Box
              component="img"
              src={selectedImage}
              alt={t('ticket.evidenceImage')}
              sx={{
                width: '100%',
                height: 'auto',
                objectFit: 'contain',
                maxHeight: '80vh'
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
}
