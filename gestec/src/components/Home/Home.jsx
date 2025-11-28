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
import { useTranslation } from 'react-i18next';

export function Home() {
  const { t } = useTranslation();
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
          {t('home.title')}
        </Typography>
        <Typography
          variant="h5"
          align="center"
          sx={{ mb: 3, opacity: 0.95 }}
        >
          {t('home.subtitle')}
        </Typography>
        <Typography
          variant="body1"
          align="center"
          sx={{ maxWidth: 800, mx: 'auto', opacity: 0.9 }}
        >
          {t('home.description')}
        </Typography>
      </Paper>

      {/* Características principales */}
      <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        {t('home.mainFeatures')}
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
                {t('home.ticketManagement')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('home.ticketManagementDesc')}
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
                {t('home.technicalTeam')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('home.technicalTeamDesc')}
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
                {t('home.slaControl')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('home.slaControlDesc')}
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
                {t('home.categorization')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('home.categorizationDesc')}
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
                {t('home.realtimeDashboard')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('home.realtimeDashboardDesc')}
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
                {t('home.completeTracking')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('home.completeTrackingDesc')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
