const BASE = import.meta.env.VITE_BASE_URL || '';
const BASE_URL = BASE + 'sla';

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
  async getAll() {
    const res = await fetchWithFallback(BASE_URL);
    return res.json();
  },
  async getById(id) {
    const res = await fetchWithFallback(BASE_URL + '/' + id);
    return res.json();
  },
};
