const API_URL = 'http://localhost:81/GESTEC/';

const ValoracionService = {
  /**
   * Crear valoración para un ticket
   */
  crear: async (ticketId, valoracionData) => {
    try {
      const response = await fetch(`${API_URL}valoracion/crear`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ticket_id: ticketId,
          ...valoracionData
        })
      });
      return await response.json();
    } catch (error) {
      console.error('Error al crear valoración:', error);
      throw error;
    }
  },

  /**
   * Obtener valoraciones de un técnico
   */
  obtenerPorTecnico: async (tecnicoId) => {
    try {
      const response = await fetch(`${API_URL}valoracion/tecnico/${tecnicoId}`, {
        method: 'GET',
        credentials: 'include'
      });
      return await response.json();
    } catch (error) {
      console.error('Error al obtener valoraciones:', error);
      throw error;
    }
  },

  /**
   * Obtener promedio de valoraciones de un técnico
   */
  obtenerPromedio: async (tecnicoId) => {
    try {
      const response = await fetch(`${API_URL}valoracion/promedio/${tecnicoId}`, {
        method: 'GET',
        credentials: 'include'
      });
      return await response.json();
    } catch (error) {
      console.error('Error al obtener promedio:', error);
      throw error;
    }
  },

  /**
   * Listar todas las valoraciones (admin)
   */
  listarTodas: async () => {
    try {
      const response = await fetch(`${API_URL}valoracion/todas`, {
        method: 'GET',
        credentials: 'include'
      });
      return await response.json();
    } catch (error) {
      console.error('Error al listar valoraciones:', error);
      throw error;
    }
  }
};

export default ValoracionService;
