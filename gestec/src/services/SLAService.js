const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:81/GESTEC/';

async function fetchWithFallback(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) throw res;
  return res;
}

export default {
  async getAll() {
    const res = await fetchWithFallback(`${BASE_URL}sla`);
    return res.json();
  },
  async getById(id) {
    const res = await fetchWithFallback(`${BASE_URL}sla/${id}`);
    return res.json();
  },
};
