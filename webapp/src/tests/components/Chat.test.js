import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Chat from '../../components/Chat';
import axios from 'axios';
window.HTMLElement.prototype.scrollIntoView = jest.fn();

jest.mock('axios');
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => {
      const translations = {
        'ChatLLM.chatTitle': 'Chat with LLM',
        'ChatLLM.typeMessage': 'Type your message...',
        'ChatLLM.sendMessage': 'Send',
        'ChatLLM.typing': 'Typing...',
        'ChatLLM.noResponse': 'No response available.',
      };
      return translations[key] || key;
    },
  }),
}));

describe('Chat Component', () => {
  const mockQuestionData = {
    correctAnswer: 'TestAnswer',
  };

  const mockHeader = 'Header: ';
  const mockOnUserMessage = jest.fn();
  const mockOnBotResponse = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the chat title and input field', () => {
    render(
      <Chat
        questionData={mockQuestionData}
        header={mockHeader}
        onUserMessage={mockOnUserMessage}
        onBotResponse={mockOnBotResponse}
        ignoreChat={false}
      />
    );

    expect(screen.getByText('Chat with LLM')).toBeInTheDocument();
    expect(screen.getByLabelText('Type your message...')).toBeInTheDocument();
    expect(screen.getByText('Send')).toBeInTheDocument();
  });

  it('should send a user message and display it in the chat', async () => {
    render(
      <Chat
        questionData={mockQuestionData}
        header={mockHeader}
        onUserMessage={mockOnUserMessage}
        onBotResponse={mockOnBotResponse}
        ignoreChat={false}
      />
    );

    const inputField = screen.getByLabelText('Type your message...');
    const sendButton = screen.getByText('Send');

    fireEvent.change(inputField, { target: { value: 'Hello, bot!' } });
    fireEvent.click(sendButton);

    expect(mockOnUserMessage).toHaveBeenCalledWith('Hello, bot!');
    expect(screen.getByText('Hello, bot!')).toBeInTheDocument();
  });

  it('should display the bot response after sending a message', async () => {
    axios.post.mockResolvedValueOnce({
      data: { answer: 'Hello, user!' },
    });

    render(
      <Chat
        questionData={mockQuestionData}
        header={mockHeader}
        onUserMessage={mockOnUserMessage}
        onBotResponse={mockOnBotResponse}
        ignoreChat={false}
      />
    );

    const inputField = screen.getByLabelText('Type your message...');
    const sendButton = screen.getByText('Send');

    fireEvent.change(inputField, { target: { value: 'Hello, bot!' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText('Hello, user!')).toBeInTheDocument();
    });

    expect(mockOnBotResponse).toHaveBeenCalledWith('Hello, user!');
  });

  it('should display "Typing..." while waiting for the bot response', async () => {
    axios.post.mockImplementationOnce(() => {
      return new Promise((resolve) => setTimeout(() => resolve({ data: { answer: 'Delayed response' } }), 1000));
    });

    render(
      <Chat
        questionData={mockQuestionData}
        header={mockHeader}
        onUserMessage={mockOnUserMessage}
        onBotResponse={mockOnBotResponse}
        ignoreChat={false}
      />
    );

    const inputField = screen.getByLabelText('Type your message...');
    const sendButton = screen.getByText('Send');

    fireEvent.change(inputField, { target: { value: 'Hello, bot!' } });
    fireEvent.click(sendButton);

    expect(screen.getByText('Typing...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Delayed response')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('should handle API errors gracefully', async () => {
    axios.post.mockRejectedValueOnce(new Error('API Error'));

    render(
      <Chat
        questionData={mockQuestionData}
        header={mockHeader}
        onUserMessage={mockOnUserMessage}
        onBotResponse={mockOnBotResponse}
        ignoreChat={false}
      />
    );

    const inputField = screen.getByLabelText('Type your message...');
    const sendButton = screen.getByText('Send');

    fireEvent.change(inputField, { target: { value: 'Hello, bot!' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.queryByText('Typing...')).not.toBeInTheDocument();
    });

    expect(mockOnBotResponse).not.toHaveBeenCalled();
  });

  it('should not send a message if the input is empty', () => {
    render(
      <Chat
        questionData={mockQuestionData}
        header={mockHeader}
        onUserMessage={mockOnUserMessage}
        onBotResponse={mockOnBotResponse}
        ignoreChat={false}
      />
    );

    const sendButton = screen.getByText('Send');
    fireEvent.click(sendButton);

    expect(mockOnUserMessage).not.toHaveBeenCalled();
  });
});