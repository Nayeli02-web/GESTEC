<?php
/**
 * Controlador para la gestión de tickets.
 */
class TicketController
{
    // GET lista de tickets según rol
    public function index()
    {
        try {
            $response = new Response();
            $request = new Request();
            $ticketM = new TicketModel();

            // Obtener parámetros de la URL (usuario_id y rol)
            $usuario_id = $_GET['usuario_id'] ?? 1;
            $rol = $_GET['rol'] ?? 'Administrador'; 

            $result = $ticketM->listarPorRol($usuario_id, $rol);
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    // GET detalle de un ticket específico
    public function get($id)
    {
        try {
            $response = new Response();
            $ticketM = new TicketModel();
            $result = $ticketM->get($id);
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    // GET detalle completo de un ticket con toda la información
    public function detalle($id)
    {
        try {
            $response = new Response();
            $ticketM = new TicketModel();
            $result = $ticketM->getDetalle($id);
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    // POST crear un nuevo ticket
    public function create()
    {
        try {
            $request = new Request();
            $response = new Response();
            $inputJSON = $request->getJSON();

            $ticketM = new TicketModel();
            $result = $ticketM->create($inputJSON);
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    // PUT/POST actualizar el estado de un ticket
    public function estado($id)
    {
        try {
            $request = new Request();
            $response = new Response();
            
            // Log para debug
            error_log("=== UPDATE ESTADO DEBUG ===");
            error_log("REQUEST_METHOD: " . $_SERVER['REQUEST_METHOD']);
            error_log("CONTENT_TYPE: " . ($_SERVER['CONTENT_TYPE'] ?? 'none'));
            error_log("POST data: " . print_r($_POST, true));
            error_log("FILES data: " . print_r($_FILES, true));
            
            // Obtener datos del formulario
            $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
            
            // Si viene como POST con multipart/form-data (FormData)
            if ($_SERVER['REQUEST_METHOD'] === 'POST' || !empty($_POST)) {
                $inputJSON = (object)[
                    'nuevoEstado' => $_POST['nuevoEstado'] ?? '',
                    'comentario' => $_POST['comentario'] ?? '',
                    'usuario_id' => (int)($_POST['usuario_id'] ?? 1),
                    'rol_usuario' => $_POST['rol_usuario'] ?? '',
                ];
                
                error_log("Parsed data - Estado: {$inputJSON->nuevoEstado}, Comentario: {$inputJSON->comentario}, Usuario: {$inputJSON->usuario_id}, Rol: {$inputJSON->rol_usuario}");
                
                // Manejar la subida de la imagen
                if (isset($_FILES['imagen']) && $_FILES['imagen']['error'] === UPLOAD_ERR_OK) {
                    $uploadDir = __DIR__ . '/../uploads/historial/';
                    
                    // Crear directorio si no existe
                    if (!is_dir($uploadDir)) {
                        mkdir($uploadDir, 0777, true);
                    }
                    
                    $fileName = uniqid() . '_' . time() . '_' . basename($_FILES['imagen']['name']);
                    $targetPath = $uploadDir . $fileName;
                    
                    if (move_uploaded_file($_FILES['imagen']['tmp_name'], $targetPath)) {
                        $inputJSON->imagen_evidencia = '/uploads/historial/' . $fileName;
                        error_log("Image uploaded: " . $inputJSON->imagen_evidencia);
                    }
                }
                
            } else {
                // JSON normal para PUT
                $inputJSON = $request->getJSON();
                error_log("JSON data: " . print_r($inputJSON, true));
            }

            error_log("Final inputJSON: " . print_r($inputJSON, true));
            
            // Obtener estado anterior del ticket antes de actualizar
            $ticketM = new TicketModel();
            $ticketAnterior = $ticketM->getDetalle($id);
            $estadoAnterior = $ticketAnterior['estado'] ?? 'pendiente';
            
            // Actualizar estado del ticket
            $result = $ticketM->updateEstado($id, $inputJSON);
            
            // Si la actualización fue exitosa, generar notificación
            if ($result['response']) {
                require_once __DIR__ . '/../models/NotificacionModel.php';
                $notificacionM = new NotificacionModel();
                
                // Obtener nombre del usuario responsable
                $sqlUsuario = "SELECT nombre FROM usuarios WHERE id = {$inputJSON->usuario_id}";
                $enlace = new MySqlConnect();
                $usuario = $enlace->ExecuteSQL($sqlUsuario, 'asoc');
                $responsable = !empty($usuario) ? $usuario[0]['nombre'] : 'Usuario';
                
                // Generar notificación de cambio de estado
                $notificacionM->notificarCambioEstado(
                    $id,
                    $estadoAnterior,
                    $inputJSON->nuevoEstado,
                    $responsable,
                    $inputJSON->comentario ?? ''
                );
            }
            
            $response->toJSON($result);
        } catch (Exception $e) {
            error_log("ERROR in estado: " . $e->getMessage());
            handleException($e);
        }
    }
}