import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  Divider,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  IconButton,
  Tooltip,
  Badge,
} from "@mui/material";
import {
  AssignmentInd as AssignIcon,
  Person as PersonIcon,
  FilterList as FilterIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Timer as TimerIcon,
  WorkOutline as WorkIcon,
  Star as StarIcon,
  Close as CloseIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import AutoTriageService from "../../services/AutoTriageService";
import { useTranslation } from "react-i18next";

export default function AsignacionManual() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [ticketsPendientes, setTicketsPendientes] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [tecnicosDisponibles, setTecnicosDisponibles] = useState([]);
  const [selectedTecnico, setSelectedTecnico] = useState("");
  const [justificacion, setJustificacion] = useState("");
  const [asignando, setAsignando] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [filtroEspecialidad, setFiltroEspecialidad] = useState("");
  const [filtroPrioridad, setFiltroPrioridad] = useState("");

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [ticketsResponse, tecnicosResponse] = await Promise.all([
        AutoTriageService.listarTicketsPendientes(),
        AutoTriageService.listarTecnicosConCarga(),
      ]);

      if (ticketsResponse.response) {
        setTicketsPendientes(ticketsResponse.result.tickets || []);
      }

      if (tecnicosResponse.response) {
        setTecnicos(tecnicosResponse.result.tecnicos || []);
      }
    } catch (error) {
      console.error("Error al cargar datos:", error);
      setMensaje({
        tipo: "error",
        texto: "Error al cargar la información",
      });
    } finally {
      setLoading(false);
    }
  };

  const abrirDialogoAsignacion = async (ticket) => {
    try {
      setLoading(true);
      const response = await AutoTriageService.obtenerInfoAsignacionManual(ticket.id);

      if (response.response && response.result.success) {
        setSelectedTicket(response.result.ticket);
        setTecnicosDisponibles(response.result.tecnicos_disponibles || []);
        setOpenDialog(true);
        setSelectedTecnico("");
        setJustificacion("");
        setMensaje(null);
      } else {
        setMensaje({
          tipo: "error",
          texto: response.result.message || "Error al obtener información del ticket",
        });
      }
    } catch (error) {
      console.error("Error al abrir diálogo:", error);
      setMensaje({
        tipo: "error",
        texto: "Error al obtener información del ticket",
      });
    } finally {
      setLoading(false);
    }
  };

  const cerrarDialogo = () => {
    setOpenDialog(false);
    setSelectedTicket(null);
    setTecnicosDisponibles([]);
    setSelectedTecnico("");
    setJustificacion("");
    setMensaje(null);
  };

  const asignarTicket = async () => {
    if (!selectedTecnico) {
      setMensaje({
        tipo: "warning",
        texto: "Debe seleccionar un técnico",
      });
      return;
    }

    if (!justificacion || justificacion.trim().length < 10) {
      setMensaje({
        tipo: "warning",
        texto: "La justificación debe tener al menos 10 caracteres",
      });
      return;
    }

    try {
      setAsignando(true);
      const response = await AutoTriageService.asignarManualmente(
        selectedTicket.id,
        selectedTecnico,
        justificacion
      );

      if (response.response) {
        setMensaje({
          tipo: "success",
          texto: `Ticket asignado exitosamente a ${response.result.tecnico_nombre}`,
        });
        cerrarDialogo();
        cargarDatos(); // Recargar la lista
      } else {
        setMensaje({
          tipo: "error",
          texto: response.message || "Error al asignar el ticket",
        });
      }
    } catch (error) {
      console.error("Error al asignar:", error);
      setMensaje({
        tipo: "error",
        texto: "Error al asignar el ticket",
      });
    } finally {
      setAsignando(false);
    }
  };

  const getPrioridadColor = (prioridad) => {
    switch (prioridad?.toLowerCase()) {
      case "alta":
        return "error";
      case "media":
        return "warning";
      case "baja":
        return "info";
      default:
        return "default";
    }
  };

  const getSLAStatus = (tiempoRestante) => {
    if (tiempoRestante < 60) return { color: "error", icon: <ErrorIcon />, text: "CRÍTICO" };
    if (tiempoRestante < 240) return { color: "warning", icon: <WarningIcon />, text: "URGENTE" };
    return { color: "success", icon: <CheckIcon />, text: "NORMAL" };
  };

  const ticketsFiltrados = ticketsPendientes.filter((ticket) => {
    if (filtroPrioridad && ticket.prioridad !== filtroPrioridad) return false;
    if (filtroEspecialidad && ticket.categoria_nombre !== filtroEspecialidad) return false;
    return true;
  });

  const especialidadesUnicas = [...new Set(ticketsPendientes.map((t) => t.categoria_nombre))];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Asignación Manual de Tickets
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Asigne tickets pendientes a técnicos específicos con validaciones de especialidad y carga
        de trabajo.
      </Typography>

      {/* Mensaje global */}
      {mensaje && (
        <Alert
          severity={mensaje.tipo}
          onClose={() => setMensaje(null)}
          sx={{ mb: 3 }}
        >
          {mensaje.texto}
        </Alert>
      )}

      {/* Estadísticas generales */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Tickets Pendientes
              </Typography>
              <Typography variant="h3" fontWeight="bold" color="primary">
                {ticketsPendientes.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Técnicos Activos
              </Typography>
              <Typography variant="h3" fontWeight="bold" color="success.main">
                {tecnicos.filter((t) => t.activo === "1").length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Carga Promedio
              </Typography>
              <Typography variant="h3" fontWeight="bold" color="info.main">
                {tecnicos.length > 0
                  ? (
                      tecnicos.reduce((sum, t) => sum + parseInt(t.carga_trabajo || 0), 0) /
                      tecnicos.length
                    ).toFixed(1)
                  : 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filtros */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <FilterIcon color="action" />
            </Grid>
            <Grid item xs>
              <Typography variant="subtitle1" fontWeight="bold">
                Filtros
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Prioridad</InputLabel>
                <Select
                  value={filtroPrioridad}
                  label="Prioridad"
                  onChange={(e) => setFiltroPrioridad(e.target.value)}
                >
                  <MenuItem value="">Todas</MenuItem>
                  <MenuItem value="alta">Alta</MenuItem>
                  <MenuItem value="media">Media</MenuItem>
                  <MenuItem value="baja">Baja</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Categoría</InputLabel>
                <Select
                  value={filtroEspecialidad}
                  label="Categoría"
                  onChange={(e) => setFiltroEspecialidad(e.target.value)}
                >
                  <MenuItem value="">Todas</MenuItem>
                  {especialidadesUnicas.map((esp) => (
                    <MenuItem key={esp} value={esp}>
                      {esp}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabla de tickets pendientes */}
      {loading && ticketsPendientes.length === 0 ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : ticketsFiltrados.length === 0 ? (
        <Alert severity="info">No hay tickets pendientes que mostrar</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "primary.light" }}>
                <TableCell>
                  <strong>ID</strong>
                </TableCell>
                <TableCell>
                  <strong>Título</strong>
                </TableCell>
                <TableCell>
                  <strong>Cliente</strong>
                </TableCell>
                <TableCell>
                  <strong>Categoría</strong>
                </TableCell>
                <TableCell>
                  <strong>Prioridad</strong>
                </TableCell>
                <TableCell>
                  <strong>SLA Restante</strong>
                </TableCell>
                <TableCell align="center">
                  <strong>Acciones</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ticketsFiltrados.map((ticket) => {
                const slaStatus = getSLAStatus(ticket.tiempo_restante_sla);
                return (
                  <TableRow key={ticket.id} hover>
                    <TableCell>#{ticket.id}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {ticket.titulo}
                      </Typography>
                    </TableCell>
                    <TableCell>{ticket.cliente_nombre}</TableCell>
                    <TableCell>
                      <Chip label={ticket.categoria_nombre} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={ticket.prioridad}
                        color={getPrioridadColor(ticket.prioridad)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        {slaStatus.icon}
                        <Typography variant="body2" color={`${slaStatus.color}.main`}>
                          {ticket.tiempo_restante_sla} min
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<AssignIcon />}
                        onClick={() => abrirDialogoAsignacion(ticket)}
                      >
                        Asignar
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Diálogo de asignación */}
      <Dialog open={openDialog} onClose={cerrarDialogo} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight="bold">
              Asignar Ticket Manualmente
            </Typography>
            <IconButton onClick={cerrarDialogo}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedTicket && (
            <>
              {/* Información del ticket */}
              <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: "#f5f5f5" }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Información del Ticket
                </Typography>
                <Typography variant="h6" gutterBottom>
                  #{selectedTicket.id} - {selectedTicket.titulo}
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      <strong>Categoría:</strong> {selectedTicket.categoria_nombre}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Chip
                      label={selectedTicket.prioridad}
                      color={getPrioridadColor(selectedTicket.prioridad)}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2">
                      <strong>Descripción:</strong> {selectedTicket.descripcion}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              {/* Mensaje dentro del diálogo */}
              {mensaje && (
                <Alert severity={mensaje.tipo} sx={{ mb: 2 }}>
                  {mensaje.texto}
                </Alert>
              )}

              {/* Validación: Técnicos disponibles */}
              {tecnicosDisponibles.length === 0 ? (
                <Alert severity="error" icon={<ErrorIcon />}>
                  <strong>No hay técnicos disponibles</strong> con la especialidad requerida para
                  esta categoría.
                </Alert>
              ) : (
                <>
                  {/* Selección de técnico */}
                  <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel>Seleccionar Técnico *</InputLabel>
                    <Select
                      value={selectedTecnico}
                      label="Seleccionar Técnico *"
                      onChange={(e) => setSelectedTecnico(e.target.value)}
                    >
                      {tecnicosDisponibles.map((tecnico) => (
                        <MenuItem key={tecnico.id} value={tecnico.id}>
                          <Box display="flex" alignItems="center" gap={2} width="100%">
                            <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main" }}>
                              <PersonIcon fontSize="small" />
                            </Avatar>
                            <Box flex={1}>
                              <Typography variant="body2" fontWeight="bold">
                                {tecnico.nombre}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {tecnico.especialidad_nombre}
                              </Typography>
                            </Box>
                            <Badge
                              badgeContent={tecnico.carga_trabajo}
                              color={tecnico.carga_trabajo > 5 ? "error" : "success"}
                            >
                              <WorkIcon color="action" />
                            </Badge>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Información del técnico seleccionado */}
                  {selectedTecnico && (
                    <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: "#e3f2fd" }}>
                      <Typography variant="subtitle2" gutterBottom>
                        <InfoIcon fontSize="small" sx={{ verticalAlign: "middle", mr: 1 }} />
                        Información del Técnico Seleccionado
                      </Typography>
                      {(() => {
                        const tecnico = tecnicosDisponibles.find((t) => t.id === selectedTecnico);
                        return (
                          <Grid container spacing={1} sx={{ mt: 1 }}>
                            <Grid item xs={6}>
                              <Typography variant="body2">
                                <strong>Especialidad:</strong> {tecnico?.especialidad_nombre}
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="body2">
                                <strong>Carga actual:</strong> {tecnico?.carga_trabajo} tickets
                              </Typography>
                            </Grid>
                          </Grid>
                        );
                      })()}
                    </Paper>
                  )}

                  {/* Justificación */}
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Justificación de la asignación *"
                    value={justificacion}
                    onChange={(e) => setJustificacion(e.target.value)}
                    placeholder="Explique por qué está asignando este técnico (mínimo 10 caracteres)..."
                    helperText={`${justificacion.length}/10 caracteres mínimos`}
                    error={justificacion.length > 0 && justificacion.length < 10}
                  />
                </>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={cerrarDialogo} disabled={asignando}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={asignarTicket}
            disabled={
              asignando ||
              !selectedTecnico ||
              !justificacion ||
              justificacion.length < 10 ||
              tecnicosDisponibles.length === 0
            }
            startIcon={asignando ? <CircularProgress size={20} /> : <AssignIcon />}
          >
            {asignando ? "Asignando..." : "Asignar Ticket"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
