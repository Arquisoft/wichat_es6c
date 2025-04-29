import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import App from '../App';
import { SessionContext } from '../SessionContext';
import { MemoryRouter } from 'react-router-dom';

jest.mock('i18next', () => ({
  changeLanguage: jest.fn(),
}));

describe('App component', () => {
  it('renders home by default', () => {
    render(
      <SessionContext.Provider value={{ isLoggedIn: false }}>
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>
      </SessionContext.Provider>
    );
    const homeElement = screen.getByText(/home/i);
    expect(homeElement).toBeInTheDocument();
  });

  test('redirects to login if not authenticated', () => {
    render(
      <SessionContext.Provider value={{ isLoggedIn: false }}>
        <MemoryRouter initialEntries={['/login']}>
          <App />
        </MemoryRouter>
      </SessionContext.Provider>
    );
    const loginMessage = screen.getByRole('heading', { name: /login/i });
    expect(loginMessage).toBeInTheDocument();
  });

  test('renders user homepage if authenticated', () => {
    render(
      <SessionContext.Provider value={{ isLoggedIn: true }}>
        <MemoryRouter initialEntries={['/homepage']}>
          <App />
        </MemoryRouter>
      </SessionContext.Provider>
    );
    const userHomeElement = screen.getByText(/user home/i);
    expect(userHomeElement).toBeInTheDocument();
  });

  test('renders 404 page for unknown routes', () => {
    render(
      <SessionContext.Provider value={{ isLoggedIn: false }}>
        <MemoryRouter initialEntries={['/unknown']}>
          <App />
        </MemoryRouter>
      </SessionContext.Provider>
    );
    const notFoundMessage = screen.getByText(/404/i);
    expect(notFoundMessage).toBeInTheDocument();
  });
});
