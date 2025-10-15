import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';

export default function HomeTec() {
  const tecnico = {
    nombre: 'Nombre Técnico',
    puesto: 'Soporte Técnico',
    correo: 'tecnico@gestec.local',
    telefono: '+506 8888-8888',
    ubicacion: 'San José, Costa Rica'
  };

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', mt: 4, px: 2 }}>
      <Typography variant="h4" gutterBottom>Datos del Técnico</Typography>
      <Paper sx={{ p: 3 }} elevation={1}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2">Nombre</Typography>
            <Typography variant="body1">{tecnico.nombre}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2">Puesto</Typography>
            <Typography variant="body1">{tecnico.puesto}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2">Correo</Typography>
            <Typography variant="body1">{tecnico.correo}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2">Teléfono</Typography>
            <Typography variant="body1">{tecnico.telefono}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2">Ubicación</Typography>
            <Typography variant="body1">{tecnico.ubicacion}</Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}
