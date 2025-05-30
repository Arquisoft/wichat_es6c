import React, { useState, useContext } from "react";
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Menu, MenuItem, useMediaQuery, useTheme, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { Person, Games, Logout, MoreVert, Language, HelpOutline } from "@mui/icons-material";
import { SessionContext } from '../SessionContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import i18n from "i18next";

const NavMenu = () => {
  const navigate = useNavigate();
  const { sessionId, destroySession } = useContext(SessionContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const [languageMenuAnchorEl, setLanguageMenuAnchorEl] = useState(null);
  const [helpOpen, setHelpOpen] = useState(false); // Estado para controlar el diálogo de ayuda

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleLanguageMenuOpen = (event) => setLanguageMenuAnchorEl(event.currentTarget);
  const handleLanguageMenuClose = () => setLanguageMenuAnchorEl(null);
  const handleHelpOpen = () => setHelpOpen(true);
  const handleHelpClose = () => setHelpOpen(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { t } = useTranslation();
  const [lang, setLang] = React.useState(["en", "es"].includes(i18n.language) ? i18n.language : "en");

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setLang(lng);
    handleLanguageMenuClose();
  }

  React.useEffect(() => {
    i18n.changeLanguage(lang);
  }, [lang]);

  const logout = () => {
    destroySession();
    navigate('/', { state: { message: "Se ha cerrado sesión con éxito" } });
  };

  return (
    <>
      <AppBar 
  position="static" 
  sx={{ 
    backgroundColor: "#9b33c0", 
    zIndex: 10, 
    height: "8vh", // Limita la altura al 8% de la vista disponible
    maxHeight: "8vh", // Asegura que no exceda el 8%
    overflow: "hidden" // Evita que el contenido se desborde
  }}
>
        <Toolbar 
  sx={{ 
    display: "flex", 
    justifyContent: "space-between", 
    alignItems: "center", 
    px: { xs: 1, sm: 2 }, // Espaciado horizontal dinámico
    height: "100%" // Asegura que el contenido ocupe toda la altura del AppBar
  }}
>
          {/* Logo y Nombre */}
          <IconButton 
    onClick={() => navigate("/")} 
    sx={{ 
      p: 0, 
      background: "transparent", 
      display: "flex", 
      alignItems: "center" 
    }}
  >
    <Box 
      sx={{ 
        display: "flex", 
        alignItems: "center", 
        gap: { xs: 1, sm: 2 } // Ajusta el espacio entre el logo y el texto
      }}
    >
      <img 
        src="/icon-app.ico" 
        alt="Logo" 
        style={{ 
          width: "auto", 
          height: "4vh", // Ajusta dinámicamente la altura del logo
          marginRight: 10 
        }} 
      />
      <Typography 
        variant="h6" 
        sx={{ 
          color: "white", 
          fontSize: { xs: "0.9rem", sm: "1.2rem" } // Tamaño de fuente responsivo
        }}
      >
        {t('NavBar.nameApp')}
      </Typography>
    </Box>
  </IconButton>

          {/* Menú de navegación */}
          <Box 
    sx={{ 
      display: "flex", 
      alignItems: "center", 
      gap: { xs: 1, sm: 2 }, // Espaciado dinámico entre elementos
      flexWrap: "wrap" // Permite que los elementos se ajusten en pantallas pequeñas
    }}
  >
    {!isMobile && sessionId && (
      <>
        <Button 
          color="inherit" 
          startIcon={<Person />} 
          onClick={() => navigate('/history')} 
          sx={{ 
            fontSize: { xs: "0.8rem", sm: "1rem" } // Tamaño de fuente responsivo
          }}
        >
          {t('NavBar.profile')}
        </Button>
        <Button 
          color="inherit" 
          startIcon={<HelpOutline />} 
          onClick={handleHelpOpen} 
          sx={{ 
            fontSize: { xs: "0.8rem", sm: "1rem" } 
          }}
        >
          {t('NavBar.howToPlay')}
        </Button>
        <Button 
          color="inherit" 
          startIcon={<Logout />} 
          onClick={logout} 
          sx={{ 
            fontSize: { xs: "0.8rem", sm: "1rem" } 
          }}
        >
          {t('NavBar.logout')}
        </Button>
      </>
    )}

    {/* Nueva opción: More Options Games */}
    {isMobile && sessionId && (
      <Button
        color="inherit"
        startIcon={<Games />}
        onClick={() => navigate('/game-type')}
        sx={{
          color: "white",
          borderRadius: "20px",
          px: { xs: 2, sm: 3 },
          py: 1,
          fontWeight: "bold",
          textTransform: "none",
          border: "2px solid white",
          "&:hover": {
            backgroundColor: "#9b33c0",
          },
          fontSize: { xs: '0.8rem', sm: '0.9rem' },
          minWidth: 'auto',
          margin: { xs: '0.5rem', sm: '0' },
          whiteSpace: 'nowrap',
        }}
      >
        {t('UserHome.moreOptions')}
      </Button>
    )}

    {/* Menú de configuración */}
    <IconButton 
      color="inherit" 
      onClick={handleMenuOpen} 
      data-testid="more-button"
      sx={{ 
        fontSize: { xs: "0.8rem", sm: "1rem" } 
      }}
    >
      <MoreVert />
    </IconButton>
    <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
              {/* Agregar opciones móviles si hay sesión iniciada */}
              {isMobile && sessionId && (
                <>
                  <MenuItem onClick={() => { handleMenuClose(); navigate('/history'); }}>
                    <Person sx={{ mr: 1 }} /> {t('NavBar.profile')}
                  </MenuItem>
                  <MenuItem onClick={() => { handleMenuClose(); handleHelpOpen(); }}>
                    <HelpOutline sx={{ mr: 1 }} /> {t('NavBar.howToPlay')}
                  </MenuItem>
                  <MenuItem onClick={() => { handleMenuClose(); logout(); }}>
                    <Logout sx={{ mr: 1 }} /> {t('NavBar.logout')}
                  </MenuItem>
                </>
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
            </Menu>

  </Box>
</Toolbar>
      </AppBar>

      {/* Diálogo de ayuda */}
      <Dialog open={helpOpen} onClose={handleHelpClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{
          color: 'white',
          textAlign: 'center',
          backgroundColor: '#6A0DAD',
          fontWeight: 'bold'
        }}>
          {t('NavBar.howToPlay')}
        </DialogTitle>
        <DialogContent dividers sx={{ p: 4 }}>
          <Typography variant="h6" gutterBottom>
            {t('NavBar.normalType')}
          </Typography>
          <Typography paragraph>
            {t('NavBar.normalTypeDescription')}
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            {t('NavBar.vsIAType')}
          </Typography>
          <Typography paragraph>
            {t('NavBar.vsIATypeDescription')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleHelpClose}
            variant="contained"
            sx={{
              backgroundColor: '#6A0DAD',
              color: 'white',
              '&:hover': {
                backgroundColor: '#4A0D80', // Un morado más oscuro para hover
              }
            }}
          >
            {t('NavBar.close')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default NavMenu;