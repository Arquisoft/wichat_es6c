import React from 'react';
import { render, fireEvent, screen, waitFor, act } from '@testing-library/react';
import axios from 'axios';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import MockAdapter from 'axios-mock-adapter';
import Login from '../../pages/Login';
import { SessionContext } from '../../SessionContext';

const mockAxios = new MockAdapter(axios);
const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Login component', () => {
  beforeEach(() => {
    mockAxios.reset();
    mockNavigate.mockReset();
  });

  it('should render login form', () => {
    render(
      <SessionContext.Provider value={{}}>
        <RouterProvider router={createMemoryRouter([{ path: '/', element: <Login /> }])}>
          <Login />
        </RouterProvider>
      </SessionContext.Provider>
    );

    const usernameMessage = screen.getByText('Username');
    expect(usernameMessage).toBeInTheDocument();

    const passwordMessage = screen.getByText('Password');
    expect(passwordMessage).toBeInTheDocument();

    const loginButton = screen.getByRole('button', { name: 'Login'});
    expect(buttons.length).toBeGreaterThan(0); 

    expect(
      screen.getByRole('link', { name: '¿Aún no te has registrado? Registro aquí' })
    ).toBeInTheDocument();
  });

  it('should log in successfully', async () => {
    const createSession = jest.fn();

    render(
      <SessionContext.Provider value={{ createSession }}>
        <RouterProvider router={createMemoryRouter([{ path: '/', element: <Login /> }])}>
          <Login />
        </RouterProvider>
      </SessionContext.Provider>
    );

    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'testpassword' } });

    mockAxios.onPost('http://localhost:8000/login').reply(200, { user: 'testuser' }); 

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Login' }));
    });

    await waitFor(() => {
      expect(createSession).toHaveBeenCalledWith('testuser');
      expect(mockNavigate).toHaveBeenCalledWith('/homepage');
    });
  });

  it('should handle error when logging in', async () => {
    mockAxios.onPost('http://localhost:8000/login').reply(401, { error: 'Invalid credentials' });

    const createSession = jest.fn();

    render(
      <SessionContext.Provider value={{ createSession }}>
        <RouterProvider router={createMemoryRouter([{ path: '/', element: <Login /> }])}>
          <Login />
        </RouterProvider>
      </SessionContext.Provider>
    );

    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'testpassword' } });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Login' }));
    });

    await waitFor(() => {
      expect(screen.getByText('Error: Invalid credentials')).toBeInTheDocument();
    });
  });
});