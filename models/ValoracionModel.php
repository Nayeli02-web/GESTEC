<?php

require_once __DIR__ . '/../controllers/core/MySqlConnect.php';

class ValoracionModel {
    private $db;

    public function __construct() {
        $this->db = new MySqlConnect();
    }

    /**
     * Crear una nueva valoración
     */
    public function crear($data) {
        $ticketId = $data['ticket_id'];
        $puntuacion = $data['puntuacion'];
        $comentario = mysqli_real_escape_string(new mysqli(), $data['comentario']);
        $usuarioId = $_SESSION['usuario_id'];

        $sql = "INSERT INTO valoraciones (ticket_id, puntuacion, comentario, fecha, usuario_id) 
                VALUES ($ticketId, $puntuacion, '$comentario', NOW(), $usuarioId)";
        
        return $this->db->executeSQL_DML_last($sql);
    }

    /**
     * Verificar si ya existe una valoración para un ticket
     */
    public function existeValoracion($ticketId) {
        $sql = "SELECT COUNT(*) as total FROM valoraciones WHERE ticket_id = $ticketId";
        $result = $this->db->executeSQL($sql, 'asoc');
        return !empty($result) && $result[0]['total'] > 0;
    }

    /**
     * Obtener valoraciones de un técnico específico
     */
    public function obtenerPorTecnico($tecnicoId) {
        $sql = "SELECT v.*, t.id as ticket_id, t.titulo, t.fecha_cierre,
                       u.nombre as cliente_nombre
                FROM valoraciones v
                INNER JOIN tickets t ON v.ticket_id = t.id
                INNER JOIN usuarios u ON v.usuario_id = u.id
                WHERE t.tecnico_id = $tecnicoId
                ORDER BY v.fecha DESC";
        
        return $this->db->executeSQL($sql, 'asoc');
    }

    /**
     * Calcular el promedio de valoraciones de un técnico
     */
    public function calcularPromedio($tecnicoId) {
        $sql = "SELECT AVG(v.puntuacion) as promedio, COUNT(*) as total
                FROM valoraciones v
                INNER JOIN tickets t ON v.ticket_id = t.id
                WHERE t.tecnico_id = $tecnicoId";
        
        $result = $this->db->executeSQL($sql, 'asoc');
        if (empty($result)) {
            return [
                'promedio' => 0,
                'total_valoraciones' => 0
            ];
        }
        return [
            'promedio' => round($result[0]['promedio'], 2),
            'total_valoraciones' => $result[0]['total']
        ];
    }

    /**
     * Obtener todas las valoraciones con información del ticket y técnico
     */
    public function obtenerTodas() {
        $sql = "SELECT v.*, t.id as ticket_id, t.titulo, t.tecnico_id,
                       tech.nombre as tecnico_nombre,
                       u.nombre as cliente_nombre
                FROM valoraciones v
                INNER JOIN tickets t ON v.ticket_id = t.id
                INNER JOIN usuarios tech ON t.tecnico_id = tech.id
                INNER JOIN usuarios u ON v.usuario_id = u.id
                ORDER BY v.fecha DESC";
        
        return $this->db->executeSQL($sql, 'asoc');
    }

    /**
     * Verificar si el ticket está cerrado
     */
    public function ticketEstaCerrado($ticketId) {
        $sql = "SELECT estado FROM tickets WHERE id = $ticketId";
        $result = $this->db->executeSQL($sql, 'asoc');
        return !empty($result) && $result[0]['estado'] === 'cerrado';
    }

    /**
     * Verificar si el usuario es el creador del ticket
     */
    public function esCreadorDelTicket($ticketId, $usuarioId) {
        $sql = "SELECT usuario_id FROM tickets WHERE id = $ticketId";
        $result = $this->db->executeSQL($sql, 'asoc');
        return !empty($result) && $result[0]['usuario_id'] == $usuarioId;
    }

    /**
     * Eliminar una valoración (solo admin)
     */
    public function eliminar($valoracionId) {
        $sql = "DELETE FROM valoraciones WHERE id = $valoracionId";
        return $this->db->executeSQL_DML($sql);
    }
}
