import axios from "axios";

const BASE_URL = "http://localhost:81/GESTEC/";

const AutoTriageService = {
  /**
   * Ejecutar asignación automática
   */
  ejecutarAutoTriage: async () => {
    try {
      const response = await axios.post(`${BASE_URL}autotriage/ejecutar`);
      return response.data;
    } catch (error) {
      console.error("Error al ejecutar AutoTriage:", error);
      throw error;
    }
  },

  /**
   * Obtener estadísticas de asignaciones automáticas
   */
  obtenerEstadisticas: async () => {
    try {
      const response = await axios.get(`${BASE_URL}autotriage/estadisticas`);
      return response.data;
    } catch (error) {
      console.error("Error al obtener estadísticas:", error);
      throw error;
    }
  },

  /**
   * ASIGNACIÓN MANUAL: Obtener información para asignar manualmente un ticket
   */
  obtenerInfoAsignacionManual: async (ticketId) => {
    try {
      const response = await axios.get(`${BASE_URL}autotriage/manual/${ticketId}`);
      return response.data;
    } catch (error) {
      console.error("Error al obtener información de asignación manual:", error);
      throw error;
    }
  },

  /**
   * ASIGNACIÓN MANUAL: Asignar ticket manualmente a un técnico
   */
  asignarManualmente: async (ticketId, tecnicoId, justificacion, usuarioAdminId = 1) => {
    try {
      const response = await axios.post(`${BASE_URL}autotriage/asignar`, {
        ticket_id: ticketId,
        tecnico_id: tecnicoId,
        justificacion: justificacion,
        usuario_admin_id: usuarioAdminId,
      });
      return response.data;
    } catch (error) {
      console.error("Error al asignar manualmente:", error);
      throw error;
    }
  },

  /**
   * ASIGNACIÓN MANUAL: Listar tickets pendientes
   */
  listarTicketsPendientes: async () => {
    try {
      const response = await axios.get(`${BASE_URL}autotriage/pendientes`);
      return response.data;
    } catch (error) {
      console.error("Error al listar tickets pendientes:", error);
      throw error;
    }
  },

  /**
   * ASIGNACIÓN MANUAL: Listar técnicos con carga de trabajo
   */
  listarTecnicosConCarga: async () => {
    try {
      const response = await axios.get(`${BASE_URL}autotriage/tecnicos`);
      return response.data;
    } catch (error) {
      console.error("Error al listar técnicos:", error);
      throw error;
    }
  },
};

export default AutoTriageService;
