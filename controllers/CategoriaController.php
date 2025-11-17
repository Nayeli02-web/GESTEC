<?php
/**
 * Controlador para la gestión de categorías en el sistema de soporte técnico.
 * Incluye operaciones CRUD: listar, obtener, crear y actualizar.
 */
class CategoriaController
{
    // GET listar todas las categorías
    public function index()
    {
        try {
            $response = new Response();
            $categoriaM = new CategoriaModel();
            $result = $categoriaM->all();
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    // GET obtener una categoría por ID
    public function get($id)
    {
        try {
            $response = new Response();
            $categoria = new CategoriaModel();
            $result = $categoria->get($id);
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    // POST crear una nueva categoría
    public function create()
    {
        try {
            $request = new Request();
            $response = new Response();
            $inputJSON = $request->getJSON();

            $categoria = new CategoriaModel();
            $result = $categoria->create($inputJSON);
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    // PUT actualizar categoría existente
    public function update($id = null)
    {
        try {
            $request = new Request();
            $response = new Response();
            $inputJSON = $request->getJSON();

            // Si el ID viene por URL y no en el JSON, agregarlo
            if ($id !== null && !isset($inputJSON->id)) {
                $inputJSON->id = $id;
            }

            $categoria = new CategoriaModel();
            $result = $categoria->update($inputJSON);
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    // GET detalle completo de una categoría
    public function detalle($id)
    {
       try {
          $response = new Response();
          $categoria = new CategoriaModel();
          $result = $categoria->getDetalle($id);
          $response->toJSON($result);
        } catch (Exception $e) {
         handleException($e);
        }
    } 

}
