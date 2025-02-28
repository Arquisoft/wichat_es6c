import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ element: Element }) => {
    const storedSessionId = localStorage.getItem('sessionId');
 

    return ( storedSessionId ? <Element /> : <Navigate to="/login" /> );

};


export default PrivateRoute;