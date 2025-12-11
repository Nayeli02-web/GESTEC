<?php
require_once 'models/NotificacionModel.php';

class NotificacionController
{
    private $notificacionModel;

    public function __construct()
    {
        $this->notificacionModel = new NotificacionModel();
    }

    /**
     * Obtener notificaciones del usuario autenticado
     * GET /notificacion o GET /notificacion/usuario/{usuario_id}
     */
    public function index($request = null)
    {
        try {
            $response = new Response();
            
            // Verificar sesión
            if (session_status() === PHP_SESSION_NONE) {
                session_start();
            }
            
            // Obtener usuario_id de la sesión autenticada
            if (!isset($_SESSION['usuario_id']) && !isset($_SESSION['id'])) {
                $response->setResponse(false);
                $response->setMessage('Usuario no autenticado');
                return $response;
            }
            
            $usuario_id = $_SESSION['usuario_id'] ?? $_SESSION['id'];
            
            $resultado = $this->notificacionModel->obtenerPorUsuario($usuario_id, false, 50);
            
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
            $response->setMessage('Error al obtener notificaciones: ' . $e->getMessage());
            return $response;
        }
    }

    /**
     * Obtener solo notificaciones no leídas
     * GET /notificacion/noleidas
     */
    public function noleidas($request = null)
    {
        try {
            $response = new Response();
            
            // Verificar sesión
            if (session_status() === PHP_SESSION_NONE) {
                session_start();
            }
            
            if (!isset($_SESSION['usuario_id']) && !isset($_SESSION['id'])) {
                $response->setResponse(false);
                $response->setMessage('Usuario no autenticado');
                return $response;
            }
            
            $usuario_id = $_SESSION['usuario_id'] ?? $_SESSION['id'];
            
            $resultado = $this->notificacionModel->obtenerPorUsuario($usuario_id, true, 50);
            
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
            $response->setMessage('Error al obtener notificaciones: ' . $e->getMessage());
            return $response;
        }
    }

    /**
     * Contar notificaciones no leídas
     * GET /notificacion/contar
     */
    public function contar($request = null)
    {
        try {
            $response = new Response();
            
            // Verificar sesión
            if (session_status() === PHP_SESSION_NONE) {
                session_start();
            }
            
            if (!isset($_SESSION['usuario_id']) && !isset($_SESSION['id'])) {
                $response->setResponse(false);
                $response->setMessage('Usuario no autenticado');
                return $response;
            }
            
            $usuario_id = $_SESSION['usuario_id'] ?? $_SESSION['id'];
            
            $resultado = $this->notificacionModel->contarNoLeidas($usuario_id);
            
            if ($resultado['success']) {
                $response->setResponse(true);
                $response->result = ['count' => $resultado['total_no_leidas']];
            } else {
                $response->setResponse(false);
                $response->setMessage($resultado['message']);
            }
            
            return $response;

        } catch (Exception $e) {
            $response = new Response();
            $response->setResponse(false);
            $response->setMessage('Error al contar notificaciones: ' . $e->getMessage());
            return $response;
        }
    }

    /**
     * Marcar notificación como leída
     * PUT /notificacion/leer/{id}
     * 
     * SEGURIDAD: Valida pertenencia de la notificación
     * ACTUALIZACIÓN TIEMPO REAL: Retorna estado actualizado
     */
    public function leer($notificacion_id)
    {
        try {
            $response = new Response();
            
            // Verificar sesión
            if (session_status() === PHP_SESSION_NONE) {
                session_start();
            }
            
            if (!isset($_SESSION['usuario_id']) && !isset($_SESSION['id'])) {
                $response->setResponse(false);
                $response->setMessage('Usuario no autenticado');
                return $response;
            }
            
            $usuario_id = $_SESSION['usuario_id'] ?? $_SESSION['id'];
            
            // VALIDACIÓN: ID de notificación válido
            if (empty($notificacion_id) || !is_numeric($notificacion_id)) {
                $response->setResponse(false);
                $response->setMessage('ID de notificación inválido');
                return $response;
            }
            
            // Llamar al modelo con validaciones de seguridad
            $resultado = $this->notificacionModel->marcarComoLeida($notificacion_id, $usuario_id);
            
            // Construir respuesta según el código de resultado
            if ($resultado['success']) {
                $response->setResponse(true);
                $response->setMessage($resultado['message']);
                
                // Incluir detalles para actualización en tiempo real
                if (isset($resultado['detalles'])) {
                    $response->result = $resultado['detalles'];
                }
                
                // Incluir código para manejo específico en frontend
                if (isset($resultado['code'])) {
                    $response->code = $resultado['code'];
                }
            } else {
                $response->setResponse(false);
                $response->setMessage($resultado['message']);
                
                // Códigos de error específicos para el frontend
                if (isset($resultado['code'])) {
                    $response->code = $resultado['code'];
                    
                    // HTTP status codes apropiados
                    if ($resultado['code'] === 'FORBIDDEN') {
                        $response->http_code = 403;
                    } elseif ($resultado['code'] === 'NOT_FOUND') {
                        $response->http_code = 404;
                    } elseif ($resultado['code'] === 'INVALID_PARAMS') {
                        $response->http_code = 400;
                    }
                }
            }
            
            return $response;

        } catch (Exception $e) {
            $response = new Response();
            $response->setResponse(false);
            $response->setMessage('Error al marcar notificación: ' . $e->getMessage());
            $response->code = 'ERROR';
            return $response;
        }
    }

