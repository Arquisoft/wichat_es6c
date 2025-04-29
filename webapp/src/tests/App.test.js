import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import App from '../App';
import { SessionContext } from '../SessionContext';

describe('App component', () => {
  it('renders home by default', () => {
    render(
        <SessionContext.Provider value={{ isLoggedIn: false }}>
            <MemoryRouter initialEntries={['/']}>
                <App />
            </MemoryRouter>
        </SessionContext.Provider>
    );
  });
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
