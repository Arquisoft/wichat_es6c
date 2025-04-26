import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import GameFinished from '../../pages/GameFinished';
import '../../localize/i18n';

jest.mock('react-confetti', () => () => <div data-testid="confetti" />);

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
  useLocation: jest.fn(),
}));

describe('GameFinished Page', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
  });

  it('should render the final score and buttons correctly', () => {
    require('react-router-dom').useLocation.mockReturnValue({
      state: {
        score: 8,
        totalTime: 120,
        maxScore: 10,
        gameType: 'normal',
      },
    });

    render(
      <MemoryRouter>
        <GameFinished />
      </MemoryRouter>
    );

    expect(screen.getByText('Game over!')).toBeInTheDocument();
    expect(screen.getByText('Score achieved')).toBeInTheDocument();
    expect(screen.getByText('8 / 10')).toBeInTheDocument();
    expect(screen.getByText('Total time')).toBeInTheDocument();
    expect(screen.getByText('120 seconds')).toBeInTheDocument();
    expect(screen.getByText('Play again')).toBeInTheDocument();
    expect(screen.getByText('View history')).toBeInTheDocument();
  });

  it('should navigate to the game mode page when "Play Again" is clicked', () => {
    require('react-router-dom').useLocation.mockReturnValue({
      state: {
        score: 8,
        totalTime: 120,
        maxScore: 10,
        gameType: 'normal',
      },
    });

    render(
      <MemoryRouter>
        <GameFinished />
      </MemoryRouter>
    );

    const playAgainButton = screen.getByText('Play again');
    fireEvent.click(playAgainButton);

    expect(mockNavigate).toHaveBeenCalledWith('/game-mode', { state: { type: 'normal' } });
  });

  it('should navigate to the history page when "View History" is clicked', () => {
    require('react-router-dom').useLocation.mockReturnValue({
      state: {
        score: 8,
        totalTime: 120,
        maxScore: 10,
        gameType: 'normal',
      },
    });

    render(
      <MemoryRouter>
        <GameFinished />
      </MemoryRouter>
    );

    const viewHistoryButton = screen.getByText('View history');
    fireEvent.click(viewHistoryButton);

    expect(mockNavigate).toHaveBeenCalledWith('/history');
  });

  it('should render confetti if the score is greater than or equal to 5', () => {
    require('react-router-dom').useLocation.mockReturnValue({
      state: {
        score: 8,
        totalTime: 120,
        maxScore: 10,
        gameType: 'normal',
      },
    });

    render(
      <MemoryRouter>
        <GameFinished />
      </MemoryRouter>
    );

    expect(screen.getByTestId('confetti')).toBeInTheDocument();
  });

  it('should not render confetti if the score is less than 5', () => {
    require('react-router-dom').useLocation.mockReturnValue({
      state: {
        score: 3,
        totalTime: 120,
        maxScore: 10,
        gameType: 'normal',
      },
    });

    render(
      <MemoryRouter>
        <GameFinished />
      </MemoryRouter>
    );

    expect(screen.queryByTestId('confetti')).not.toBeInTheDocument();
  });
});