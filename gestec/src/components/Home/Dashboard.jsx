import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Auth/AuthContext';
import DashboardService from '../../services/DashboardService';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  Star as StarIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  EmojiEvents as TrophyIcon
} from '@mui/icons-material';

const COLORS = ['#4caf50', '#f44336', '#ff9800', '#2196f3', '#9c27b0'];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [ticketsPorMes, setTicketsPorMes] = useState([]);
  const [promedioValoraciones, setPromedioValoraciones] = useState(0);
  const [cumplimientoSLA, setCumplimientoSLA] = useState({ respuesta: 0, resolucion: 0 });
  const [rankingTecnicos, setRankingTecnicos] = useState([]);
  const [categoriasIncumplimientos, setCategoriasIncumplimientos] = useState([]);

  useEffect(() => {
    // Verificar que solo administradores puedan acceder
    if (!user || user.rol_id !== 1) {
      navigate('/');
      return;
    }

    cargarDatos();
  }, [user, navigate]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [tickets, valoraciones, sla, ranking, categorias] = await Promise.all([
        DashboardService.getTicketsPorMes(),
        DashboardService.getPromedioValoraciones(),
        DashboardService.getCumplimientoSLA(),
        DashboardService.getRankingTecnicos(),
        DashboardService.getCategoriasIncumplimientos()
      ]);

      setTicketsPorMes(Array.isArray(tickets) ? tickets : []);
      setPromedioValoraciones(valoraciones?.promedio || 0);
      setCumplimientoSLA(sla || { respuesta: 0, resolucion: 0 });
      setRankingTecnicos(Array.isArray(ranking) ? ranking : []);
      setCategoriasIncumplimientos(Array.isArray(categorias) ? categorias : []);
    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error);
      // Asegurar que los estados sean arrays/objetos válidos incluso en caso de error
      setTicketsPorMes([]);
      setPromedioValoraciones(0);
      setCumplimientoSLA({ respuesta: 0, resolucion: 0 });
      setRankingTecnicos([]);
      setCategoriasIncumplimientos([]);
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.rol_id !== 1) {
    return null;
  }

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
        Dashboard Administrativo
      </Typography>

      {/* Cards de resumen */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                    {promedioValoraciones.toFixed(1)}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    Promedio Valoraciones
                  </Typography>
                </Box>
                <StarIcon sx={{ fontSize: 48, color: 'rgba(255,255,255,0.8)' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                    {cumplimientoSLA.respuesta}%
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    SLA Respuesta
                  </Typography>
                </Box>
                <CheckCircleIcon sx={{ fontSize: 48, color: 'rgba(255,255,255,0.8)' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                    {cumplimientoSLA.resolucion}%
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    SLA Resolución
                  </Typography>
                </Box>
                <TrendingUpIcon sx={{ fontSize: 48, color: 'rgba(255,255,255,0.8)' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                    {Array.isArray(ticketsPorMes) ? ticketsPorMes.reduce((sum, item) => sum + parseInt(item.total || 0), 0) : 0}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    Total Tickets
                  </Typography>
                </Box>
                <AssessmentIcon sx={{ fontSize: 48, color: 'rgba(255,255,255,0.8)' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Gráficos principales */}
      <Grid container spacing={3}>
        {/* Tickets por mes */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <AssessmentIcon color="primary" />
              Tickets Creados por Mes
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={Array.isArray(ticketsPorMes) ? ticketsPorMes : []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" fill="#2196f3" name="Tickets" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Ranking de técnicos */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrophyIcon color="primary" />
              Ranking de Técnicos
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Técnico</TableCell>
                    <TableCell align="right">⭐</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(Array.isArray(rankingTecnicos) ? rankingTecnicos : []).slice(0, 5).map((tecnico, index) => (
                    <TableRow key={tecnico.tecnico_id}>
                      <TableCell>
                        <Chip
                          label={index + 1}
                          size="small"
                          color={index === 0 ? 'warning' : index === 1 ? 'default' : 'default'}
                          sx={{
                            fontWeight: 'bold',
                            background: index === 0 ? 'linear-gradient(135deg, #FFD700, #FFA500)' : 
                                       index === 1 ? 'linear-gradient(135deg, #C0C0C0, #A9A9A9)' :
                                       index === 2 ? 'linear-gradient(135deg, #CD7F32, #8B4513)' : 'default'
                          }}
                        />
                      </TableCell>
                      <TableCell>{tecnico.tecnico_nombre}</TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="bold" color="primary">
                          {parseFloat(tecnico.promedio).toFixed(1)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Cumplimiento SLA */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircleIcon color="primary" />
              Cumplimiento SLA
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Cumple Respuesta', value: cumplimientoSLA?.respuesta || 0 },
                    { name: 'No Cumple Respuesta', value: 100 - (cumplimientoSLA?.respuesta || 0) }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {[0, 1].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Categorías con más incumplimientos */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <WarningIcon color="error" />
              Categorías con Más Incumplimientos
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={(Array.isArray(categoriasIncumplimientos) ? categoriasIncumplimientos : []).slice(0, 5)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="categoria_nombre" type="category" width={100} />
                <Tooltip />
                <Legend />
                <Bar dataKey="incumplimientos" fill="#f44336" name="Incumplimientos" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
