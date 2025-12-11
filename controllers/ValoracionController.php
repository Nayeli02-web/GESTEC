<?php

require_once __DIR__ . '/core/Response.php';
require_once __DIR__ . '/../models/ValoracionModel.php';
require_once __DIR__ . '/../models/UserModel.php';

class ValoracionController {
    
    /**
     * Crear una nueva valoración
     * POST /valoracion/crear
     */
    public function crear() {
        try {
            $response = new Response();

            // Verificar autenticación
            if (!isset($_SESSION['usuario_id'])) {
                $response->status(401)->toJSON(null, 'Usuario no autenticado');
                return;
            }

            $data = json_decode(file_get_contents('php://input'), true);

            // Validaciones de datos requeridos
            if (!isset($data['ticket_id']) || !isset($data['puntuacion'])) {
                $response->status(400)->toJSON(null, 'Datos incompletos: ticket_id y puntuacion son requeridos');
                return;
            }

            $ticketId = filter_var($data['ticket_id'], FILTER_VALIDATE_INT);
            $puntuacion = filter_var($data['puntuacion'], FILTER_VALIDATE_INT);
            $comentario = isset($data['comentario']) ? trim($data['comentario']) : '';

            // Validación: ticket_id válido
            if ($ticketId === false || $ticketId <= 0) {
                $response->status(400)->toJSON(null, 'ID de ticket inválido');
                return;
            }

            // Validación: rango de puntuación (1-5)
            if ($puntuacion === false || $puntuacion < 1 || $puntuacion > 5) {
                $response->status(400)->toJSON(null, 'La puntuación debe estar entre 1 y 5');
                return;
            }

            // Validación: longitud del comentario
            if (strlen($comentario) > 500) {
                $response->status(400)->toJSON(null, 'El comentario no puede exceder 500 caracteres');
                return;
            }

            $model = new ValoracionModel();

            // Validación: el ticket debe estar cerrado
            if (!$model->ticketEstaCerrado($ticketId)) {
                $response->status(400)->toJSON(null, 'Solo se pueden valorar tickets cerrados');
                return;
            }

            // Validación: el usuario debe ser el creador del ticket
            if (!$model->esCreadorDelTicket($ticketId, $_SESSION['usuario_id'])) {
                $response->status(403)->toJSON(null, 'Solo el creador del ticket puede valorarlo');
                return;
            }

            // Validación: evitar duplicidad
            if ($model->existeValoracion($ticketId)) {
                $response->status(400)->toJSON(null, 'Este ticket ya ha sido valorado');
                return;
            }

            // Crear la valoración
            $result = $model->crear([
                'ticket_id' => $ticketId,
                'puntuacion' => $puntuacion,
                'comentario' => $comentario
            ]);

            if ($result) {
                $response->status(200)->toJSON(['success' => true, 'id' => $result], 'Valoración creada exitosamente');
            } else {
                $response->status(500)->toJSON(null, 'Error al crear la valoración');
            }

        } catch (Exception $e) {
            error_log("Error en ValoracionController::crear - " . $e->getMessage());
            $response = new Response();
            $response->status(500)->toJSON(null, 'Error interno del servidor');
        }
    }

    /**
     * Obtener valoraciones de un técnico
     * GET /valoracion/tecnico/{id}
     */
    public function tecnico($tecnicoId) {
        try {
            $response = new Response();

            // Verificar autenticación
            if (!isset($_SESSION['usuario_id'])) {
                $response->status(401)->toJSON(null, 'Usuario no autenticado');
                return;
            }

            $tecnicoId = filter_var($tecnicoId, FILTER_VALIDATE_INT);
            if ($tecnicoId === false || $tecnicoId <= 0) {
                $response->status(400)->toJSON(null, 'ID de técnico inválido');
                return;
            }

            // Verificar rol: solo admin, director o el mismo técnico pueden ver
            $userModel = new UserModel();
            $usuario = $userModel->get($_SESSION['usuario_id']);
            $rolId = $usuario['rol_id'];

            if ($rolId != 1 && $rolId != 2 && $_SESSION['usuario_id'] != $tecnicoId) {
                $response->status(403)->toJSON(null, 'No tiene permisos para ver estas valoraciones');
                return;
            }

            $model = new ValoracionModel();
            $valoraciones = $model->obtenerPorTecnico($tecnicoId);
            $response->toJSON($valoraciones);

        } catch (Exception $e) {
            error_log("Error en ValoracionController::tecnico - " . $e->getMessage());
            $response = new Response();
            $response->status(500)->toJSON(null, 'Error interno del servidor');
        }
    }

    /**
     * Obtener el promedio de valoraciones de un técnico
     * GET /valoracion/promedio/{id}
     */
    public function promedio($tecnicoId) {
        try {
            $response = new Response();

            // Verificar autenticación
            if (!isset($_SESSION['usuario_id'])) {
                $response->status(401)->toJSON(null, 'Usuario no autenticado');
                return;
            }

            $tecnicoId = filter_var($tecnicoId, FILTER_VALIDATE_INT);
            if ($tecnicoId === false || $tecnicoId <= 0) {
                $response->status(400)->toJSON(null, 'ID de técnico inválido');
                return;
            }

            $model = new ValoracionModel();
            $promedio = $model->calcularPromedio($tecnicoId);
            $response->toJSON($promedio);

        } catch (Exception $e) {
            error_log("Error en ValoracionController::promedio - " . $e->getMessage());
            $response = new Response();
            $response->status(500)->toJSON(null, 'Error interno del servidor');
        }
    }

    /**
     * Listar todas las valoraciones (solo admin/director)
     * GET /valoracion/todas
     */
    public function todas() {
        try {
            $response = new Response();

            // Verificar autenticación
            if (!isset($_SESSION['usuario_id'])) {
                $response->status(401)->toJSON(null, 'Usuario no autenticado');
                return;
            }

            // Verificar rol: solo admin o director
            $userModel = new UserModel();
            $usuario = $userModel->get($_SESSION['usuario_id']);
            $rolId = $usuario['rol_id'];

            if ($rolId != 1 && $rolId != 2) {
                $response->status(403)->toJSON(null, 'Solo administradores y directores pueden listar todas las valoraciones');
                return;
            }

            $model = new ValoracionModel();
            $valoraciones = $model->obtenerTodas();
            $response->toJSON($valoraciones);

        } catch (Exception $e) {
            error_log("Error en ValoracionController::todas - " . $e->getMessage());
            $response = new Response();
            $response->status(500)->toJSON(null, 'Error interno del servidor');
        }
    }
}