    /**
     * Marcar todas como leídas
     * PUT /notificacion/leertodas
     * 
     * SEGURIDAD: Solo marca notificaciones del usuario autenticado
     * ACTUALIZACIÓN TIEMPO REAL: Retorna cantidad actualizada
     */
    public function leertodas($request = null)
    {
        try {
            $response = new Response();
            
            // Verificar sesión
            if (session_status() === PHP_SESSION_NONE) {
                session_start();
            }
            
            if (!isset($_SESSION['usuario_id']) && !isset($_SESSION['id'])) {
                $response->setResponse(false);
                $response->setMessage('Usuario no autenticado');
                return $response;
            }
            
            $usuario_id = $_SESSION['usuario_id'] ?? $_SESSION['id'];
            
            // VALIDACIÓN: Usuario válido
            if (empty($usuario_id)) {
                $response->setResponse(false);
                $response->setMessage('Usuario no autenticado');
                return $response;
            }
            
            // Llamar al modelo con validaciones
            $resultado = $this->notificacionModel->marcarTodasComoLeidas($usuario_id);
            
            // Construir respuesta
            if ($resultado['success']) {
                $response->setResponse(true);
                $response->setMessage($resultado['message']);
                
                // Detalles para actualización en tiempo real
                if (isset($resultado['detalles'])) {
                    $response->result = $resultado['detalles'];
                }
                
                if (isset($resultado['code'])) {
                    $response->code = $resultado['code'];
                }
            } else {
                $response->setResponse(false);
                $response->setMessage($resultado['message']);
                
                if (isset($resultado['code'])) {
                    $response->code = $resultado['code'];
                }
            }
            
            return $response;

        } catch (Exception $e) {
            $response = new Response();
            $response->setResponse(false);
            $response->setMessage('Error al marcar notificaciones: ' . $e->getMessage());
            $response->code = 'ERROR';
            return $response;
        }
    }

    /**
     * Eliminar notificación
     * DELETE /notificacion/{id}
     */
    public function delete($notificacion_id)
    {
        try {
            $response = new Response();
            
            // TODO: Obtener usuario_id de la sesión autenticada
            $usuario_id = 1;
            
            $resultado = $this->notificacionModel->eliminar($notificacion_id, $usuario_id);
            
            if ($resultado['success']) {
                $response->setResponse(true);
                $response->setMessage($resultado['message']);
            } else {
                $response->setResponse(false);
                $response->setMessage($resultado['message']);
            }
            
            return $response;

        } catch (Exception $e) {
            $response = new Response();
            $response->setResponse(false);
            $response->setMessage('Error al eliminar notificación: ' . $e->getMessage());
            return $response;
        }
    }

    /**
     * Registrar inicio de sesión (llamado desde login)
     * POST /notificacion/sesion
     */
    public function sesion($request = null)
    {
        try {
            $response = new Response();
            
            $json = file_get_contents('php://input');
            $datos = json_decode($json);
            
            if (!isset($datos->usuario_id)) {
                $response->setResponse(false);
                $response->setMessage('Falta usuario_id');
                return $response;
            }
            
            $usuario_id = (int)$datos->usuario_id;
            $ip_address = $_SERVER['REMOTE_ADDR'] ?? null;
            $user_agent = $_SERVER['HTTP_USER_AGENT'] ?? null;
            
            $resultado = $this->notificacionModel->notificarInicioSesion(
                $usuario_id,
                $ip_address,
                $user_agent
            );
            
            if ($resultado['success']) {
                $response->setResponse(true);
                $response->setMessage($resultado['message']);
            } else {
                $response->setResponse(false);
                $response->setMessage($resultado['message']);
            }
            
            return $response;

        } catch (Exception $e) {
            $response = new Response();
            $response->setResponse(false);
            $response->setMessage('Error al registrar sesión: ' . $e->getMessage());
            return $response;
        }
    }

    /**
     * Obtener historial de inicios de sesión
     * GET /notificacion/historial-sesiones
     */
    public function historialSesiones($request = null)
    {
        try {
            $response = new Response();
            
            // TODO: Obtener usuario_id de la sesión autenticada
            $usuario_id = 1;
            
            $resultado = $this->notificacionModel->obtenerHistorialSesiones($usuario_id, 20);
            
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
            $response->setMessage('Error al obtener historial: ' . $e->getMessage());
            return $response;
        }
    }

    /**
     * Obtener estadísticas completas de notificaciones
     * GET /notificacion/estadisticas
     * 
     * CUMPLE REQUISITOS:
     * - Control transparente de eventos
     * - Información histórica completa
     * - Métricas de uso del sistema
     */
    public function estadisticas($request = null)
    {
        try {
            $response = new Response();
            
            // TODO: Obtener usuario_id de la sesión autenticada
            $usuario_id = 1;
            
            $resultado = $this->notificacionModel->obtenerEstadisticas($usuario_id);
            
            if ($resultado['success']) {
                $response->setResponse(true);
                $response->result = $resultado['estadisticas'];
                $response->setMessage('Estadísticas obtenidas exitosamente');
            } else {
                $response->setResponse(false);
                $response->setMessage($resultado['message']);
            }
            
            return $response;

        } catch (Exception $e) {
            $response = new Response();
            $response->setResponse(false);
            $response->setMessage('Error al obtener estadísticas: ' . $e->getMessage());
            return $response;
        }
    }
}
