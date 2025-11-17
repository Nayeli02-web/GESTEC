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

export default function ListTickets() {
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
    <Container maxWidth="lg" sx={{ mt: 3 }}>
      <Paper sx={{ p: 2 }} elevation={2}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h2">
            Tickets
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              component={RouterLink}
              to="/ticket/crear"
            >
              Crear Ticket
            </Button>
            
            {/* Selector de Rol (solo para desarrollo/pruebas) */}
            <TextField
              label="Usuario ID"
              value={usuarioId}
              size="small"
              disabled
              sx={{ width: 120 }}
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Rol</InputLabel>
              <Select
                value={rol}
                label="Rol"
                onChange={(e) => setRol(e.target.value)}
              >
                <MenuItem value="Administrador">Administrador</MenuItem>
                <MenuItem value="Cliente">Cliente</MenuItem>
                <MenuItem value="Tecnico">Técnico</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Mostrando tickets para: <strong>{rol === 'Tecnico' ? 'Técnico' : rol}</strong> (ID: {usuarioId})
        </Typography>

        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error">Error al cargar tickets</Typography>
        ) : data.length === 0 ? (
          <Typography color="text.secondary">No hay tickets registrados</Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Título</strong></TableCell>
                  <TableCell><strong>Categoría</strong></TableCell>
                  <TableCell><strong>Prioridad</strong></TableCell>
                  <TableCell><strong>Estado</strong></TableCell>
                  <TableCell><strong>Acciones</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((ticket) => (
                  <TableRow key={ticket.id} hover>
                    <TableCell>{ticket.titulo}</TableCell>
                    <TableCell>{ticket.categoria || 'Sin categoría'}</TableCell>
                    <TableCell>
                      <Chip 
                        label={ticket.prioridad} 
                        color={getPrioridadColor(ticket.prioridad)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={ticket.estado} 
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
                        Ver Detalle
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
