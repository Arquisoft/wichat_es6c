import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import App from '../App';
import { SessionContext } from '../SessionContext';

import '../localize/i18n';

describe('App component', () => {
  it('renders home by default', () => {
    render(
      <SessionContext.Provider value={{ isLoggedIn: false }}>
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>
      </SessionContext.Provider>
    );
    const homeElement = screen.getByText(/sign in to wichat/i);
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
    const loginMessage = screen.getByRole('heading', { name: /sign in to wichat/i });
    expect(loginMessage).toBeInTheDocument();
  });

  test('renders 404 page for unknown routes', () => {
    render(
      <SessionContext.Provider value={{ isLoggedIn: false }}>
        <MemoryRouter initialEntries={['/unknown']}>
          <App />
        </MemoryRouter>
      </SessionContext.Provider>
    );
    const notFoundMessage = screen.getByText(/page not found/i);
    expect(notFoundMessage).toBeInTheDocument();
  });
});
