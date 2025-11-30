const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:81/GESTEC/';

async function fetchWithFallback(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) throw res;
  return res;
}

export default {
  async getAll(usuarioId, rol) {
    const params = new URLSearchParams();
    if (usuarioId) params.append('usuario_id', usuarioId);
    if (rol) params.append('rol', rol);
    
    const url = `${BASE_URL}ticket${params.toString() ? '?' + params.toString() : ''}`;
    const res = await fetchWithFallback(url);
    return res.json();
  },
  
  async getById(id) {
    const res = await fetchWithFallback(`${BASE_URL}ticket/${id}`);
    return res.json();
  },
  
  async getDetalle(id) {
    const res = await fetchWithFallback(`${BASE_URL}ticket/detalle/${id}`);
    return res.json();
  },
  
  async create(ticket) {
    const res = await fetchWithFallback(`${BASE_URL}ticket`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ticket),
    });
    return res.json();
  },
  
  async update(ticket) {
    const res = await fetchWithFallback(`${BASE_URL}ticket/${ticket.id || ''}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ticket),
    });
    return res.json();
  },
  
  async updateEstado(id, formData) {
    try {
      // Si es FormData (contiene imagen), usar POST para que $_POST y $_FILES funcionen
      // Si es JSON, usar PUT
      const isFormData = formData instanceof FormData;
      const method = isFormData ? 'POST' : 'PUT';
      const headers = isFormData ? {} : { 'Content-Type': 'application/json' };
      const body = isFormData ? formData : JSON.stringify(formData);
      
      const res = await fetchWithFallback(`${BASE_URL}ticket/estado/${id}`, {
        method: method,
        headers: headers,
        body: body,
      });
      return res.json();
    } catch (error) {
      // Si el error es una Response, intentar extraer el mensaje
      if (error instanceof Response) {
        const errorData = await error.json();
        throw new Error(errorData.message || errorData.result || 'Error al actualizar estado');
      }
      throw error;
    }
  },
};
