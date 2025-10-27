const BASE = import.meta.env.VITE_BASE_URL || '';
const BASE_URL = BASE + 'ticket';

async function fetchWithFallback(path, options) {

  try {
    const res = await fetch(path, options);
    if (!res.ok) throw res;
    return res;
  } catch {
    
    const fallback = 'http://localhost:81/GESTEC/' + path.replace(/^\//, '');
    const res2 = await fetch(fallback, options);
    if (!res2.ok) throw res2;
    return res2;
  }
}

export default {
  async getAll(usuarioId, rol) {
    const params = new URLSearchParams();
    if (usuarioId) params.append('usuario_id', usuarioId);
    if (rol) params.append('rol', rol);
    
    const url = `${BASE_URL}${params.toString() ? '?' + params.toString() : ''}`;
    const res = await fetchWithFallback(url);
    return res.json();
  },
  
  async getById(id) {
    const res = await fetchWithFallback(BASE_URL + '/' + id);
    return res.json();
  },
  
  async getDetalle(id) {
    const res = await fetchWithFallback(BASE_URL + '/detalle/' + id);
    return res.json();
  },
  
  async create(ticket) {
    const res = await fetchWithFallback(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ticket),
    });
    return res.json();
  },
  
  async update(ticket) {
    const res = await fetchWithFallback(BASE_URL + '/' + (ticket.id || ''), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ticket),
    });
    return res.json();
  },
};
