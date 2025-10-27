import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TicketService from '../../services/TicketService';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import IconButton from '@mui/material/IconButton';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

// Icons
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import CommentIcon from '@mui/icons-material/Comment';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BugReportIcon from '@mui/icons-material/BugReport';
import ComputerIcon from '@mui/icons-material/Computer';
import NetworkCheckIcon from '@mui/icons-material/NetworkCheck';
import SecurityIcon from '@mui/icons-material/Security';
import BuildIcon from '@mui/icons-material/Build';
import CategoryIcon from '@mui/icons-material/Category';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import WarningIcon from '@mui/icons-material/Warning';

export default function AsignacionesTecnico() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [semanaSeleccionada, setSemanaSeleccionada] = useState('todas');
  
  // TODO: En producción, obtener del contexto de autenticación
  const usuarioId = 1;
  const rolUsuario = 'Administrador'; // Cambiado temporalmente a Administrador para ver todos los tickets

  useEffect(() => {
    cargarTickets();
  }, []);

  const cargarTickets = () => {
    setLoading(true);
    TicketService.getAll(usuarioId, rolUsuario)
      .then((res) => {
        setTickets(Array.isArray(res) ? res : []);
      })
      .catch((err) => {
        console.error('Error al cargar tickets:', err);
        setError(err);
      })
      .finally(() => setLoading(false));
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const getCategoriaIcon = (categoria) => {
    const categoriaLower = categoria?.toLowerCase() || '';
    if (categoriaLower.includes('software')) return <BugReportIcon />;
    if (categoriaLower.includes('hardware')) return <ComputerIcon />;
    if (categoriaLower.includes('red')) return <NetworkCheckIcon />;
    if (categoriaLower.includes('seguridad')) return <SecurityIcon />;
    if (categoriaLower.includes('mantenimiento')) return <BuildIcon />;
    return <CategoryIcon />;
  };

  const getPrioridadColor = (prioridad) => {
    switch (prioridad?.toLowerCase()) {
      case 'alta': return '#d32f2f';
      case 'media': return '#f57c00';
      case 'baja': return '#388e3c';
      default: return '#757575';
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'pendiente': return 'error';
      case 'asignado': return 'warning';
      case 'en_proceso': return 'info';
      case 'resuelto': return 'success';
      case 'cerrado': return 'default';
      default: return 'default';
    }
  };

  const getEstadoLabel = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'pendiente': return 'Pendiente';
      case 'asignado': return 'Asignado';
      case 'en_proceso': return 'En Proceso';
      case 'resuelto': return 'Resuelto';
      case 'cerrado': return 'Cerrado';
      default: return estado;
    }
  };

  // Calcular tiempo restante de SLA 
  const calcularTiempoRestanteSLA = (ticket) => {

    // calcular basándose en fecha_creacion y SLA
    const random = Math.random();
    if (random > 0.7) return { porcentaje: 85, color: 'error', texto: '15 min' };
    if (random > 0.4) return { porcentaje: 50, color: 'warning', texto: '2 hrs' };
    return { porcentaje: 20, color: 'success', texto: '6 hrs' };
  };

  // Generar opciones de semanas 
  const generarOpcionesSemanas = () => {
    const semanas = [{ value: 'todas', label: 'Todas las semanas' }];
    const hoy = new Date();
    
    for (let i = 0; i < 5; i++) {
      const inicioSemana = new Date(hoy);
      inicioSemana.setDate(hoy.getDate() - (hoy.getDay() || 7) + 1 - (i * 7));
      const finSemana = new Date(inicioSemana);
      finSemana.setDate(inicioSemana.getDate() + 6);
      
      const label = i === 0 
        ? 'Semana actual' 
        : `${inicioSemana.getDate()}/${inicioSemana.getMonth() + 1} - ${finSemana.getDate()}/${finSemana.getMonth() + 1}`;
      
      semanas.push({
        value: i.toString(),
        label,
        inicio: inicioSemana,
        fin: finSemana
      });
    }
    
    return semanas;
  };

  const opcionesSemanas = generarOpcionesSemanas();

  // Filtrar tickets por semana
  const filtrarPorSemana = (ticketsList) => {
    if (semanaSeleccionada === 'todas') return ticketsList;
    
    const semana = opcionesSemanas.find(s => s.value === semanaSeleccionada);
    if (!semana || !semana.inicio) return ticketsList;
    
    return ticketsList.filter(ticket => {
      const fechaTicket = new Date(ticket.fecha_creacion);
      return fechaTicket >= semana.inicio && fechaTicket <= semana.fin;
    });
  };

  // Filtrar tickets por estado
  const ticketsPorEstado = {
    pendientes: tickets.filter(t => t.estado === 'pendiente' || t.estado === 'asignado'),
    enProceso: tickets.filter(t => t.estado === 'en_proceso'),
    resueltos: tickets.filter(t => t.estado === 'resuelto' || t.estado === 'cerrado'),
  };

  const ticketsPorEstadoFiltrados = tabValue === 0 
    ? ticketsPorEstado.pendientes 
    : tabValue === 1 
    ? ticketsPorEstado.enProceso 
    : ticketsPorEstado.resueltos;

  const ticketsFiltrados = filtrarPorSemana(ticketsPorEstadoFiltrados);

  const TicketCard = ({ ticket }) => {
    const sla = calcularTiempoRestanteSLA(ticket);
    
    return (
      <Card 
        elevation={3} 
        sx={{ 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderLeft: `4px solid ${getPrioridadColor(ticket.prioridad)}`,
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 6,
          }
        }}
      >
        <CardContent sx={{ flexGrow: 1 }}>
          {/* Header del ticket */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
              TICKET #{ticket.id}
            </Typography>
            <Chip 
              label={getEstadoLabel(ticket.estado)} 
              color={getEstadoColor(ticket.estado)} 
              size="small"
            />
          </Box>

          {/* Título del ticket */}
          <Typography variant="h6" component="div" sx={{ mb: 1, fontSize: '1rem', fontWeight: 600 }}>
            {ticket.titulo}
          </Typography>

          {/* Categoría con icono */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
            {getCategoriaIcon(ticket.categoria)}
            <Typography variant="body2" color="text.secondary">
              {ticket.categoria || 'Sin categoría'}
            </Typography>
          </Box>

          <Divider sx={{ my: 1 }} />

          {/* Prioridad */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <WarningIcon sx={{ fontSize: 18, color: getPrioridadColor(ticket.prioridad) }} />
            <Typography variant="body2">
              Prioridad: <strong style={{ color: getPrioridadColor(ticket.prioridad) }}>
                {ticket.prioridad?.toUpperCase()}
              </strong>
            </Typography>
          </Box>

          {/* Tiempo restante SLA */}
          <Box sx={{ mb: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <AccessTimeIcon sx={{ fontSize: 14 }} />
                Tiempo restante SLA
              </Typography>
              <Typography variant="caption" fontWeight="bold" color={`${sla.color}.main`}>
                {sla.texto}
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={sla.porcentaje} 
              color={sla.color}
              sx={{ height: 6, borderRadius: 3 }}
            />
          </Box>
        </CardContent>

        {/* Acciones */}
        <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
          <Button 
            size="small" 
            variant="contained" 
            startIcon={<VisibilityIcon />}
            onClick={() => navigate(`/ticket/${ticket.id}`, { state: { from: '/asignaciones' } })}
          >
            Ver Detalle
          </Button>
          <Box>
            <IconButton 
              size="small" 
              color="primary" 
              title="Cambiar estado"
              disabled
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton 
              size="small" 
              color="primary" 
              title="Agregar comentario"
              disabled
            >
              <CommentIcon fontSize="small" />
            </IconButton>
          </Box>
        </CardActions>
      </Card>
    );
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 3, mb: 4 }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }} elevation={3}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <AssignmentIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            <Box>
              <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 0 }}>
                Mis Asignaciones
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Vista de tickets asignados organizados por estado y semana
              </Typography>
            </Box>
          </Box>
          
          {/* Selector de Semana */}
          <FormControl sx={{ minWidth: 220 }} size="small">
            <InputLabel id="semana-select-label">Filtrar por semana</InputLabel>
            <Select
              labelId="semana-select-label"
              id="semana-select"
              value={semanaSeleccionada}
              label="Filtrar por semana"
              onChange={(e) => setSemanaSeleccionada(e.target.value)}
            >
              {opcionesSemanas.map((semana) => (
                <MenuItem key={semana.value} value={semana.value}>
                  {semana.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Tabs de filtrado */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="PENDIENTES" />
          <Tab label="EN PROCESO" />
          <Tab label="RESUELTOS" />
        </Tabs>
      </Paper>

      {/* Contenido */}
      {loading ? (
        <Box display="flex" justifyContent="center" p={5}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">Error al cargar las asignaciones</Alert>
      ) : ticketsFiltrados.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <AssignmentIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No hay tickets en esta categoría
          </Typography>
        </Paper>
      ) : (
        <>
          {/* Resumen */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Mostrando {ticketsFiltrados.length} ticket{ticketsFiltrados.length !== 1 ? 's' : ''}
            </Typography>
          </Box>

          {/* Grid de tarjetas */}
          <Grid container spacing={3}>
            {ticketsFiltrados.map((ticket) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={ticket.id}>
                <TicketCard ticket={ticket} />
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {/* Leyenda */}
      <Paper sx={{ p: 2, mt: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Leyenda de Prioridades:
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Chip label="Alta" size="small" sx={{ bgcolor: '#d32f2f', color: 'white' }} />
          <Chip label="Media" size="small" sx={{ bgcolor: '#f57c00', color: 'white' }} />
          <Chip label="Baja" size="small" sx={{ bgcolor: '#388e3c', color: 'white' }} />
        </Box>
      </Paper>
    </Container>
  );
}
