import axios from "axios";

const BASE_URL = "http://localhost:81/GESTEC/";

const NotificacionService = {
  /**
   * Obtener todas las notificaciones del usuario
   */
  obtenerNotificaciones: async () => {
    try {
      const response = await axios.get(`${BASE_URL}notificacion`);
      return response.data;
    } catch (error) {
      console.error("Error al obtener notificaciones:", error);
      throw error;
    }
  },

  /**
   * Obtener solo notificaciones no leídas
   */
  obtenerNoLeidas: async () => {
    try {
      const response = await axios.get(`${BASE_URL}notificacion/noleidas`);
      return response.data;
    } catch (error) {
      console.error("Error al obtener notificaciones no leídas:", error);
      throw error;
    }
  },

  /**
   * Contar notificaciones no leídas
   */
  contarNoLeidas: async () => {
    try {
      const response = await axios.get(`${BASE_URL}notificacion/contar`);
      return response.data;
    } catch (error) {
      console.error("Error al contar notificaciones:", error);
      throw error;
    }
  },

  /**
   * Marcar notificación como leída
   */
  marcarComoLeida: async (notificacionId) => {
    try {
      const response = await axios.put(`${BASE_URL}notificacion/leer/${notificacionId}`);
      return response.data;
    } catch (error) {
      console.error("Error al marcar notificación:", error);
      throw error;
    }
  },

  /**
   * Marcar todas como leídas
   */
  marcarTodasLeidas: async () => {
    try {
      const response = await axios.put(`${BASE_URL}notificacion/leertodas`);
      return response.data;
    } catch (error) {
      console.error("Error al marcar todas:", error);
      throw error;
    }
  },

  /**
   * Eliminar notificación
   */
  eliminar: async (notificacionId) => {
    try {
      const response = await axios.delete(`${BASE_URL}notificacion/${notificacionId}`);
      return response.data;
    } catch (error) {
      console.error("Error al eliminar notificación:", error);
      throw error;
    }
  },

  /**
   * Registrar inicio de sesión
   */
  registrarInicioSesion: async (usuarioId) => {
    try {
      const response = await axios.post(`${BASE_URL}notificacion/sesion`, {
        usuario_id: usuarioId,
      });
      return response.data;
    } catch (error) {
      console.error("Error al registrar inicio de sesión:", error);
      throw error;
    }
  },

  /**
   * Obtener historial de inicios de sesión
   */
  obtenerHistorialSesiones: async () => {
    try {
      const response = await axios.get(`${BASE_URL}notificacion/historial-sesiones`);
      return response.data;
    } catch (error) {
      console.error("Error al obtener historial:", error);
      throw error;
    }
  },
};

export default NotificacionService;
