import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CategoriaService from '../../services/CategoriaService';
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
import Alert from '@mui/material/Alert';
import LabelIcon from '@mui/icons-material/Label';
import PsychologyIcon from '@mui/icons-material/Psychology';
import TimerIcon from '@mui/icons-material/Timer';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { useTranslation } from 'react-i18next';

export default function DetailCategoria() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [categoria, setCategoria] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    CategoriaService.getDetalle(id)
      .then((res) => {
        if (mounted) setCategoria(res);
      })
      .catch((err) => {
        console.error('Error al cargar categoría:', err);
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

  return (
    <Container maxWidth="lg" sx={{ mt: 3, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/categorias')}
        >
          {t('category.backToList')}
        </Button>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={() => navigate(`/categoria/${id}/editar`)}
        >
          {t('common.edit')}
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" p={5}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{t('category.loadingError')}</Alert>
      ) : !categoria ? (
        <Alert severity="warning">{t('category.notFound')}</Alert>
      ) : (
        <>
          {/* Header con título */}
          <Paper sx={{ p: 3, mb: 3 }} elevation={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <AssignmentIcon sx={{ fontSize: 40, color: 'primary.main' }} />
              <Box>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
                  {categoria.nombre}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Categoría ID: {categoria.id}
                </Typography>
              </Box>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="body1" color="text.secondary">
              {categoria.descripcion || 'Sin descripción disponible'}
            </Typography>
          </Paper>

          <Grid container spacing={3}>
            {/* Etiquetas */}
            <Grid item xs={12} md={6}>
              <Card elevation={2} sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <LabelIcon color="primary" />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {t('category.tags')}
                    </Typography>
                  </Box>
                  
                  {categoria.etiquetas && categoria.etiquetas.length > 0 ? (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {categoria.etiquetas.map((etiqueta, idx) => (
                        <Chip
                          key={idx}
                          label={etiqueta.palabra}
                          color="primary"
                          variant="outlined"
                          size="small"
                        />
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No hay etiquetas disponibles
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Especialidades */}
            <Grid item xs={12} md={6}>
              <Card elevation={2} sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <PsychologyIcon color="success" />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {t('category.specialties')}
                    </Typography>
                  </Box>
                  
                  {categoria.especialidades && categoria.especialidades.length > 0 ? (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {categoria.especialidades.map((esp) => (
                        <Chip
                          key={esp.id}
                          label={esp.nombre}
                          color="success"
                        />
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No hay especialidades asignadas
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* SLA */}
            <Grid item xs={12}>
              <Card elevation={2}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <TimerIcon color="warning" />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {t('category.sla')} - {t('category.slaConfig')}
                    </Typography>
                  </Box>
                  
                  {categoria.sla ? (
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={4}>
                        <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', bgcolor: 'info.50' }}>
                          <Typography variant="caption" color="text.secondary" gutterBottom>
                            {t('category.slaSelected')}
                          </Typography>
                          <Typography variant="h6" color="info.main" sx={{ fontWeight: 600 }}>
                            {categoria.sla.nombre}
                          </Typography>
                        </Paper>
                      </Grid>
                      
                      <Grid item xs={12} md={4}>
                        <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', bgcolor: 'success.50' }}>
                          <Typography variant="caption" color="text.secondary" gutterBottom>
                            {t('category.responseTime')}
                          </Typography>
                          <Typography variant="h6" color="success.main" sx={{ fontWeight: 600 }}>
                            {formatearTiempo(categoria.sla.tiempo_respuesta_minutos)}
                          </Typography>
                        </Paper>
                      </Grid>
                      
                      <Grid item xs={12} md={4}>
                        <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.50' }}>
                          <Typography variant="caption" color="text.secondary" gutterBottom>
                            {t('category.resolutionTime')}
                          </Typography>
                          <Typography variant="h6" color="warning.main" sx={{ fontWeight: 600 }}>
                            {formatearTiempo(categoria.sla.tiempo_resolucion_minutos)}
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>
                  ) : (
                    <Alert severity="info">
                      No hay SLA configurado para esta categoría
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Estadísticas de Tickets */}
            <Grid item xs={12}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    {t('category.ticketStats')}
                  </Typography>
                  
                  <Paper variant="outlined" sx={{ p: 3, bgcolor: 'grey.50', textAlign: 'center' }}>
                    <Typography variant="h3" color="primary" gutterBottom sx={{ fontWeight: 700 }}>
                      {categoria.total_tickets}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                      Total de tickets registrados en esta categoría
                    </Typography>
                    
                    {categoria.estadisticas && categoria.estadisticas.length > 0 && (
                      <Box sx={{ mt: 3 }}>
                        <Divider sx={{ mb: 2 }} />
                        <Typography variant="subtitle2" gutterBottom>
                          {t('category.byState')}:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center', mt: 2 }}>
                          {categoria.estadisticas.map((stat, idx) => (
                            <Chip
                              key={idx}
                              label={`${stat.estado}: ${stat.cantidad}`}
                              color={
                                stat.estado === 'resuelto' ? 'success' :
                                stat.estado === 'en_proceso' ? 'warning' :
                                stat.estado === 'pendiente' ? 'default' :
                                stat.estado === 'asignado' ? 'info' :
                                'primary'
                              }
                              size="large"
                            />
                          ))}
                        </Box>
                      </Box>
                    )}
                  </Paper>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </Container>
  );
}
