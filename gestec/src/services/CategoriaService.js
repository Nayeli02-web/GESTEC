const BASE = import.meta.env.VITE_BASE_URL || 'http://localhost:81/GESTEC/';
const BASE_URL = BASE + 'categoria';

async function fetchWithFallback(path, options) {
  
  try {
    const res = await fetch(path, options);
    if (!res.ok) throw res;
    return res;
  } catch {
    // Remove leading slash and extract the path after BASE_URL
    let cleanPath = path.replace(/^\//, '');
    
    // If path starts with BASE_URL (categoria), use it directly
    // Otherwise, assume it's already the full path we want
    const fallback = 'http://localhost:81/GESTEC/' + cleanPath;
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
  async getDetalle(id) {
    const res = await fetchWithFallback(BASE_URL + '/detalle/' + id);
    return res.json();
  },
  async getAll() {
    const res = await fetchWithFallback(BASE_URL);
    return res.json();
  },
  async create(categoria) {
    const res = await fetchWithFallback(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(categoria),
    });
    return res.json();
  },
  async update(categoria) {
    const res = await fetchWithFallback(BASE_URL + '/' + (categoria.id || ''), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(categoria),
    });
    return res.json();
  },
};
