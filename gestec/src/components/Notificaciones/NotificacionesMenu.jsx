import { useState, useEffect } from "react";
import {
  IconButton,
  Badge,
  Menu,
  Typography,
  Box,
  Divider,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tooltip,
  Avatar,
  Stack,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  Circle as CircleIcon,
  CheckCircle as CheckCircleIcon,
  DeleteOutline as DeleteIcon,
  Login as LoginIcon,
  ConfirmationNumber as TicketIcon,
  Assignment as AssignmentIcon,
  Warning as WarningIcon,
  Comment as CommentIcon,
  TrendingUp as TrendingUpIcon,
  AccessTime as AccessTimeIcon,
  Flag as FlagIcon,
} from "@mui/icons-material";
import NotificacionService from "../../services/NotificacionService";
import { useNavigate } from "react-router-dom";

export default function NotificacionesMenu() {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificaciones, setNotificaciones] = useState([]);
  const [countNoLeidas, setCountNoLeidas] = useState(0);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  useEffect(() => {
    cargarContador();
    // Actualizar contador cada 30 segundos
    const interval = setInterval(cargarContador, 30000);
    return () => clearInterval(interval);
  }, []);

  const cargarContador = async () => {
    try {
      const response = await NotificacionService.contarNoLeidas();
      if (response.response) {
        setCountNoLeidas(response.result.count);
      }
    } catch (error) {
      console.error("Error al cargar contador:", error);
    }
  };

  const cargarNotificaciones = async () => {
    try {
      setLoading(true);
      const response = await NotificacionService.obtenerNotificaciones();
      if (response.response) {
        setNotificaciones(response.result.notificaciones || []);
      }
    } catch (error) {
      console.error("Error al cargar notificaciones:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
    cargarNotificaciones();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const marcarComoLeida = async (notificacionId, event) => {
    event.stopPropagation();
    try {
      const response = await NotificacionService.marcarComoLeida(notificacionId);
      
      if (response.response) {
        // ACTUALIZACIÓN EN TIEMPO REAL: Sin recargar página
        setNotificaciones(prevNotificaciones =>
          prevNotificaciones.map(notif =>
            notif.id === notificacionId
              ? { 
                  ...notif, 
                  leida: "1", 
                  fecha_lectura: response.result?.fecha_lectura || new Date().toISOString() 
                }
              : notif
          )
        );
        
        // Actualizar contador
        cargarContador();
        
        // Mostrar mensaje de éxito
        setMensaje({ tipo: "success", texto: "Notificación marcada como leída" });
        setTimeout(() => setMensaje(null), 2000);
      } else {
        setMensaje({ tipo: "error", texto: response.message || "Error al marcar notificación" });
        setTimeout(() => setMensaje(null), 3000);
      }
    } catch (error) {
      setMensaje({ tipo: "error", texto: "Error al marcar como leída" });
      setTimeout(() => setMensaje(null), 3000);
    }
  };

  const marcarTodasLeidas = async () => {
    try {
      const response = await NotificacionService.marcarTodasLeidas();
      
      if (response.response) {
        // ACTUALIZACIÓN EN TIEMPO REAL: Actualizar estado local
        const timestamp = new Date().toISOString();
        setNotificaciones(prevNotificaciones =>
          prevNotificaciones.map(notif =>
            notif.leida === "0"
              ? { ...notif, leida: "1", fecha_lectura: timestamp }
              : notif
          )
        );
        
        // Actualizar contador a 0
        setCountNoLeidas(0);
        
        // Mostrar mensaje de éxito
        const cantidad = response.result?.cantidad_actualizada || 0;
        setMensaje({ 
          tipo: "success", 
          texto: `${cantidad} notificación${cantidad !== 1 ? 'es' : ''} marcada${cantidad !== 1 ? 's' : ''} como leída${cantidad !== 1 ? 's' : ''}` 
        });
        setTimeout(() => setMensaje(null), 2000);
      } else {
        setMensaje({ tipo: "error", texto: response.message || "Error al marcar notificaciones" });
        setTimeout(() => setMensaje(null), 3000);
      }
    } catch (error) {
      setMensaje({ tipo: "error", texto: "Error al marcar todas las notificaciones" });
      setTimeout(() => setMensaje(null), 3000);
    }
  };

  const eliminarNotificacion = async (notificacionId, event) => {
    event.stopPropagation();
    try {
      const response = await NotificacionService.eliminar(notificacionId);
      
      if (response.response) {
        cargarNotificaciones();
        cargarContador();
        setMensaje({ tipo: "success", texto: "Notificación eliminada" });
        setTimeout(() => setMensaje(null), 2000);
      } else {
        setMensaje({ tipo: "error", texto: "Error al eliminar notificación" });
        setTimeout(() => setMensaje(null), 3000);
      }
    } catch (error) {
      setMensaje({ tipo: "error", texto: "Error al eliminar notificación" });
      setTimeout(() => setMensaje(null), 3000);
    }
  };

  const handleNotificacionClick = (notificacion) => {
    // ACTUALIZACIÓN OPTIMISTA: Marcar como leída inmediatamente en UI
    if (notificacion.leida === "0") {
      // Actualizar estado local
      setNotificaciones(prevNotificaciones =>
        prevNotificaciones.map(notif =>
          notif.id === notificacion.id
            ? { ...notif, leida: "1", fecha_lectura: new Date().toISOString() }
            : notif
        )
      );
      
      // Actualizar contador
      setCountNoLeidas(prev => Math.max(0, prev - 1));
      
      // Enviar request en background
      NotificacionService.marcarComoLeida(notificacion.id).catch(err => {
        console.error("Error al marcar:", err);
        // Revertir cambio si falla
        cargarNotificaciones();
        cargarContador();
      });
    }

    // Navegar según el tipo
    if (notificacion.tipo === "ticket_cambio_estado" && notificacion.datos_adicionales?.ticket_id) {
      navigate(`/ticket/${notificacion.datos_adicionales.ticket_id}`);
      handleClose();
    }
  };

  // JERARQUÍA VISUAL: Configuración de iconos, colores e importancia por tipo
  const getConfigTipo = (tipo) => {
    const config = {
      ticket_cambio_estado: {
        icono: <TicketIcon fontSize="small" />,
        color: "primary",
        importancia: 2,
        label: "Cambio de Estado"
      },
      ticket_asignado: {
        icono: <AssignmentIcon fontSize="small" />,
        color: "info",
        importancia: 3,
        label: "Asignado"
      },
      ticket_resuelto: {
        icono: <CheckCircleIcon fontSize="small" />,
        color: "success",
        importancia: 4,
        label: "Resuelto"
      },
      sla_proximo_vencer: {
        icono: <WarningIcon fontSize="small" />,
        color: "warning",
        importancia: 5,
        label: "SLA Crítico"
      },
      comentario_nuevo: {
        icono: <CommentIcon fontSize="small" />,
        color: "default",
        importancia: 1,
        label: "Comentario"
      },
      escalamiento: {
        icono: <TrendingUpIcon fontSize="small" />,
        color: "error",
        importancia: 6,
        label: "Escalamiento"
      },
      inicio_sesion: {
        icono: <LoginIcon fontSize="small" />,
        color: "success",
        importancia: 1,
        label: "Inicio Sesión"
      }
    };
    return config[tipo] || {
      icono: <NotificationsIcon fontSize="small" />,
      color: "default",
      importancia: 0,
      label: tipo
    };
  };

  const formatearFecha = (fecha) => {
    const date = new Date(fecha);
    const ahora = new Date();
    const diffMs = ahora - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Ahora";
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    return date.toLocaleDateString();
  };

  return (
    <>
      <Tooltip title="Notificaciones">
        <IconButton size="large" color="inherit" onClick={handleOpen}>
          <Badge badgeContent={countNoLeidas} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 450,
            maxHeight: 650,
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        {/* Header con estadísticas rápidas */}
        <Box sx={{ p: 2, bgcolor: "primary.main", color: "white" }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight="bold">
              Notificaciones
            </Typography>
            {countNoLeidas > 0 && (
              <Chip 
                label={`${countNoLeidas} nuevas`} 
                size="small"
                sx={{ 
                  bgcolor: "error.main", 
                  color: "white",
                  fontWeight: "bold"
                }}
              />
            )}
          </Box>
          {countNoLeidas > 0 && (
            <Button 
              size="small" 
              onClick={marcarTodasLeidas}
              sx={{ 
                mt: 1,
                color: "white",
                borderColor: "white",
                "&:hover": {
                  bgcolor: "primary.dark"
                }
              }}
              variant="outlined"
              fullWidth
            >
              Marcar todas leídas
            </Button>
          )}
        </Box>
        <Divider />

        {/* Lista de notificaciones con jerarquía visual */}
        {loading ? (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              Cargando...
            </Typography>
          </Box>
        ) : notificaciones.length === 0 ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <NotificationsIcon sx={{ fontSize: 56, color: "text.disabled", mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              No tienes notificaciones
            </Typography>
          </Box>
        ) : (
              <List sx={{ p: 0, maxHeight: 450, overflow: "auto" }}>
            {notificaciones.map((notif) => {
              const tipoConfig = getConfigTipo(notif.tipo);
              return (
                <ListItem
                  key={notif.id}
                  sx={{
                    bgcolor: notif.leida === "0" ? "action.hover" : "transparent",
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    borderLeft: notif.leida === "0" ? 3 : 0,
                    borderLeftColor: `${tipoConfig.color}.main`,
                    cursor: "pointer",
                    "&:hover": {
                      bgcolor: "action.selected",
                    },
                    py: 1.5,
                  }}
                  onClick={() => handleNotificacionClick(notif)}
                >
                  {/* Avatar con icono y color jerárquico */}
                  <ListItemIcon sx={{ minWidth: 56 }}>
                    <Avatar
                      sx={{
                        bgcolor: `${tipoConfig.color}.main`,
                        color: "white",
                        width: 40,
                        height: 40
                      }}
                    >
                      {tipoConfig.icono}
                    </Avatar>
                  </ListItemIcon>

                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
                        <Typography 
                          variant="body2" 
                          fontWeight={notif.leida === "0" ? "bold" : "normal"}
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            flex: 1
                          }}
                        >
                          {notif.titulo}
                        </Typography>
                        {notif.leida === "0" && (
                          <CircleIcon sx={{ fontSize: 8, color: "error.main" }} />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          sx={{ 
                            mb: 0.5,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap"
                          }}
                        >
                          {notif.mensaje.length > 80
                            ? notif.mensaje.substring(0, 80) + "..."
                            : notif.mensaje}
                        </Typography>
                        <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap">
                          <Chip 
                            label={tipoConfig.label} 
                            size="small" 
                            color={tipoConfig.color}
                            sx={{ fontSize: "0.65rem", height: 20 }}
                          />
                          <Chip
                            icon={<AccessTimeIcon sx={{ fontSize: 12 }} />}
                            label={formatearFecha(notif.fecha_creacion)}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: "0.65rem", height: 20 }}
                          />
                          {notif.datos_adicionales?.prioridad && (
                            <Chip
                              icon={<FlagIcon sx={{ fontSize: 12 }} />}
                              label={notif.datos_adicionales.prioridad}
                              size="small"
                              color={
                                notif.datos_adicionales.prioridad === "Alta" ? "error" :
                                notif.datos_adicionales.prioridad === "Media" ? "warning" : "default"
                              }
                              sx={{ fontSize: "0.65rem", height: 20 }}
                            />
                          )}
                        </Stack>
                      </Box>
                    }
                  />

                  {/* Acciones compactas */}
                  <Box display="flex" gap={0.5}>
                    {notif.leida === "0" && (
                      <Tooltip title="Marcar como leída">
                        <IconButton
                          size="small"
                          onClick={(e) => marcarComoLeida(notif.id, e)}
                          sx={{
                            transition: "all 0.2s ease",
                            "&:hover": {
                              transform: "scale(1.1)",
                              bgcolor: "primary.light"
                            }
                          }}
                        >
                          <CheckCircleIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Eliminar">
                      <IconButton
                        size="small"
                        onClick={(e) => eliminarNotificacion(notif.id, e)}
                        sx={{
                          transition: "all 0.2s ease",
                          "&:hover": {
                            transform: "scale(1.1)",
                            bgcolor: "error.light"
                          }
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </ListItem>
              );
            })}
          </List>
        )}

        <Divider />
        {/* Footer con acceso directo al historial completo */}
        <Box sx={{ p: 1.5, bgcolor: "background.default" }}>
          <Button
            fullWidth
            size="small"
            variant="contained"
            onClick={() => {
              navigate("/notificaciones");
              handleClose();
            }}
          >
            Ver historial completo
          </Button>
        </Box>
      </Menu>

      {/* Snackbar para mensajes personalizados */}
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
            variant="filled"
            sx={{ width: "100%" }}
          >
            {mensaje.texto}
          </Alert>
        )}
      </Snackbar>
    </>
  );
}
