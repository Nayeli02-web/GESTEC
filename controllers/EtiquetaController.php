<?php
/**
 * Controlador para etiquetas
 */
class EtiquetaController
{
    // GET listar todas las etiquetas
    public function index()
    {
        try {
            $response = new Response();
            $etiquetaM = new EtiquetaModel();
            $result = $etiquetaM->getAll();
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    // GET obtener una etiqueta por ID
    public function get($id)
    {
        try {
            $response = new Response();
            $etiqueta = new EtiquetaModel();
            $result = $etiqueta->get($id);
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
