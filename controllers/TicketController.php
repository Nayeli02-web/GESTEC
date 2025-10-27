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
}
