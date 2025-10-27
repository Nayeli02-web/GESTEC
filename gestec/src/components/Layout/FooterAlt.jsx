import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

export default function FooterAlt() {
  return (
    <Box 
      component="footer" 
      sx={{ 
        bgcolor: '#0097a7', 
        color: 'white', 
        mt: 'auto',
        py: 3
      }}
    >
      <Container maxWidth="xl" sx={{ textAlign: 'center' }}>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
          © {new Date().getFullYear()} GESTEC. Todos los derechos reservados.
        </Typography>
      </Container>
    </Box>
  );
}
