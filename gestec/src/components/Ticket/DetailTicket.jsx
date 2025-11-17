import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
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
    return `${horas} ${horas === 1 ? 'hora' : 'horas'}`;
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
        Volver
      </Button>

      {loading ? (
        <Paper sx={{ p: 3 }}>
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        </Paper>
      ) : error ? (
        <Alert severity="error">Error al cargar el ticket</Alert>
      ) : !ticket ? (
        <Alert severity="warning">Ticket no encontrado</Alert>
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
                  Ticket #{ticket.id} • Creado: {new Date(ticket.fecha_creacion).toLocaleString()}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column', alignItems: 'flex-end' }}>
                <Chip 
                  label={`Prioridad: ${ticket.prioridad}`} 
                  color={getPrioridadColor(ticket.prioridad)}
                  size="medium"
                />
                <Chip 
                  label={`Estado: ${ticket.estado}`} 
                  color={getEstadoColor(ticket.estado)}
                  size="medium"
                  variant="outlined"
                />
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Descripción */}
            <Typography variant="h6" gutterBottom>
              Descripción
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {ticket.descripcion || 'Sin descripción'}
            </Typography>
          </Paper>

          <Grid container spacing={2}>
            {/* Información del Usuario y Técnico */}
            <Grid item xs={12} md={6}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary">
                    Usuario Solicitante
                  </Typography>
                  <Typography variant="body1"><strong>Nombre:</strong> {ticket.cliente?.nombre}</Typography>
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
                    Técnico Asignado
                  </Typography>
                  {ticket.tecnico ? (
                    <>
                      <Typography variant="body1"><strong>Nombre:</strong> {ticket.tecnico.nombre}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {ticket.tecnico.correo}
                      </Typography>
                    </>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Sin técnico asignado
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
                    Categoría Asociada
                  </Typography>
                  <Chip 
                    label={ticket.categoria?.nombre || 'Sin categoría'} 
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
                    Resolución
                  </Typography>
                  {ticket.fecha_cierre ? (
                    <>
                      <Typography variant="body2">
                        <strong>Fecha de Cierre:</strong> {new Date(ticket.fecha_cierre).toLocaleString()}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Días de Resolución:</strong> {ticket.dias_resolucion} días
                      </Typography>
                    </>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Ticket en proceso
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
                          Tiempo SLA Respuesta
                        </Typography>
                        <Typography variant="h6">{formatearTiempo(ticket.sla.tiempo_respuesta)}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="text.secondary">
                          Fecha Límite Respuesta
                        </Typography>
                        <Typography variant="h6" color="error.main">
                          {ticket.sla.fecha_limite_respuesta 
                            ? new Date(ticket.sla.fecha_limite_respuesta).toLocaleString('es-CR')
                            : 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="text.secondary">
                          Tiempo SLA Resolución
                        </Typography>
                        <Typography variant="h6">{formatearTiempo(ticket.sla.tiempo_resolucion)}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="text.secondary">
                          Fecha Límite Resolución
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
                      Historial de Estados
                    </Typography>
                    <List>
                      {ticket.historial.map((cambio, idx) => (
                        <div key={cambio.id}>
                          <ListItem>
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                  <Chip label={cambio.estado_anterior} size="small" variant="outlined" />
                                  <Typography>→</Typography>
                                  <Chip label={cambio.estado_nuevo} size="small" color="primary" />
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
                      Evidencias e Imágenes
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
                    Valoración del Servicio
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
                        Valorado el: {new Date(ticket.valoracion.fecha).toLocaleString()}
                      </Typography>
                    </>
                  ) : (
                    <Alert severity="info">
                      Este ticket aún no ha sido valorado por el cliente.
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
