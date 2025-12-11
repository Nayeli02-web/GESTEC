import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import TicketService from '../../services/TicketService';
import UpdateStatusDialog from '../Ticket/UpdateStatusDialog';
import { useAuth } from '../Auth/AuthContext';
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
import Snackbar from '@mui/material/Snackbar';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import PersonIcon from '@mui/icons-material/Person';

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
import TodayIcon from '@mui/icons-material/Today';

export default function AsignacionesTecnico() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [vistaOrganizacion, setVistaOrganizacion] = useState('estado'); // 'estado', 'dia', 'semana', 'tecnico'
  const [semanaSeleccionada, setSemanaSeleccionada] = useState('todas');
  const [tecnicoSeleccionado, setTecnicoSeleccionado] = useState('todos');
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Mapear rol_id a nombre de rol
  const getRoleName = (rol_id) => {
    switch (rol_id) {
      case 1: return 'Administrador';
      case 2: return 'Cliente';
      case 3: return 'Tecnico';
      default: return 'Cliente';
    }
  };

  useEffect(() => {
    if (user) {
      cargarTickets();
      // Si es admin, cargar lista de técnicos
      if (user.rol_id === 1) {
        cargarTecnicos();
      }
    }
  }, [user]);

  const cargarTecnicos = async () => {
    try {
      const TecnicoService = (await import('../../services/TecnicoService')).default;
      const data = await TecnicoService.getAll();
      setTecnicos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar técnicos:', err);
    }
  };

  const cargarTickets = () => {
    if (!user) return;
    
    setLoading(true);
    const rol = getRoleName(user.rol_id);
    const userId = user.usuario_id || user.id;
    
    TicketService.getAll(userId, rol)
      .then((res) => {
        setTickets(Array.isArray(res) ? res : []);
      })
      .catch((err) => {
        console.error('Error al cargar tickets:', err);
        setError(err);
      })
      .finally(() => setLoading(false));
  };

  const handleUpdateStatus = async (data) => {
    try {
      await TicketService.updateEstado(selectedTicket.id, data);
      setSuccessMessage(t('ticket.updateSuccess') || 'Estado del ticket actualizado exitosamente');
      // Recargar tickets para ver los cambios
      cargarTickets();
      setOpenUpdateDialog(false);
      setSelectedTicket(null);
    } catch (err) {
      console.error('Error al actualizar estado:', err);
      throw err;
    }
  };

  const handleOpenUpdateDialog = (ticket) => {
    setSelectedTicket(ticket);
    setOpenUpdateDialog(true);
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
      case 'pendiente': return t('ticket.pending');
      case 'asignado': return t('ticket.assigned');
      case 'en_proceso': return t('ticket.inProgress');
      case 'resuelto': return t('ticket.resolved');
      case 'cerrado': return t('ticket.closed');
      default: return estado;
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

  // Calcular tiempo restante de SLA desde los datos reales del ticket
  const calcularTiempoRestanteSLA = (ticket) => {
    if (!ticket.sla_info) {
      return { porcentaje: 0, color: 'default', texto: 'N/A' };
    }

    const { porcentaje, color, texto } = ticket.sla_info;
    return { porcentaje, color, texto };
  };

  // Generar opciones de semanas 
  const generarOpcionesSemanas = () => {
    const semanas = [{ value: 'todas', label: t('assignment.allWeeks') }];
    const hoy = new Date();
    
    for (let i = 0; i < 5; i++) {
      const inicioSemana = new Date(hoy);
      inicioSemana.setDate(hoy.getDate() - (hoy.getDay() || 7) + 1 - (i * 7));
      const finSemana = new Date(inicioSemana);
      finSemana.setDate(inicioSemana.getDate() + 6);
      
      const label = i === 0 
        ? t('assignment.currentWeek') 
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

  // Filtrar tickets por técnico (solo para admin)
  const filtrarPorTecnico = (ticketsList) => {
    if (tecnicoSeleccionado === 'todos') return ticketsList;
    return ticketsList.filter(t => t.tecnico_id === parseInt(tecnicoSeleccionado));
  };

  // Agrupar tickets por día
  const agruparPorDia = (ticketsList) => {
    const grupos = {};
    ticketsList.forEach(ticket => {
      const fecha = new Date(ticket.fecha_creacion);
      const key = fecha.toISOString().split('T')[0]; // YYYY-MM-DD
      if (!grupos[key]) {
        grupos[key] = [];
      }
      grupos[key].push(ticket);
    });
    return grupos;
  };

  // Agrupar tickets por semana
  const agruparPorSemana = (ticketsList) => {
    const grupos = {};
    ticketsList.forEach(ticket => {
      const fecha = new Date(ticket.fecha_creacion);
      const inicioSemana = new Date(fecha);
      inicioSemana.setDate(fecha.getDate() - (fecha.getDay() || 7) + 1);
      const key = inicioSemana.toISOString().split('T')[0];
      if (!grupos[key]) {
        grupos[key] = [];
      }
      grupos[key].push(ticket);
    });
    return grupos;
  };

  // Agrupar tickets por técnico
  const agruparPorTecnico = (ticketsList) => {
    const grupos = {};
    ticketsList.forEach(ticket => {
      const key = ticket.tecnico_id || 'sin_asignar';
      if (!grupos[key]) {
        grupos[key] = {
          nombre: ticket.tecnico_nombre || 'Sin asignar',
          tickets: []
        };
      }
      grupos[key].tickets.push(ticket);
    });
    return grupos;
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

  // Aplicar filtros
  let ticketsFiltrados = ticketsPorEstadoFiltrados;
  ticketsFiltrados = filtrarPorSemana(ticketsFiltrados);
  if (user?.rol_id === 1) { // Solo admin puede filtrar por técnico
    ticketsFiltrados = filtrarPorTecnico(ticketsFiltrados);
  }

  // Organizar según vista seleccionada
  let ticketsOrganizados = {};
  if (vistaOrganizacion === 'dia') {
    ticketsOrganizados = agruparPorDia(ticketsFiltrados);
  } else if (vistaOrganizacion === 'semana') {
    ticketsOrganizados = agruparPorSemana(ticketsFiltrados);
  } else if (vistaOrganizacion === 'tecnico') {
    ticketsOrganizados = agruparPorTecnico(ticketsFiltrados);
  }

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
              {ticket.categoria || t('ticket.noCategory')}
            </Typography>
          </Box>

          <Divider sx={{ my: 1 }} />

          {/* Prioridad */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <WarningIcon sx={{ fontSize: 18, color: getPrioridadColor(ticket.prioridad) }} />
            <Typography variant="body2">
              {t('ticket.priority')}: <strong style={{ color: getPrioridadColor(ticket.prioridad) }}>
                {getPrioridadLabel(ticket.prioridad).toUpperCase()}
              </strong>
            </Typography>
          </Box>

          {/* Tiempo restante SLA */}
          <Box sx={{ mb: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <AccessTimeIcon sx={{ fontSize: 14 }} />
                {t('assignment.remainingTime')}
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
            {t('common.viewDetail')}
          </Button>
          <Button 
            size="small" 
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => handleOpenUpdateDialog(ticket)}
            disabled={ticket.estado?.toLowerCase() === 'cerrado'}
          >
            {t('assignment.changeState')}
          </Button>
        </CardActions>
      </Card>
    );
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 3, mb: 4 }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }} elevation={3}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <AssignmentIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            <Box>
              <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 0 }}>
                {user?.rol_id === 1 ? t('assignment.allAssignments') : t('assignment.myAssignments')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('assignment.viewDescription')}
              </Typography>
            </Box>
          </Box>
          
          {/* Selector de Semana */}
          <FormControl sx={{ minWidth: 220 }} size="small">
            <InputLabel id="semana-select-label">{t('assignment.filterByWeek')}</InputLabel>
            <Select
              labelId="semana-select-label"
              id="semana-select"
              value={semanaSeleccionada}
              label={t('assignment.filterByWeek')}
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

        {/* Controles adicionales */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Toggle de vista de organización */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {t('assignment.organizeBy')}:
            </Typography>
            <ToggleButtonGroup
              value={vistaOrganizacion}
              exclusive
              onChange={(e, newValue) => newValue && setVistaOrganizacion(newValue)}
              size="small"
            >
              <ToggleButton value="estado">
                {t('assignment.byState')}
              </ToggleButton>
              <ToggleButton value="dia">
                <TodayIcon sx={{ mr: 0.5, fontSize: 18 }} />
                {t('assignment.byDay')}
              </ToggleButton>
              <ToggleButton value="semana">
                <ViewWeekIcon sx={{ mr: 0.5, fontSize: 18 }} />
                {t('assignment.byWeek')}
              </ToggleButton>
              {user?.rol_id === 1 && (
                <ToggleButton value="tecnico">
                  <PersonIcon sx={{ mr: 0.5, fontSize: 18 }} />
                  {t('assignment.byTechnician')}
                </ToggleButton>
              )}
            </ToggleButtonGroup>
          </Box>

          {/* Filtro por técnico (solo para admin) */}
          {user?.rol_id === 1 && vistaOrganizacion !== 'tecnico' && (
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel id="tecnico-select-label">{t('assignment.filterByTechnician')}</InputLabel>
              <Select
                labelId="tecnico-select-label"
                value={tecnicoSeleccionado}
                label={t('assignment.filterByTechnician')}
                onChange={(e) => setTecnicoSeleccionado(e.target.value)}
              >
                <MenuItem value="todos">{t('assignment.allTechnicians')}</MenuItem>
                {tecnicos.map((tec) => (
                  <MenuItem key={tec.id} value={tec.id}>
                    {tec.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Box>
      </Paper>

      {/* Tabs de filtrado - solo visible en vista por estado */}
      {vistaOrganizacion === 'estado' && (
        <Paper sx={{ mb: 3 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            variant="fullWidth"
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab label={t('assignment.pending').toUpperCase()} />
            <Tab label={t('assignment.inProgress').toUpperCase()} />
            <Tab label={t('assignment.resolved').toUpperCase()} />
          </Tabs>
        </Paper>
      )}

      {/* Contenido */}
      {loading ? (
        <Box display="flex" justifyContent="center" p={5}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{t('assignment.loadingError')}</Alert>
      ) : ticketsFiltrados.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <AssignmentIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            {t('assignment.noTickets')}
          </Typography>
        </Paper>
      ) : (
        <>
          {/* Resumen */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {t('assignment.showing')} {ticketsFiltrados.length} ticket{ticketsFiltrados.length !== 1 ? 's' : ''}
            </Typography>
          </Box>

          {/* Vista según organización seleccionada */}
          {vistaOrganizacion === 'estado' ? (
            // Vista por estado (grid simple)
            <Grid container spacing={3}>
              {ticketsFiltrados.map((ticket) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={ticket.id}>
                  <TicketCard ticket={ticket} />
                </Grid>
              ))}
            </Grid>
          ) : vistaOrganizacion === 'dia' ? (
            // Vista por día
            <Box>
              {Object.keys(ticketsOrganizados).sort().reverse().map((dia) => (
                <Box key={dia} sx={{ mb: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <CalendarMonthIcon color="primary" />
                    <Typography variant="h6">
                      {new Date(dia).toLocaleDateString('es-ES', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </Typography>
                    <Chip label={`${ticketsOrganizados[dia].length} ticket(s)`} size="small" />
                  </Box>
                  <Grid container spacing={3}>
                    {ticketsOrganizados[dia].map((ticket) => (
                      <Grid item xs={12} sm={6} md={4} lg={3} key={ticket.id}>
                        <TicketCard ticket={ticket} />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              ))}
            </Box>
          ) : vistaOrganizacion === 'semana' ? (
            // Vista por semana
            <Box>
              {Object.keys(ticketsOrganizados).sort().reverse().map((semana) => {
                const fechaInicio = new Date(semana);
                const fechaFin = new Date(fechaInicio);
                fechaFin.setDate(fechaFin.getDate() + 6);
                return (
                  <Box key={semana} sx={{ mb: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <ViewWeekIcon color="primary" />
                      <Typography variant="h6">
                        Semana del {fechaInicio.toLocaleDateString('es-ES')} al {fechaFin.toLocaleDateString('es-ES')}
                      </Typography>
                      <Chip label={`${ticketsOrganizados[semana].length} ticket(s)`} size="small" />
                    </Box>
                    <Grid container spacing={3}>
                      {ticketsOrganizados[semana].map((ticket) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={ticket.id}>
                          <TicketCard ticket={ticket} />
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                );
              })}
            </Box>
          ) : (
            // Vista por técnico
            <Box>
              {Object.entries(ticketsOrganizados).map(([tecnicoId, data]) => (
                <Box key={tecnicoId} sx={{ mb: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <PersonIcon color="primary" />
                    <Typography variant="h6">
                      {data.nombre}
                    </Typography>
                    <Chip label={`${data.tickets.length} ticket(s)`} size="small" />
                  </Box>
                  <Grid container spacing={3}>
                    {data.tickets.map((ticket) => (
                      <Grid item xs={12} sm={6} md={4} lg={3} key={ticket.id}>
                        <TicketCard ticket={ticket} />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              ))}
            </Box>
          )}
        </>
      )}

      {/* Leyenda */}
      <Paper sx={{ p: 2, mt: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          {t('assignment.priorityLegend')}:
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Chip label={t('ticket.high')} size="small" sx={{ bgcolor: '#d32f2f', color: 'white' }} />
          <Chip label={t('ticket.medium')} size="small" sx={{ bgcolor: '#f57c00', color: 'white' }} />
          <Chip label={t('ticket.low')} size="small" sx={{ bgcolor: '#388e3c', color: 'white' }} />
        </Box>
      </Paper>

      {/* Diálogo de actualización de estado */}
      <UpdateStatusDialog
        open={openUpdateDialog}
        onClose={() => {
          setOpenUpdateDialog(false);
          setSelectedTicket(null);
        }}
        ticket={selectedTicket}
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
    </Container>
  );
}
