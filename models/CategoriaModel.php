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
            $nombre = addslashes($datos->nombre);
            $descripcion = addslashes($datos->descripcion ?? '');

            $vSql = "INSERT INTO categorias (nombre, descripcion) 
                     VALUES ('$nombre', '$descripcion')";
            $idNuevo = $this->enlace->executeSQL_DML_last($vSql);

            return $this->get($idNuevo);
        } catch (Exception $e) {
            handleException($e);
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

            $vSql = "UPDATE categorias SET 
                        nombre = '$nombre',
                        descripcion = '$descripcion'
                     WHERE id = $id";

            $this->enlace->executeSQL_DML($vSql);
            return $this->get($id);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /**
     * Obtener detalle completo de una categoría
     */
    public function getDetalle($id)
    {
        try {
            // Obtener la información básica de la categoría
            $vSqlCategoria = "SELECT id, nombre, descripcion FROM categorias WHERE id = $id";
            $categoria = $this->enlace->ExecuteSQL($vSqlCategoria, 'asoc');
            
            if (empty($categoria)) {
                return null;
            }
            
            $categoria = $categoria[0];

            $etiquetas = [];
            try {
                $vSqlEtiquetas = "SELECT DISTINCT 
                                    SUBSTRING_INDEX(SUBSTRING_INDEX(titulo, ' ', n), ' ', -1) as palabra
                                  FROM tickets t
                                  CROSS JOIN (
                                    SELECT 1 as n UNION ALL SELECT 2 UNION ALL SELECT 3 
                                    UNION ALL SELECT 4 UNION ALL SELECT 5
                                  ) numbers
                                  WHERE t.categoria_id = $id 
                                    AND LENGTH(titulo) - LENGTH(REPLACE(titulo, ' ', '')) >= n - 1
                                  LIMIT 10";
                $etiquetas = $this->enlace->ExecuteSQL($vSqlEtiquetas, 'asoc');
            } catch (Exception $ex) {
                $etiquetas = [];
            }

            // Obtener especialidades de los técnicos que trabajan en esta categoría
            $especialidades = [];
            try {
                $vSqlEspecialidades = "SELECT DISTINCT 
                                        e.id, 
                                        e.nombre
                                      FROM especialidades e
                                      INNER JOIN tecnico_especialidad te ON e.id = te.especialidad_id
                                      INNER JOIN tickets t ON te.tecnico_id = t.tecnico_id
                                      WHERE t.categoria_id = $id";
                $especialidades = $this->enlace->ExecuteSQL($vSqlEspecialidades, 'asoc');
            } catch (Exception $ex) {
                $especialidades = [];
            }

            // Obtener SLA más utilizado para esta categoría
            $sla = null;
            try {
                $vSqlSLA = "SELECT 
                              s.id,
                              s.nombre,
                              s.tiempo_respuesta,
                              s.tiempo_resolucion,
                              COUNT(t.id) as uso_count
                            FROM sla s
                            INNER JOIN tickets t ON s.id = t.sla_id
                            WHERE t.categoria_id = $id
                            GROUP BY s.id, s.nombre, s.tiempo_respuesta, s.tiempo_resolucion
                            ORDER BY uso_count DESC
                            LIMIT 1";
                $slaResult = $this->enlace->ExecuteSQL($vSqlSLA, 'asoc');
                if (!empty($slaResult)) {
                    $sla = [
                        'id' => $slaResult[0]['id'],
                        'nombre' => $slaResult[0]['nombre'],
                        'tiempo_respuesta_minutos' => $slaResult[0]['tiempo_respuesta'],
                        'tiempo_resolucion_minutos' => $slaResult[0]['tiempo_resolucion']
                    ];
                }
            } catch (Exception $ex) {
                $sla = null;
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
                'etiquetas' => $etiquetas,
                'especialidades' => $especialidades,
                'sla' => $sla,
                'total_tickets' => $totalTickets,
                'estadisticas' => $estadisticas
            ];
        } catch (Exception $e) {
            handleException($e);
            return null;
        }
    }

}
