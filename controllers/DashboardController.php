<?php

require_once __DIR__ . '/core/Response.php';
require_once __DIR__ . '/../models/DashboardModel.php';
require_once __DIR__ . '/../models/UserModel.php';

class DashboardController {
    
    /**
     * Obtener todas las estadísticas del dashboard
     * GET /dashboard/estadisticas
     */
    public function estadisticas() {
        try {
            $response = new Response();

            // Verificar autenticación
            if (!isset($_SESSION['usuario_id'])) {
                $response->status(401)->toJSON(null, 'Usuario no autenticado');
                return;
            }

            // Verificar que sea administrador
            $userModel = new UserModel();
            $usuario = $userModel->get($_SESSION['usuario_id']);
            
            if ($usuario['rol_id'] != 1) {
                $response->status(403)->toJSON(null, 'Acceso denegado. Solo administradores pueden ver el dashboard');
                return;
            }

            $model = new DashboardModel();
            $estadisticas = $model->getEstadisticasCompletas();
            
            $response->toJSON($estadisticas);

        } catch (Exception $e) {
            error_log("Error en DashboardController::estadisticas - " . $e->getMessage());
            $response = new Response();
            $response->status(500)->toJSON(null, 'Error interno del servidor');
        }
    }

    /**
     * Obtener tickets por mes
     * GET /dashboard/ticketspormes
     */
    public function ticketspormes() {
        try {
            $response = new Response();

            if (!isset($_SESSION['usuario_id'])) {
                $response->status(401)->toJSON(null, 'Usuario no autenticado');
                return;
            }

            $userModel = new UserModel();
            $usuario = $userModel->get($_SESSION['usuario_id']);
            
            if ($usuario['rol_id'] != 1) {
                $response->status(403)->toJSON(null, 'Acceso denegado');
                return;
            }

            $model = new DashboardModel();
            $tickets = $model->getTicketsPorMes();
            
            $response->toJSON($tickets);

        } catch (Exception $e) {
            error_log("Error en DashboardController::ticketspormes - " . $e->getMessage());
            $response = new Response();
            $response->status(500)->toJSON(null, 'Error interno del servidor');
        }
    }

    /**
     * Obtener promedio de valoraciones
     * GET /dashboard/promediovaloraciones
     */
    public function promediovaloraciones() {
        try {
            $response = new Response();

            if (!isset($_SESSION['usuario_id'])) {
                $response->status(401)->toJSON(null, 'Usuario no autenticado');
                return;
            }

            $userModel = new UserModel();
            $usuario = $userModel->get($_SESSION['usuario_id']);
            
            if ($usuario['rol_id'] != 1) {
                $response->status(403)->toJSON(null, 'Acceso denegado');
                return;
            }

            $model = new DashboardModel();
            $promedio = $model->getPromedioValoraciones();
            
            $response->toJSON($promedio);

        } catch (Exception $e) {
            error_log("Error en DashboardController::promediovaloraciones - " . $e->getMessage());
            $response = new Response();
            $response->status(500)->toJSON(null, 'Error interno del servidor');
        }
    }

    /**
     * Obtener cumplimiento de SLA
     * GET /dashboard/cumplimientosla
     */
    public function cumplimientosla() {
        try {
            $response = new Response();

            if (!isset($_SESSION['usuario_id'])) {
                $response->status(401)->toJSON(null, 'Usuario no autenticado');
                return;
            }

            $userModel = new UserModel();
            $usuario = $userModel->get($_SESSION['usuario_id']);
            
            if ($usuario['rol_id'] != 1) {
                $response->status(403)->toJSON(null, 'Acceso denegado');
                return;
            }

            $model = new DashboardModel();
            $cumplimiento = $model->getCumplimientoSLA();
            
            $response->toJSON($cumplimiento);

        } catch (Exception $e) {
            error_log("Error en DashboardController::cumplimientosla - " . $e->getMessage());
            $response = new Response();
            $response->status(500)->toJSON(null, 'Error interno del servidor');
        }
    }

    /**
     * Obtener ranking de técnicos
     * GET /dashboard/rankingtecnicos
     */
    public function rankingtecnicos() {
        try {
            $response = new Response();

            if (!isset($_SESSION['usuario_id'])) {
                $response->status(401)->toJSON(null, 'Usuario no autenticado');
                return;
            }

            $userModel = new UserModel();
            $usuario = $userModel->get($_SESSION['usuario_id']);
            
            if ($usuario['rol_id'] != 1) {
                $response->status(403)->toJSON(null, 'Acceso denegado');
                return;
            }

            $model = new DashboardModel();
            $ranking = $model->getRankingTecnicos();
            
            $response->toJSON($ranking);

        } catch (Exception $e) {
            error_log("Error en DashboardController::rankingtecnicos - " . $e->getMessage());
            $response = new Response();
            $response->status(500)->toJSON(null, 'Error interno del servidor');
        }
    }

    /**
     * Obtener categorías con más incumplimientos
     * GET /dashboard/categoriasincumplimientos
     */
    public function categoriasincumplimientos() {
        try {
            $response = new Response();

            if (!isset($_SESSION['usuario_id'])) {
                $response->status(401)->toJSON(null, 'Usuario no autenticado');
                return;
            }

            $userModel = new UserModel();
            $usuario = $userModel->get($_SESSION['usuario_id']);
            
            if ($usuario['rol_id'] != 1) {
                $response->status(403)->toJSON(null, 'Acceso denegado');
                return;
            }

            $model = new DashboardModel();
            $categorias = $model->getCategoriasIncumplimientos();
            
            $response->toJSON($categorias);

        } catch (Exception $e) {
            error_log("Error en DashboardController::categoriasincumplimientos - " . $e->getMessage());
            $response = new Response();
            $response->status(500)->toJSON(null, 'Error interno del servidor');
        }
    }
}
