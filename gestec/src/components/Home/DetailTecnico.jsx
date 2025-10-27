import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TecnicoService from '../../services/TecnicoService';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Avatar from '@mui/material/Avatar';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import WorkIcon from '@mui/icons-material/Work';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BuildIcon from '@mui/icons-material/Build';

export default function DetailTecnico() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tecnico, setTecnico] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    TecnicoService.getDetalle(id)
      .then((res) => {
        if (mounted) setTecnico(res);
      })
      .catch((err) => {
        console.error('Error al cargar técnico:', err);
        setError(err);
      })
      .finally(() => setLoading(false));
    return () => (mounted = false);
  }, [id]);

  return (
    <Container maxWidth="lg" sx={{ mt: 3, mb: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/tecnicos')}
        sx={{ mb: 2 }}
      >
        Volver a Técnicos
      </Button>

      {loading ? (
        <Paper sx={{ p: 3 }}>
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        </Paper>
      ) : error ? (
        <Alert severity="error">Error al cargar el técnico</Alert>
      ) : !tecnico ? (
        <Alert severity="warning">Técnico no encontrado</Alert>
      ) : (
        <>
          {/* Encabezado Principal */}
          <Paper sx={{ p: 3, mb: 3 }} elevation={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar 
                sx={{ 
                  width: 80, 
                  height: 80, 
                  bgcolor: 'primary.main',
                  fontSize: '2rem'
                }}
              >
                {tecnico.nombre?.charAt(0).toUpperCase()}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                  {tecnico.nombre}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip 
                    icon={tecnico.disponible ? <CheckCircleIcon /> : <CancelIcon />}
                    label={tecnico.disponible ? 'Disponible' : 'No Disponible'} 
                    color={tecnico.disponible ? 'success' : 'error'}
                    size="small"
                  />
                  <Chip 
                    label={`${tecnico.carga_trabajo || 0} tickets activos`}
                    color="primary"
                    variant="outlined"
                    size="small"
                  />
                </Box>
              </Box>
            </Box>
          </Paper>

          <Grid container spacing={3}>
            {/* Información Personal del Técnico */}
            <Grid item xs={12} md={6}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon />
                    Información Personal
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <PersonIcon color="action" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Nombre completo"
                        secondary={tecnico.nombre || 'N/A'}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <EmailIcon color="action" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Correo electrónico"
                        secondary={tecnico.correo || 'N/A'}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <PhoneIcon color="action" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Teléfono"
                        secondary={tecnico.telefono || 'N/A'}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <WorkIcon color="action" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="ID de Técnico"
                        secondary={`#${tecnico.id}`}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* Carga de Trabajo y Disponibilidad */}
            <Grid item xs={12} md={6}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AssignmentIcon />
                    Carga de Trabajo y Disponibilidad
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Estado de disponibilidad
                    </Typography>
                    <Chip 
                      icon={tecnico.disponible ? <CheckCircleIcon /> : <CancelIcon />}
                      label={tecnico.disponible ? 'Disponible para asignación' : 'No disponible'} 
                      color={tecnico.disponible ? 'success' : 'error'}
                      sx={{ mt: 1 }}
                    />
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Tickets activos asignados
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mt: 1 }}>
                      <Typography variant="h3" color="primary.main">
                        {tecnico.carga_trabajo || 0}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        tickets en proceso
                      </Typography>
                    </Box>
                  </Box>
                  {tecnico.carga_trabajo > 0 && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      El técnico tiene {tecnico.carga_trabajo} ticket{tecnico.carga_trabajo > 1 ? 's' : ''} actualmente en proceso
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Especialidades */}
            <Grid item xs={12}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BuildIcon />
                    Especialidades
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  {tecnico.especialidades && tecnico.especialidades.length > 0 ? (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {tecnico.especialidades.map((esp, index) => (
                        <Chip
                          key={index}
                          label={esp.nombre || esp}
                          color="secondary"
                          variant="outlined"
                          icon={<BuildIcon />}
                        />
                      ))}
                    </Box>
                  ) : (
                    <Alert severity="warning">
                      Este técnico no tiene especialidades asignadas
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Historial de Tickets (opcional - si tienes esta información) */}
            {tecnico.tickets_resueltos !== undefined && (
              <Grid item xs={12}>
                <Card elevation={2}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="primary">
                      Estadísticas de Rendimiento
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <Box sx={{ textAlign: 'center', p: 2 }}>
                          <Typography variant="h4" color="success.main">
                            {tecnico.tickets_resueltos || 0}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Tickets resueltos
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Box sx={{ textAlign: 'center', p: 2 }}>
                          <Typography variant="h4" color="primary.main">
                            {tecnico.carga_trabajo || 0}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Tickets activos
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Box sx={{ textAlign: 'center', p: 2 }}>
                          <Typography variant="h4" color="info.main">
                            {tecnico.tickets_totales || 0}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Total de tickets
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
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
