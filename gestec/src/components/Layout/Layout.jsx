import PropTypes from 'prop-types';
import { Container } from '@mui/material';
import HeaderAlt from './HeaderAlt';
import FooterAlt from './FooterAlt';
import { useAuth } from '../Auth/AuthContext';
 
Layout.propTypes = { children: PropTypes.node.isRequired }; 
 
export function Layout({ children }) { 
  const { isAuthenticated } = useAuth();

  return ( 
    <>
      {isAuthenticated && <HeaderAlt />}
      <Container 
        maxWidth="xl" 
        style={{ 
          paddingTop: isAuthenticated ? '1rem' : '0', 
          paddingBottom: isAuthenticated ? '4.5rem' : '0',
          minHeight: '100vh' 
        }} 
      > 
        {children} 
      </Container> 
      {isAuthenticated && <FooterAlt />}
    </> 
  ); 
} 