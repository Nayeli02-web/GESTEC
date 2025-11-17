<?php
/**
 * Modelo para la gestión de especialidades.
 */
class EspecialidadModel
{
    public $enlace;

    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }

    /**
     * Obtener todas las especialidades
     */
    public function getAll()
    {
        try {
            $vSql = "SELECT id, nombre FROM especialidades ORDER BY nombre ASC";
            return $this->enlace->ExecuteSQL($vSql, 'asoc');
        } catch (Exception $e) {
            handleException($e);
            return [];
        }
    }
}
