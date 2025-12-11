const API_URL = 'http://localhost:81/GESTEC/';

const DashboardService = {
  /**
   * Obtener todas las estadísticas del dashboard
   */
  getEstadisticas: async () => {
    try {
      const response = await fetch(`${API_URL}dashboard/estadisticas`, {
        method: 'GET',
        credentials: 'include'
      });
      return await response.json();
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      throw error;
    }
  },

  /**
   * Obtener tickets creados por mes
   */
  getTicketsPorMes: async () => {
    try {
      const response = await fetch(`${API_URL}dashboard/ticketspormes`, {
        method: 'GET',
        credentials: 'include'
      });
      return await response.json();
    } catch (error) {
      console.error('Error al obtener tickets por mes:', error);
      throw error;
    }
  },

  /**
   * Obtener promedio general de valoraciones
   */
  getPromedioValoraciones: async () => {
    try {
      const response = await fetch(`${API_URL}dashboard/promediovaloraciones`, {
        method: 'GET',
        credentials: 'include'
      });
      return await response.json();
    } catch (error) {
      console.error('Error al obtener promedio de valoraciones:', error);
      throw error;
    }
  },

  /**
   * Obtener cumplimiento de SLA
   */
  getCumplimientoSLA: async () => {
    try {
      const response = await fetch(`${API_URL}dashboard/cumplimientosla`, {
        method: 'GET',
        credentials: 'include'
      });
      return await response.json();
    } catch (error) {
      console.error('Error al obtener cumplimiento SLA:', error);
      throw error;
    }
  },

  /**
   * Obtener ranking de técnicos
   */
  getRankingTecnicos: async () => {
    try {
      const response = await fetch(`${API_URL}dashboard/rankingtecnicos`, {
        method: 'GET',
        credentials: 'include'
      });
      return await response.json();
    } catch (error) {
      console.error('Error al obtener ranking de técnicos:', error);
      throw error;
    }
  },

  /**
   * Obtener categorías con más incumplimientos
   */
  getCategoriasIncumplimientos: async () => {
    try {
      const response = await fetch(`${API_URL}dashboard/categoriasincumplimientos`, {
        method: 'GET',
        credentials: 'include'
      });
      return await response.json();
    } catch (error) {
      console.error('Error al obtener categorías con incumplimientos:', error);
      throw error;
    }
  }
};

export default DashboardService;
