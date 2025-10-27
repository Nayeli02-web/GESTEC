import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import CategoryIcon from '@mui/icons-material/Category';
import SpeedIcon from '@mui/icons-material/Speed';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

export function Home() {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Hero Section */}
      <Paper
        elevation={3}
        sx={{
          p: 6,
          mb: 4,
          background: 'linear-gradient(135deg, #0097a7 0%, #00796b 100%)',
          color: 'white',
          borderRadius: 3
        }}
      >
        <Typography
          component="h1"
          variant="h2"
          align="center"
          gutterBottom
          sx={{ fontWeight: 700 }}
        >
          GESTEC
        </Typography>
        <Typography
          variant="h5"
          align="center"
          sx={{ mb: 3, opacity: 0.95 }}
        >
          Sistema de Gestión de Tickets de Soporte Técnico
        </Typography>
        <Typography
          variant="body1"
          align="center"
          sx={{ maxWidth: 800, mx: 'auto', opacity: 0.9 }}
        >
          Gestiona eficientemente las solicitudes de soporte técnico, asigna tickets a especialistas,
          monitorea los tiempos de respuesta y mejora la satisfacción del cliente.
        </Typography>
      </Paper>

      {/* Características principales */}
      <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        Características Principales
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card
            elevation={2}
            sx={{
              height: '100%',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4,
              }
            }}
          >
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <AssignmentIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                Gestión de Tickets
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Crea, asigna y rastrea tickets de soporte técnico de manera organizada y eficiente.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card
            elevation={2}
            sx={{
              height: '100%',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4,
              }
            }}
          >
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <SupportAgentIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
              <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                Equipo Técnico
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Administra especialistas, asigna tickets según especialidad y monitorea cargas de trabajo.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card
            elevation={2}
            sx={{
              height: '100%',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4,
              }
            }}
          >
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <AccessTimeIcon sx={{ fontSize: 60, color: 'warning.main', mb: 2 }} />
              <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                Control de SLA
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Monitorea tiempos de respuesta y resolución con indicadores visuales de cumplimiento.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card
            elevation={2}
            sx={{
              height: '100%',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4,
              }
            }}
          >
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <CategoryIcon sx={{ fontSize: 60, color: 'info.main', mb: 2 }} />
              <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                Categorización
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Organiza tickets por categorías con niveles de prioridad y SLAs personalizados.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card
            elevation={2}
            sx={{
              height: '100%',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4,
              }
            }}
          >
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <SpeedIcon sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
              <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                Dashboard en Tiempo Real
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Visualiza métricas de rendimiento, tickets activos y estadísticas del equipo.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card
            elevation={2}
            sx={{
              height: '100%',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4,
              }
            }}
          >
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <CheckCircleIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
              <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                Seguimiento Completo
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Historial de cambios, evidencias fotográficas y valoraciones de servicio.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
