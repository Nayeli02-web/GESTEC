import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  IconButton,
  Tabs,
  Tab,
  Button,
  Menu,
  MenuItem,
  Badge,
  Tooltip,
  Alert,
  Snackbar,
  Grid,
  Paper,
  Divider,
  Stack,
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  CheckCircle as CheckCircleIcon,
  DoneAll as DoneAllIcon,
  FilterList as FilterListIcon,
  Sort as SortIcon,
  AssignmentTurnedIn as TicketIcon,
  PersonAdd as AssignmentIcon,
  CheckCircleOutline as ResolvedIcon,
  Warning as WarningIcon,
  Comment as CommentIcon,
  TrendingUp as EscalateIcon,
  Login as LoginIcon,
  Circle as CircleIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import NotificacionService from "../../services/NotificacionService";

const Notificaciones = () => {
  const navigate = useNavigate();
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [filtroTipo, setFiltroTipo] = useState("todas");
  const [ordenamiento, setOrdenamiento] = useState("recientes");
  const [anchorElFiltro, setAnchorElFiltro] = useState(null);
  const [anchorElOrden, setAnchorElOrden] = useState(null);
  const [mensaje, setMensaje] = useState(null);

  const tiposNotificacion = {
    ticket_cambio_estado: {
      label: "Cambio de Estado",
      icon: TicketIcon,
      color: "#2196F3",
      prioridad: 3,
    },
    ticket_asignado: {
      label: "Ticket Asignado",
      icon: AssignmentIcon,
      color: "#4CAF50",
      prioridad: 4,
    },
    ticket_resuelto: {
      label: "Ticket Resuelto",
      icon: ResolvedIcon,
      color: "#00C853",
      prioridad: 2,
    },
    sla_proximo_vencer: {
      label: "SLA Próximo a Vencer",
      icon: WarningIcon,
      color: "#FF9800",
      prioridad: 5,
    },
    comentario_nuevo: {
      label: "Nuevo Comentario",
      icon: CommentIcon,
      color: "#9C27B0",
      prioridad: 1,
    },
    escalamiento: {
      label: "Escalamiento",
      icon: EscalateIcon,
      color: "#F44336",
      prioridad: 6,
    },
    inicio_sesion: {
      label: "Inicio de Sesión",
      icon: LoginIcon,
      color: "#607D8B",
      prioridad: 0,
    },
  };

  useEffect(() => {
    cargarNotificaciones();
  }, []);

  const cargarNotificaciones = async () => {
    setLoading(true);
    try {
      const response = await NotificacionService.getNotificaciones();
      if (response.response && response.result) {
        setNotificaciones(response.result);
      }
    } catch (error) {
      setMensaje({ tipo: "error", texto: "Error al cargar notificaciones" });
    } finally {
      setLoading(false);
    }
  };

  const marcarComoLeida = async (notificacionId) => {
    try {
      const response = await NotificacionService.marcarComoLeida(notificacionId);
      if (response.response) {
        setNotificaciones((prevNotificaciones) =>
          prevNotificaciones.map((notif) =>
            notif.id === notificacionId
              ? {
                  ...notif,
                  leida: "1",
                  fecha_lectura:
                    response.result?.fecha_lectura || new Date().toISOString(),
                }
              : notif
          )
        );
        setMensaje({ tipo: "success", texto: response.message });
        setTimeout(() => setMensaje(null), 2000);
      }
    } catch (error) {
      setMensaje({ tipo: "error", texto: "Error al marcar notificación" });
    }
  };

  const marcarTodasLeidas = async () => {
    try {
      const response = await NotificacionService.marcarTodasLeidas();
      if (response.response) {
        const timestamp = new Date().toISOString();
        setNotificaciones((prevNotificaciones) =>
          prevNotificaciones.map((notif) =>
            notif.leida === "0"
              ? { ...notif, leida: "1", fecha_lectura: timestamp }
              : notif
          )
        );
        setMensaje({
          tipo: "success",
          texto: `${response.result?.cantidad_actualizada || 0} notificaciones marcadas`,
        });
      }
    } catch (error) {
      setMensaje({ tipo: "error", texto: "Error al marcar todas como leídas" });
    }
  };

  const handleNotificacionClick = async (notificacion) => {
    if (notificacion.leida === "0") {
      setNotificaciones((prevNotificaciones) =>
        prevNotificaciones.map((notif) =>
          notif.id === notificacion.id
            ? { ...notif, leida: "1", fecha_lectura: new Date().toISOString() }
            : notif
        )
      );
      marcarComoLeida(notificacion.id);
    }
    if (
      notificacion.tipo === "ticket_cambio_estado" &&
      notificacion.datos_adicionales?.ticket_id
    ) {
      navigate(`/ticket/${notificacion.datos_adicionales.ticket_id}`);
    }
    if (
      notificacion.tipo === "ticket_asignado" &&
      notificacion.datos_adicionales?.ticket_id
    ) {
      navigate(`/ticket/${notificacion.datos_adicionales.ticket_id}`);
    }
    if (
      notificacion.tipo === "ticket_resuelto" &&
      notificacion.datos_adicionales?.ticket_id
    ) {
      navigate(`/ticket/${notificacion.datos_adicionales.ticket_id}`);
    }
    if (
      notificacion.tipo === "comentario_nuevo" &&
      notificacion.datos_adicionales?.ticket_id
    ) {
      navigate(`/ticket/${notificacion.datos_adicionales.ticket_id}`);
    }
    if (
      notificacion.tipo === "escalamiento" &&
      notificacion.datos_adicionales?.ticket_id
    ) {
      navigate(`/ticket/${notificacion.datos_adicionales.ticket_id}`);
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "";
    const date = new Date(fecha);
    const ahora = new Date();
    const diff = ahora - date;
    const minutos = Math.floor(diff / 60000);
    const horas = Math.floor(diff / 3600000);
    const dias = Math.floor(diff / 86400000);

    if (minutos < 1) return "Ahora";
    if (minutos < 60) return `Hace ${minutos} min`;
    if (horas < 24) return `Hace ${horas}h`;
    if (dias < 7) return `Hace ${dias}d`;
    return date.toLocaleDateString();
  };

  const obtenerNotificacionesFiltradas = () => {
    let filtradas = [...notificaciones];

    // Filtro por estado (tabs)
    if (tabValue === 1) {
      filtradas = filtradas.filter((n) => n.leida === "0");
    } else if (tabValue === 2) {
      filtradas = filtradas.filter((n) => n.leida === "1");
    }

    // Filtro por tipo
    if (filtroTipo !== "todas") {
      filtradas = filtradas.filter((n) => n.tipo === filtroTipo);
    }

    // Ordenamiento
    filtradas.sort((a, b) => {
      if (ordenamiento === "recientes") {
        return new Date(b.fecha_creacion) - new Date(a.fecha_creacion);
      } else if (ordenamiento === "antiguas") {
        return new Date(a.fecha_creacion) - new Date(b.fecha_creacion);
      } else if (ordenamiento === "importancia") {
        const prioridadA = tiposNotificacion[a.tipo]?.prioridad || 0;
        const prioridadB = tiposNotificacion[b.tipo]?.prioridad || 0;
        return prioridadB - prioridadA;
      }
      return 0;
    });

    return filtradas;
  };

  const calcularEstadisticas = () => {
    const total = notificaciones.length;
    const noLeidas = notificaciones.filter((n) => n.leida === "0").length;
    const leidas = notificaciones.filter((n) => n.leida === "1").length;
    const tasaLectura = total > 0 ? ((leidas / total) * 100).toFixed(1) : 0;

    return { total, noLeidas, leidas, tasaLectura };
  };

  const estadisticas = calcularEstadisticas();
  const notificacionesFiltradas = obtenerNotificacionesFiltradas();

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          <NotificationsIcon sx={{ mr: 1, verticalAlign: "middle" }} />
          Notificaciones
        </Typography>
        <Button
          variant="contained"
          startIcon={<DoneAllIcon />}
          onClick={marcarTodasLeidas}
          disabled={estadisticas.noLeidas === 0}
        >
          Marcar todas como leídas
        </Button>
      </Box>

      {/* Estadísticas */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="h4" color="primary">
              {estadisticas.total}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="h4" color="error">
              {estadisticas.noLeidas}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              No Leídas
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="h4" color="success.main">
              {estadisticas.leidas}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Leídas
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="h4" color="info.main">
              {estadisticas.tasaLectura}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tasa de Lectura
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          {/* Tabs y Filtros */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
              <Tab
                label={
                  <Badge badgeContent={estadisticas.total} color="primary">
                    Todas
                  </Badge>
                }
              />
              <Tab
                label={
                  <Badge badgeContent={estadisticas.noLeidas} color="error">
                    No Leídas
                  </Badge>
                }
              />
              <Tab
                label={
                  <Badge badgeContent={estadisticas.leidas} color="success">
                    Leídas
                  </Badge>
                }
              />
            </Tabs>

            <Box>
              <Tooltip title="Filtrar por tipo">
                <IconButton onClick={(e) => setAnchorElFiltro(e.currentTarget)}>
                  <FilterListIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Ordenar">
                <IconButton onClick={(e) => setAnchorElOrden(e.currentTarget)}>
                  <SortIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Filtros activos */}
          {(filtroTipo !== "todas" || ordenamiento !== "recientes") && (
            <Box sx={{ mb: 2 }}>
              <Stack direction="row" spacing={1}>
                {filtroTipo !== "todas" && (
                  <Chip
                    label={tiposNotificacion[filtroTipo]?.label || filtroTipo}
                    onDelete={() => setFiltroTipo("todas")}
                    size="small"
                  />
                )}
                {ordenamiento !== "recientes" && (
                  <Chip
                    label={`Orden: ${
                      ordenamiento === "antiguas"
                        ? "Más antiguas"
                        : "Importancia"
                    }`}
                    onDelete={() => setOrdenamiento("recientes")}
                    size="small"
                  />
                )}
              </Stack>
            </Box>
          )}

          <Divider sx={{ mb: 2 }} />

          {/* Lista de notificaciones */}
          {loading ? (
            <Typography align="center" sx={{ py: 4 }}>
              Cargando notificaciones...
            </Typography>
          ) : notificacionesFiltradas.length === 0 ? (
            <Typography align="center" color="text.secondary" sx={{ py: 4 }}>
              No hay notificaciones
            </Typography>
          ) : (
            <Box>
              {notificacionesFiltradas.map((notificacion, index) => {
                const tipo = tiposNotificacion[notificacion.tipo] || {
                  label: notificacion.tipo,
                  icon: NotificationsIcon,
                  color: "#757575",
                  prioridad: 0,
                };
                const IconComponent = tipo.icon;

                return (
                  <Box key={notificacion.id}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        p: 2,
                        cursor: "pointer",
                        bgcolor:
                          notificacion.leida === "0"
                            ? "action.hover"
                            : "transparent",
                        borderRadius: 1,
                        transition: "all 0.2s",
                        "&:hover": {
                          bgcolor: "action.selected",
                          transform: "translateX(4px)",
                        },
                      }}
                      onClick={() => handleNotificacionClick(notificacion)}
                    >
                      <Avatar
                        sx={{
                          bgcolor: tipo.color,
                          mr: 2,
                          width: 48,
                          height: 48,
                        }}
                      >
                        <IconComponent />
                      </Avatar>

                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            mb: 0.5,
                          }}
                        >
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontWeight:
                                notificacion.leida === "0" ? 600 : 400,
                              mr: 1,
                            }}
                          >
                            {notificacion.titulo}
                          </Typography>
                          {notificacion.leida === "0" && (
                            <CircleIcon
                              sx={{ fontSize: 10, color: "primary.main" }}
                            />
                          )}
                        </Box>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 1 }}
                        >
                          {notificacion.mensaje}
                        </Typography>

                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            flexWrap: "wrap",
                          }}
                        >
                          <Chip
                            label={tipo.label}
                            size="small"
                            sx={{
                              bgcolor: tipo.color,
                              color: "white",
                              fontSize: "0.7rem",
                            }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {formatearFecha(notificacion.fecha_creacion)}
                          </Typography>
                        </Box>
                      </Box>

                      {notificacion.leida === "0" && (
                        <Tooltip title="Marcar como leída">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              marcarComoLeida(notificacion.id);
                            }}
                            sx={{
                              "&:hover": {
                                bgcolor: "success.light",
                              },
                            }}
                          >
                            <CheckCircleIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                    {index < notificacionesFiltradas.length - 1 && <Divider />}
                  </Box>
                );
              })}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Menu Filtro por Tipo */}
      <Menu
        anchorEl={anchorElFiltro}
        open={Boolean(anchorElFiltro)}
        onClose={() => setAnchorElFiltro(null)}
      >
        <MenuItem
          onClick={() => {
            setFiltroTipo("todas");
            setAnchorElFiltro(null);
          }}
          selected={filtroTipo === "todas"}
        >
          Todas
        </MenuItem>
        {Object.entries(tiposNotificacion).map(([key, tipo]) => (
          <MenuItem
            key={key}
            onClick={() => {
              setFiltroTipo(key);
              setAnchorElFiltro(null);
            }}
            selected={filtroTipo === key}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <tipo.icon sx={{ color: tipo.color, fontSize: 20 }} />
              {tipo.label}
            </Box>
          </MenuItem>
        ))}
      </Menu>

      {/* Menu Ordenamiento */}
      <Menu
        anchorEl={anchorElOrden}
        open={Boolean(anchorElOrden)}
        onClose={() => setAnchorElOrden(null)}
      >
        <MenuItem
          onClick={() => {
            setOrdenamiento("recientes");
            setAnchorElOrden(null);
          }}
          selected={ordenamiento === "recientes"}
        >
          Más recientes
        </MenuItem>
        <MenuItem
          onClick={() => {
            setOrdenamiento("antiguas");
            setAnchorElOrden(null);
          }}
          selected={ordenamiento === "antiguas"}
        >
          Más antiguas
        </MenuItem>
        <MenuItem
          onClick={() => {
            setOrdenamiento("importancia");
            setAnchorElOrden(null);
          }}
          selected={ordenamiento === "importancia"}
        >
          Por importancia
        </MenuItem>
      </Menu>

      {/* Snackbar para mensajes */}
      <Snackbar
        open={Boolean(mensaje)}
        autoHideDuration={3000}
        onClose={() => setMensaje(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        {mensaje && (
          <Alert
            onClose={() => setMensaje(null)}
            severity={mensaje.tipo}
            sx={{ width: "100%" }}
          >
            {mensaje.texto}
          </Alert>
        )}
      </Snackbar>
    </Box>
  );
};

export default Notificaciones;
