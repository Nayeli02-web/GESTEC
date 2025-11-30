const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:81/GESTEC/';

function parseJsonSafe(res) {
  try {
    return res.json ? res.json() : Promise.resolve(res.data);
  } catch (e) {
    return Promise.resolve(null);
  }
}

async function fetchWithFallback(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) throw res;
  return res;
}

export default {
  async getById(id) {
    const res = await fetchWithFallback(`${BASE_URL}tecnico/${id}`);
    return res.json();
  },
  async getAll() {
    const res = await fetchWithFallback(`${BASE_URL}tecnico`);
    return res.json();
  },
  async getDetalle(id) {
    const res = await fetchWithFallback(`${BASE_URL}tecnico/detalle/${id}`);
    return res.json();
  },
  async update(tecnico) {
    const res = await fetchWithFallback(`${BASE_URL}tecnico/${tecnico.id || ''}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tecnico),
    });
    return res.json();
  },
  async create(tecnico) {
    const res = await fetchWithFallback(`${BASE_URL}tecnico`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tecnico),
    });
    return res.json();
  },
};
