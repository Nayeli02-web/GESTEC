import React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItemText from '@mui/material/ListItemText';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import StarIcon from '@mui/icons-material/Star';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemButton from '@mui/material/ListItemButton';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import Grid from '@mui/material/Grid2';
//import ticket from '../../assets/ticket.jpg';
import MovieService from '../../services/MovieService';

export function DetailMovie() {
  const routeParams = useParams();
  console.log(routeParams);
  //Url para acceder a la imagenes guardadas en el API
  const BASE_URL = import.meta.env.VITE_BASE_URL+'uploads'
  //Resultado de consumo del API, respuesta
  const [data, setData] = useState(null);
  //Error del API
  const [error, setError] = useState('');
  //Booleano para establecer sí se ha recibido respuesta
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    //Llamar al API y obtener una pelicula
    MovieService.getMovieById(routeParams.id)
      .then((response) => {
        setData(response.data);
        console.log(response.data);
        setError(response.error);
        setLoaded(true);
      })
      .catch((error) => {
        console.log(error);
        setError(error);
        throw new Error('Respuesta no válida del servidor');
      });
  }, [routeParams.id]);

  if (!loaded) return <p>Cargando...</p>;
  if (error) return <p>Error: {error.message}</p>;
  return (
    <Container component="main" sx={{ mt: 8, mb: 2 }}>
     
        <Grid container spacing={2}>
          <Grid size={5}>
            <Box
              component="img"
              sx={{
                borderRadius: '4%',
                maxWidth: '100%',
                height: 'auto',
              }}
              alt="Ticket pelicula"
              src={`${BASE_URL}/${data.imagen?.image}`}
            />
          </Grid>
          <Grid size={7}>
            <Typography variant="h4" component="h1" gutterBottom>
              {/* Título pelicula */}
              
            </Typography>
            <Typography variant="subtitle1" component="h1" gutterBottom>
              {/* Año pelicula */}
              
            </Typography>
            <Typography component="span" variant="subtitle1" display="block">
              <Box fontWeight="bold" display="inline">
                {/* Duración o Tiempo pelicula */}
                
              </Box>{' '}
              minutos
            </Typography>
            <Typography component="span" variant="subtitle1" display="block">
              <Box fontWeight="bold" display="inline">
                Idioma:
              </Box>{' '}
              {/* Idioma pelicula */}
              
            </Typography>
            <Typography component="span" variant="subtitle1" display="block">
              <Box fontWeight="bold" display="inline">
                Director:
              </Box>{' '}
              {/* Nombre completo Director */}
              
            </Typography>
            <Typography component="span" variant="subtitle1">
              <Box fontWeight="bold">Generos:</Box>
              <List
                sx={{
                  width: '100%',
                  maxWidth: 360,
                  bgcolor: 'background.paper',
                }}
              >
                {/* Lista de generos de la pelicula */}
              
                  <ListItemButton >
                    <ListItemIcon>
                      <ArrowRightIcon />
                    </ListItemIcon>
                    <ListItemText primary="Nombre Genero" />
                  </ListItemButton>
               
              </List>
            </Typography>
            <Typography component="span" variant="subtitle1">
              <Box fontWeight="bold">Actores:</Box>
              <List
                sx={{
                  width: '100%',
                  maxWidth: 360,
                  bgcolor: 'background.paper',
                }}
              >
                {/* Lista de actores de la pelicula */}
                
                  <ListItemButton>
                    <ListItemIcon>
                      <StarIcon />
                    </ListItemIcon>
                    <ListItemText primary="Nombre Completo Actor" />
                  </ListItemButton>
               
              </List>
            </Typography>
          </Grid>
        </Grid>
      
    </Container>
  );
}
