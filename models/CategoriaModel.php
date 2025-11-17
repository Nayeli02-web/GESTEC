<?php
/**
 * Modelo para la gestión de categorías
 */
class CategoriaModel
{
    public $enlace;

    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }

    /**
     * Obtener todas las categorías
     */
    public function all()
    {
        try {
            $vSql = "SELECT id, nombre, descripcion FROM categorias ORDER BY id DESC";
            return $this->enlace->ExecuteSQL($vSql);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /**
     * Obtener una categoría por su ID
     */
    public function get($id)
    {
        try {
            $vSql = "SELECT id, nombre, descripcion FROM categorias WHERE id = $id";
            $vResultado = $this->enlace->ExecuteSQL($vSql);
            return !empty($vResultado) ? $vResultado[0] : null;
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /**
     * Crear una nueva categoría
     */
    public function create($datos)
    {
        try {
            $nombre = addslashes($datos->nombre ?? '');
            $descripcion = addslashes($datos->descripcion ?? '');
            $sla_id = isset($datos->sla_id) && $datos->sla_id > 0 ? (int)$datos->sla_id : null;
            
            // Si se proporcionan tiempos personalizados, crear un nuevo SLA
            if (isset($datos->tiempo_respuesta) && isset($datos->tiempo_resolucion)) {
                $tiempo_respuesta = (int)$datos->tiempo_respuesta;
                $tiempo_resolucion = (int)$datos->tiempo_resolucion;
                
                // Crear SLA personalizado
                $nombreSLA = "SLA - " . $nombre;
                $vSqlSLA = "INSERT INTO sla (nombre, tiempo_respuesta, tiempo_resolucion) 
                           VALUES ('$nombreSLA', $tiempo_respuesta, $tiempo_resolucion)";
                $sla_id = $this->enlace->executeSQL_DML_last($vSqlSLA);
            }

            // Insertar categoría
            $vSql = "INSERT INTO categorias (nombre, descripcion, sla_id) 
                     VALUES ('$nombre', '$descripcion', " . ($sla_id ? $sla_id : "NULL") . ")";
            $idNuevo = $this->enlace->executeSQL_DML_last($vSql);

            // Asociar etiquetas
            if (isset($datos->etiquetas) && is_array($datos->etiquetas)) {
                foreach ($datos->etiquetas as $etiqueta_id) {
                    $etiqueta_id = (int)$etiqueta_id;
                    // Actualizar la etiqueta para asociarla con esta categoría
                    $vSqlEtiq = "UPDATE etiquetas SET categoria_id = $idNuevo WHERE id = $etiqueta_id";
                    $this->enlace->executeSQL_DML($vSqlEtiq);
                }
            }

            // Asociar especialidades
            if (isset($datos->especialidades) && is_array($datos->especialidades)) {
                foreach ($datos->especialidades as $especialidad_id) {
                    $esp_id = (int)$especialidad_id;
                    $vSqlEsp = "INSERT INTO categoria_especialidad (categoria_id, especialidad_id) 
                               VALUES ($idNuevo, $esp_id)";
                    $this->enlace->executeSQL_DML($vSqlEsp);
                }
            } elseif (isset($datos->especialidades) && is_object($datos->especialidades)) {
                // Convertir objeto a array
                $especialidades = array_values((array)$datos->especialidades);
                foreach ($especialidades as $especialidad_id) {
                    $esp_id = (int)$especialidad_id;
                    $vSqlEsp = "INSERT INTO categoria_especialidad (categoria_id, especialidad_id) 
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
     * Actualizar una categoría existente
     */
    public function update($datos)
    {
        try {
            $id = (int) $datos->id;
            $nombre = addslashes($datos->nombre ?? '');
            $descripcion = addslashes($datos->descripcion ?? '');
            $sla_id = isset($datos->sla_id) && $datos->sla_id > 0 ? (int)$datos->sla_id : null;
            
            // Si se proporcionan tiempos personalizados, crear un nuevo SLA
            if (isset($datos->tiempo_respuesta) && isset($datos->tiempo_resolucion)) {
                $tiempo_respuesta = (int)$datos->tiempo_respuesta;
                $tiempo_resolucion = (int)$datos->tiempo_resolucion;
                
                // Crear SLA personalizado
                $nombreSLA = "SLA - " . $nombre;
                $vSqlSLA = "INSERT INTO sla (nombre, tiempo_respuesta, tiempo_resolucion) 
                           VALUES ('$nombreSLA', $tiempo_respuesta, $tiempo_resolucion)";
                $sla_id = $this->enlace->executeSQL_DML_last($vSqlSLA);
            }

            // Actualizar categoría
            $vSql = "UPDATE categorias SET 
                        nombre = '$nombre',
                        descripcion = '$descripcion',
                        sla_id = " . ($sla_id ? $sla_id : "NULL") . "
                     WHERE id = $id";

            $this->enlace->executeSQL_DML($vSql);

            // Actualizar etiquetas
            if (isset($datos->etiquetas)) {
                // Primero, desasociar todas las etiquetas actuales de esta categoría
                $vSqlRemoveEtiq = "UPDATE etiquetas SET categoria_id = NULL WHERE categoria_id = $id";
                $this->enlace->executeSQL_DML($vSqlRemoveEtiq);
                
                // Convertir a array si es necesario
                $etiquetas = is_array($datos->etiquetas) 
                    ? $datos->etiquetas 
                    : (is_object($datos->etiquetas) ? array_values((array)$datos->etiquetas) : []);
                
                // Asociar las nuevas etiquetas
                foreach ($etiquetas as $etiqueta_id) {
                    $etiqueta_id = (int)$etiqueta_id;
                    $vSqlEtiq = "UPDATE etiquetas SET categoria_id = $id WHERE id = $etiqueta_id";
                    $this->enlace->executeSQL_DML($vSqlEtiq);
                }
            }

            // Actualizar especialidades
            if (isset($datos->especialidades)) {
                // Eliminar especialidades actuales
                $vSqlDeleteEsp = "DELETE FROM categoria_especialidad WHERE categoria_id = $id";
                $this->enlace->executeSQL_DML($vSqlDeleteEsp);
                
                // Convertir a array si es necesario
                $especialidades = is_array($datos->especialidades) 
                    ? $datos->especialidades 
                    : (is_object($datos->especialidades) ? array_values((array)$datos->especialidades) : []);
                
                // Insertar nuevas especialidades
                foreach ($especialidades as $especialidad_id) {
                    $esp_id = (int)$especialidad_id;
                    $vSqlEsp = "INSERT INTO categoria_especialidad (categoria_id, especialidad_id) 
                               VALUES ($id, $esp_id)";
                    $this->enlace->executeSQL_DML($vSqlEsp);
                }
            }

            return $this->getDetalle($id);
        } catch (Exception $e) {
            handleException($e);
            return null;
        }
    }

    /**
     * Obtener detalle completo de una categoría
     */
    public function getDetalle($id)
    {
        try {
            // Obtener la información básica de la categoría
            $vSqlCategoria = "SELECT c.id, c.nombre, c.descripcion, c.sla_id,
                                    s.nombre AS sla_nombre,
                                    s.tiempo_respuesta,
                                    s.tiempo_resolucion
                             FROM categorias c
                             LEFT JOIN sla s ON c.sla_id = s.id
                             WHERE c.id = $id";
            $categoria = $this->enlace->ExecuteSQL($vSqlCategoria, 'asoc');
            
            if (empty($categoria)) {
                return null;
            }
            
            $categoria = $categoria[0];

            // Obtener etiquetas asociadas a esta categoría
            $etiquetas = [];
            try {
                $vSqlEtiquetas = "SELECT id, nombre 
                                 FROM etiquetas 
                                 WHERE categoria_id = $id
                                 ORDER BY nombre ASC";
                $resultEtiq = $this->enlace->ExecuteSQL($vSqlEtiquetas, 'asoc');
                $etiquetas = is_array($resultEtiq) ? $resultEtiq : [];
            } catch (Exception $ex) {
                $etiquetas = [];
            }

            // Obtener especialidades asociadas a esta categoría
            $especialidades = [];
            try {
                $vSqlEspecialidades = "SELECT e.id, e.nombre
                                      FROM especialidades e
                                      INNER JOIN categoria_especialidad ce ON e.id = ce.especialidad_id
                                      WHERE ce.categoria_id = $id
                                      ORDER BY e.nombre ASC";
                $resultEsp = $this->enlace->ExecuteSQL($vSqlEspecialidades, 'asoc');
                $especialidades = is_array($resultEsp) ? $resultEsp : [];
            } catch (Exception $ex) {
                $especialidades = [];
            }

            // Contar tickets asociados a esta categoría
            $totalTickets = 0;
            $estadisticas = [];
            try {
                $vSqlTickets = "SELECT COUNT(*) as total FROM tickets WHERE categoria_id = $id";
                $ticketCount = $this->enlace->ExecuteSQL($vSqlTickets, 'asoc');
                $totalTickets = $ticketCount[0]['total'] ?? 0;

                // Obtener estadísticas de tickets por estado
                $vSqlEstados = "SELECT 
                                  estado, 
                                  COUNT(*) as cantidad 
                                FROM tickets 
                                WHERE categoria_id = $id 
                                GROUP BY estado";
                $estadisticas = $this->enlace->ExecuteSQL($vSqlEstados, 'asoc');
            } catch (Exception $ex) {
                $totalTickets = 0;
                $estadisticas = [];
            }

            // Respuesta final con información completa
            return [
                'id' => $categoria['id'],
                'nombre' => $categoria['nombre'],
                'descripcion' => $categoria['descripcion'],
                'sla' => $categoria['sla_id'] ? [
                    'id' => $categoria['sla_id'],
                    'nombre' => $categoria['sla_nombre'],
                    'tiempo_respuesta' => $categoria['tiempo_respuesta'],
                    'tiempo_resolucion' => $categoria['tiempo_resolucion']
                ] : null,
                'etiquetas' => $etiquetas,
                'especialidades' => $especialidades,
                'total_tickets' => $totalTickets,
                'estadisticas' => $estadisticas
            ];
        } catch (Exception $e) {
            handleException($e);
            return null;
        }
    }

}
