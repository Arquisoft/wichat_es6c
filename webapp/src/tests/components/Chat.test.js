import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Chat from '../../components/Chat';
import axios from 'axios';
window.HTMLElement.prototype.scrollIntoView = jest.fn();
import '../../localize/i18n';

jest.mock('axios');


describe('Chat Component', () => {
  const mockQuestionData = {
    correctAnswer: 'TestAnswer'
  };

  const mockQuestionData2 = {
    correctAnswer: 'TestAnswer',
    enAnswer: 'TestAnswer2',
  };

  const mockQuestionData3 = {
    correctAnswer: 'TestAnswer',
    esAnswer: 'TestAnswer3',
  };

  const mockQuestionData4= {
    correctAnswer: 'TestAnswer',
    enAnswer: 'TestAnswer2',
    esAnswer: 'TestAnswer3'
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

    expect(screen.getByText('Chat with IA')).toBeInTheDocument();
    expect(screen.getByLabelText('Type a message...')).toBeInTheDocument();
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

    const inputField = screen.getByLabelText('Type a message...');
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

    const inputField = screen.getByLabelText('Type a message...');
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

    const inputField = screen.getByLabelText('Type a message...');
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

    const inputField = screen.getByLabelText('Type a message...');
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

  it('should not return a message if the mode is vs and the input contains the answer', () => {
    render(
      <Chat
        questionData={mockQuestionData}
        header={mockHeader}
        onUserMessage={mockOnUserMessage}
        onBotResponse={mockOnBotResponse}
        ignoreChat={false}
        mode="vs"
      />
    );
    const inputField = screen.getByLabelText('Type a message...');
    const sendButton = screen.getByText('Send');
    fireEvent.change(inputField, { target: { value: mockQuestionData.correctAnswer } });
    fireEvent.click(sendButton);

    expect(mockOnBotResponse).not.toHaveBeenCalled();
  });

  it('should not return a message if the mode is vs and the input contains the answer in english', () => {
    render(
      <Chat
        questionData={mockQuestionData2}
        header={mockHeader}
        onUserMessage={mockOnUserMessage}
        onBotResponse={mockOnBotResponse}
        ignoreChat={false}
        mode="vs"
      />
    );
    const inputField = screen.getByLabelText('Type a message...');
    const sendButton = screen.getByText('Send');
    fireEvent.change(inputField, { target: { value: mockQuestionData2.enAnswer } });
    fireEvent.click(sendButton);

    expect(mockOnBotResponse).not.toHaveBeenCalled();
  });

  it('should not return a message if the mode is vs and the input contains the answer in spanish', () => {
    render(
      <Chat
        questionData={mockQuestionData3}
        header={mockHeader}
        onUserMessage={mockOnUserMessage}
        onBotResponse={mockOnBotResponse}
        ignoreChat={false}
        mode="vs"
      />
    );
    const inputField = screen.getByLabelText('Type a message...');
    const sendButton = screen.getByText('Send');
    fireEvent.change(inputField, { target: { value: mockQuestionData3.esAnswer } });
    fireEvent.click(sendButton);

    expect(mockOnBotResponse).not.toHaveBeenCalled();
  });

  it('should not return a message if the mode is vs and the input matches any of correctAnswer, enAnswer, or esAnswer', () => {
    render(
      <Chat
        questionData={mockQuestionData4}
        header={mockHeader}
        onUserMessage={mockOnUserMessage}
        onBotResponse={mockOnBotResponse}
        ignoreChat={false}
        mode="vs"
      />
    );
    
    const inputField = screen.getByLabelText('Type a message...');
    const sendButton = screen.getByText('Send');
    
    // Test correctAnswer
    fireEvent.change(inputField, { target: { value: mockQuestionData4.correctAnswer } });
    fireEvent.click(sendButton);
    expect(mockOnBotResponse).not.toHaveBeenCalled();
    
    // Clear input
    fireEvent.change(inputField, { target: { value: '' } });
    
    // Test enAnswer
    fireEvent.change(inputField, { target: { value: mockQuestionData4.enAnswer } });
    fireEvent.click(sendButton);
    expect(mockOnBotResponse).not.toHaveBeenCalled();
    
    // Clear input
    fireEvent.change(inputField, { target: { value: '' } });
    
    // Test esAnswer
    fireEvent.change(inputField, { target: { value: mockQuestionData4.esAnswer } });
    fireEvent.click(sendButton);
    expect(mockOnBotResponse).not.toHaveBeenCalled();
  });
  it('should return a message if the mode is not vs and the input matches any of correctAnswer, enAnswer, or esAnswer', async () => {
    axios.post.mockResolvedValue({ data: { answer: 'This is a mock response' } });
  
    render(
      <Chat
        questionData={mockQuestionData4}
        header={mockHeader}
        onUserMessage={mockOnUserMessage}
        onBotResponse={mockOnBotResponse}
        ignoreChat={false}
        mode="not-vs"
      />
    );
    
    const inputField = screen.getByLabelText('Type a message...');
    const sendButton = screen.getByText('Send');
    
    // Test correctAnswer
    fireEvent.change(inputField, { target: { value: mockQuestionData4.correctAnswer } });
    fireEvent.click(sendButton);
    
    await waitFor(() => {
      expect(mockOnBotResponse).toHaveBeenCalled();
    });
  
    // Clear input
    fireEvent.change(inputField, { target: { value: '' } });
    
    // Test enAnswer
    fireEvent.change(inputField, { target: { value: mockQuestionData4.enAnswer } });
    fireEvent.click(sendButton);
    
    await waitFor(() => {
      expect(mockOnBotResponse).toHaveBeenCalled();
    });
  
    // Clear input
    fireEvent.change(inputField, { target: { value: '' } });
    
    // Test esAnswer
    fireEvent.change(inputField, { target: { value: mockQuestionData4.esAnswer } });
    fireEvent.click(sendButton);
  
    await waitFor(() => {
      expect(mockOnBotResponse).toHaveBeenCalledTimes(3);
    });
  });
  
});

