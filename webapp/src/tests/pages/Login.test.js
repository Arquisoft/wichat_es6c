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

    const usernameInput = screen.getByLabelText('Username');
    expect(usernameInput).toBeInTheDocument();

    const passwordMessage = screen.getByLabelText('Password');
    expect(passwordMessage).toBeInTheDocument();

    const loginButton = screen.getByRole('button', { name: 'Login' });
    expect(loginButton).toBeInTheDocument();

    expect(
      screen.getByRole('link', { name: 'Registro aquí' })
    ).toBeInTheDocument();
  });

  it('should log in successfully', async () => {
    mockAxios.onPost('http://localhost:8000/login').reply(200, { createdAt: new Date().toISOString() });

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


   
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));
 

    await waitFor(() => {
      expect(createSession).toHaveBeenCalledWith('testuser');
      expect(mockNavigate).toHaveBeenCalledWith('/homepage');
    });
  });

  it('should handle error when logging in', async () => {
    mockAxios.onPost('http://localhost:8000/login').reply(401, { error: 'Usuario o contraseña incorrectos' });

    const createSession = jest.fn();

    render(
      <SessionContext.Provider value={{ createSession }}>
        <RouterProvider router={createMemoryRouter([{ path: '/', element: <Login /> }])}>
          <Login />
        </RouterProvider>
      </SessionContext.Provider>
    );

    fireEvent.change(screen.getByLabelText('Username'), { target: { value: ' ' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: ' ' } });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Login' }));
    });

    await waitFor(() => {
      expect(screen.getByText('Usuario o contraseña incorrectos')).toBeInTheDocument();
    });
  });
});
