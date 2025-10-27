import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import TecnicoService from '../../services/TecnicoService';
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
import IconButton from '@mui/material/IconButton';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Tooltip from '@mui/material/Tooltip';

export default function ListTecnicos() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    TecnicoService.getAll()
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
          Técnicos
        </Typography>

        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Typography color="error">Error al cargar técnicos</Typography>
        ) : (
          <List>
            {data.map((t, idx) => (
              <div key={t.id || idx}>
                <ListItem 
                  disablePadding
                  secondaryAction={
                    <Tooltip title="Ver detalle">
                      <IconButton 
                        edge="end" 
                        component={RouterLink} 
                        to={`/tecnico/${t.id}`}
                        color="primary"
                      >
                        <ArrowForwardIcon />
                      </IconButton>
                    </Tooltip>
                  }
                >
                  <ListItemButton component={RouterLink} to={`/tecnico/${t.id}`}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {(t.nombre || '').split(' ').map(n=>n[0]).slice(0,2).join('')}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={<Typography variant="h6" color="primary">{t.nombre}</Typography>}
                      secondary={`${t.correo} — ${t.telefono}`}
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
