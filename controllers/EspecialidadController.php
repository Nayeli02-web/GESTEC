<?php
/**
 * Controlador para la gestión de especialidades.
 */
class EspecialidadController
{
    // GET lista de especialidades
    public function index()
    {
        try {
            $response = new Response();
            $especialidadM = new EspecialidadModel();
            $result = $especialidadM->getAll();
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
