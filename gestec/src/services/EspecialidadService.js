const BASE_URL = 'http://localhost:81/GESTEC';

const EspecialidadService = {
  async getAll() {
    const response = await fetch(`${BASE_URL}/especialidad`);
    if (!response.ok) throw new Error('Error al cargar especialidades');
    return response.json();
  }
};

export default EspecialidadService;
