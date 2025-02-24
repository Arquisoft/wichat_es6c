import React from 'react';
import { Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';
const PrivateRoute = ({ element: Element }) => {
    const cookie = Cookies.get('cookie');

    return ( cookie ? <Element /> : <Navigate to="/login" /> );

};


export default PrivateRoute;