import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Router } from 'react-router-dom';
import axios from 'axios';
import GameVS from '../../pages/Game-VS';
import { SessionContext } from '../../SessionContext';
import '../../localize/i18n';
import MockAdapter from 'axios-mock-adapter';
const mockAxios = new MockAdapter(axios);


window.HTMLElement.prototype.scrollIntoView = jest.fn();

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));


describe('Game-vS Page', () => {
    beforeEach(() => {
        mockAxios.reset();
        mockAxios.onGet('http://localhost:8000/questions/en/country').reply(200,
            {
                question: 'Describe the following country',
                options: ['Spain', 'France', 'Germany', 'Italy'],
                correctAnswer: 'Spain',
                category: 'country',
                language: 'en',
                imageUrl: 'https://example.com/image.jpg'

            }
        );
        render(
            <SessionContext.Provider value={{ username: 'testUser' }}>
                <MemoryRouter initialEntries={[{ pathname: '/', state: { mode: 'country', name:'country' } }]}>
                    <GameVS />
                </MemoryRouter>
            </SessionContext.Provider>
        );

    });
    it('should render the loading screen initially', () => {

        expect(screen.getByText('Loading round...')).toBeInTheDocument();
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should fetch and display the LLM chat and first question', async () => {

        await waitFor(() => screen.getByText('Describe the following country'));

        expect(screen.getByText('Spain')).toBeInTheDocument();
        expect(screen.getByText('Chat with IA')).toBeInTheDocument();
    });

});