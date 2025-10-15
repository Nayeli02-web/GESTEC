<?php
/**
 * Controlador para la gestión de técnicos en el sistema de soporte técnico.
 * Incluye operaciones CRUD: listar, obtener, crear y actualizar.
 */
class TecnicoController
{
    // GET listar todos los técnicos
    public function index()
    {
        try {
            $response = new Response();
            $tecnicoM = new TecnicoModel();
            $result = $tecnicoM->all();
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    // GET obtener un técnico por ID
    public function get($id)
    {
        try {
            $response = new Response();
            $tecnico = new TecnicoModel();
            $result = $tecnico->get($id);
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    // POST crear un técnico
    public function create()
    {
        try {
            $request = new Request();
            $response = new Response();
            $inputJSON = $request->getJSON();

            $tecnico = new TecnicoModel();
            $result = $tecnico->create($inputJSON);
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    // PUT actualizar técnico
    public function update()
    {
        try {
            $request = new Request();
            $response = new Response();
            $inputJSON = $request->getJSON();

            $tecnico = new TecnicoModel();
            $result = $tecnico->update($inputJSON);
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

}
