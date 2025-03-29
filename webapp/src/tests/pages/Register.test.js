import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import Register from '../../pages/Register';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { SessionContext } from '../../SessionContext';
const mockAxios = new MockAdapter(axios);
const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Register component', () => {
  beforeEach(() => {
    mockAxios.reset();
    mockNavigate.mockReset();
  });

  it('should render register form', () => {
    render(
      <SessionContext.Provider value={{}}>
        <RouterProvider router={createMemoryRouter([{ path: '/', element: <Register /> }])}>
          <Register />
        </RouterProvider>
      </SessionContext.Provider>
    );

    const usernameMessage = screen.getByLabelText('Usuario');
    expect(usernameMessage).toBeInTheDocument();

    const passwordMessage = screen.getByLabelText('Contraseña');
    expect(passwordMessage).toBeInTheDocument();

    const surnameMessage = screen.getByLabelText('Primer apellido');
    expect(surnameMessage).toBeInTheDocument();
    const nameMessage = screen.getByLabelText('Nombre');
    expect(nameMessage).toBeInTheDocument();

    const registerButton = screen.getByRole('button', { name: 'Registrarse'});
    expect(registerButton).toBeInTheDocument();

    expect(
      screen.getByRole('link', { name: 'Inicia sesión aquí' })
    ).toBeInTheDocument();
  });

  it('should add user successfully', async () => {
    mockAxios.onPost('http://localhost:8000/user').reply(200);
    mockAxios.onPost('http://localhost:8000/login').reply(200, { createdAt: new Date().toISOString() });


    const createSession = jest.fn();

    render(
      <SessionContext.Provider value={{createSession}}>
        <RouterProvider router={createMemoryRouter([{ path: '/', element: <Register /> }])}>
          <Register />
        </RouterProvider>
      </SessionContext.Provider>
    );

    fireEvent.change(screen.getByLabelText('Usuario'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'testpassword' } });
    fireEvent.change(screen.getByLabelText('Primer apellido'), { target: { value: 'testSurname'}});
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'testNombre'}});
    
       
    fireEvent.click(screen.getByRole('button', { name: 'Registrarse' }));

     await waitFor(() => {
          expect(createSession).toHaveBeenCalledWith('testuser');
          expect(mockNavigate).toHaveBeenCalledWith('/homepage');
          expect(mockAxios.history.post.length).toBe(2);
        });
  
  });

  it('should handle error when adding user', async () => {
    mockAxios.onPost('http://localhost:8000/user').reply(400, { error: 'Usuario ya registrado'});


    const createSession = jest.fn();

    render(
      <SessionContext.Provider value={{}}>
        <RouterProvider router={createMemoryRouter([{ path: '/', element: <Register /> }])}>
          <Register />
        </RouterProvider>
      </SessionContext.Provider>
    );
    
       
    fireEvent.click(screen.getByRole('button', { name: 'Registrarse' }));

     await waitFor(() => {
        expect(screen.getByText('Error: Usuario ya registrado')).toBeInTheDocument();
      });
  
  });
});

