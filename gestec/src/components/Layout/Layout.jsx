// eslint-disable-next-line no-unused-vars
import React from 'react'; 
import PropTypes from 'prop-types'; 
import { Container } from '@mui/material'; 
import Header from './Header'; 
import { Footer } from './Footer'; 
 
Layout.propTypes = { children: PropTypes.node.isRequired }; 
 
export function Layout({ children }) { 
  return ( 
    <> 
      <Header /> 
      <Container 
        maxWidth="xl" 
        style={{ paddingTop: '1rem', paddingBottom: '4.5rem' }} 
      > 
        {children} 
      </Container> 
      <Footer /> 
    </> 
  ); 
} 