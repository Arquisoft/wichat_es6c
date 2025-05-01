import React from 'react';
import { Box, Typography, Link } from '@mui/material';
import { GitHub, Description, AndroidSharp } from '@mui/icons-material';
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();
  const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || "http://localhost:8000";

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#9b33c0',
        color: 'white',
        height: 'auto', // Cambiado a auto para mejor ajuste
        minHeight: '8vh', // Altura mínima
        width: '100%',
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' }, // Columna en móvil, fila en desktop
        justifyContent: 'space-between',
        alignItems: 'center',
        px: { xs: 1, sm: 2 },
        py: 1, // Padding vertical para mejor espaciado
        flexWrap: 'wrap',
        overflow: 'hidden',
        boxSizing: 'border-box', // Asegura que el padding no afecte el ancho total
      }}
    >
      {/* Enlaces centrados */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          gap: { xs: 1, sm: 2 },
          flexWrap: 'wrap',
          width: { xs: '100%', sm: 'auto' }, // Ocupa todo el ancho en móvil
          mb: { xs: 1, sm: 0 }, // Margen inferior solo en móvil
          order: { xs: 2, sm: 1 }, // Cambia el orden en móvil
        }}
      >
        <Link
          href="https://github.com/Arquisoft/wichat_es6c"
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            fontSize: { xs: '0.7rem', sm: '0.9rem' }, // Tamaño más pequeño en móvil
            whiteSpace: 'nowrap',
          }}
        >
          <GitHub sx={{ mr: 0.5, fontSize: { xs: '0.9rem', sm: '1.2rem' } }} /> {t('Footer.github')}
        </Link>
        <Link
          href={apiEndpoint + "/api-doc"}
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            fontSize: { xs: '0.7rem', sm: '0.9rem' },
            whiteSpace: 'nowrap',
          }}
        >
          <Description sx={{ mr: 0.5, fontSize: { xs: '0.9rem', sm: '1.2rem' } }} /> {t('Footer.apiDocs')}
        </Link>
        <Link
          href="https://mega.nz/file/UBRxAQ7Q#VKM_4UVP55RlRPYV_OFXjK3Za4_wGP3qfi4PgjACdFE"
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            fontSize: { xs: '0.7rem', sm: '0.9rem' },
            whiteSpace: 'nowrap',
          }}
        >
          <AndroidSharp sx={{ mr: 0.5, fontSize: { xs: '0.9rem', sm: '1.2rem' } }} /> {t('Footer.appMovil')}
        </Link>
      </Box>

      {/* Texto del copyright */}
      <Typography 
        variant="body2" 
        sx={{ 
          fontSize: { xs: '0.7rem', sm: '0.9rem' },
          whiteSpace: 'nowrap',
          order: { xs: 1, sm: 2 }, // Cambia el orden en móvil
          mb: { xs: 1, sm: 0 }, // Margen inferior solo en móvil
          textAlign: { xs: 'center', sm: 'right' }, // Centrado en móvil
          width: { xs: '100%', sm: 'auto' }, // Ocupa todo el ancho en móvil
        }}
      >
        © {new Date().getFullYear()} {t('Footer.title')}
      </Typography>
    </Box>
  );
};

export default Footer;