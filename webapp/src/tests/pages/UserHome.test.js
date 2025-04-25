import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import HomePage from '../../pages/UserHome';
import '../../localize/i18n';
import { SessionContext } from '../../SessionContext';


const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('HomePage Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should render the welcome message with the username if session exists', () => {


    render(
      <BrowserRouter>
        <SessionContext.Provider value={{ sessionId: '1234', username: 'TestUser' }}>

          <HomePage />
        </SessionContext.Provider>
      </BrowserRouter>
    );

    expect(screen.getByText('Welcome TestUser!')).toBeInTheDocument();
  });

  it('should not render the welcome message if no session exists', () => {
    render(
      <BrowserRouter>
        <SessionContext.Provider value={{ sessionId: null }}>

          <HomePage />
        </SessionContext.Provider>
      </BrowserRouter>
    );

    expect(screen.queryByText(/Welcome,/)).not.toBeInTheDocument();
  });

  it('should navigate to /game-type when the Play button is clicked', () => {

    render(
      <BrowserRouter>
        <SessionContext.Provider value={{ sessionId: '1234', username: 'TestUser' }}>

          <HomePage />
        </SessionContext.Provider>
      </BrowserRouter>
    );

    const playButton = screen.getByText('Play');
    expect(playButton).toBeInTheDocument();

    fireEvent.click(playButton);

    expect(mockNavigate).toHaveBeenCalledWith('/game-type');
  });
});