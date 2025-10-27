import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import CategoriaService from '../../services/CategoriaService';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import CategoryIcon from '@mui/icons-material/Category';
import IconButton from '@mui/material/IconButton';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Tooltip from '@mui/material/Tooltip';

export default function ListCategorias() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    CategoriaService.getAll()
      .then((res) => {
        const list = Array.isArray(res) ? res : (res?.data || res || []);
        if (mounted) setData(list);
      })
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
    return () => (mounted = false);
  }, []);

  return (
    <Container maxWidth="md" sx={{ mt: 3 }}>
      <Paper sx={{ p: 2 }} elevation={2}>
        <Typography variant="h5" component="h2" gutterBottom>
          Categorías
        </Typography>

        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Typography color="error">Error al cargar categorías</Typography>
        ) : data.length === 0 ? (
          <Typography color="text.secondary">No hay categorías registradas</Typography>
        ) : (
          <List>
            {data.map((categoria, idx) => (
              <div key={categoria.id || idx}>
                <ListItem 
                  disablePadding
                  secondaryAction={
                    <Tooltip title="Ver detalle">
                      <IconButton 
                        edge="end" 
                        component={RouterLink} 
                        to={`/categoria/${categoria.id}`}
                        color="primary"
                      >
                        <ArrowForwardIcon />
                      </IconButton>
                    </Tooltip>
                  }
                >
                  <ListItemButton component={RouterLink} to={`/categoria/${categoria.id}`}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <CategoryIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={<Typography variant="h6" color="primary">{categoria.nombre}</Typography>}
                      secondary={categoria.descripcion || 'Sin descripción'}
                    />
                  </ListItemButton>
                </ListItem>
                {idx < data.length - 1 && <Divider variant="inset" component="li" />}
              </div>
            ))}
          </List>
        )}
      </Paper>
    </Container>
  );
}
