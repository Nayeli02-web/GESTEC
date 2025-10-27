<?php
/**
 * Modelo para la gestión de tickets.
 */
class TicketModel
{
    public $enlace;

    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }

    /**
     * Obtener lista de tickets según rol
     * @param int $usuario_id - ID del usuario logueado
     * @param string $rol - Rol del usuario ('Administrador', 'Cliente', 'Tecnico')
     */
    public function listarPorRol($usuario_id, $rol)
    {
        try {
            $vSql = "";
            
            
            $rol = strtolower(trim($rol));
            $rol = str_replace(['técnico', 'tecnico'], 'tecnico', $rol);

            if ($rol === 'administrador') {
                $vSql = "SELECT t.id, t.titulo, t.prioridad, t.estado, t.fecha_creacion,
                         c.nombre AS categoria,
                         s.tiempo_respuesta AS sla_respuesta_minutos,
                         s.tiempo_resolucion AS sla_resolucion_minutos
                         FROM tickets t
                         LEFT JOIN categorias c ON t.categoria_id = c.id
                         LEFT JOIN sla s ON t.sla_id = s.id
                         ORDER BY t.fecha_creacion DESC";
            } elseif ($rol === 'cliente') {
                $vSql = "SELECT t.id, t.titulo, t.prioridad, t.estado, t.fecha_creacion,
                         c.nombre AS categoria,
                         s.tiempo_respuesta AS sla_respuesta_minutos,
                         s.tiempo_resolucion AS sla_resolucion_minutos
                         FROM tickets t
                         LEFT JOIN categorias c ON t.categoria_id = c.id
                         LEFT JOIN sla s ON t.sla_id = s.id
                         WHERE t.cliente_id = $usuario_id
                         ORDER BY t.fecha_creacion DESC";
            } elseif ($rol === 'tecnico') {
                // Buscar el técnico asociado al usuario
                $tecnico = $this->enlace->ExecuteSQL("SELECT id FROM tecnicos WHERE usuario_id = $usuario_id", 'asoc');
                if (empty($tecnico)) return [];
                $tecnico_id = $tecnico[0]['id'];

                $vSql = "SELECT t.id, t.titulo, t.prioridad, t.estado, t.fecha_creacion,
                         c.nombre AS categoria,
                         s.tiempo_respuesta AS sla_respuesta_minutos,
                         s.tiempo_resolucion AS sla_resolucion_minutos
                         FROM tickets t
                         LEFT JOIN categorias c ON t.categoria_id = c.id
                         LEFT JOIN sla s ON t.sla_id = s.id
                         WHERE t.tecnico_id = $tecnico_id
                         ORDER BY t.fecha_creacion DESC";
            } else {
            
                return [];
            }

            $tickets = $this->enlace->ExecuteSQL($vSql, 'asoc');
            
            // Calcular tiempo restante de SLA para cada ticket
            foreach ($tickets as &$ticket) {
                $ticket['sla_info'] = $this->calcularSLARestante($ticket);
            }
            unset($ticket); 
            
            return $tickets;
        } catch (Exception $e) {
            handleException($e);
            return [];
        }
    }

    /**
     * Obtener detalle completo de un ticket
     */
    public function get($id)
    {
        try {
            $vSql = "SELECT 
                        t.id, t.titulo, t.descripcion, t.prioridad, t.estado, 
                        c.nombre AS categoria, u.nombre AS cliente, 
                        tec.id AS tecnico_id, u2.nombre AS tecnico, 
                        s.tiempo_respuesta, s.tiempo_resolucion, 
                        t.fecha_creacion, t.fecha_cierre
                     FROM tickets t
                     LEFT JOIN categorias c ON t.categoria_id = c.id
                     LEFT JOIN usuarios u ON t.cliente_id = u.id
                     LEFT JOIN tecnicos tec ON t.tecnico_id = tec.id
                     LEFT JOIN usuarios u2 ON tec.usuario_id = u2.id
                     LEFT JOIN sla s ON t.sla_id = s.id
                     WHERE t.id = $id";
            $vResultado = $this->enlace->ExecuteSQL($vSql, 'asoc');
            return !empty($vResultado) ? $vResultado[0] : null;
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /**
     * Obtener detalle completo de un ticket con toda la información requerida
     */
    public function getDetalle($id)
    {
        try {
            // Información básica del ticket con JOINs
            $vSql = "SELECT 
                        t.id, t.titulo, t.descripcion, t.prioridad, t.estado, 
                        t.fecha_creacion, t.fecha_cierre,
                        -- Cliente
                        u.id AS cliente_id, u.nombre AS cliente_nombre, u.correo AS cliente_email,
                        -- Técnico
                        tec.id AS tecnico_id, u2.nombre AS tecnico_nombre, u2.correo AS tecnico_email,
                        -- Categoría
                        c.id AS categoria_id, c.nombre AS categoria_nombre,
                        -- SLA
                        s.tiempo_respuesta AS sla_respuesta_minutos,
                        s.tiempo_resolucion AS sla_resolucion_minutos
                     FROM tickets t
                     LEFT JOIN usuarios u ON t.cliente_id = u.id
                     LEFT JOIN tecnicos tec ON t.tecnico_id = tec.id
                     LEFT JOIN usuarios u2 ON tec.usuario_id = u2.id
                     LEFT JOIN categorias c ON t.categoria_id = c.id
                     LEFT JOIN sla s ON t.sla_id = s.id
                     WHERE t.id = $id";
            
            $ticket = $this->enlace->ExecuteSQL($vSql, 'asoc');
            if (empty($ticket)) return null;
            $ticket = $ticket[0];

            // Calcular días de resolución
            if ($ticket['fecha_cierre']) {
                $fecha_creacion = new DateTime($ticket['fecha_creacion']);
                $fecha_cierre = new DateTime($ticket['fecha_cierre']);
                $ticket['dias_resolucion'] = $fecha_cierre->diff($fecha_creacion)->days;
            } else {
                $ticket['dias_resolucion'] = null;
            }

            // Calcular cumplimiento de SLA basándose en el historial
    
            $ticket['cumplimiento_respuesta'] = 'Pendiente';
            $ticket['cumplimiento_resolucion'] = 'Pendiente';

            // Obtener historial de estados (si existe la tabla)
            try {
                $historialSql = "SELECT h.estado_nuevo AS estado, h.fecha, h.observacion AS observaciones
                                FROM historial_tickets h
                                WHERE h.ticket_id = $id
                                ORDER BY h.fecha ASC";
                $ticket['historial'] = $this->enlace->ExecuteSQL($historialSql, 'asoc');
                
                // Calcular cumplimiento basándose en el historial
                if (!empty($ticket['historial'])) {
                    $fecha_creacion = new DateTime($ticket['fecha_creacion']);
                    
                    // Buscar primera respuesta (primer cambio después de pendiente)
                    $primera_respuesta = null;
                    foreach ($ticket['historial'] as $cambio) {
                        if ($cambio['estado'] !== 'pendiente') {
                            $primera_respuesta = new DateTime($cambio['fecha']);
                            break;
                        }
                    }
                    
                    // Calcular cumplimiento de respuesta
                    if ($primera_respuesta && $ticket['sla_respuesta_minutos']) {
                        $minutos_transcurridos = ($primera_respuesta->getTimestamp() - $fecha_creacion->getTimestamp()) / 60;
                        $ticket['cumplimiento_respuesta'] = $minutos_transcurridos <= $ticket['sla_respuesta_minutos'] ? 'Cumplido' : 'Incumplido';
                    }
                    
                    // Buscar fecha de resolución (cuando llega a resuelto o cerrado)
                    $fecha_resolucion = null;
                    foreach ($ticket['historial'] as $cambio) {
                        if ($cambio['estado'] === 'resuelto' || $cambio['estado'] === 'cerrado') {
                            $fecha_resolucion = new DateTime($cambio['fecha']);
                            break;
                        }
                    }
                    
                    // Calcular cumplimiento de resolución
                    if ($fecha_resolucion && $ticket['sla_resolucion_minutos']) {
                        $minutos_transcurridos = ($fecha_resolucion->getTimestamp() - $fecha_creacion->getTimestamp()) / 60;
                        $ticket['cumplimiento_resolucion'] = $minutos_transcurridos <= $ticket['sla_resolucion_minutos'] ? 'Cumplido' : 'Incumplido';
                    }
                }
            } catch (Exception $e) {
                $ticket['historial'] = [];
            }

            // Obtener imágenes/evidencias (si existe la tabla)
            try {
                $imagenesSql = "SELECT id, ruta, nombre_archivo
                               FROM imagenes
                               WHERE ticket_id = $id
                               ORDER BY id ASC";
                $ticket['imagenes'] = $this->enlace->ExecuteSQL($imagenesSql, 'asoc');
            } catch (Exception $e) {
                $ticket['imagenes'] = [];
            }

            // Obtener valoración (si existe la tabla)
            try {
                $valoracionSql = "SELECT puntuacion, comentario, fecha
                                 FROM valoraciones
                                 WHERE ticket_id = $id
                                 LIMIT 1";
                $valoracion = $this->enlace->ExecuteSQL($valoracionSql, 'asoc');
                $ticket['valoracion'] = !empty($valoracion) ? $valoracion[0] : null;
            } catch (Exception $e) {
                $ticket['valoracion'] = null;
            }

            // Estructurar datos como objetos anidados para el frontend
            $resultado = [
                'id' => $ticket['id'],
                'titulo' => $ticket['titulo'],
                'descripcion' => $ticket['descripcion'],
                'prioridad' => $ticket['prioridad'],
                'estado' => $ticket['estado'],
                'fecha_creacion' => $ticket['fecha_creacion'],
                'fecha_cierre' => $ticket['fecha_cierre'],
                'dias_resolucion' => $ticket['dias_resolucion'],
                'cliente' => [
                    'id' => $ticket['cliente_id'],
                    'nombre' => $ticket['cliente_nombre'],
                    'correo' => $ticket['cliente_email']
                ],
                'tecnico' => $ticket['tecnico_id'] ? [
                    'id' => $ticket['tecnico_id'],
                    'nombre' => $ticket['tecnico_nombre'],
                    'correo' => $ticket['tecnico_email']
                ] : null,
                'categoria' => $ticket['categoria_id'] ? [
                    'id' => $ticket['categoria_id'],
                    'nombre' => $ticket['categoria_nombre']
                ] : null,
                'sla' => [
                    'tiempo_respuesta' => $ticket['sla_respuesta_minutos'],
                    'tiempo_resolucion' => $ticket['sla_resolucion_minutos']
                ],
                'cumplimiento_respuesta' => $ticket['cumplimiento_respuesta'],
                'cumplimiento_resolucion' => $ticket['cumplimiento_resolucion'],
                'historial' => $ticket['historial'] ?? [],
                'imagenes' => $ticket['imagenes'] ?? [],
                'valoracion' => $ticket['valoracion']
            ];

            return $resultado;
        } catch (Exception $e) {
            handleException($e);
            return null;
        }
    }

    /**
     * Calcula el tiempo restante de SLA para un ticket
     * @param array $ticket - Ticket con fecha_creacion, sla_respuesta_minutos, sla_resolucion_minutos, estado
     * @return array - ['porcentaje' => float, 'color' => string, 'texto' => string]
     */
    private function calcularSLARestante($ticket)
    {
        try {
            // Si no hay SLA configurado, retornar valores por defecto
            if (!isset($ticket['sla_respuesta_minutos']) || !isset($ticket['sla_resolucion_minutos'])) {
                return [
                    'porcentaje' => 0,
                    'color' => 'default',
                    'texto' => 'Sin SLA'
                ];
            }

            // Calcular minutos transcurridos desde la creación
            $fechaCreacion = new DateTime($ticket['fecha_creacion']);
            $ahora = new DateTime();
            $minutosTranscurridos = ($ahora->getTimestamp() - $fechaCreacion->getTimestamp()) / 60;

            // Determinar qué SLA usar según el estado del ticket
            $estado = strtolower($ticket['estado']);
            $slaLimite = 0;
            
            if ($estado === 'pendiente' || $estado === 'asignado') {
                // Para tickets pendientes o asignados, usar SLA de respuesta
                $slaLimite = $ticket['sla_respuesta_minutos'];
            } elseif ($estado === 'en_proceso' || $estado === 'en proceso') {
                // Para tickets en proceso, usar SLA de resolución
                $slaLimite = $ticket['sla_resolucion_minutos'];
            } elseif ($estado === 'resuelto' || $estado === 'cerrado') {
                // Para tickets cerrados, mostrar que se completó
                return [
                    'porcentaje' => 100,
                    'color' => 'success',
                    'texto' => 'Completado'
                ];
            }

            if ($slaLimite <= 0) {
                return [
                    'porcentaje' => 0,
                    'color' => 'default',
                    'texto' => 'Sin SLA'
                ];
            }

            // Calcular porcentaje de tiempo consumido
            $porcentaje = ($minutosTranscurridos / $slaLimite) * 100;

            // Calcular tiempo restante
            $minutosRestantes = $slaLimite - $minutosTranscurridos;

            // Determinar color según porcentaje
            $color = 'success'; 
            if ($porcentaje >= 80) {
                $color = 'error'; 
            } elseif ($porcentaje >= 50) {
                $color = 'warning'; 
            }

            
            $texto = '';
            if ($minutosRestantes > 0) {
                $horas = (int)floor($minutosRestantes / 60);
                $minutos = (int)fmod(floor($minutosRestantes), 60);
                
                if ($horas > 0) {
                    $texto = $horas . ' hr' . ($horas > 1 ? 's' : '') . ' ' . $minutos . ' min';
                } else {
                    $texto = $minutos . ' min';
                }
            } else {
                // SLA vencido
                $minutosVencidos = abs($minutosRestantes);
                $horas = (int)floor($minutosVencidos / 60);
                $minutos = (int)fmod(floor($minutosVencidos), 60);
                
                if ($horas > 0) {
                    $texto = 'Vencido: ' . $horas . ' hr' . ($horas > 1 ? 's' : '') . ' ' . $minutos . ' min';
                } else {
                    $texto = 'Vencido: ' . $minutos . ' min';
                }
                $color = 'error';
                $porcentaje = 100;
            }

            return [
                'porcentaje' => min($porcentaje, 100),
                'color' => $color,
                'texto' => $texto
            ];

        } catch (Exception $e) {
            handleException($e);
            return [
                'porcentaje' => 0,
                'color' => 'default',
                'texto' => 'Error al calcular'
            ];
        }
    }
}
