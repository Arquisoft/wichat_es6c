import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import AIGreeting from '../../components/AIGreeting';
import axios from 'axios';
import '../../localize/i18n';

jest.mock('axios');


describe('AIGreeting Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should show loading spinner initially', () => {
        axios.post.mockImplementation(() => new Promise(() => { }));

        render(<AIGreeting />);

        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should display greeting after successful API call', async () => {
        const mockGreeting = "¡Hola! Bienvenido";
        axios.post.mockResolvedValue({
            data: { answer: mockGreeting }
        });

        render(<AIGreeting />);

        await waitFor(() => {
            expect(screen.getByText(mockGreeting)).toBeInTheDocument();
        });
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    it('should display fallback message on API error', async () => {
        axios.post.mockRejectedValue(new Error('API Error'));

        render(<AIGreeting />);

        await waitFor(() => {
            expect(screen.getByText(/¡Hola!/i)).toBeInTheDocument();
        });
    });



    it('should make API call with correct parameters', async () => {
        const mockGreeting = "Test greeting response";
        axios.post.mockResolvedValue({
            data: { answer: mockGreeting }
        });

        render(<AIGreeting />);

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith(
                expect.stringContaining('/askllm'),
                {
                    question: "Welcome the user warmly in a concise, friendly, and motivating tone maximum eight words. Use engaging emojis like 😊, 🎮, 📜, and 🎉 to make it lively. Encourage them to have fun and ask if they're ready to start playing!",
                    model: "empathy"
                },
                {
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        });
    });
});