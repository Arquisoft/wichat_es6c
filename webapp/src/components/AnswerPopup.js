import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const AnswerPopup = ({ isCorrect, visible}) => {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: '50vh', // Position
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100vw',
        padding: '2rem',
        backgroundColor: isCorrect ? 'green' : 'red',
        borderRadius: '1rem',
        color: 'white',
        display: visible ? 'flex' : 'none',
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: 3,
        opacity: visible ? 0.8 : 0, 
        transition: 'all 0.8s ease-in-out', // Animation
        zIndex: 1000,
      }}
    >
      {isCorrect ? (
        <>
          <CheckCircleIcon sx={{ fontSize: '2rem', marginRight: '1rem' }} />
          <Typography variant="h5" sx={{ fontWeight: 'bold', fontSize: '2rem' }}>
            ¡Correcto!
          </Typography>
        </>
      ) : (
        <>
          <CancelIcon sx={{ fontSize: '2rem', marginRight: '1rem' }} />
          <Typography variant="h5" sx={{ fontWeight: 'bold', fontSize: '2rem' }}>
            Incorrecto
          </Typography>
        </>
      )}
    </Box>
  );
};

export default AnswerPopup;
