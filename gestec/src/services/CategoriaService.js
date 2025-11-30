const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:81/GESTEC/';

async function fetchWithFallback(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) throw res;
  return res;
}

export default {
  async getById(id) {
    const res = await fetchWithFallback(`${BASE_URL}categoria/${id}`);
    return res.json();
  },
  async getDetalle(id) {
    const res = await fetchWithFallback(`${BASE_URL}categoria/detalle/${id}`);
    return res.json();
  },
  async getAll() {
    const res = await fetchWithFallback(`${BASE_URL}categoria`);
    return res.json();
  },
  async create(categoria) {
    const res = await fetchWithFallback(`${BASE_URL}categoria`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(categoria),
    });
    return res.json();
  },
  async update(categoria) {
    const res = await fetchWithFallback(`${BASE_URL}categoria/${categoria.id || ''}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(categoria),
    });
    return res.json();
  },
};
