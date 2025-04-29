import React from 'react';
import { Box, Typography, Link, Divider } from '@mui/material';
import { GitHub, Description } from '@mui/icons-material';
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
        textAlign: 'center',
        py: 2,
        mt: 'auto',
        width: '100%',
      }}
    >
      <Typography variant="body2" sx={{ mb: 1 }}>
        © {new Date().getFullYear()} {t('Footer.title')}
      </Typography>
      <Divider sx={{ backgroundColor: 'white', mx: 'auto', maxWidth: 300, my: 1 }} />
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'center',
          alignItems: 'center',
          gap: 2,
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
          }}
        >
          <GitHub sx={{ mr: 1 }} /> {t('Footer.github')}
        </Link>
        <Link
          href={apiEndpoint}
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
          }}
        >
          <Description sx={{ mr: 1 }} /> {t('Footer.apiDocs')}
        </Link>
      </Box>
    </Box>
  );
};

export default Footer;
