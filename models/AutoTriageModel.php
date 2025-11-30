<?php
require_once 'TicketModel.php';
require_once 'TecnicoModel.php';
require_once 'NotificacionModel.php';

class AutoTriageModel
{
    private $enlace;
    private $ticketModel;
    private $tecnicoModel;
    private $notificacionModel;

    public function __construct()
    {
        $this->enlace = new MySqlConnect();
        $this->ticketModel = new TicketModel();
        $this->tecnicoModel = new TecnicoModel();
        $this->notificacionModel = new NotificacionModel();
    }

    /**
     * Ejecutar asignación automática de todos los tickets pendientes
     */
    public function ejecutarAutoTriage()
    {
        try {
            // Obtener todos los tickets pendientes sin técnico asignado
            $sql = "SELECT t.id, t.titulo, t.prioridad, t.categoria_id, 
                           t.fecha_creacion, t.sla_id,
                           s.tiempo_respuesta AS sla_respuesta_minutos,
                           s.tiempo_resolucion AS sla_resolucion_minutos,
                           c.nombre AS categoria_nombre
                    FROM tickets t
                    LEFT JOIN sla s ON t.sla_id = s.id
                    LEFT JOIN categorias c ON t.categoria_id = c.id
                    WHERE t.estado = 'pendiente' 
                    AND (t.tecnico_id IS NULL OR t.tecnico_id = 0)
                    ORDER BY t.fecha_creacion ASC";
            
            $ticketsPendientes = $this->enlace->ExecuteSQL($sql, 'asoc');
            
            if (empty($ticketsPendientes)) {
                return [
                    'success' => true,
                    'message' => 'No hay tickets pendientes para asignar',
                    'asignaciones' => []
                ];
            }

            $asignaciones = [];
            
            foreach ($ticketsPendientes as $ticket) {
                $resultado = $this->asignarTicket($ticket);
                $asignaciones[] = $resultado;
            }

            return [
                'success' => true,
                'message' => 'Asignación automática completada',
                'total_procesados' => count($ticketsPendientes),
                'asignaciones' => $asignaciones
            ];

        } catch (Exception $e) {
            error_log("Error en autoTriage: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Error al ejecutar asignación automática: ' . $e->getMessage(),
                'asignaciones' => []
            ];
        }
    }

