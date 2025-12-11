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
import Button from '@mui/material/Button';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../Auth/AuthContext';

export default function ListTickets() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    if (!user) return;
    
    let mounted = true;
    setLoading(true);
    const rol = getRoleName(user.rol_id);
    
    TicketService.getAll(user.usuario_id || user.id, rol)
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
  }, [user]);

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
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            component={RouterLink}
            to="/ticket/crear"
          >
            {t('ticket.new')}
          </Button>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {user?.rol_id === 1 && 'Mostrando todos los tickets (Administrador)'}
          {user?.rol_id === 2 && 'Mostrando tus tickets (Cliente)'}
          {user?.rol_id === 3 && 'Mostrando tickets asignados a ti (Técnico)'}
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
