<?php
/**
 * Modelo para la gestión de SLAs
 */
class SLAModel
{
    public $enlace;

    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }

    /**
     * Obtener todos los SLAs
     */
    public function getAll()
    {
        try {
            $vSql = "SELECT 
                        id, 
                        nombre,
                        tiempo_respuesta,
                        tiempo_resolucion
                     FROM sla
                     ORDER BY nombre ASC";
            
            $result = $this->enlace->ExecuteSQL($vSql, 'asoc');
            return $result;
        } catch (Exception $e) {
            handleException($e);
            return [];
        }
    }

    /**
     * Obtener un SLA por ID
     */
    public function get($id)
    {
        try {
            $id = (int) $id;
            $vSql = "SELECT 
                        id, 
                        nombre,
                        tiempo_respuesta,
                        tiempo_resolucion
                     FROM sla
                     WHERE id = $id";
            
            $result = $this->enlace->ExecuteSQL($vSql, 'asoc');
            return !empty($result) ? $result[0] : null;
        } catch (Exception $e) {
            handleException($e);
            return null;
        }
    }

    /**
     * Crear un nuevo SLA
     */
    public function create($datos)
    {
        try {
            $nombre = addslashes($datos->nombre ?? '');
            $tiempo_respuesta = (int)($datos->tiempo_respuesta ?? 0);
            $tiempo_resolucion = (int)($datos->tiempo_resolucion ?? 0);

            $vSql = "INSERT INTO sla (nombre, tiempo_respuesta, tiempo_resolucion) 
                     VALUES ('$nombre', $tiempo_respuesta, $tiempo_resolucion)";
            
            $id = $this->enlace->executeSQL_DML_last($vSql);
            return $this->get($id);
        } catch (Exception $e) {
            handleException($e);
            return null;
        }
    }
}
