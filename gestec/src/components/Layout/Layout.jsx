import PropTypes from 'prop-types';
import { Container } from '@mui/material';
import HeaderAlt from './HeaderAlt';
import FooterAlt from './FooterAlt';
 
Layout.propTypes = { children: PropTypes.node.isRequired }; 
 
export function Layout({ children }) { 
  return ( 
    <>
      <HeaderAlt />
      <Container 
        maxWidth="xl" 
        style={{ paddingTop: '1rem', paddingBottom: '4.5rem' }} 
      > 
        {children} 
      </Container> 
      <FooterAlt />
    </> 
  ); 
} 