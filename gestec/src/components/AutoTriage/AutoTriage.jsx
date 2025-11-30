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
  List,
  ListItem,
  ListItemText,
  Collapse,
  IconButton,
} from "@mui/material";
import {
  PlayArrow as PlayIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Speed as SpeedIcon,
  AssignmentInd as AssignIcon,
  Timer as TimerIcon,
  TrendingUp as PriorityIcon,
} from "@mui/icons-material";
import AutoTriageService from "../../services/AutoTriageService";
import { useTranslation } from "react-i18next";

export default function AutoTriage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [ejecutando, setEjecutando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [estadisticas, setEstadisticas] = useState(null);
  const [expandedTickets, setExpandedTickets] = useState({});

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      setLoading(true);
      const response = await AutoTriageService.obtenerEstadisticas();
      if (response.response) {
        setEstadisticas(response.result);
      }
    } catch (error) {
      console.error("Error al cargar estadísticas:", error);
    } finally {
      setLoading(false);
    }
  };

  const ejecutarAutoTriage = async () => {
    try {
      setEjecutando(true);
      setResultado(null);
      
      const response = await AutoTriageService.ejecutarAutoTriage();
      
      if (response.response) {
        setResultado(response.result);
        // Recargar estadísticas después de ejecutar
        setTimeout(() => cargarEstadisticas(), 1000);
      } else {
        setResultado({
          total_procesados: 0,
          asignaciones: [],
          error: response.message,
        });
      }
    } catch (error) {
      console.error("Error al ejecutar AutoTriage:", error);
      setResultado({
        total_procesados: 0,
        asignaciones: [],
        error: "Error al ejecutar la asignación automática",
      });
    } finally {
      setEjecutando(false);
    }
  };

  const toggleExpanded = (ticketId) => {
    setExpandedTickets((prev) => ({
      ...prev,
      [ticketId]: !prev[ticketId],
    }));
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

  const renderAsignacion = (asignacion, index) => {
    const isExpanded = expandedTickets[asignacion.ticket_id] || false;

    if (!asignacion.success) {
      return (
        <Paper key={index} elevation={2} sx={{ p: 2, mb: 2, bgcolor: "#fff3e0" }}>
          <Box display="flex" alignItems="center" gap={1}>
            <ErrorIcon color="error" />
            <Typography variant="subtitle1" fontWeight="bold">
              Ticket #{asignacion.ticket_id}: {asignacion.titulo}
            </Typography>
          </Box>
          <Alert severity="warning" sx={{ mt: 1 }}>
            {asignacion.mensaje}
          </Alert>
        </Paper>
      );
    }

    return (
      <Paper key={index} elevation={3} sx={{ p: 2, mb: 2, bgcolor: "#f0f7ff" }}>
        {/* Header */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
          <Box display="flex" alignItems="center" gap={1}>
            <SuccessIcon color="success" />
            <Typography variant="h6" fontWeight="bold">
              Ticket #{asignacion.ticket_id}
            </Typography>
            <Chip
              label={asignacion.prioridad}
              color={getPrioridadColor(asignacion.prioridad)}
              size="small"
            />
          </Box>
          <IconButton onClick={() => toggleExpanded(asignacion.ticket_id)} size="small">
            {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>

        <Typography variant="body1" sx={{ mb: 2, fontStyle: "italic" }}>
          {asignacion.titulo}
        </Typography>

        {/* Resumen de asignación */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={6}>
            <Box display="flex" alignItems="center" gap={1}>
              <AssignIcon color="primary" />
              <Typography variant="body2">
                <strong>Técnico asignado:</strong> {asignacion.tecnico_asignado}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box display="flex" alignItems="center" gap={1}>
              <InfoIcon color="info" />
              <Typography variant="body2">
                <strong>Especialidad:</strong> {asignacion.especialidad}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Métricas principales */}
        <Box
          display="flex"
          gap={2}
          flexWrap="wrap"
          sx={{
            p: 2,
            bgcolor: "white",
            borderRadius: 1,
            mb: 2,
          }}
        >
          <Box textAlign="center">
            <SpeedIcon color="action" />
            <Typography variant="caption" display="block" color="text.secondary">
              Puntaje
            </Typography>
            <Typography variant="h6" fontWeight="bold">
              {asignacion.puntaje_ticket}
            </Typography>
          </Box>

          <Divider orientation="vertical" flexItem />

          <Box textAlign="center">
            <PriorityIcon color="warning" />
            <Typography variant="caption" display="block" color="text.secondary">
              Prioridad
            </Typography>
            <Typography variant="h6" fontWeight="bold">
              {asignacion.prioridad_numerica}
            </Typography>
          </Box>

          <Divider orientation="vertical" flexItem />

          <Box textAlign="center">
            <TimerIcon color="error" />
            <Typography variant="caption" display="block" color="text.secondary">
              SLA Restante
            </Typography>
            <Typography variant="h6" fontWeight="bold">
              {asignacion.tiempo_restante_sla} min
            </Typography>
          </Box>

          <Divider orientation="vertical" flexItem />

          <Box textAlign="center">
            <AssignIcon color="info" />
            <Typography variant="caption" display="block" color="text.secondary">
              Carga Técnico
            </Typography>
            <Typography variant="h6" fontWeight="bold">
              {asignacion.carga_trabajo_tecnico}
            </Typography>
          </Box>
        </Box>

        {/* Fórmula del cálculo */}
        <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 2 }}>
          <Typography variant="body2" fontWeight="bold" gutterBottom>
            Cálculo del Puntaje:
          </Typography>
          <Typography variant="body2" fontFamily="monospace">
            Puntaje = (Prioridad × 1000) - Tiempo Restante SLA
          </Typography>
          <Typography variant="body2" fontFamily="monospace">
            Puntaje = ({asignacion.prioridad_numerica} × 1000) -{" "}
            {asignacion.tiempo_restante_sla} = {asignacion.puntaje_ticket}
          </Typography>
        </Alert>

        {/* Detalles expandibles */}
        <Collapse in={isExpanded}>
          <Divider sx={{ my: 2 }} />

          {/* Justificación */}
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            Justificación de la Asignación:
          </Typography>
          <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: "#f5f5f5" }}>
            <Typography
              variant="body2"
              component="pre"
              sx={{ whiteSpace: "pre-line", fontFamily: "inherit" }}
            >
              {asignacion.justificacion}
            </Typography>
          </Paper>

          {/* Otros candidatos */}
          {asignacion.otros_candidatos && asignacion.otros_candidatos.length > 0 && (
            <>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                Otros Candidatos Considerados:
              </Typography>
              <List dense>
                {asignacion.otros_candidatos.map((candidato, idx) => (
                  <ListItem
                    key={idx}
                    sx={{
                      bgcolor: "white",
                      mb: 1,
                      borderRadius: 1,
                      border: "1px solid #e0e0e0",
                    }}
                  >
                    <ListItemText
                      primary={candidato.tecnico_nombre}
                      secondary={
                        <span>
                          {candidato.especialidad} | Carga: {candidato.carga_trabajo} tickets |
                          Puntaje: {candidato.puntaje_idoneidad}
                        </span>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </>
          )}
        </Collapse>
      </Paper>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        AutoTriage - Asignación Automática
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Sistema de asignación automática de tickets pendientes basado en prioridad, SLA, carga de
        trabajo y especialidad del técnico.
      </Typography>

      {/* Estadísticas */}
      {estadisticas && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Tickets Pendientes
                </Typography>
                <Typography variant="h3" fontWeight="bold" color="primary">
                  {estadisticas.tickets_pendientes}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Asignaciones Últimas 24h
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="success.main">
                  {estadisticas.historial_24h?.reduce(
                    (sum, h) => sum + parseInt(h.total_asignaciones || 0),
                    0
                  ) || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Botón de ejecución */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="h6" gutterBottom>
                Ejecutar Asignación Automática
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Procesa todos los tickets pendientes y los asigna al técnico más adecuado según
                los criterios establecidos.
              </Typography>
            </Box>
            <Button
              variant="contained"
              size="large"
              startIcon={ejecutando ? <CircularProgress size={20} color="inherit" /> : <PlayIcon />}
              onClick={ejecutarAutoTriage}
              disabled={ejecutando || (estadisticas?.tickets_pendientes === 0)}
              sx={{ minWidth: 200 }}
            >
              {ejecutando ? "Ejecutando..." : "Ejecutar AutoTriage"}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Resultados */}
      {resultado && (
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom fontWeight="bold">
              Resultados de la Asignación
            </Typography>

            {resultado.error ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                {resultado.error}
              </Alert>
            ) : resultado.total_procesados === 0 ? (
              <Alert severity="info">No hay tickets pendientes para asignar</Alert>
            ) : (
              <>
                <Alert severity="success" sx={{ mb: 3 }}>
                  <Typography variant="body1" fontWeight="bold">
                    Procesados: {resultado.total_procesados} tickets
                  </Typography>
                  <Typography variant="body2">
                    Exitosos:{" "}
                    {resultado.asignaciones.filter((a) => a.success).length} | Fallidos:{" "}
                    {resultado.asignaciones.filter((a) => !a.success).length}
                  </Typography>
                </Alert>

                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                  Detalle de Asignaciones:
                </Typography>

                {resultado.asignaciones.map((asignacion, index) =>
                  renderAsignacion(asignacion, index)
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Loading inicial */}
      {loading && (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
}
