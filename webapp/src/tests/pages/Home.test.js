import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter, MemoryRouter, Routes, Route } from 'react-router-dom';
import { SessionContext } from '../../SessionContext';
import Home from '../../pages/Home';
import '../../localize/i18n';
import Login from '../../pages/Login';
import Register from '../../pages/Register';

describe('Home Page', () => {
    const mockNavigate = jest.fn();

    jest.mock('react-router-dom', () => ({
        ...jest.requireActual('react-router-dom'),
        useNavigate: () => mockNavigate,
    }));


    it('should render the / component by default', async () => {
        render(
            <BrowserRouter>
                <SessionContext.Provider value={{ sessionId: null }}>
                    <Home />
                </SessionContext.Provider>
            </BrowserRouter>
        );
        expect(screen.getByText('Sign in to Wichat')).toBeInTheDocument();
        expect(window.location.pathname).toBe('/');
    });

    it('should toggle to the Register component when the toggle button is clicked', () => {
        render(
            <MemoryRouter initialEntries={['/']}>
                <SessionContext.Provider value={{ sessionId: null }}>
                    <Routes>
                        <Route path="/" element={<Login />} />
                        <Route path="/register" element={< Register/>}  />
                    </Routes>
                </SessionContext.Provider>
            </MemoryRouter>
        );


        const toggledButton = screen.getByRole('link', { name: 'Create an account here' });
        expect(toggledButton).toBeInTheDocument();
        fireEvent.click(toggledButton);

        expect(screen.getByText('Sign Up')).toBeInTheDocument();

    });

    it('should redirect to /homepage if sessionId exists', () => {
        render(
            <BrowserRouter>
                <SessionContext.Provider value={{ sessionId: '12345' }}>
                    <Home />
                </SessionContext.Provider>
            </BrowserRouter>
        );

        expect(window.location.pathname).toBe('/homepage');
    });
});