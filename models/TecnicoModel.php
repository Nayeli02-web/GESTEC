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
            // Obtener técnicos junto con datos del usuario asociado
            $vSql = "SELECT t.id as id, u.nombre as nombre, u.correo as correo, u.telefono as telefono, t.disponible as disponibilidad
                     FROM tecnicos t
                     JOIN usuarios u ON t.usuario_id = u.id";
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
            // Obtener técnico y datos del usuario asociado
            $vSql = "SELECT t.id as id, u.id as usuario_id, u.nombre as nombre, u.correo as correo, u.telefono as telefono, t.disponible as disponibilidad
                     FROM tecnicos t
                     JOIN usuarios u ON t.usuario_id = u.id
                     WHERE t.id = $id";
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
            // Crear usuario primero
            $nombre = addslashes($datos->nombre);
            $correo = addslashes($datos->correo);
            $telefono = addslashes($datos->telefono);

            $vSqlUser = "INSERT INTO usuarios (nombre, correo, contrasena, telefono, rol_id) VALUES ('$nombre', '$correo', '',  '$telefono', 2)";
            $idUser = $this->enlace->executeSQL_DML_last($vSqlUser);
            // Crear registro técnico
            $vSql = "INSERT INTO tecnicos (usuario_id, disponible) VALUES ($idUser, 1)";
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
            // Obtener usuario_id asociado
            $res = $this->enlace->ExecuteSQL("SELECT usuario_id FROM tecnicos WHERE id = $id");
            if (empty($res)) return null;
            $usuario_id = (int) $res[0]['usuario_id'];

            $nombre = addslashes($datos->nombre ?? '');
            $correo = addslashes($datos->correo ?? '');
            $telefono = addslashes($datos->telefono ?? '');
            $disponible = isset($datos->disponibilidad) ? (int)$datos->disponibilidad : null;

            // Actualizar usuario
            $vSqlUser = "UPDATE usuarios SET 
                            nombre = '$nombre',
                            correo = '$correo',
                            telefono = '$telefono'
                         WHERE id = $usuario_id";
            $this->enlace->executeSQL_DML($vSqlUser);

            // Actualizar técnico
            if (!is_null($disponible)) {
                $vSqlTec = "UPDATE tecnicos SET disponible = $disponible WHERE id = $id";
                $this->enlace->executeSQL_DML($vSqlTec);
            }

            return $this->get($id);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    
    public function getDetalle($id)
    {
        try {
            // Información básica del técnico
            $vSql = "SELECT 
                        t.id, 
                        t.disponible,
                        u.id AS usuario_id,
                        u.nombre,
                        u.correo,
                        u.telefono
                     FROM tecnicos t
                     JOIN usuarios u ON t.usuario_id = u.id
                     WHERE t.id = $id";
            
            $tecnico = $this->enlace->ExecuteSQL($vSql, 'asoc');
            if (empty($tecnico)) return null;
            $tecnico = $tecnico[0];

            // Obtener especialidades del técnico
            try {
                $especialidadesSql = "SELECT e.id, e.nombre
                                     FROM especialidades e
                                     JOIN tecnico_especialidad te ON e.id = te.especialidad_id
                                     WHERE te.tecnico_id = $id";
                $especialidades = $this->enlace->ExecuteSQL($especialidadesSql, 'asoc');
                $tecnico['especialidades'] = $especialidades ?? [];
            } catch (Exception $e) {
                $tecnico['especialidades'] = [];
            }

            // Calcular carga de trabajo (tickets activos)
            try {
                $cargaSql = "SELECT COUNT(*) as total
                            FROM tickets
                            WHERE tecnico_id = $id
                            AND estado IN ('asignado', 'en_proceso')";
                $carga = $this->enlace->ExecuteSQL($cargaSql, 'asoc');
                $tecnico['carga_trabajo'] = isset($carga[0]['total']) ? (int)$carga[0]['total'] : 0;
            } catch (Exception $e) {
                $tecnico['carga_trabajo'] = 0;
            }

            // Estadísticas adicionales
            try {
                // Tickets resueltos
                $resueltosSQL = "SELECT COUNT(*) as total
                                FROM tickets
                                WHERE tecnico_id = $id
                                AND estado = 'resuelto'";
                $resueltos = $this->enlace->ExecuteSQL($resueltosSQL, 'asoc');
                $tecnico['tickets_resueltos'] = isset($resueltos[0]['total']) ? (int)$resueltos[0]['total'] : 0;

                // Total de tickets
                $totalesSql = "SELECT COUNT(*) as total
                              FROM tickets
                              WHERE tecnico_id = $id";
                $totales = $this->enlace->ExecuteSQL($totalesSql, 'asoc');
                $tecnico['tickets_totales'] = isset($totales[0]['total']) ? (int)$totales[0]['total'] : 0;
            } catch (Exception $e) {
                $tecnico['tickets_resueltos'] = 0;
                $tecnico['tickets_totales'] = 0;
            }

            return $tecnico;
        } catch (Exception $e) {
            handleException($e);
            return null;
        }
    }

}
