<?php
/**
 * Modelo para la gestión de técnicos
 */
class TecnicoModel
{
    public $enlace;

    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }

    /**
     * Obtener todos los técnicos activos
     */
    public function all()
    {
        try {
            $vSql = "SELECT id, nombre, correo, telefono, disponibilidad, carga_trabajo 
                     FROM tecnicos 
                     WHERE activo = 1";
            return $this->enlace->ExecuteSQL($vSql);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /**
     * Obtener un técnico por su ID
     */
    public function get($id)
    {
        try {
            $vSql = "SELECT t.id, t.nombre, t.correo, t.telefono, t.disponibilidad, 
                            t.carga_trabajo, e.nombre AS especialidad
                     FROM tecnicos t
                     LEFT JOIN especialidades e ON t.especialidad_id = e.id
                     WHERE t.id = $id AND t.activo = 1";
            $vResultado = $this->enlace->ExecuteSQL($vSql);
            return !empty($vResultado) ? $vResultado[0] : null;
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /**
     * Crear un nuevo técnico
     */
    public function create($datos)
    {
        try {
            $nombre = addslashes($datos->nombre);
            $correo = addslashes($datos->correo);
            $telefono = addslashes($datos->telefono);
            $disponibilidad = isset($datos->disponibilidad) ? (int) $datos->disponibilidad : 1;
            $carga = isset($datos->carga_trabajo) ? (int) $datos->carga_trabajo : 0;
            $especialidad_id = isset($datos->especialidad_id) ? (int) $datos->especialidad_id : null;
            $activo = 1;

            $vSql = "INSERT INTO tecnicos (nombre, correo, telefono, disponibilidad, carga_trabajo, especialidad_id, activo)
                     VALUES ('$nombre', '$correo', '$telefono', $disponibilidad, $carga, $especialidad_id, $activo)";

            $idNuevo = $this->enlace->executeSQL_DML_last($vSql);
            return $this->get($idNuevo);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /**
     * Actualizar un técnico existente
     */
    public function update($datos)
    {
        try {
            $id = (int) $datos->id;
            $nombre = addslashes($datos->nombre);
            $correo = addslashes($datos->correo);
            $telefono = addslashes($datos->telefono);
            $disponibilidad = isset($datos->disponibilidad) ? (int) $datos->disponibilidad : 1;
            $carga = isset($datos->carga_trabajo) ? (int) $datos->carga_trabajo : 0;
            $especialidad_id = isset($datos->especialidad_id) ? (int) $datos->especialidad_id : null;

            $vSql = "UPDATE tecnicos SET 
                        nombre = '$nombre',
                        correo = '$correo',
                        telefono = '$telefono',
                        disponibilidad = $disponibilidad,
                        carga_trabajo = $carga,
                        especialidad_id = $especialidad_id
                     WHERE id = $id";

            $this->enlace->executeSQL_DML($vSql);
            return $this->get($id);
        } catch (Exception $e) {
            handleException($e);
        }
    }

}
