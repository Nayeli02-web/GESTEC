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
                
                
                if (empty($tecnico)) {
                    return [];
                }
                
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
                        s.nombre AS sla_nombre,
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

            // Calcular fechas límite de SLA
            $ticket['sla_fecha_limite_respuesta'] = null;
            $ticket['sla_fecha_limite_resolucion'] = null;
            
            if ($ticket['fecha_creacion']) {
                $fecha_creacion = new DateTime($ticket['fecha_creacion']);
                
                // Calcular fecha límite de respuesta (fecha_creacion + tiempo_respuesta en horas)
                if ($ticket['sla_respuesta_minutos']) {
                    $fecha_limite_respuesta = clone $fecha_creacion;
                    $fecha_limite_respuesta->modify('+' . $ticket['sla_respuesta_minutos'] . ' hours');
                    $ticket['sla_fecha_limite_respuesta'] = $fecha_limite_respuesta->format('Y-m-d H:i:s');
                }
                
                // Calcular fecha límite de resolución (fecha_creacion + tiempo_resolucion en horas)
                if ($ticket['sla_resolucion_minutos']) {
                    $fecha_limite_resolucion = clone $fecha_creacion;
                    $fecha_limite_resolucion->modify('+' . $ticket['sla_resolucion_minutos'] . ' hours');
                    $ticket['sla_fecha_limite_resolucion'] = $fecha_limite_resolucion->format('Y-m-d H:i:s');
                }
            }

            // Calcular cumplimiento de SLA basándose en el historial
    
            $ticket['cumplimiento_respuesta'] = 'Pendiente';
            $ticket['cumplimiento_resolucion'] = 'Pendiente';

            // Obtener historial de estados (si existe la tabla)
            try {
                // Verificar si las columnas usuario_id e imagen_evidencia existen
                $checkColumnsSql = "SHOW COLUMNS FROM historial_tickets LIKE 'usuario_id'";
                $columnsExist = $this->enlace->ExecuteSQL($checkColumnsSql, 'asoc');
                
                if (!empty($columnsExist)) {
                    // Versión con columnas nuevas (después de migración)
                    $historialSql = "SELECT 
                                        h.id,
                                        h.estado_anterior,
                                        h.estado_nuevo AS estado, 
                                        h.fecha, 
                                        h.observacion,
                                        h.imagen_evidencia,
                                        u.id AS usuario_id,
                                        u.nombre AS usuario_nombre,
                                        u.correo AS usuario_email
                                    FROM historial_tickets h
                                    LEFT JOIN usuarios u ON h.usuario_id = u.id
                                    WHERE h.ticket_id = $id
                                    ORDER BY h.fecha ASC";
                } else {
                    // Versión sin columnas nuevas (antes de migración)
                    $historialSql = "SELECT 
                                        h.id,
                                        h.estado_anterior,
                                        h.estado_nuevo AS estado, 
                                        h.fecha, 
                                        h.observacion,
                                        NULL AS imagen_evidencia,
                                        NULL AS usuario_id,
                                        NULL AS usuario_nombre,
                                        NULL AS usuario_email
                                    FROM historial_tickets h
                                    WHERE h.ticket_id = $id
                                    ORDER BY h.fecha ASC";
                }
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
                    'nombre' => $ticket['sla_nombre'],
                    'tiempo_respuesta' => $ticket['sla_respuesta_minutos'],
                    'tiempo_resolucion' => $ticket['sla_resolucion_minutos'],
                    'fecha_limite_respuesta' => $ticket['sla_fecha_limite_respuesta'],
                    'fecha_limite_resolucion' => $ticket['sla_fecha_limite_resolucion']
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

    /**
     * Crear un nuevo ticket
     */
    public function create($datos)
    {
        try {
            $titulo = addslashes($datos->titulo ?? '');
            $descripcion = addslashes($datos->descripcion ?? '');
            $prioridad = addslashes($datos->prioridad ?? 'media');
            $cliente_id = (int)($datos->cliente_id ?? 0);
            $etiqueta_id = (int)($datos->etiqueta_id ?? 0);
            $tecnico_id = isset($datos->tecnico_id) && $datos->tecnico_id ? (int)$datos->tecnico_id : null;

            // Validaciones
            if (empty($titulo) || empty($cliente_id) || empty($etiqueta_id)) {
                return null;
            }

            // Obtener la categoría y SLA de la etiqueta seleccionada
            $etiquetaInfo = $this->enlace->ExecuteSQL(
                "SELECT categoria_id FROM etiquetas WHERE id = $etiqueta_id",
                'asoc'
            );

            if (empty($etiquetaInfo)) {
                return null;
            }

            $categoria_id = (int)$etiquetaInfo[0]['categoria_id'];

            // Obtener el SLA de la categoría
            $categoriaInfo = $this->enlace->ExecuteSQL(
                "SELECT sla_id FROM categorias WHERE id = $categoria_id",
                'asoc'
            );

            $sla_id = !empty($categoriaInfo) && $categoriaInfo[0]['sla_id'] 
                ? (int)$categoriaInfo[0]['sla_id'] 
                : null;

            // Insertar ticket
            $vSql = "INSERT INTO tickets (
                        titulo, 
                        descripcion, 
                        prioridad, 
                        estado, 
                        cliente_id, 
                        tecnico_id,
                        categoria_id, 
                        sla_id,
                        fecha_creacion
                    ) VALUES (
                        '$titulo',
                        '$descripcion',
                        '$prioridad',
                        'pendiente',
                        $cliente_id,
                        " . ($tecnico_id ? $tecnico_id : "NULL") . ",
                        $categoria_id,
                        " . ($sla_id ? $sla_id : "NULL") . ",
                        NOW()
                    )";

            $ticket_id = $this->enlace->executeSQL_DML_last($vSql);

            if ($ticket_id) {
                return $this->getDetalle($ticket_id);
            }

            return null;
        } catch (Exception $e) {
            handleException($e);
            return null;
        }
    }

    /**
     * Actualizar el estado de un ticket
     * @param int $id - ID del ticket
     * @param object $datos - Objeto con nuevoEstado, comentario, usuario_id, rol_usuario
     * @return array|null - Ticket actualizado o null si hay error
     */
    public function updateEstado($id, $datos)
    {
        try {
            $nuevoEstado = strtolower(trim($datos->nuevoEstado ?? ''));
            $comentario = addslashes(trim($datos->comentario ?? ''));
            $usuario_id = (int)($datos->usuario_id ?? 0);
            $imagen_evidencia = $datos->imagen_evidencia ?? null;
            $rol_usuario = isset($datos->rol_usuario) ? strtolower(trim($datos->rol_usuario)) : '';

            // Verificar si las columnas usuario_id e imagen_evidencia existen
            $checkColumnsSql = "SHOW COLUMNS FROM historial_tickets LIKE 'usuario_id'";
            $columnsExist = $this->enlace->ExecuteSQL($checkColumnsSql, 'asoc');
            $hasMigration = !empty($columnsExist);

            // Validaciones
            if (empty($nuevoEstado) || empty($comentario)) {
                throw new Exception('Estado y comentario son obligatorios');
            }

            // Validar usuario (solo si la migración está aplicada)
            if ($hasMigration && empty($usuario_id)) {
                throw new Exception('El usuario es obligatorio para registrar el cambio');
            }

            // Validar imagen de evidencia (solo si la migración está aplicada)
            if ($hasMigration && empty($imagen_evidencia)) {
                throw new Exception('La imagen de evidencia es obligatoria para registrar el cambio');
            }

            // Validar que el comentario tenga al menos 10 caracteres
            if (strlen($comentario) < 10) {
                throw new Exception('El comentario debe tener al menos 10 caracteres');
            }

            // Estados válidos
            $estadosValidos = ['pendiente', 'asignado', 'en_proceso', 'resuelto', 'cerrado'];
            if (!in_array($nuevoEstado, $estadosValidos)) {
                throw new Exception('Estado no válido');
            }

            // Obtener el ticket actual
            $ticketActual = $this->get($id);
            if (!$ticketActual) {
                throw new Exception('Ticket no encontrado');
            }

            $estadoActual = strtolower(trim($ticketActual['estado']));

            // Validar que el ticket no esté cerrado
            if ($estadoActual === 'cerrado') {
                throw new Exception('No se puede cambiar el estado de un ticket cerrado');
            }

            // *** VALIDACIÓN DE PERMISOS POR ROL ***
            // Normalizar rol
            $rol_usuario = str_replace(['técnico', 'tecnico'], 'tecnico', $rol_usuario);
            
            // RESTRICCIÓN 1: Solo CLIENTES y ADMINISTRADORES pueden cerrar tickets
            if ($nuevoEstado === 'cerrado') {
                if ($rol_usuario !== 'cliente' && $rol_usuario !== 'administrador') {
                    throw new Exception('Solo los clientes y administradores pueden cerrar tickets');
                }
            }
            
            // RESTRICCIÓN 2: Solo TÉCNICOS y ADMINISTRADORES pueden cambiar estados intermedios
            if (in_array($nuevoEstado, ['asignado', 'en_proceso', 'resuelto'])) {
                if ($rol_usuario !== 'tecnico' && $rol_usuario !== 'administrador') {
                    throw new Exception('Solo los técnicos y administradores pueden cambiar estados intermedios');
                }
            }

            // Validar flujo de estados
            // CLIENTES pueden cerrar tickets cuando están en "resuelto" (satisfechos con la solución)
            // TÉCNICOS/ADMINISTRADORES siguen el flujo normal
            $flujoEstados = [
                'pendiente' => ['asignado'],  // Solo puede pasar a asignado
                'asignado' => ['en_proceso'], // Solo puede pasar a en proceso
                'en_proceso' => ['resuelto'], // Solo puede pasar a resuelto
                'resuelto' => ['cerrado']     // Solo puede pasar a cerrado (CLIENTE confirma)
            ];

            $estadosPermitidos = $flujoEstados[$estadoActual] ?? [];
            if (!in_array($nuevoEstado, $estadosPermitidos)) {
                throw new Exception('No se puede cambiar al estado "' . $nuevoEstado . '" desde "' . $estadoActual . '". Estados permitidos: ' . implode(', ', $estadosPermitidos));
            }

            // Validar que tenga técnico asignado (excepto si está en pendiente o si es cliente cerrando ticket resuelto)
            $esCierrePorCliente = ($estadoActual === 'resuelto' && $nuevoEstado === 'cerrado');
            if ($estadoActual !== 'pendiente' && !$esCierrePorCliente && empty($ticketActual['tecnico_id'])) {
                throw new Exception('El ticket debe tener un técnico asignado para avanzar');
            }

            // Actualizar el estado del ticket
            $updateSql = "UPDATE tickets 
                         SET estado = '$nuevoEstado'";
            
            // Si pasa a cerrado, registrar fecha de cierre
            if ($nuevoEstado === 'cerrado') {
                $updateSql .= ", fecha_cierre = NOW()";
            }
            
            $updateSql .= " WHERE id = $id";
            $this->enlace->executeSQL_DML($updateSql);

            // Insertar en el historial según si existe la migración o no
            if ($hasMigration) {
                // Con nuevas columnas
                $imagen_sql = $imagen_evidencia ? "'" . addslashes($imagen_evidencia) . "'" : "NULL";
                $historialSql = "INSERT INTO historial_tickets 
                                (ticket_id, estado_anterior, estado_nuevo, observacion, usuario_id, imagen_evidencia, fecha)
                                VALUES 
                                ($id, '$estadoActual', '$nuevoEstado', '$comentario', $usuario_id, $imagen_sql, NOW())";
            } else {
                // Sin nuevas columnas
                $historialSql = "INSERT INTO historial_tickets 
                                (ticket_id, estado_anterior, estado_nuevo, observacion, fecha)
                                VALUES 
                                ($id, '$estadoActual', '$nuevoEstado', '$comentario', NOW())";
            }
            $this->enlace->executeSQL_DML($historialSql);

            // Retornar el ticket actualizado
            return $this->getDetalle($id);

        } catch (Exception $e) {
            throw $e;
        }
    }
}
