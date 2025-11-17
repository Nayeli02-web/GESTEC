<?php
/**
 * Controlador para SLAs
 */
class SLAController
{
    // GET listar todos los SLAs
    public function index()
    {
        try {
            $response = new Response();
            $slaM = new SLAModel();
            $result = $slaM->getAll();
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    // GET obtener un SLA por ID
    public function get($id)
    {
        try {
            $response = new Response();
            $sla = new SLAModel();
            $result = $sla->get($id);
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    // POST crear un nuevo SLA
    public function create()
    {
        try {
            $request = new Request();
            $response = new Response();
            $inputJSON = $request->getJSON();

            $sla = new SLAModel();
            $result = $sla->create($inputJSON);
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