    /**
     * Asignar un ticket específico al técnico más adecuado
     */
    private function asignarTicket($ticket)
    {
        try {
            // 1. Obtener técnicos con la especialidad requerida
            $tecnicosDisponibles = $this->obtenerTecnicosConEspecialidad($ticket['categoria_id']);

            if (empty($tecnicosDisponibles)) {
                return [
                    'ticket_id' => $ticket['id'],
                    'titulo' => $ticket['titulo'],
                    'success' => false,
                    'mensaje' => 'No hay técnicos disponibles con la especialidad requerida',
                    'categoria' => $ticket['categoria_nombre']
                ];
            }

            // 2. Calcular tiempo restante SLA
            $tiempoRestanteSLA = $this->calcularTiempoRestanteSLA($ticket);

            // 3. Calcular puntaje del ticket
            $prioridadNumerica = $this->convertirPrioridadANumero($ticket['prioridad']);
            $puntajeTicket = ($prioridadNumerica * 1000) - $tiempoRestanteSLA;

            // 4. Evaluar cada técnico y calcular su idoneidad
            $evaluacionTecnicos = [];
            foreach ($tecnicosDisponibles as $tecnico) {
                $cargaTrabajo = $this->calcularCargaTrabajo($tecnico['id']);
                
                // Puntaje de idoneidad: menor carga = mejor
                // Restamos la carga de trabajo para que técnicos con menos carga tengan mayor puntaje
                $puntajeIdoneidad = 1000 - $cargaTrabajo;
                
                $evaluacionTecnicos[] = [
                    'tecnico_id' => $tecnico['id'],
                    'tecnico_nombre' => $tecnico['nombre'],
                    'especialidad' => $tecnico['especialidad_nombre'],
                    'carga_trabajo' => $cargaTrabajo,
                    'puntaje_idoneidad' => $puntajeIdoneidad
                ];
            }

            // 5. Ordenar técnicos por puntaje de idoneidad (mayor a menor)
            usort($evaluacionTecnicos, function($a, $b) {
                return $b['puntaje_idoneidad'] - $a['puntaje_idoneidad'];
            });

            // 6. Seleccionar el mejor técnico
            $mejorTecnico = $evaluacionTecnicos[0];

            // 7. Asignar el ticket
            $asignacionExitosa = $this->asignarTicketATecnico(
                $ticket['id'],
                $mejorTecnico['tecnico_id'],
                $puntajeTicket,
                $mejorTecnico,
                $tiempoRestanteSLA,
                $prioridadNumerica
            );

            if ($asignacionExitosa) {
                return [
                    'ticket_id' => $ticket['id'],
                    'titulo' => $ticket['titulo'],
                    'success' => true,
                    'tecnico_asignado' => $mejorTecnico['tecnico_nombre'],
                    'tecnico_id' => $mejorTecnico['tecnico_id'],
                    'especialidad' => $mejorTecnico['especialidad'],
                    'puntaje_ticket' => $puntajeTicket,
                    'prioridad' => $ticket['prioridad'],
                    'prioridad_numerica' => $prioridadNumerica,
                    'tiempo_restante_sla' => $tiempoRestanteSLA,
                    'carga_trabajo_tecnico' => $mejorTecnico['carga_trabajo'],
                    'justificacion' => $this->generarJustificacion(
                        $ticket,
                        $mejorTecnico,
                        $puntajeTicket,
                        $tiempoRestanteSLA,
                        $prioridadNumerica
                    ),
                    'otros_candidatos' => array_slice($evaluacionTecnicos, 1, 3) // Top 3 alternativas
                ];
            } else {
                return [
                    'ticket_id' => $ticket['id'],
                    'titulo' => $ticket['titulo'],
                    'success' => false,
                    'mensaje' => 'Error al asignar el ticket al técnico'
                ];
            }

        } catch (Exception $e) {
            error_log("Error al asignar ticket {$ticket['id']}: " . $e->getMessage());
            return [
                'ticket_id' => $ticket['id'],
                'titulo' => $ticket['titulo'],
                'success' => false,
                'mensaje' => 'Error: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Obtener técnicos que tienen la especialidad requerida para la categoría
     */
    private function obtenerTecnicosConEspecialidad($categoria_id)
    {
        $sql = "SELECT DISTINCT t.id, u.nombre, e.nombre AS especialidad_nombre
                FROM tecnicos t
                INNER JOIN usuarios u ON t.usuario_id = u.id
                INNER JOIN especialidades e ON t.especialidad_id = e.id
                INNER JOIN categoria_especialidad ce ON e.id = ce.especialidad_id
                WHERE ce.categoria_id = $categoria_id
                AND t.activo = 1";
        
        return $this->enlace->ExecuteSQL($sql, 'asoc');
    }

    /**
     * Calcular tiempo restante de SLA en minutos
     */
    private function calcularTiempoRestanteSLA($ticket)
    {
        if (empty($ticket['sla_respuesta_minutos'])) {
            return 9999; // Sin SLA definido, prioridad baja
        }

        $fechaCreacion = new DateTime($ticket['fecha_creacion']);
        $ahora = new DateTime();
        
        $minutosTranscurridos = ($ahora->getTimestamp() - $fechaCreacion->getTimestamp()) / 60;
        $tiempoRestante = $ticket['sla_respuesta_minutos'] - $minutosTranscurridos;
        
        return max(0, round($tiempoRestante)); // No puede ser negativo
    }

    /**
     * Convertir prioridad textual a número
     */
    private function convertirPrioridadANumero($prioridad)
    {
        $prioridades = [
            'alta' => 3,
            'media' => 2,
            'baja' => 1
        ];
        
        return $prioridades[strtolower($prioridad)] ?? 1;
    }

    /**
     * Calcular carga de trabajo actual del técnico
     */
    private function calcularCargaTrabajo($tecnico_id)
    {
        // Contar tickets activos (asignado o en proceso)
        $sql = "SELECT COUNT(*) as total
                FROM tickets
                WHERE tecnico_id = $tecnico_id
                AND estado IN ('asignado', 'en_proceso')";
        
        $resultado = $this->enlace->ExecuteSQL($sql, 'asoc');
        
        return !empty($resultado) ? (int)$resultado[0]['total'] : 0;
    }

    /**
     * Asignar ticket a técnico y actualizar estado
     */
    private function asignarTicketATecnico($ticket_id, $tecnico_id, $puntaje, $tecnico, $tiempoSLA, $prioridad)
    {
        try {
            // Actualizar ticket
            $sql = "UPDATE tickets 
                    SET tecnico_id = $tecnico_id, 
                        estado = 'asignado'
                    WHERE id = $ticket_id";
            
            $this->enlace->executeSQL_DML($sql);

            // Registrar en historial
            $comentario = "Ticket asignado automáticamente mediante AutoTriage. " .
                         "Técnico: {$tecnico['tecnico_nombre']} ({$tecnico['especialidad']}). " .
                         "Puntaje: $puntaje (Prioridad: $prioridad, SLA restante: {$tiempoSLA}min). " .
                         "Carga actual del técnico: {$tecnico['carga_trabajo']} tickets.";
            
            $comentario = addslashes($comentario);
            
            $historialSql = "INSERT INTO historial_tickets 
                            (ticket_id, estado_anterior, estado_nuevo, observacion, usuario_id, fecha)
                            VALUES 
                            ($ticket_id, 'pendiente', 'asignado', '$comentario', 1, NOW())";
            
            $this->enlace->executeSQL_DML($historialSql);

            // NOTIFICACIONES: Notificar al técnico y al cliente sobre la asignación
            $this->notificarAsignacionAutomatica($ticket_id, $tecnico, $puntaje, $tiempoSLA, $prioridad);

            return true;

        } catch (Exception $e) {
            error_log("Error al asignar ticket $ticket_id a técnico $tecnico_id: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Generar justificación de la asignación
     */
    private function generarJustificacion($ticket, $tecnico, $puntaje, $tiempoSLA, $prioridad)
    {
        $justificacion = [];
        
        // Criterio 1: Especialidad
        $justificacion[] = "✓ Especialidad requerida: {$tecnico['especialidad']}";
        
        // Criterio 2: Puntaje del ticket
        $justificacion[] = "✓ Puntaje del ticket: $puntaje (Prioridad: $prioridad × 1000 - SLA restante: {$tiempoSLA}min)";
        
        // Criterio 3: Carga de trabajo
        $carga = $tecnico['carga_trabajo'];
        if ($carga == 0) {
            $justificacion[] = "✓ Técnico disponible sin tickets activos";
        } else {
            $justificacion[] = "✓ Carga de trabajo: $carga tickets activos (la más baja disponible)";
        }
        
        // Criterio 4: Tiempo SLA
        if ($tiempoSLA < 60) {
            $justificacion[] = "⚠ URGENTE: Menos de 1 hora para cumplir SLA";
        } elseif ($tiempoSLA < 240) {
            $justificacion[] = "⚡ Prioritario: Menos de 4 horas para cumplir SLA";
        }
        
        return implode("\n", $justificacion);
    }

    /**
     * ASIGNACIÓN MANUAL: Obtener información completa para asignación manual
     */
    public function obtenerInfoParaAsignacionManual($ticket_id)
    {
        try {
            // Obtener información del ticket
            $sqlTicket = "SELECT t.id, t.titulo, t.descripcion, t.prioridad, 
                                 t.categoria_id, t.estado, t.fecha_creacion, t.sla_id,
                                 c.nombre AS categoria_nombre,
                                 s.tiempo_respuesta AS sla_respuesta_minutos,
                                 s.tiempo_resolucion AS sla_resolucion_minutos,
                                 u.nombre AS cliente_nombre, u.email AS cliente_email
                          FROM tickets t
                          LEFT JOIN categorias c ON t.categoria_id = c.id
                          LEFT JOIN sla s ON t.sla_id = s.id
                          LEFT JOIN usuarios u ON t.usuario_id = u.id
                          WHERE t.id = $ticket_id";
            
            $ticket = $this->enlace->ExecuteSQL($sqlTicket, 'asoc');
            
            if (empty($ticket)) {
                return [
                    'success' => false,
                    'message' => 'Ticket no encontrado'
                ];
            }
            
            $ticket = $ticket[0];
            
            // Validar que el ticket esté en estado pendiente
            if ($ticket['estado'] !== 'pendiente') {
                return [
                    'success' => false,
                    'message' => 'Solo se pueden asignar tickets en estado Pendiente',
                    'estado_actual' => $ticket['estado']
                ];
            }
            
            // Calcular tiempo restante SLA
            $tiempoRestanteSLA = $this->calcularTiempoRestanteSLA($ticket);
            
            // Obtener técnicos con la especialidad requerida
            $tecnicosDisponibles = $this->obtenerTecnicosConEspecialidad($ticket['categoria_id']);
            
            // Enriquecer información de técnicos con carga de trabajo
            foreach ($tecnicosDisponibles as &$tecnico) {
                $tecnico['carga_trabajo'] = $this->calcularCargaTrabajo($tecnico['id']);
            }
            
            return [
                'success' => true,
                'ticket' => $ticket,
                'tiempo_restante_sla' => $tiempoRestanteSLA,
                'tecnicos_disponibles' => $tecnicosDisponibles,
                'total_tecnicos' => count($tecnicosDisponibles)
            ];
            
        } catch (Exception $e) {
            error_log("Error al obtener info para asignación manual: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Error al obtener información: ' . $e->getMessage()
            ];
        }
    }

    /**
     * ASIGNACIÓN MANUAL: Asignar ticket manualmente a un técnico
     */
    public function asignarManualmente($ticket_id, $tecnico_id, $justificacion_manual, $usuario_admin_id)
    {
        try {
            // Obtener información del ticket
            $sqlTicket = "SELECT t.id, t.estado, t.categoria_id, t.titulo,
                                 c.nombre AS categoria_nombre
                          FROM tickets t
                          LEFT JOIN categorias c ON t.categoria_id = c.id
                          WHERE t.id = $ticket_id";
            
            $ticket = $this->enlace->ExecuteSQL($sqlTicket, 'asoc');
            
            if (empty($ticket)) {
                return [
                    'success' => false,
                    'message' => 'Ticket no encontrado'
                ];
            }
            
            $ticket = $ticket[0];
            
            // VALIDACIÓN 1: Solo tickets pendientes
            if ($ticket['estado'] !== 'pendiente') {
                return [
                    'success' => false,
                    'message' => 'Solo se pueden asignar tickets en estado Pendiente',
                    'estado_actual' => $ticket['estado']
                ];
            }
            
            // Obtener información del técnico
            $sqlTecnico = "SELECT t.id, u.nombre AS tecnico_nombre, 
                                  e.id AS especialidad_id, e.nombre AS especialidad_nombre
                           FROM tecnicos t
                           INNER JOIN usuarios u ON t.usuario_id = u.id
                           INNER JOIN especialidades e ON t.especialidad_id = e.id
                           WHERE t.id = $tecnico_id AND t.activo = 1";
            
            $tecnico = $this->enlace->ExecuteSQL($sqlTecnico, 'asoc');
            
            if (empty($tecnico)) {
                return [
                    'success' => false,
                    'message' => 'Técnico no encontrado o inactivo'
                ];
            }
            
            $tecnico = $tecnico[0];
            
            // VALIDACIÓN 2: Verificar que el técnico tenga la especialidad requerida
            $sqlVerificarEspecialidad = "SELECT COUNT(*) as tiene_especialidad
                                         FROM categoria_especialidad
                                         WHERE categoria_id = {$ticket['categoria_id']}
                                         AND especialidad_id = {$tecnico['especialidad_id']}";
            
            $verificacion = $this->enlace->ExecuteSQL($sqlVerificarEspecialidad, 'asoc');
            
            if ($verificacion[0]['tiene_especialidad'] == 0) {
                return [
                    'success' => false,
                    'message' => 'El técnico no tiene la especialidad requerida para esta categoría',
                    'categoria' => $ticket['categoria_nombre'],
                    'especialidad_tecnico' => $tecnico['especialidad_nombre']
                ];
            }
            
            // Calcular carga de trabajo del técnico
            $cargaTrabajo = $this->calcularCargaTrabajo($tecnico_id);
            
            // Realizar la asignación
            $sqlUpdate = "UPDATE tickets 
                         SET tecnico_id = $tecnico_id, 
                             estado = 'asignado'
                         WHERE id = $ticket_id";
            
            $this->enlace->executeSQL_DML($sqlUpdate);
            
            // Registrar en historial con método manual
            $comentarioHistorial = "Ticket asignado MANUALMENTE por administrador. " .
                                  "Técnico: {$tecnico['tecnico_nombre']} ({$tecnico['especialidad_nombre']}). " .
                                  "Carga actual: {$cargaTrabajo} tickets. " .
                                  "Justificación: " . addslashes($justificacion_manual);
            
            $sqlHistorial = "INSERT INTO historial_tickets 
                            (ticket_id, estado_anterior, estado_nuevo, observacion, usuario_id, fecha)
                            VALUES 
                            ($ticket_id, 'pendiente', 'asignado', '$comentarioHistorial', $usuario_admin_id, NOW())";
            
            $this->enlace->executeSQL_DML($sqlHistorial);
            
            // NOTIFICACIONES: Notificar al técnico y al cliente sobre la asignación manual
            $this->notificarAsignacionManual($ticket_id, $tecnico, $justificacion_manual, $cargaTrabajo);
            
            return [
                'success' => true,
                'message' => 'Ticket asignado exitosamente de forma manual',
                'ticket_id' => $ticket_id,
                'tecnico_id' => $tecnico_id,
                'tecnico_nombre' => $tecnico['tecnico_nombre'],
                'especialidad' => $tecnico['especialidad_nombre'],
                'carga_trabajo' => $cargaTrabajo,
                'metodo' => 'Manual'
            ];
            
        } catch (Exception $e) {
            error_log("Error en asignación manual: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Error al asignar ticket: ' . $e->getMessage()
            ];
        }
    }

    /**
     * ASIGNACIÓN MANUAL: Listar todos los tickets pendientes para asignación
     */
    public function listarTicketsPendientes()
    {
        try {
            $sql = "SELECT t.id, t.titulo, t.prioridad, t.categoria_id, 
                           t.fecha_creacion, t.sla_id,
                           s.tiempo_respuesta AS sla_respuesta_minutos,
                           c.nombre AS categoria_nombre,
                           u.nombre AS cliente_nombre
                    FROM tickets t
                    LEFT JOIN sla s ON t.sla_id = s.id
                    LEFT JOIN categorias c ON t.categoria_id = c.id
                    LEFT JOIN usuarios u ON t.usuario_id = u.id
                    WHERE t.estado = 'pendiente' 
                    AND (t.tecnico_id IS NULL OR t.tecnico_id = 0)
                    ORDER BY t.prioridad DESC, t.fecha_creacion ASC";
            
            $tickets = $this->enlace->ExecuteSQL($sql, 'asoc');
            
            // Enriquecer con tiempo restante SLA
            foreach ($tickets as &$ticket) {
                $ticket['tiempo_restante_sla'] = $this->calcularTiempoRestanteSLA($ticket);
            }
            
            return [
                'success' => true,
                'tickets' => $tickets,
                'total' => count($tickets)
            ];
            
        } catch (Exception $e) {
            error_log("Error al listar tickets pendientes: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Error al obtener tickets: ' . $e->getMessage()
            ];
        }
    }

    /**
     * ASIGNACIÓN MANUAL: Listar todos los técnicos con su información de carga
     */
    public function listarTecnicosConCarga()
    {
        try {
            $sql = "SELECT t.id, t.activo, u.nombre, u.email,
                           e.nombre AS especialidad_nombre, e.id AS especialidad_id
                    FROM tecnicos t
                    INNER JOIN usuarios u ON t.usuario_id = u.id
                    INNER JOIN especialidades e ON t.especialidad_id = e.id
                    ORDER BY t.activo DESC, u.nombre ASC";
            
            $tecnicos = $this->enlace->ExecuteSQL($sql, 'asoc');
            
            // Enriquecer con carga de trabajo
            foreach ($tecnicos as &$tecnico) {
                $tecnico['carga_trabajo'] = $this->calcularCargaTrabajo($tecnico['id']);
            }
            
            return [
                'success' => true,
                'tecnicos' => $tecnicos,
                'total' => count($tecnicos)
            ];
            
        } catch (Exception $e) {
            error_log("Error al listar técnicos: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Error al obtener técnicos: ' . $e->getMessage()
            ];
        }
    }

    /**
     * NOTIFICACIONES: Notificar asignación automática
     */
    private function notificarAsignacionAutomatica($ticket_id, $tecnico, $puntaje, $tiempoSLA, $prioridad)
    {
        try {
            // Obtener información completa del ticket y usuarios involucrados
            $sqlTicket = "SELECT t.id, t.titulo, t.descripcion, t.prioridad, t.usuario_id,
                                 u.nombre AS cliente_nombre, u.email AS cliente_email,
                                 ut.id AS tecnico_usuario_id, ut.nombre AS tecnico_nombre, ut.email AS tecnico_email
                          FROM tickets t
                          INNER JOIN usuarios u ON t.usuario_id = u.id
                          INNER JOIN tecnicos tec ON tec.id = {$tecnico['tecnico_id']}
                          INNER JOIN usuarios ut ON tec.usuario_id = ut.id
                          WHERE t.id = $ticket_id";
            
            $resultado = $this->enlace->ExecuteSQL($sqlTicket, 'asoc');
            
            if (empty($resultado)) {
                error_log("No se encontró información para notificar ticket $ticket_id");
                return;
            }
            
            $info = $resultado[0];
            
            // NOTIFICACIÓN 1: Para el TÉCNICO asignado
            $tituloTecnico = "Nuevo ticket asignado: #{$ticket_id}";
            $mensajeTecnico = "Se te ha asignado el ticket #{$ticket_id} '{$info['titulo']}' mediante AutoTriage. " .
                             "Prioridad: {$info['prioridad']}. " .
                             "Puntaje de asignación: $puntaje. " .
                             "Tiempo restante SLA: {$tiempoSLA} minutos. " .
                             "Cliente: {$info['cliente_nombre']}.";
            
            $datosAdicionalesTecnico = [
                'ticket_id' => $ticket_id,
                'ticket_titulo' => $info['titulo'],
                'prioridad' => $info['prioridad'],
                'prioridad_numerica' => $prioridad,
                'puntaje' => $puntaje,
                'tiempo_sla_minutos' => $tiempoSLA,
                'especialidad' => $tecnico['especialidad'],
                'carga_trabajo' => $tecnico['carga_trabajo'],
                'cliente_nombre' => $info['cliente_nombre'],
                'metodo_asignacion' => 'AutoTriage'
            ];
            
            $this->notificacionModel->crear(
                $info['tecnico_usuario_id'],
                'ticket_asignado',
                $tituloTecnico,
                $mensajeTecnico,
                $datosAdicionalesTecnico
            );
            
            // NOTIFICACIÓN 2: Para el CLIENTE que creó el ticket
            $tituloCliente = "Tu ticket #{$ticket_id} ha sido asignado";
            $mensajeCliente = "Tu ticket #{$ticket_id} '{$info['titulo']}' ha sido asignado al técnico {$info['tecnico_nombre']} ({$tecnico['especialidad']}). " .
                             "El técnico comenzará a trabajar en tu solicitud pronto.";
            
            $datosAdicionalesCliente = [
                'ticket_id' => $ticket_id,
                'ticket_titulo' => $info['titulo'],
                'tecnico_nombre' => $info['tecnico_nombre'],
                'tecnico_especialidad' => $tecnico['especialidad'],
                'estado_nuevo' => 'asignado',
                'estado_anterior' => 'pendiente',
                'metodo_asignacion' => 'AutoTriage'
            ];
            
            $this->notificacionModel->crear(
                $info['usuario_id'],
                'ticket_cambio_estado',
                $tituloCliente,
                $mensajeCliente,
                $datosAdicionalesCliente
            );
            
            error_log("Notificaciones enviadas para ticket $ticket_id (AutoTriage): Técnico ID {$info['tecnico_usuario_id']}, Cliente ID {$info['usuario_id']}");
            
        } catch (Exception $e) {
            error_log("Error al notificar asignación automática: " . $e->getMessage());
            // No lanzar excepción para no interrumpir el flujo de asignación
        }
    }

    /**
     * NOTIFICACIONES: Notificar asignación manual
     */
    private function notificarAsignacionManual($ticket_id, $tecnico, $justificacion, $cargaTrabajo)
    {
        try {
            // Obtener información completa del ticket y usuarios involucrados
            $sqlTicket = "SELECT t.id, t.titulo, t.descripcion, t.prioridad, t.usuario_id,
                                 u.nombre AS cliente_nombre, u.email AS cliente_email,
                                 ut.id AS tecnico_usuario_id, ut.nombre AS tecnico_nombre, ut.email AS tecnico_email
                          FROM tickets t
                          INNER JOIN usuarios u ON t.usuario_id = u.id
                          INNER JOIN tecnicos tec ON tec.id = {$tecnico['id']}
                          INNER JOIN usuarios ut ON tec.usuario_id = ut.id
                          WHERE t.id = $ticket_id";
            
            $resultado = $this->enlace->ExecuteSQL($sqlTicket, 'asoc');
            
            if (empty($resultado)) {
                error_log("No se encontró información para notificar ticket $ticket_id");
                return;
            }
            
            $info = $resultado[0];
            
            // NOTIFICACIÓN 1: Para el TÉCNICO asignado
            $tituloTecnico = "Nuevo ticket asignado manualmente: #{$ticket_id}";
            $mensajeTecnico = "Se te ha asignado manualmente el ticket #{$ticket_id} '{$info['titulo']}'. " .
                             "Prioridad: {$info['prioridad']}. " .
                             "Especialidad: {$tecnico['especialidad_nombre']}. " .
                             "Tu carga actual: {$cargaTrabajo} tickets. " .
                             "Justificación del administrador: $justificacion";
            
            $datosAdicionalesTecnico = [
                'ticket_id' => $ticket_id,
                'ticket_titulo' => $info['titulo'],
                'prioridad' => $info['prioridad'],
                'especialidad' => $tecnico['especialidad_nombre'],
                'carga_trabajo' => $cargaTrabajo,
                'cliente_nombre' => $info['cliente_nombre'],
                'justificacion' => $justificacion,
                'metodo_asignacion' => 'Manual'
            ];
            
            $this->notificacionModel->crear(
                $info['tecnico_usuario_id'],
                'ticket_asignado',
                $tituloTecnico,
                $mensajeTecnico,
                $datosAdicionalesTecnico
            );
            
            // NOTIFICACIÓN 2: Para el CLIENTE que creó el ticket
            $tituloCliente = "Tu ticket #{$ticket_id} ha sido asignado";
            $mensajeCliente = "Tu ticket #{$ticket_id} '{$info['titulo']}' ha sido asignado al técnico {$info['tecnico_nombre']} ({$tecnico['especialidad_nombre']}). " .
                             "El técnico comenzará a trabajar en tu solicitud pronto.";
            
            $datosAdicionalesCliente = [
                'ticket_id' => $ticket_id,
                'ticket_titulo' => $info['titulo'],
                'tecnico_nombre' => $info['tecnico_nombre'],
                'tecnico_especialidad' => $tecnico['especialidad_nombre'],
                'estado_nuevo' => 'asignado',
                'estado_anterior' => 'pendiente',
                'metodo_asignacion' => 'Manual'
            ];
            
            $this->notificacionModel->crear(
                $info['usuario_id'],
                'ticket_cambio_estado',
                $tituloCliente,
                $mensajeCliente,
                $datosAdicionalesCliente
            );
            
            error_log("Notificaciones enviadas para ticket $ticket_id (Manual): Técnico ID {$info['tecnico_usuario_id']}, Cliente ID {$info['usuario_id']}");
            
        } catch (Exception $e) {
            error_log("Error al notificar asignación manual: " . $e->getMessage());
            // No lanzar excepción para no interrumpir el flujo de asignación
        }
    }
}
