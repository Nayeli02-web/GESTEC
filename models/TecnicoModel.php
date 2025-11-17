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
            $telefono = addslashes($datos->telefono ?? '');
            $contrasena = password_hash($datos->contrasena ?? '12345', PASSWORD_DEFAULT); // contraseña por defecto
            
            // Rol 3 = Técnico
            $vSqlUser = "INSERT INTO usuarios (nombre, correo, contrasena, telefono, rol_id) 
                        VALUES ('$nombre', '$correo', '$contrasena', '$telefono', 3)";
            $idUser = $this->enlace->executeSQL_DML_last($vSqlUser);
            
            // Crear registro técnico
            $disponible = isset($datos->disponible) ? (int)$datos->disponible : 1;
            $vSql = "INSERT INTO tecnicos (usuario_id, disponible) VALUES ($idUser, $disponible)";
            $idNuevo = $this->enlace->executeSQL_DML_last($vSql);
            
            // Asignar especialidades si se proporcionaron
            if (isset($datos->especialidades) && is_array($datos->especialidades)) {
                foreach ($datos->especialidades as $especialidad_id) {
                    $esp_id = (int)$especialidad_id;
                    $vSqlEsp = "INSERT INTO tecnico_especialidad (tecnico_id, especialidad_id) 
                               VALUES ($idNuevo, $esp_id)";
                    $this->enlace->executeSQL_DML($vSqlEsp);
                }
            }
            
            return $this->getDetalle($idNuevo);
        } catch (Exception $e) {
            handleException($e);
            return null;
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
            $res = $this->enlace->ExecuteSQL("SELECT usuario_id FROM tecnicos WHERE id = $id", 'asoc');
            if (empty($res)) return null;
            $usuario_id = (int) $res[0]['usuario_id'];

            $nombre = addslashes($datos->nombre ?? '');
            $correo = addslashes($datos->correo ?? '');
            $telefono = addslashes($datos->telefono ?? '');
            $disponible = isset($datos->disponible) ? (int)$datos->disponible : null;

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

            // Actualizar especialidades si se proporcionaron
            if (isset($datos->especialidades)) {
                // Convertir a array PHP si viene como array JSON u objeto
                $especialidades = $datos->especialidades;
                
                // Si es un objeto stdClass, convertir sus propiedades a array
                if (is_object($especialidades)) {
                    $especialidades = array_values((array)$especialidades);
                }
                
                if (!empty($especialidades) && is_array($especialidades)) {
                    // Eliminar especialidades actuales
                    $vSqlDeleteEsp = "DELETE FROM tecnico_especialidad WHERE tecnico_id = $id";
                    $this->enlace->executeSQL_DML($vSqlDeleteEsp);
                    
                    // Insertar nuevas especialidades
                    foreach ($especialidades as $especialidad_id) {
                        $esp_id = (int)$especialidad_id;
                        $vSqlEsp = "INSERT INTO tecnico_especialidad (tecnico_id, especialidad_id) 
                                   VALUES ($id, $esp_id)";
                        $this->enlace->executeSQL_DML($vSqlEsp);
                    }
                }
            }

            return $this->getDetalle($id);
        } catch (Exception $e) {
            handleException($e);
            return null;
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
