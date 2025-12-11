import { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { AuthService } from '../../services/AuthService';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const session = await AuthService.getSession();
      if (session && session.result) {
        // Asegurarse de que rol_id sea número
        const userData = {
          ...session.result,
          rol_id: parseInt(session.result.rol_id, 10)
        };
        setUser(userData);
        console.log('Usuario cargado desde sesión:', userData);
      }
    } catch (error) {
      console.error('Error verificando sesión:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (correo, contrasena) => {
    const result = await AuthService.login(correo, contrasena);
    if (result.status === 200) {
      // Asegurarse de que rol_id sea número
      const userData = {
        ...result.result,
        rol_id: parseInt(result.result.rol_id, 10)
      };
      setUser(userData);
      console.log('Usuario logueado:', userData);
      return result;
    }
    throw new Error(result.message || 'Error en login');
  };

  const logout = async () => {
    await AuthService.logout();
    setUser(null);
    localStorage.removeItem('user');
  };

  const register = async (nombre, correo, contrasena, rol_id) => {
    return await AuthService.register(nombre, correo, contrasena, rol_id);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    register,
    isAuthenticated: !!user,
    isAdmin: user?.rol_id === 1,
    isTechnician: user?.rol_id === 3,
    isClient: user?.rol_id === 2,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
