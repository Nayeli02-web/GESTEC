import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { CircularProgress, Box } from '@mui/material';
import PropTypes from 'prop-types';

export const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si se requiere un rol específico, verificarlo
  if (requiredRole && user.rol_id !== requiredRole) {
    // Redirigir según el rol del usuario
    if (user.rol_id === 1) {
      return <Navigate to="/" replace />;
    } else if (user.rol_id === 3) {
      return <Navigate to="/asignaciones" replace />;
    } else {
      return <Navigate to="/tickets" replace />;
    }
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  requiredRole: PropTypes.number,
};
