import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { SessionContext } from '../../SessionContext';
import NavMenu from '../../components/NavBar';
import '../../localize/i18n';


const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

describe('NavMenu Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render the app name and logo', () => {
        render(
            <BrowserRouter>
                <SessionContext.Provider value={{ sessionId: null }}>
                    <NavMenu />
                </SessionContext.Provider>
            </BrowserRouter>
        );

        expect(screen.getByText('WICHAT')).toBeInTheDocument();
        expect(screen.getByAltText('Logo')).toBeInTheDocument();
        expect(screen.queryByText('Profile')).not.toBeInTheDocument();
        expect(screen.queryByText('Sign out')).not.toBeInTheDocument();
    });

    it('should render profile and logout buttons when session exists', () => {
        render(
            <BrowserRouter>
                <SessionContext.Provider value={{ sessionId: '12345', destroySession: jest.fn() }}>
                    <NavMenu />
                </SessionContext.Provider>
            </BrowserRouter>
        );

        expect(screen.queryByText('Profile')).toBeInTheDocument();
        expect(screen.queryByText('Sign out')).toBeInTheDocument();
        fireEvent.click(screen.getByTestId('more-button'));
        fireEvent.click(screen.getByText('Change language'));
        expect(screen.queryByText('Spanish')).toBeInTheDocument();
        expect(screen.queryByText('English')).toBeInTheDocument();


    });

    it('should navigate to /history when Profile button is clicked', () => {
        render(
            <BrowserRouter>
                <SessionContext.Provider value={{ sessionId: '12345', destroySession: jest.fn() }}>
                    <NavMenu />
                </SessionContext.Provider>
            </BrowserRouter>
        );

        fireEvent.click(screen.getByText('Profile'));
        expect(mockNavigate).toHaveBeenCalledWith('/history');
    });

    it('should call destroySession and navigate to / when Logout button is clicked', () => {
        const mockDestroySession = jest.fn();

        render(
            <BrowserRouter>
                <SessionContext.Provider value={{ sessionId: '12345', destroySession: mockDestroySession }}>
                    <NavMenu />
                </SessionContext.Provider>
            </BrowserRouter>
        );

        fireEvent.click(screen.getByText('Sign out'));
        expect(mockDestroySession).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('/', { state: { message: 'Se ha cerrado sesión con éxito' } });
    });

    it('should open the language menu and change the language to English', () => {
        render(
            <BrowserRouter>
                <SessionContext.Provider value={{ sessionId: '12345', username: 'TestUser' }}>
                    <NavMenu />
                </SessionContext.Provider>
            </BrowserRouter>
        );

        fireEvent.click(screen.getByTestId('more-button'));
        fireEvent.click(screen.getByText('Change language'));


        const selectLangEn = screen.getByText("English");
        expect(selectLangEn).toBeInTheDocument();
        expect(screen.getByText('Profile')).toBeInTheDocument();
        expect(screen.getByText('Sign out')).toBeInTheDocument();

        fireEvent.click(selectLangEn);
        expect(screen.getByText('Change language')).toBeInTheDocument();
        expect(screen.getByText('Settings')).toBeInTheDocument();
        fireEvent.click(screen.getByText('Change language'));
        expect(screen.getByText('Spanish')).toBeInTheDocument();
        expect(screen.getByText('English')).toBeInTheDocument();



    });

    it('should open the language menu and change the language to Spanish', () => {
        render(
            <BrowserRouter>
                <SessionContext.Provider value={{ sessionId: '12345', username: 'TestUser' }}>
                    <NavMenu />
                </SessionContext.Provider>
            </BrowserRouter>
        );
        fireEvent.click(screen.getByTestId('more-button'));
        fireEvent.click(screen.getByText('Change language'));


        const selectLangEs = screen.getByText("Spanish");
        expect(selectLangEs).toBeInTheDocument();

        fireEvent.click(selectLangEs); 
        expect(screen.getByText('Perfil')).toBeInTheDocument();
        expect(screen.getByText('Cerrar sesión')).toBeInTheDocument();

        
        fireEvent.click(screen.getByText('Cambiar idioma'));
        expect(screen.getByText('Español')).toBeInTheDocument();
        expect(screen.getByText('Inglés')).toBeInTheDocument();

    });

    it('should open the settings menu and navigate to /settings', () => {
        render(
            <BrowserRouter>
                <SessionContext.Provider value={{ sessionId: '12345' }}>
                    <NavMenu />
                </SessionContext.Provider>
            </BrowserRouter>
        );

        fireEvent.click(screen.getByTestId('more-button'));
        fireEvent.click(screen.getByText('Ajustes'));

        expect(mockNavigate).toHaveBeenCalledWith('/settings');
    });

    it('should open the API Documentation link in a new tab', () => {
        render(
            <BrowserRouter>
                <SessionContext.Provider value={{ sessionId: '12345' }}>
                    <NavMenu />
                </SessionContext.Provider>
            </BrowserRouter>
        );

        fireEvent.click(screen.getByTestId('more-button'));
        const apiDocsLink = screen.getByTestId('api-doc-link');
        expect(apiDocsLink).toHaveAttribute('href', 'http://localhost:8000/api-doc');
        expect(apiDocsLink).toHaveAttribute('target', '_blank');
    });
});