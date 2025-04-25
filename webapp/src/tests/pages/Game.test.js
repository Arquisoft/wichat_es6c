import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter, Router } from 'react-router-dom';
import axios from 'axios';
import Game from '../../pages/Game';
import { SessionContext } from '../../SessionContext';
import '../../localize/i18n';
import MockAdapter from 'axios-mock-adapter';
const mockAxios = new MockAdapter(axios);



const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));


describe('Game Page', () => {
    beforeEach(() => {
        mockAxios.reset();
        mockAxios.onGet('http://localhost:8000/questions/en/country').reply(200,
            {
                question: 'Which country does this image belong to?',
                options: ['Madrid', 'Berlin', 'Paris', 'London'],
                correctAnswer: 'Madrid',
                category: 'country',
                language: 'en',
                imageUrl: 'https://example.com/image.jpg'
            }
        );
        render(
            <SessionContext.Provider value={{ username: 'testUser' }}>
                <MemoryRouter initialEntries={[{ pathname: '/', state: { mode: 'country' } }]}>
                    <Game />
                </MemoryRouter>
            </SessionContext.Provider>
        );

    });

    it('should render the loading screen initially', () => {

        expect(screen.getByText('Loading round...')).toBeInTheDocument();
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should fetch and display the first question', async () => {

        await waitFor(() => screen.getByText('Which country does this image belong to?'));

        expect(screen.getByText('Paris')).toBeInTheDocument();
        expect(screen.getByText('London')).toBeInTheDocument();
        expect(screen.getByText('Berlin')).toBeInTheDocument();
        expect(screen.getByText('Madrid')).toBeInTheDocument();
    });

    it('should handle correct answer and update score', async () => {



        await waitFor(() => {
            expect(screen.getByText('Which country does this image belong to?')).toBeInTheDocument();
        });

        const correctOption = screen.getByText('Madrid');
        fireEvent.click(correctOption);

        await waitFor(() => {
            expect(screen.getByText('+20')).toBeInTheDocument();
        });
    });

    it('should handle incorrect answer and show feedback', async () => {


        await waitFor(() => {
            expect(screen.getByText('Which country does this image belong to?')).toBeInTheDocument();
        });

        const incorrectOption = screen.getByText('London');
        fireEvent.click(incorrectOption);

        await waitFor(() => {
            expect(screen.getByText('+0')).toBeInTheDocument();
        });
    });

    

   
});