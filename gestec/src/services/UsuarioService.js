const API_URL = 'http://localhost:81/GESTEC/auth';

const UsuarioService = {
  // Listar todos los usuarios
  async getAll() {
    const res = await fetch(`${API_URL}/usuarios`, {
      method: 'GET',
      credentials: 'include',
    });
    return res.json();
  },

  // Obtener usuario por ID
  async getById(id) {
    const res = await fetch(`${API_URL}/usuario/${id}`, {
      method: 'GET',
      credentials: 'include',
    });
    return res.json();
  },

  // Crear nuevo usuario (solo admin)
  async create(usuario) {
    const res = await fetch(`${API_URL}/crear-usuario`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(usuario),
    });
    return res.json();
  },

  // Actualizar usuario (sin contraseña)
  async update(id, usuario) {
    const res = await fetch(`${API_URL}/usuario/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(usuario),
    });
    return res.json();
  },

  // Actualizar contraseña de usuario
  async updatePassword(id, password) {
    const res = await fetch(`${API_URL}/usuario/${id}/password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ password }),
    });
    return res.json();
  },

  // Eliminar usuario
  async delete(id) {
    const res = await fetch(`${API_URL}/usuario/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    return res.json();
  },
};

export default UsuarioService;
