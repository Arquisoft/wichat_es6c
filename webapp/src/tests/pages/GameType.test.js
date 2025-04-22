import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import GameType from '../../pages/GameType';
import '../../localize/i18n';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

describe('GameType Page', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
  });

  it('should render the page title and buttons', () => {
    render(
      <MemoryRouter>
        <GameType />
      </MemoryRouter>
    );

    expect(screen.getByText('Choose a game mode')).toBeInTheDocument();

    expect(screen.getByAltText('Normal')).toBeInTheDocument();
    expect(screen.getByAltText('VS IA')).toBeInTheDocument();
  });

  it('should navigate to the correct game mode when a button is clicked', () => {
    render(
      <MemoryRouter>
        <GameType />
      </MemoryRouter>
    );

    const normalButton = screen.getByAltText('Normal');
    fireEvent.click(normalButton);

    expect(mockNavigate).toHaveBeenCalledWith('/game-mode', { state: { type: 'normal' } });

    const vsIaButton = screen.getByAltText('VS IA');
    fireEvent.click(vsIaButton);

    expect(mockNavigate).toHaveBeenCalledWith('/game-mode', { state: { type: 'vs' } });
  });
});