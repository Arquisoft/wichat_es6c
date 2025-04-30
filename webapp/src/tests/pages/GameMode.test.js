import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import GameMode from '../../pages/GameMode';
import '../../localize/i18n';

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: jest.fn(),
    useLocation: jest.fn(() => ({
        state: { type: 'normal' },
    })),
}));



describe('GameMode Page', () => {
    const mockNavigate = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        useNavigate.mockReturnValue(mockNavigate);
    });

    it('should render the page title and buttons for "normal" mode', async () => {
        require('react-router-dom').useLocation.mockReturnValue({
            state: { type: 'normal' },
        });

        render(
            <MemoryRouter>
                <GameMode />
            </MemoryRouter>
        );

        expect(screen.getByText('Choose a theme')).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByAltText('Celebrities')).toBeInTheDocument();
        });
    });

    it('should render the buttons for "vs" mode', async () => {
        require('react-router-dom').useLocation.mockReturnValue({
            state: { type: 'vs' },
        });

        render(
            <MemoryRouter>
                <GameMode />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByAltText('Countries')).toBeInTheDocument();
        });
    });

    it('should navigate to the correct game path when a button is clicked', async () => {
        require('react-router-dom').useLocation.mockReturnValue({
            state: { type: 'normal' },
        });

        render(
            <MemoryRouter>
                <GameMode />
            </MemoryRouter>
        );

        const countryButton = screen.getByAltText('Countries');
        fireEvent.click(countryButton);

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/game', {
                state: { mode: 'country', name: 'country' },
            });
        });
    });
});