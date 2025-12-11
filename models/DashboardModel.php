<?php

require_once __DIR__ . '/../controllers/core/MySqlConnect.php';

class DashboardModel {
    private $db;

    public function __construct() {
        $this->db = new MySqlConnect();
    }

    /**
     * Obtener tickets creados por mes (últimos 6 meses)
     */
    public function getTicketsPorMes() {
        $sql = "SELECT 
                    DATE_FORMAT(fecha_creacion, '%Y-%m') as mes,
                    DATE_FORMAT(fecha_creacion, '%M %Y') as mes_nombre,
                    COUNT(*) as total
                FROM tickets
                WHERE fecha_creacion >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
                GROUP BY DATE_FORMAT(fecha_creacion, '%Y-%m')
                ORDER BY mes ASC";
        
        $result = $this->db->executeSQL($sql, 'asoc');
        return $result ? $result : [];
    }

    /**
     * Calcular promedio general de valoraciones
     */
    public function getPromedioValoraciones() {
        $sql = "SELECT AVG(puntuacion) as promedio, COUNT(*) as total
                FROM valoraciones";
        
        $result = $this->db->executeSQL($sql, 'asoc');
        if (empty($result)) {
            return ['promedio' => 0, 'total' => 0];
        }
        return [
            'promedio' => round($result[0]['promedio'], 2),
            'total' => $result[0]['total']
        ];
    }

    /**
     * Calcular porcentaje de cumplimiento SLA
     */
    public function getCumplimientoSLA() {
        // SLA Respuesta
        $sqlRespuesta = "SELECT 
            COUNT(*) as total,
            SUM(CASE 
                WHEN TIMESTAMPDIFF(MINUTE, fecha_creacion, 
                    COALESCE((SELECT MIN(fecha) FROM historial_tickets WHERE ticket_id = t.id AND estado = 'en_proceso'), NOW())
                ) <= s.tiempo_respuesta * 60 
                THEN 1 ELSE 0 END) as cumplidos
            FROM tickets t
            LEFT JOIN sla s ON t.categoria_id = s.categoria_id AND t.prioridad = s.prioridad
            WHERE t.fecha_creacion >= DATE_SUB(NOW(), INTERVAL 3 MONTH)
            AND s.id IS NOT NULL";
        
        $resultRespuesta = $this->db->executeSQL($sqlRespuesta, 'asoc');
        
        // SLA Resolución
        $sqlResolucion = "SELECT 
            COUNT(*) as total,
            SUM(CASE 
                WHEN TIMESTAMPDIFF(HOUR, fecha_creacion, 
                    COALESCE(fecha_cierre, NOW())
                ) <= s.tiempo_resolucion 
                THEN 1 ELSE 0 END) as cumplidos
            FROM tickets t
            LEFT JOIN sla s ON t.categoria_id = s.categoria_id AND t.prioridad = s.prioridad
            WHERE t.estado = 'cerrado'
            AND t.fecha_creacion >= DATE_SUB(NOW(), INTERVAL 3 MONTH)
            AND s.id IS NOT NULL";
        
        $resultResolucion = $this->db->executeSQL($sqlResolucion, 'asoc');
        
        $porcentajeRespuesta = 0;
        $porcentajeResolucion = 0;
        
        if (!empty($resultRespuesta) && $resultRespuesta[0]['total'] > 0) {
            $porcentajeRespuesta = round(($resultRespuesta[0]['cumplidos'] / $resultRespuesta[0]['total']) * 100, 1);
        }
        
        if (!empty($resultResolucion) && $resultResolucion[0]['total'] > 0) {
            $porcentajeResolucion = round(($resultResolucion[0]['cumplidos'] / $resultResolucion[0]['total']) * 100, 1);
        }
        
        return [
            'respuesta' => $porcentajeRespuesta,
            'resolucion' => $porcentajeResolucion
        ];
    }

    /**
     * Obtener ranking de técnicos por promedio de valoraciones
     */
    public function getRankingTecnicos() {
        $sql = "SELECT 
                    t.tecnico_id,
                    u.nombre as tecnico_nombre,
                    AVG(v.puntuacion) as promedio,
                    COUNT(v.id) as total_valoraciones
                FROM tickets t
                INNER JOIN valoraciones v ON t.id = v.ticket_id
                INNER JOIN usuarios u ON t.tecnico_id = u.id
                GROUP BY t.tecnico_id, u.nombre
                HAVING COUNT(v.id) >= 1
                ORDER BY promedio DESC, total_valoraciones DESC
                LIMIT 10";
        
        $result = $this->db->executeSQL($sql, 'asoc');
        return $result ? $result : [];
    }

    /**
     * Obtener categorías con más incumplimientos de SLA
     */
    public function getCategoriasIncumplimientos() {
        $sql = "SELECT 
                    c.id as categoria_id,
                    c.nombre as categoria_nombre,
                    COUNT(*) as total_tickets,
                    SUM(CASE 
                        WHEN TIMESTAMPDIFF(HOUR, t.fecha_creacion, COALESCE(t.fecha_cierre, NOW())) > s.tiempo_resolucion 
                        THEN 1 ELSE 0 END) as incumplimientos,
                    ROUND((SUM(CASE 
                        WHEN TIMESTAMPDIFF(HOUR, t.fecha_creacion, COALESCE(t.fecha_cierre, NOW())) > s.tiempo_resolucion 
                        THEN 1 ELSE 0 END) / COUNT(*)) * 100, 1) as porcentaje_incumplimiento
                FROM tickets t
                INNER JOIN categorias c ON t.categoria_id = c.id
                LEFT JOIN sla s ON t.categoria_id = s.categoria_id AND t.prioridad = s.prioridad
                WHERE t.fecha_creacion >= DATE_SUB(NOW(), INTERVAL 3 MONTH)
                AND s.id IS NOT NULL
                GROUP BY c.id, c.nombre
                HAVING incumplimientos > 0
                ORDER BY incumplimientos DESC, porcentaje_incumplimiento DESC
                LIMIT 5";
        
        $result = $this->db->executeSQL($sql, 'asoc');
        return $result ? $result : [];
    }

    /**
     * Obtener todas las estadísticas en una sola llamada
     */
    public function getEstadisticasCompletas() {
        return [
            'tickets_por_mes' => $this->getTicketsPorMes(),
            'promedio_valoraciones' => $this->getPromedioValoraciones(),
            'cumplimiento_sla' => $this->getCumplimientoSLA(),
            'ranking_tecnicos' => $this->getRankingTecnicos(),
            'categorias_incumplimientos' => $this->getCategoriasIncumplimientos()
        ];
    }
}
