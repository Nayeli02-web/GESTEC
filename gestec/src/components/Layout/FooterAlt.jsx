import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

export default function FooterAlt() {
  return (
    <footer>
      <Container maxWidth="xl" sx={{ py: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} GESTEC. Todos los derechos reservados.
        </Typography>
      </Container>
    </footer>
  );
}
