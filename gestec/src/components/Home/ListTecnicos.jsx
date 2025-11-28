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
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import Box from '@mui/material/Box';
import { useTranslation } from 'react-i18next';

export default function ListTecnicos() {
  const { t } = useTranslation();
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h2">
            {t('technician.list')}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            component={RouterLink}
            to="/tecnico/crear"
          >
            {t('technician.new')}
          </Button>
        </Box>

        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Typography color="error">{t('technician.loadingError')}</Typography>
        ) : (
          <List>
            {data.map((tecnico, idx) => (
              <div key={tecnico.id || idx}>
                <ListItem 
                  disablePadding
                  secondaryAction={
                    <Tooltip title={t('common.viewDetail')}>
                      <IconButton 
                        edge="end" 
                        component={RouterLink} 
                        to={`/tecnico/${tecnico.id}`}
                        color="primary"
                      >
                        <ArrowForwardIcon />
                      </IconButton>
                    </Tooltip>
                  }
                >
                  <ListItemButton component={RouterLink} to={`/tecnico/${tecnico.id}`}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {(tecnico.nombre || '').split(' ').map(n=>n[0]).slice(0,2).join('')}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={<Typography variant="h6" color="primary">{tecnico.nombre}</Typography>}
                      secondary={`${tecnico.correo} — ${tecnico.telefono}`}
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
