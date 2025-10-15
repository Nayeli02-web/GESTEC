import React from 'react';
import { useState } from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Grid from '@mui/material/Grid2';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import AccessTime from '@mui/icons-material/AccessTime';
import Language from '@mui/icons-material/Language';
import { Link } from 'react-router-dom';
import { Info } from '@mui/icons-material';

export function ListMovies() {
  //Resultado de consumo del API, respuesta
  const [data, setData] = useState(null);
  //Error del API
  const [error, setError] = useState('');
  //Booleano para establecer sí se ha recibido respuesta
  const [loaded, setLoaded] = useState(false);
  let idShopRental = 1;
  //Llamar al API y obtener la lista de peliculas de una tienda

  return (
    <Grid container sx={{ p: 2 }} spacing={3}>
        <Grid size={4} >
          <Card>
            <CardHeader
              sx={{
                p: 0,
                backgroundColor: (theme) => theme.palette.secondary.main,
                color: (theme) => theme.palette.common.white,
              }}
              style={{ textAlign: 'center' }}
              title="Título pelicula"
              subheader="Año pelicula"
            />
            <CardMedia
              component="img"
              image="url imagen"
              alt="Nombre"
            />
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                <AccessTime /> Tiempo: minutos
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <Language /> Idioma: 
              </Typography>
            </CardContent>
            <CardActions
              disableSpacing
              sx={{
                backgroundColor: (theme) => theme.palette.action.focus,
                color: (theme) => theme.palette.common.white,
              }}
            >
              <IconButton
                component={Link}
                to={`/movie/`}
                aria-label="Detalle"
                sx={{ ml: 'auto' }}
              >
                <Info />
              </IconButton>
             
            </CardActions>
          </Card>
        </Grid>
  
  </Grid>
  )
 
}
