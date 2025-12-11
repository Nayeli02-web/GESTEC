const API_URL = 'http://localhost:81/GESTEC';

export const AuthService = {
  async login(correo, contrasena) {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ correo, contrasena }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error en el login');
      }

      return data;
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  },

  async register(nombre, correo, contrasena, rol_id = 2) {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ nombre, correo, contrasena, rol_id }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error en el registro');
      }

      return data;
    } catch (error) {
      console.error('Error en registro:', error);
      throw error;
    }
  },

  async logout() {
    try {
      const response = await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error en el logout');
      }

      return data;
    } catch (error) {
      console.error('Error en logout:', error);
      throw error;
    }
  },

  async getSession() {
    try {
      const response = await fetch(`${API_URL}/auth/session`, {
        method: 'GET',
        credentials: 'include',
      });

      const data = await response.json();
      
      if (!response.ok) {
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error obteniendo sesión:', error);
      return null;
    }
  },
};
