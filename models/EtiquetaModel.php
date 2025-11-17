<?php
/**
 * Modelo para la gestión de etiquetas
 */
class EtiquetaModel
{
    public $enlace;

    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }

    /**
     * Obtener todas las etiquetas con su categoría asociada
     */
    public function getAll()
    {
        try {
            $vSql = "SELECT 
                        e.id, 
                        e.nombre,
                        e.categoria_id,
                        c.nombre AS categoria_nombre
                     FROM etiquetas e
                     LEFT JOIN categorias c ON e.categoria_id = c.id
                     ORDER BY c.nombre, e.nombre ASC";
            
            $result = $this->enlace->ExecuteSQL($vSql, 'asoc');
            return $result;
        } catch (Exception $e) {
            handleException($e);
            return [];
        }
    }

    /**
     * Obtener una etiqueta por ID con su categoría
     */
    public function get($id)
    {
        try {
            $id = (int) $id;
            $vSql = "SELECT 
                        e.id, 
                        e.nombre,
                        e.categoria_id,
                        c.nombre AS categoria_nombre,
                        c.sla_id
                     FROM etiquetas e
                     LEFT JOIN categorias c ON e.categoria_id = c.id
                     WHERE e.id = $id";
            
            $result = $this->enlace->ExecuteSQL($vSql, 'asoc');
            return !empty($result) ? $result[0] : null;
        } catch (Exception $e) {
            handleException($e);
            return null;
        }
    }
}
