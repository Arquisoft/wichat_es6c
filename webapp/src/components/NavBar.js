import React, { useState, useContext } from "react";
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Menu, MenuItem, Divider } from "@mui/material";
import { Person, Settings, Logout, Description, MoreVert, Language } from "@mui/icons-material";
import { SessionContext } from '../SessionContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import i18n from "i18next";

const NavMenu = () => {
  const navigate = useNavigate();
  const { sessionId, destroySession } = useContext(SessionContext);

  const [anchorEl, setAnchorEl] = useState(null);
  const [languageMenuAnchorEl, setLanguageMenuAnchorEl] = useState(null);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleLanguageMenuOpen = (event) => setLanguageMenuAnchorEl(event.currentTarget);
  const handleLanguageMenuClose = () => setLanguageMenuAnchorEl(null);

  const { t } = useTranslation();
  //const [lang, setLang] = React.useState(["en", "es"].includes(i18n.language) ? i18n.language : "en");


  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    //setLang(lng);
    handleLanguageMenuClose();
  }




  const logout = () => {
    destroySession();
    navigate('/', { state: { message: "Se ha cerrado sesión con éxito" } });
  };




  return (
    <AppBar position="static" sx={{ backgroundColor: "#9b33c0" }}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        {/* Logo y Nombre */}
        <IconButton onClick={() => navigate("/")} sx={{ p: 0, background: "transparent" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <img src="/icon-app.ico" alt="Logo" style={{ width: 40, height: 40, marginRight: 10 }} />
            <Typography variant="h6" sx={{ color: "white" }}> {t('NavBar.nameApp')}
            </Typography>
          </Box>
        </IconButton>

        {/* Menú de navegación */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {sessionId && (
            <>
              <Button color="inherit" startIcon={<Person />} onClick={() => navigate('/history')}>
                {t('NavBar.profile')}
              </Button>
              <Button color="inherit" startIcon={<Logout />} onClick={logout}>
                {t('NavBar.logout')}
              </Button>
            </>
          )}

          {/* Menú de configuración */}
          <IconButton color="inherit" onClick={handleMenuOpen} data-testid="more-button">
            <MoreVert />
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            {sessionId && (
              <MenuItem onClick={() => { handleMenuClose(); navigate('/settings'); }}>
                <Settings sx={{ mr: 1 }} /> {t('NavBar.settings')}
              </MenuItem>
            )}
            <MenuItem onClick={handleLanguageMenuOpen}>
              <Language sx={{ mr: 1 }} /> {t('NavBar.changeLanguage')}
            </MenuItem>
            <Menu
              anchorEl={languageMenuAnchorEl}
              open={Boolean(languageMenuAnchorEl)}
              onClose={handleLanguageMenuClose}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <MenuItem onClick={() => changeLanguage('en')}>
                <img src="/images/flags/uk.png" alt="English" style={{ width: 20, height: 15, marginRight: 10 }} />
                {t('NavBar.english')}
              </MenuItem>
              <MenuItem onClick={() => changeLanguage('es')}>
                <img src="/images/flags/spain.png" alt="Español" style={{ width: 20, height: 15, marginRight: 10 }} />
                {t('NavBar.spanish')}
              </MenuItem>
            </Menu>
            <Divider />
            <MenuItem component="a" href="http://localhost:8000/api-doc" target="_blank" rel="noopener noreferrer" data-testid="api-doc-link">
              <Description sx={{ mr: 1 }} /> {t('NavBar.APIDocs')}
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavMenu;