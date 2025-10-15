import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import TecnicoService from '../../services/TecnicoService';

export default function ListTecnicos() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    TecnicoService.getAll()
      .then((res) => {
        if (mounted) setData(res.data || res || []);
      })
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
    return () => (mounted = false);
  }, []);

  if (loading) return <div>Cargando técnicos...</div>;
  if (error) return <div>Error al cargar técnicos</div>;

  return (
    <div>
      <h2>Técnicos</h2>
      <ul>
        {data.map((t) => (
          <li key={t.id}>
            <Link to={`/home-tecnico?id=${t.id}`}>
              {t.nombre} — {t.correo} — {t.telefono}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
