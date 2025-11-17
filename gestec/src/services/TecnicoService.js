const BASE = import.meta.env.VITE_BASE_URL || '';
const BASE_URL = BASE + 'tecnico';

function parseJsonSafe(res) {
  try {
    return res.json ? res.json() : Promise.resolve(res.data);
  } catch (e) {
    return Promise.resolve(null);
  }
}

async function fetchWithFallback(path, options) {
  // First try relative (Vite proxy)
  try {
    const res = await fetch(path, options);
    if (!res.ok) throw res;
    return res;
  } catch (e) {
    // fallback to direct backend
    const fallback = 'http://localhost:81/GESTEC/' + path.replace(/^\//, '');
    const res2 = await fetch(fallback, options);
    if (!res2.ok) throw res2;
    return res2;
  }
}

export default {
  async getById(id) {
    const res = await fetchWithFallback(BASE_URL + '/' + id);
    return res.json();
  },
  async getAll() {
    const res = await fetchWithFallback(BASE_URL);
    return res.json();
  },
  async getDetalle(id) {
    const res = await fetchWithFallback(BASE_URL + '/detalle/' + id);
    return res.json();
  },
  async update(tecnico) {
    const res = await fetchWithFallback(BASE_URL + '/' + (tecnico.id || ''), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tecnico),
    });
    return res.json();
  },
  async create(tecnico) {
    const res = await fetchWithFallback(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tecnico),
    });
    return res.json();
  },
};
