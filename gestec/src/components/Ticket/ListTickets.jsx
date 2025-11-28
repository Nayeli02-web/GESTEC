import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import TicketService from '../../services/TicketService';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import AddIcon from '@mui/icons-material/Add';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { useTranslation } from 'react-i18next';

export default function ListTickets() {
  const { t } = useTranslation();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Variables de usuario y rol (NO editables en UI, solo en desarrollo)
  const [usuarioId] = useState(1); // ID fijo del usuario logueado
  const [rol, setRol] = useState('Administrador'); // Rol del usuario

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    // El rol ya viene sin acentos desde el selector
    TicketService.getAll(usuarioId, rol)
      .then((res) => {
        const list = Array.isArray(res) ? res : (res?.data || res || []);
        if (mounted) setData(list);
      })
      .catch((err) => {
        console.error('Error al cargar tickets:', err);
        setError(err);
      })
      .finally(() => setLoading(false));
    return () => (mounted = false);
  }, [usuarioId, rol]);

  const getPrioridadColor = (prioridad) => {
    switch (prioridad?.toLowerCase()) {
      case 'alta': return 'error';
      case 'media': return 'warning';
      case 'baja': return 'success';
      default: return 'default';
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

  const getEstadoLabel = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'resuelto': return t('ticket.resolved');
      case 'cerrado': return t('ticket.closed');
      case 'en_proceso': return t('ticket.inProgress');
      case 'asignado': return t('ticket.assigned');
      case 'pendiente': return t('ticket.pending');
      default: return estado;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 3 }}>
      <Paper sx={{ p: 2 }} elevation={2}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h2">
            {t('ticket.list')}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              component={RouterLink}
              to="/ticket/crear"
            >
              {t('ticket.new')}
            </Button>
            
            {/* Selector de Rol (solo para desarrollo/pruebas) */}
            <TextField
              label={t('ticket.userId')}
              value={usuarioId}
              size="small"
              disabled
              sx={{ width: 120 }}
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>{t('ticket.role')}</InputLabel>
              <Select
                value={rol}
                label={t('ticket.role')}
                onChange={(e) => setRol(e.target.value)}
              >
                <MenuItem value="Administrador">{t('ticket.administrator')}</MenuItem>
                <MenuItem value="Cliente">{t('ticket.client')}</MenuItem>
                <MenuItem value="Tecnico">{t('ticket.technicianRole')}</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t('ticket.showingFor')}: <strong>{rol === 'Tecnico' ? t('ticket.technicianRole') : rol === 'Administrador' ? t('ticket.administrator') : t('ticket.client')}</strong> (ID: {usuarioId})
        </Typography>

        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error">{t('ticket.loadingError')}</Typography>
        ) : data.length === 0 ? (
          <Typography color="text.secondary">{t('ticket.loadingError')}</Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>{t('ticket.ticketTitle')}</strong></TableCell>
                  <TableCell><strong>{t('ticket.category')}</strong></TableCell>
                  <TableCell><strong>{t('ticket.priority')}</strong></TableCell>
                  <TableCell><strong>{t('ticket.state')}</strong></TableCell>
                  <TableCell><strong>{t('common.actions')}</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((ticket) => (
                  <TableRow key={ticket.id} hover>
                    <TableCell>{ticket.titulo}</TableCell>
                    <TableCell>{ticket.categoria || t('ticket.noCategory')}</TableCell>
                    <TableCell>
                      <Chip 
                        label={getPrioridadLabel(ticket.prioridad)} 
                        color={getPrioridadColor(ticket.prioridad)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={getEstadoLabel(ticket.estado)} 
                        color={getEstadoColor(ticket.estado)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        component={RouterLink}
                        to={`/ticket/${ticket.id}`}
                        state={{ from: '/tickets' }}
                        variant="outlined"
                        size="small"
                      >
                        {t('common.viewDetail')}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Container>
  );
}
