<?php
require_once 'models/AutoTriageModel.php';

class AutoTriageController
{
    private $autoTriageModel;

    public function __construct()
    {
        $this->autoTriageModel = new AutoTriageModel();
    }

    /**
     * Ejecutar asignación automática
     * POST /autotriage/ejecutar
     */
    public function ejecutar($request)
    {
        try {
            $response = new Response();
            
            // Ejecutar el autotriage
            $resultado = $this->autoTriageModel->ejecutarAutoTriage();
            
            if ($resultado['success']) {
                $response->setResponse(true);
                $response->setMessage($resultado['message']);
                $response->result = [
                    'total_procesados' => $resultado['total_procesados'] ?? 0,
                    'asignaciones' => $resultado['asignaciones']
                ];
            } else {
                $response->setResponse(false);
                $response->setMessage($resultado['message']);
            }
            
            return $response;

        } catch (Exception $e) {
            $response = new Response();
            $response->setResponse(false);
            $response->setMessage('Error al ejecutar AutoTriage: ' . $e->getMessage());
            return $response;
        }
    }

    /**
     * Obtener estadísticas de asignaciones automáticas
     * GET /autotriage/estadisticas
     */
    public function estadisticas($request)
    {
        try {
            $response = new Response();
            $enlace = new MySqlConnect();
            
            // Estadísticas de últimas 24 horas
            $sql = "SELECT 
                        COUNT(*) as total_asignaciones,
                        COUNT(DISTINCT ticket_id) as tickets_unicos,
                        DATE_FORMAT(fecha, '%H:00') as hora
                    FROM historial_tickets
                    WHERE observacion LIKE '%AutoTriage%'
                    AND fecha >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
                    GROUP BY DATE_FORMAT(fecha, '%H:00')
                    ORDER BY fecha DESC";
            
            $estadisticas24h = $enlace->ExecuteSQL($sql, 'asoc');
            
            // Tickets pendientes actuales
            $sqlPendientes = "SELECT COUNT(*) as total
                             FROM tickets
                             WHERE estado = 'pendiente'
                             AND (tecnico_id IS NULL OR tecnico_id = 0)";
            
            $pendientes = $enlace->ExecuteSQL($sqlPendientes, 'asoc');
            
            $response->setResponse(true);
            $response->result = [
                'tickets_pendientes' => $pendientes[0]['total'] ?? 0,
                'historial_24h' => $estadisticas24h
            ];
            
            return $response;

        } catch (Exception $e) {
            $response = new Response();
            $response->setResponse(false);
            $response->setMessage('Error al obtener estadísticas: ' . $e->getMessage());
            return $response;
        }
    }

    /**
     * ASIGNACIÓN MANUAL: Obtener información para asignación manual de un ticket
     * GET /autotriage/manual/{ticket_id}
     */
    public function manual($ticket_id)
    {
        try {
            $response = new Response();
            
            $resultado = $this->autoTriageModel->obtenerInfoParaAsignacionManual($ticket_id);
            
            if ($resultado['success']) {
                $response->setResponse(true);
                $response->result = $resultado;
            } else {
                $response->setResponse(false);
                $response->setMessage($resultado['message']);
            }
            
            return $response;

        } catch (Exception $e) {
            $response = new Response();
            $response->setResponse(false);
            $response->setMessage('Error al obtener información: ' . $e->getMessage());
            return $response;
        }
    }

    /**
     * ASIGNACIÓN MANUAL: Asignar ticket manualmente
     * POST /autotriage/asignar
     */
    public function asignar($request)
    {
        try {
            $response = new Response();
            
            // Obtener datos del POST
            $json = file_get_contents('php://input');
            $datos = json_decode($json);
            
            if (!isset($datos->ticket_id) || !isset($datos->tecnico_id)) {
                $response->setResponse(false);
                $response->setMessage('Faltan datos requeridos: ticket_id y tecnico_id');
                return $response;
            }
            
            $ticket_id = (int)$datos->ticket_id;
            $tecnico_id = (int)$datos->tecnico_id;
            $justificacion = $datos->justificacion ?? 'Sin justificación especificada';
            $usuario_admin_id = $datos->usuario_admin_id ?? 1; // TODO: Obtener del usuario autenticado
            
            // Validar justificación
            if (empty(trim($justificacion)) || strlen(trim($justificacion)) < 10) {
                $response->setResponse(false);
                $response->setMessage('La justificación debe tener al menos 10 caracteres');
                return $response;
            }
            
            $resultado = $this->autoTriageModel->asignarManualmente(
                $ticket_id,
                $tecnico_id,
                $justificacion,
                $usuario_admin_id
            );
            
            if ($resultado['success']) {
                $response->setResponse(true);
                $response->setMessage($resultado['message']);
                $response->result = $resultado;
            } else {
                $response->setResponse(false);
                $response->setMessage($resultado['message']);
                if (isset($resultado['estado_actual'])) {
                    $response->result = ['estado_actual' => $resultado['estado_actual']];
                }
                if (isset($resultado['categoria']) && isset($resultado['especialidad_tecnico'])) {
                    $response->result = [
                        'categoria' => $resultado['categoria'],
                        'especialidad_tecnico' => $resultado['especialidad_tecnico']
                    ];
                }
            }
            
            return $response;

        } catch (Exception $e) {
            $response = new Response();
            $response->setResponse(false);
            $response->setMessage('Error al asignar ticket: ' . $e->getMessage());
            return $response;
        }
    }

    /**
     * ASIGNACIÓN MANUAL: Listar tickets pendientes
     * GET /autotriage/pendientes
     */
    public function pendientes($request)
    {
        try {
            $response = new Response();
            
            $resultado = $this->autoTriageModel->listarTicketsPendientes();
            
            if ($resultado['success']) {
                $response->setResponse(true);
                $response->result = $resultado;
            } else {
                $response->setResponse(false);
                $response->setMessage($resultado['message']);
            }
            
            return $response;

        } catch (Exception $e) {
            $response = new Response();
            $response->setResponse(false);
            $response->setMessage('Error al obtener tickets: ' . $e->getMessage());
            return $response;
        }
    }

    /**
     * ASIGNACIÓN MANUAL: Listar técnicos con carga de trabajo
     * GET /autotriage/tecnicos
     */
    public function tecnicos($request)
    {
        try {
            $response = new Response();
            
            $resultado = $this->autoTriageModel->listarTecnicosConCarga();
            
            if ($resultado['success']) {
                $response->setResponse(true);
                $response->result = $resultado;
            } else {
                $response->setResponse(false);
                $response->setMessage($resultado['message']);
            }
            
            return $response;

        } catch (Exception $e) {
            $response = new Response();
            $response->setResponse(false);
            $response->setMessage('Error al obtener técnicos: ' . $e->getMessage());
            return $response;
        }
    }
}
