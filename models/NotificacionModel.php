<?php

class NotificacionModel
{
    private $enlace;

    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }

    /**
     * Crear una nueva notificación
     * 
     * CUMPLE REQUISITOS:
     * - Almacenamiento en BD (persistencia)
     * - Información completa (tipo, fecha, descripción, usuario)
     * - Estado de lectura (leida = 0 por defecto)
     * - Trazabilidad (datos_adicionales con evento_origen)
     * 
     * @param int $usuario_id ID del usuario receptor
     * @param string $tipo Tipo de notificación (ticket_cambio_estado, inicio_sesion, etc.)
     * @param string $titulo Título descriptivo corto
     * @param string $mensaje Descripción completa del evento
     * @param array $datos_adicionales Datos estructurados del evento (JSON)
     * @return array Resultado de la operación
     */
    public function crear($usuario_id, $tipo, $titulo, $mensaje, $datos_adicionales = null)
    {
        try {
            // VALIDACIÓN 1: Datos obligatorios
            if (empty($usuario_id) || empty($tipo) || empty($titulo) || empty($mensaje)) {
                error_log("Notificación rechazada: datos obligatorios faltantes");
                return [
                    'success' => false,
                    'message' => 'Datos obligatorios faltantes (usuario_id, tipo, titulo, mensaje)'
                ];
            }
            
            // VALIDACIÓN 2: Tipo de notificación válido
            $tipos_validos = [
                'ticket_cambio_estado',
                'inicio_sesion',
                'ticket_asignado',
                'ticket_resuelto',
                'sla_proximo_vencer',
                'comentario_nuevo',
                'escalamiento'
            ];
            
            if (!in_array($tipo, $tipos_validos)) {
                error_log("Tipo de notificación inválido: $tipo");
                $tipo = 'ticket_cambio_estado'; // Fallback seguro
            }
            
            // TRAZABILIDAD: Agregar metadatos del evento
            if (is_array($datos_adicionales)) {
                // Agregar timestamp del evento
                $datos_adicionales['timestamp_evento'] = date('Y-m-d H:i:s');
                
                // Agregar información del sistema
                $datos_adicionales['sistema'] = [
                    'version' => '1.0.0',
                    'modulo' => 'GESTEC-Notificaciones'
                ];
                
                // Si viene de un evento específico, registrarlo
                if (!isset($datos_adicionales['evento_origen'])) {
                    $datos_adicionales['evento_origen'] = $tipo;
                }
            } else {
                // Crear estructura mínima si no hay datos adicionales
                $datos_adicionales = [
                    'timestamp_evento' => date('Y-m-d H:i:s'),
                    'evento_origen' => $tipo,
                    'sistema' => [
                        'version' => '1.0.0',
                        'modulo' => 'GESTEC-Notificaciones'
                    ]
                ];
            }
            
            // Convertir datos adicionales a JSON
            $datos_json = json_encode($datos_adicionales, JSON_UNESCAPED_UNICODE);
            if ($datos_json === false) {
                error_log("Error al codificar JSON: " . json_last_error_msg());
                $datos_json = 'NULL';
            } else {
                $datos_json = "'" . addslashes($datos_json) . "'";
            }
            
            // Sanitizar entrada
            $titulo = addslashes($titulo);
            $mensaje = addslashes($mensaje);
            
            // INSERCIÓN EN BD (PERSISTENCIA)
            $sql = "INSERT INTO notificaciones 
                    (usuario_id, tipo, titulo, mensaje, datos_adicionales, leida, fecha_creacion)
                    VALUES 
                    ($usuario_id, '$tipo', '$titulo', '$mensaje', $datos_json, 0, NOW())";
            
            $this->enlace->executeSQL_DML($sql);
            
            // AUDITORÍA: Log exitoso
            error_log("[NOTIFICACIÓN CREADA] Usuario: $usuario_id, Tipo: $tipo, Título: $titulo");
            
            return [
                'success' => true,
                'message' => 'Notificación creada exitosamente',
                'detalles' => [
                    'usuario_id' => $usuario_id,
                    'tipo' => $tipo,
                    'timestamp' => date('Y-m-d H:i:s')
                ]
            ];
            
        } catch (Exception $e) {
            error_log("[ERROR NOTIFICACIÓN] Usuario: $usuario_id, Error: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Error al crear notificación: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Notificar cambio de estado de ticket
     * 
     * CUMPLE REQUISITOS:
     * - Asociación directa al evento (ticket_id, estado_anterior, estado_nuevo)
     * - Información completa (tipo, fecha automática, descripción detallada, usuarios)
     * - Trazabilidad (historial de cambios, responsable identificado)
     * - Persistencia en BD (tabla notificaciones)
     * 
     * @param int $ticket_id ID del ticket que cambió
     * @param string $estado_anterior Estado previo
     * @param string $estado_nuevo Estado actual
     * @param string $responsable_nombre Usuario que realizó el cambio
     * @param string $comentario Justificación del cambio
     * @return array Resultado de la operación
     */
    public function notificarCambioEstado($ticket_id, $estado_anterior, $estado_nuevo, $responsable_nombre, $comentario = '')
    {
        try {
            // PASO 1: Obtener información COMPLETA del ticket
            $sqlTicket = "SELECT t.id, t.titulo, t.descripcion, t.prioridad, t.categoria_id,
                                 t.usuario_id, t.fecha_creacion,
                                 c.nombre AS categoria_nombre,
                                 u.nombre AS cliente_nombre, u.email AS cliente_email
                          FROM tickets t
                          LEFT JOIN categorias c ON t.categoria_id = c.id
                          LEFT JOIN usuarios u ON t.usuario_id = u.id
                          WHERE t.id = $ticket_id";
            
            $ticket = $this->enlace->ExecuteSQL($sqlTicket, 'asoc');
            
            if (empty($ticket)) {
                error_log("[NOTIFICACIÓN FALLIDA] Ticket $ticket_id no encontrado");
                return ['success' => false, 'message' => 'Ticket no encontrado'];
            }
            
            $ticket = $ticket[0];
            
            // PASO 2: Obtener usuarios involucrados (cliente + técnico asignado)
            $sqlUsuarios = "SELECT DISTINCT u.id, u.nombre, u.email, u.rol
                           FROM usuarios u
                           WHERE u.id IN (
                               SELECT t.usuario_id FROM tickets t WHERE t.id = $ticket_id
                               UNION
                               SELECT tec.usuario_id FROM tecnicos tec
                               INNER JOIN tickets ti ON ti.tecnico_id = tec.id
                               WHERE ti.id = $ticket_id
                           )";
            
            $usuarios = $this->enlace->ExecuteSQL($sqlUsuarios, 'asoc');
            
            if (empty($usuarios)) {
                error_log("[ADVERTENCIA] No se encontraron usuarios para notificar en ticket $ticket_id");
            }
            
            // PASO 3: Construir información COMPLETA de la notificación
            $titulo = "Ticket #{$ticket_id} cambió de estado";
            $mensaje = "El ticket #{$ticket_id} '{$ticket['titulo']}' cambió de '$estado_anterior' a '$estado_nuevo'. " .
                      "Responsable: $responsable_nombre. " .
                      ($comentario ? "Motivo: $comentario" : "Sin comentarios adicionales.");
            
            // TRAZABILIDAD COMPLETA: Todos los datos del evento
            $datos_adicionales = [
                // Identificación del evento
                'evento_origen' => 'ticket_cambio_estado',
                'evento_id' => $ticket_id,
                'evento_tipo' => 'cambio_estado',
                
                // Datos del ticket
                'ticket_id' => (int)$ticket_id,
                'ticket_titulo' => $ticket['titulo'],
                'ticket_descripcion' => substr($ticket['descripcion'], 0, 200), // Primeros 200 chars
                'ticket_prioridad' => $ticket['prioridad'],
                'ticket_categoria' => $ticket['categoria_nombre'],
                'ticket_fecha_creacion' => $ticket['fecha_creacion'],
                
                // Cambio de estado
                'estado_anterior' => $estado_anterior,
                'estado_nuevo' => $estado_nuevo,
                'fecha_cambio' => date('Y-m-d H:i:s'),
                
                // Responsable del cambio
                'responsable' => $responsable_nombre,
                'comentario' => $comentario,
                
                // Cliente
                'cliente_nombre' => $ticket['cliente_nombre'],
                'cliente_email' => $ticket['cliente_email'],
                
                // Navegación
                'url_ticket' => "/ticket/{$ticket_id}",
                'accion_recomendada' => 'Ver detalles del ticket'
            ];
            
            // PASO 4: Crear notificación para CADA usuario involucrado
            $notificaciones_creadas = 0;
            $detalles_notificaciones = [];
            
            foreach ($usuarios as $usuario) {
                $resultado = $this->crear(
                    $usuario['id'],
                    'ticket_cambio_estado',
                    $titulo,
                    $mensaje,
                    $datos_adicionales
                );
                
                if ($resultado['success']) {
                    $notificaciones_creadas++;
                    $detalles_notificaciones[] = [
                        'usuario_id' => $usuario['id'],
                        'usuario_nombre' => $usuario['nombre'],
                        'usuario_rol' => $usuario['rol']
                    ];
                    
                    error_log("[NOTIFICACIÓN ENVIADA] Ticket: $ticket_id, Usuario: {$usuario['nombre']} ({$usuario['rol']}), Estado: $estado_anterior → $estado_nuevo");
                }
            }
            
            // AUDITORÍA: Registro completo del evento
            error_log("[EVENTO NOTIFICADO] Ticket: $ticket_id, Tipo: Cambio de estado, Notificaciones creadas: $notificaciones_creadas, Responsable: $responsable_nombre");
            
            return [
                'success' => true,
                'message' => "Se crearon $notificaciones_creadas notificaciones para el cambio de estado",
                'detalles' => [
                    'ticket_id' => $ticket_id,
                    'estado_anterior' => $estado_anterior,
                    'estado_nuevo' => $estado_nuevo,
                    'usuarios_notificados' => count($usuarios),
                    'notificaciones_creadas' => $notificaciones_creadas,
                    'timestamp' => date('Y-m-d H:i:s'),
                    'usuarios' => $detalles_notificaciones
                ]
            ];
            
        } catch (Exception $e) {
            error_log("[ERROR CRÍTICO] Notificación cambio estado ticket $ticket_id: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Error al notificar cambio de estado: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Notificar inicio de sesión
     */
    public function notificarInicioSesion($usuario_id, $ip_address = null, $user_agent = null)
    {
        try {
            // Registrar en tabla de sesiones_log
            $ip = $ip_address ? "'$ip_address'" : 'NULL';
            $agent = $user_agent ? "'" . addslashes($user_agent) . "'" : 'NULL';
            
            $sqlLog = "INSERT INTO sesiones_log (usuario_id, fecha_hora, ip_address, user_agent, exitoso)
                      VALUES ($usuario_id, NOW(), $ip, $agent, 1)";
            
            $this->enlace->executeSQL_DML($sqlLog);
            
            // Obtener información del usuario
            $sqlUsuario = "SELECT nombre, email FROM usuarios WHERE id = $usuario_id";
            $usuario = $this->enlace->ExecuteSQL($sqlUsuario, 'asoc');
            
            if (empty($usuario)) {
                return ['success' => false, 'message' => 'Usuario no encontrado'];
            }
            
            $usuario = $usuario[0];
            
            // Crear notificación para el usuario
            $fecha_hora = date('Y-m-d H:i:s');
            $titulo = "Inicio de sesión registrado";
            $mensaje = "Has iniciado sesión en el sistema el $fecha_hora" . 
                      ($ip_address ? " desde la IP: $ip_address" : "");
            
            $datos_adicionales = [
                'fecha_hora' => $fecha_hora,
                'ip_address' => $ip_address,
                'user_agent' => $user_agent
            ];
            
            $resultado = $this->crear(
                $usuario_id,
                'inicio_sesion',
                $titulo,
                $mensaje,
                $datos_adicionales
            );
            
            return [
                'success' => true,
                'message' => 'Inicio de sesión registrado y notificado',
                'log_id' => $this->enlace->lastInsertId()
            ];
            
        } catch (Exception $e) {
            error_log("Error al notificar inicio de sesión: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Error al registrar inicio de sesión: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Obtener notificaciones de un usuario
     * 
     * CUMPLE REQUISITOS:
     * - Acceso desde panel de notificaciones
     * - Información completa con todos los metadatos
     * - Estado de lectura visible (leida / no leída)
     * - Ordenamiento cronológico (más recientes primero)
     * - Filtrado por estado (solo no leídas opcional)
     * 
     * @param int $usuario_id ID del usuario
     * @param bool $solo_no_leidas Filtrar solo no leídas
     * @param int $limit Límite de resultados
     * @return array Notificaciones con información completa
     */
    public function obtenerPorUsuario($usuario_id, $solo_no_leidas = false, $limit = 50)
    {
        try {
            // VALIDACIÓN
            if (empty($usuario_id)) {
                return [
                    'success' => false,
                    'message' => 'Usuario ID requerido',
                    'notificaciones' => []
                ];
            }
            
            // Construir filtros
            $where_leida = $solo_no_leidas ? "AND leida = 0" : "";
            
            // CONSULTA COMPLETA: Obtener toda la información
            $sql = "SELECT 
                        n.id,
                        n.usuario_id,
                        n.tipo,
                        n.titulo,
                        n.mensaje,
                        n.datos_adicionales,
                        n.leida,
                        n.fecha_creacion,
                        n.fecha_lectura,
                        u.nombre AS usuario_nombre,
                        u.email AS usuario_email,
                        u.rol AS usuario_rol
                   FROM notificaciones n
                   INNER JOIN usuarios u ON n.usuario_id = u.id
                   WHERE n.usuario_id = $usuario_id
                   $where_leida
                   ORDER BY n.fecha_creacion DESC
                   LIMIT $limit";
            
            $notificaciones = $this->enlace->ExecuteSQL($sql, 'asoc');
            
            if (empty($notificaciones)) {
                return [
                    'success' => true,
                    'message' => 'No hay notificaciones',
                    'notificaciones' => [],
                    'total' => 0,
                    'no_leidas' => 0
                ];
            }
            
            // ENRIQUECER DATOS: Decodificar JSON y agregar metadatos útiles
            $no_leidas_count = 0;
            foreach ($notificaciones as &$notif) {
                // Decodificar datos adicionales JSON
                if ($notif['datos_adicionales']) {
                    $notif['datos_adicionales'] = json_decode($notif['datos_adicionales'], true);
                } else {
                    $notif['datos_adicionales'] = [];
                }
                
                // Agregar información de tiempo relativo para UI
                $fecha = new DateTime($notif['fecha_creacion']);
                $ahora = new DateTime();
                $diff = $ahora->diff($fecha);
                
                if ($diff->days == 0) {
                    if ($diff->h == 0) {
                        $tiempo_relativo = $diff->i <= 1 ? "Hace 1 minuto" : "Hace {$diff->i} minutos";
                    } else {
                        $tiempo_relativo = $diff->h == 1 ? "Hace 1 hora" : "Hace {$diff->h} horas";
                    }
                } else if ($diff->days == 1) {
                    $tiempo_relativo = "Ayer";
                } else if ($diff->days < 7) {
                    $tiempo_relativo = "Hace {$diff->days} días";
                } else {
                    $tiempo_relativo = $fecha->format('d/m/Y');
                }
                
                $notif['tiempo_relativo'] = $tiempo_relativo;
                
                // Agregar icono recomendado según tipo (para UI)
                $notif['icono_sugerido'] = $this->obtenerIconoPorTipo($notif['tipo']);
                
                // Agregar color recomendado según tipo
                $notif['color_sugerido'] = $this->obtenerColorPorTipo($notif['tipo']);
                
                // Contar no leídas
                if ($notif['leida'] == 0) {
                    $no_leidas_count++;
                }
                
                // Agregar URL de acción si existe
                if (isset($notif['datos_adicionales']['url_ticket'])) {
                    $notif['url_accion'] = $notif['datos_adicionales']['url_ticket'];
                } else if (isset($notif['datos_adicionales']['ticket_id'])) {
                    $notif['url_accion'] = "/ticket/{$notif['datos_adicionales']['ticket_id']}";
                } else {
                    $notif['url_accion'] = null;
                }
            }
            
            // AUDITORÍA
            error_log("[NOTIFICACIONES CONSULTADAS] Usuario: $usuario_id, Total: " . count($notificaciones) . ", No leídas: $no_leidas_count");
            
            return [
                'success' => true,
                'message' => 'Notificaciones obtenidas exitosamente',
                'notificaciones' => $notificaciones,
                'total' => count($notificaciones),
                'no_leidas' => $no_leidas_count,
                'usuario' => [
                    'id' => $usuario_id,
                    'nombre' => $notificaciones[0]['usuario_nombre'] ?? 'Desconocido',
                    'rol' => $notificaciones[0]['usuario_rol'] ?? 'Desconocido'
                ]
            ];
            
        } catch (Exception $e) {
            error_log("Error al obtener notificaciones: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Error al obtener notificaciones: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Marcar notificación como leída con validación de pertenencia
     * 
     * SEGURIDAD: Valida que el usuario solo pueda marcar sus propias notificaciones
     * TRAZABILIDAD: Registra fecha_lectura exacta
     * ACTUALIZACIÓN: Retorna estado actualizado para UI en tiempo real
     * 
     * @param int $notificacion_id ID de la notificación
     * @param int $usuario_id ID del usuario que marca como leída
     * @return array Resultado con success, message y detalles
     */
    public function marcarComoLeida($notificacion_id, $usuario_id)
    {
        try {
            // VALIDACIÓN 1: Verificar que los parámetros son válidos
            if (empty($notificacion_id) || empty($usuario_id)) {
                error_log("[VALIDACIÓN RECHAZADA] Parámetros inválidos - Notificación: $notificacion_id, Usuario: $usuario_id");
                return [
                    'success' => false,
                    'message' => 'Parámetros inválidos',
                    'code' => 'INVALID_PARAMS'
                ];
            }
            
            // VALIDACIÓN 2: Verificar que la notificación existe y pertenece al usuario
            $sql_verificar = "SELECT id, usuario_id, leida, fecha_lectura, titulo 
                             FROM notificaciones 
                             WHERE id = $notificacion_id";
            
            $notificacion = $this->enlace->ExecuteSQL_QueryOne($sql_verificar);
            
            if (!$notificacion) {
                error_log("[NOTIFICACIÓN NO ENCONTRADA] ID: $notificacion_id solicitado por Usuario: $usuario_id");
                return [
                    'success' => false,
                    'message' => 'Notificación no encontrada',
                    'code' => 'NOT_FOUND'
                ];
            }
            
            // VALIDACIÓN 3: Verificar pertenencia (SEGURIDAD CRÍTICA)
            if ((int)$notificacion['usuario_id'] !== (int)$usuario_id) {
                error_log("[ACCESO DENEGADO] Usuario $usuario_id intentó modificar notificación $notificacion_id que pertenece a Usuario {$notificacion['usuario_id']}");
                return [
                    'success' => false,
                    'message' => 'No tienes permiso para modificar esta notificación',
                    'code' => 'FORBIDDEN'
                ];
            }
            
            // VALIDACIÓN 4: Verificar si ya está leída
            if ((int)$notificacion['leida'] === 1) {
                error_log("[YA LEÍDA] Notificación $notificacion_id ya marcada como leída el {$notificacion['fecha_lectura']}");
                return [
                    'success' => true,
                    'message' => 'Notificación ya estaba marcada como leída',
                    'code' => 'ALREADY_READ',
                    'detalles' => [
                        'notificacion_id' => $notificacion_id,
                        'leida' => true,
                        'fecha_lectura' => $notificacion['fecha_lectura']
                    ]
                ];
            }
            
            // ACTUALIZACIÓN: Marcar como leída con timestamp exacto
            $sql_actualizar = "UPDATE notificaciones 
                              SET leida = 1, 
                                  fecha_lectura = NOW()
                              WHERE id = $notificacion_id 
                              AND usuario_id = $usuario_id";
            
            $this->enlace->executeSQL_DML($sql_actualizar);
            
            // Obtener timestamp actualizado para retornar
            $sql_timestamp = "SELECT fecha_lectura FROM notificaciones WHERE id = $notificacion_id";
            $timestamp = $this->enlace->ExecuteSQL_QueryOne($sql_timestamp);
            
            // LOG DE ÉXITO
            error_log("[NOTIFICACIÓN MARCADA LEÍDA] ID: $notificacion_id, Usuario: $usuario_id, Timestamp: {$timestamp['fecha_lectura']}, Título: {$notificacion['titulo']}");
            
            return [
                'success' => true,
                'message' => 'Notificación marcada como leída',
                'code' => 'SUCCESS',
                'detalles' => [
                    'notificacion_id' => $notificacion_id,
                    'leida' => true,
                    'fecha_lectura' => $timestamp['fecha_lectura'],
                    'titulo' => $notificacion['titulo']
                ]
            ];
            
        } catch (Exception $e) {
            error_log("[ERROR CRÍTICO] Al marcar notificación $notificacion_id: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Error al marcar notificación: ' . $e->getMessage(),
                'code' => 'ERROR'
            ];
        }
    }

    /**
     * Marcar todas las notificaciones no leídas como leídas
     * 
     * SEGURIDAD: Solo marca notificaciones del usuario autenticado
     * TRAZABILIDAD: Registra timestamp de lectura masiva
     * ACTUALIZACIÓN: Retorna cantidad actualizada
     * 
     * @param int $usuario_id ID del usuario
     * @return array Resultado con success, message y cantidad actualizada
     */
    public function marcarTodasComoLeidas($usuario_id)
    {
        try {
            // VALIDACIÓN: Verificar usuario válido
            if (empty($usuario_id)) {
                error_log("[VALIDACIÓN RECHAZADA] Usuario inválido en marcar todas");
                return [
                    'success' => false,
                    'message' => 'Usuario inválido',
                    'code' => 'INVALID_USER'
                ];
            }
            
            // Contar notificaciones no leídas antes de actualizar
            $sql_contar = "SELECT COUNT(*) as total 
                          FROM notificaciones 
                          WHERE usuario_id = $usuario_id 
                          AND leida = 0";
            
            $contador = $this->enlace->ExecuteSQL_QueryOne($sql_contar);
            $total_no_leidas = (int)$contador['total'];
            
            // Si no hay notificaciones por marcar
            if ($total_no_leidas === 0) {
                error_log("[SIN NOTIFICACIONES] Usuario $usuario_id no tiene notificaciones no leídas");
                return [
                    'success' => true,
                    'message' => 'No hay notificaciones pendientes',
                    'code' => 'NO_PENDING',
                    'detalles' => [
                        'cantidad_actualizada' => 0,
                        'no_leidas_restantes' => 0
                    ]
                ];
            }
            
            // ACTUALIZACIÓN MASIVA: Solo notificaciones del usuario y no leídas
            $sql_actualizar = "UPDATE notificaciones 
                              SET leida = 1, 
                                  fecha_lectura = NOW()
                              WHERE usuario_id = $usuario_id 
                              AND leida = 0";
            
            $this->enlace->executeSQL_DML($sql_actualizar);
            
            // Verificar que todas se marcaron correctamente
            $sql_verificar = "SELECT COUNT(*) as restantes 
                             FROM notificaciones 
                             WHERE usuario_id = $usuario_id 
                             AND leida = 0";
            
            $verificacion = $this->enlace->ExecuteSQL_QueryOne($sql_verificar);
            $restantes = (int)$verificacion['restantes'];
            
            // LOG DE ÉXITO
            error_log("[MARCADO MASIVO] Usuario: $usuario_id, Actualizadas: $total_no_leidas, Restantes: $restantes");
            
            return [
                'success' => true,
                'message' => "Se marcaron $total_no_leidas notificaciones como leídas",
                'code' => 'SUCCESS',
                'detalles' => [
                    'cantidad_actualizada' => $total_no_leidas,
                    'no_leidas_restantes' => $restantes,
                    'timestamp' => date('Y-m-d H:i:s')
                ]
            ];
            
        } catch (Exception $e) {
            error_log("[ERROR CRÍTICO] Al marcar todas las notificaciones del Usuario $usuario_id: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Error al marcar notificaciones: ' . $e->getMessage(),
                'code' => 'ERROR'
            ];
        }
    }

    /**
     * Contar notificaciones no leídas
     */
    public function contarNoLeidas($usuario_id)
    {
        try {
            $sql = "SELECT COUNT(*) as total
                   FROM notificaciones
                   WHERE usuario_id = $usuario_id
                   AND leida = 0";
            
            $resultado = $this->enlace->ExecuteSQL($sql, 'asoc');
            
            return [
                'success' => true,
                'total_no_leidas' => (int)$resultado[0]['total']
            ];
            
        } catch (Exception $e) {
            error_log("Error al contar notificaciones: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Error al contar notificaciones: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Eliminar notificación
     */
    public function eliminar($notificacion_id, $usuario_id)
    {
        try {
            $sql = "DELETE FROM notificaciones 
                   WHERE id = $notificacion_id 
                   AND usuario_id = $usuario_id";
            
            $this->enlace->executeSQL_DML($sql);
            
            return [
                'success' => true,
                'message' => 'Notificación eliminada'
            ];
            
        } catch (Exception $e) {
            error_log("Error al eliminar notificación: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Error al eliminar notificación: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Obtener historial de inicios de sesión
     */
    public function obtenerHistorialSesiones($usuario_id, $limit = 20)
    {
        try {
            $sql = "SELECT id, fecha_hora, ip_address, user_agent, exitoso
                   FROM sesiones_log
                   WHERE usuario_id = $usuario_id
                   ORDER BY fecha_hora DESC
                   LIMIT $limit";
            
            $sesiones = $this->enlace->ExecuteSQL($sql, 'asoc');
            
            return [
                'success' => true,
                'sesiones' => $sesiones,
                'total' => count($sesiones)
            ];
            
        } catch (Exception $e) {
            error_log("Error al obtener historial: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Error al obtener historial: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Obtener icono recomendado según tipo de notificación
     * Para facilitar el diseño intuitivo del panel
     */
    private function obtenerIconoPorTipo($tipo)
    {
        $iconos = [
            'ticket_cambio_estado' => 'ConfirmationNumberIcon',
            'inicio_sesion' => 'LoginIcon',
            'ticket_asignado' => 'AssignmentIcon',
            'ticket_resuelto' => 'CheckCircleIcon',
            'sla_proximo_vencer' => 'WarningIcon',
            'comentario_nuevo' => 'CommentIcon',
            'escalamiento' => 'TrendingUpIcon'
        ];
        
        return $iconos[$tipo] ?? 'NotificationsIcon';
    }

    /**
     * Obtener color recomendado según tipo de notificación
     * Para facilitar la navegación visual del panel
     */
    private function obtenerColorPorTipo($tipo)
    {
        $colores = [
            'ticket_cambio_estado' => 'primary',
            'inicio_sesion' => 'success',
            'ticket_asignado' => 'info',
            'ticket_resuelto' => 'success',
            'sla_proximo_vencer' => 'warning',
            'comentario_nuevo' => 'default',
            'escalamiento' => 'error'
        ];
        
        return $colores[$tipo] ?? 'default';
    }

    /**
     * Obtener estadísticas completas de notificaciones del usuario
     * Útil para dashboards y reportes
     */
    public function obtenerEstadisticas($usuario_id)
    {
        try {
            // Total de notificaciones
            $sqlTotal = "SELECT COUNT(*) as total FROM notificaciones WHERE usuario_id = $usuario_id";
            $total = $this->enlace->ExecuteSQL($sqlTotal, 'asoc');
            
            // No leídas
            $sqlNoLeidas = "SELECT COUNT(*) as total FROM notificaciones WHERE usuario_id = $usuario_id AND leida = 0";
            $noLeidas = $this->enlace->ExecuteSQL($sqlNoLeidas, 'asoc');
            
            // Por tipo
            $sqlPorTipo = "SELECT tipo, COUNT(*) as cantidad 
                          FROM notificaciones 
                          WHERE usuario_id = $usuario_id 
                          GROUP BY tipo 
                          ORDER BY cantidad DESC";
            $porTipo = $this->enlace->ExecuteSQL($sqlPorTipo, 'asoc');
            
            // Últimas 7 días
            $sqlUltimos7Dias = "SELECT DATE(fecha_creacion) as fecha, COUNT(*) as cantidad
                               FROM notificaciones
                               WHERE usuario_id = $usuario_id
                               AND fecha_creacion >= DATE_SUB(NOW(), INTERVAL 7 DAY)
                               GROUP BY DATE(fecha_creacion)
                               ORDER BY fecha DESC";
            $ultimos7Dias = $this->enlace->ExecuteSQL($sqlUltimos7Dias, 'asoc');
            
            return [
                'success' => true,
                'estadisticas' => [
                    'total_notificaciones' => (int)$total[0]['total'],
                    'no_leidas' => (int)$noLeidas[0]['total'],
                    'leidas' => (int)$total[0]['total'] - (int)$noLeidas[0]['total'],
                    'tasa_lectura' => $total[0]['total'] > 0 
                        ? round((($total[0]['total'] - $noLeidas[0]['total']) / $total[0]['total']) * 100, 2) 
                        : 0,
                    'por_tipo' => $porTipo,
                    'ultimos_7_dias' => $ultimos7Dias
                ]
            ];
            
        } catch (Exception $e) {
            error_log("Error al obtener estadísticas: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Error al obtener estadísticas: ' . $e->getMessage()
            ];
        }
    }
}
