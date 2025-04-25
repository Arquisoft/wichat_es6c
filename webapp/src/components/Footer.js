import React from 'react';
import { Box, Typography, Link, Divider } from '@mui/material';
import { GitHub, Description } from '@mui/icons-material';
import { useTranslation } from "react-i18next";
const Footer = () => {
    const {t } = useTranslation();
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#9b33c0',
        color: 'white',
        textAlign: 'center',
        py: '1rem',
        mt: 'auto',
        width: '100%',
      }}
    >
      <Typography variant="body2" sx={{ mb: '0.5rem' }}>
        © {new Date().getFullYear()} {t('Footer.title')}
      </Typography>
      <Divider sx={{ backgroundColor: 'white', my: '0.5rem' }} />
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
        <Link
          href="https://github.com/Arquisoft/wichat_es6c"
          target="_blank"
          rel="noopener noreferrer"
          sx={{ color: 'white', display: 'flex', alignItems: 'center', textDecoration: 'none' }}
        >
          <GitHub sx={{ mr: '0.5rem' }} /> {t('Footer.github')}
        </Link>
        <Link
          href="http://localhost:8000/api-doc"
          target="_blank"
          rel="noopener noreferrer"
          sx={{ color: 'white', display: 'flex', alignItems: 'center', textDecoration: 'none' }}
        >
          <Description sx={{ mr: '0.5rem' }} /> {t('Footer.apiDocs')}
        </Link>
      </Box>
    </Box>
  );
};

export default Footer;