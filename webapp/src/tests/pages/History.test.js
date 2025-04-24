import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import UserHistory from '../../pages/History';
import '../../localize/i18n';
import { SessionContext } from '../../SessionContext';


jest.mock('axios');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

// Stub out ResizeObserver globally:
global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  
  // Mock recharts to render data in a test‑friendly way:
  jest.mock('recharts', () => {
    return {
      ResponsiveContainer: ({ children }) => <div>{children}</div>,
      BarChart: ({ data }) => (
        <div data-testid="mock-barchart">
          {data.map((entry, i) => (
            <div key={i}>
              <span>{entry.username}</span>
              <span>{entry.score}</span>
            </div>
          ))}
        </div>
      ),
      XAxis: () => <div>X-Axis</div>,
      YAxis: () => <div>Y-Axis</div>,
      CartesianGrid: () => <div>Grid</div>,
      Tooltip: () => <div>Tooltip</div>,
      Legend: () => <div>Legend</div>,
      Cell: () => <div>Cell</div>,
      PieChart: ({ children }) => <div>{children}</div>,
      Pie: ({ data }) => <div data-testid="mock-pie">{data.map(d => d.value).join(',')}</div>,
    };
  });

describe('History Page', () => {
    const mockHistoryData = [
        { correctAnswers: 8, wrongAnswers: 2, time: 25, score: 100, gameMode: 'country' },
    ];
    const mockStatsData = {
        totalCorrect: 50,
        totalWrong: 10,
        totalGames: 20,
        averageScore: 85.5,
        totalTime: 300,
    };

    const mockLeaderboardData = [
        { username: 'Player1', score: 200 },
        { username: 'Player2', score: 150 },
        { username: 'Player3', score: 100 },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render the page title and buttons', () => {
        render(
            <BrowserRouter>
                <SessionContext.Provider value={{ sessionId: '1234', username: 'testUser' }}>

                    <UserHistory />
                </SessionContext.Provider>

            </BrowserRouter>
        );
        expect(screen.getByText('testUser')).toBeInTheDocument();

        expect(screen.getByText('User History')).toBeInTheDocument();
        expect(screen.getByText('View History')).toBeInTheDocument();
        expect(screen.getByText('View Stats')).toBeInTheDocument();
        expect(screen.getByText('View Ranking')).toBeInTheDocument();
        expect(screen.getByText('Main Page')).toBeInTheDocument();
    });

    it('should fetch and display user history when "View History" is clicked', async () => {


        render(
            <BrowserRouter>
                <SessionContext.Provider value={{ sessionId: '1234', username: 'testUser' }}>

                    <UserHistory />
                </SessionContext.Provider>

            </BrowserRouter>
        );
        axios.get.mockResolvedValueOnce({ data: { history: mockHistoryData } });

        fireEvent.click(screen.getByText('View History'));

        await waitFor(() => {
            expect(screen.getByText('country')).toBeInTheDocument();
            expect(screen.getByText('2')).toBeInTheDocument();
            expect(screen.getByText('25')).toBeInTheDocument();
            expect(screen.getByText('100')).toBeInTheDocument();
        });
    });

    it('should fetch and display user stats when "View Stats" is clicked', async () => {

        render(
            <BrowserRouter>
                <SessionContext.Provider value={{ sessionId: '1234', username: 'testUser' }}>
                    <UserHistory />
                </SessionContext.Provider>
            </BrowserRouter>
        );
        axios.get.mockResolvedValueOnce({ data: mockStatsData });

        fireEvent.click(screen.getByText('View Stats'));
        await waitFor(() => {
            expect(screen.getByText((content) => content.includes('20'))).toBeInTheDocument();
            expect(screen.getByText((content) => content.includes('85.5'))).toBeInTheDocument();
            expect(screen.getByText((content) => content.includes('300'))).toBeInTheDocument();
        }, setTimeout(3000));
    });

    it('should fetch and display global ranking when "View Ranking" is clicked', async () => {
        axios.get.mockResolvedValueOnce({ data: { topPlayers: mockLeaderboardData } });

        render(
            <BrowserRouter>
                <SessionContext.Provider value={{ sessionId: '1234', username: 'testUser' }}>
                    <UserHistory />
                </SessionContext.Provider>
            </BrowserRouter>
        );

        fireEvent.click(screen.getByText('View Ranking'));

        await waitFor(() => {
            expect(screen.getByText((content) => content.includes('Player1'))).toBeInTheDocument();
            expect(screen.getByText((content) => content.includes('200'))).toBeInTheDocument();
            expect(screen.getByText((content) => content.includes('Player2'))).toBeInTheDocument();
            expect(screen.getByText((content) => content.includes('150'))).toBeInTheDocument();
            expect(screen.getByText((content) => content.includes('Player3'))).toBeInTheDocument();
            expect(screen.getByText((content) => content.includes('100'))).toBeInTheDocument();
        });
    });

    it('should navigate to the homepage when "Main Page" is clicked', () => {

        render(
            <BrowserRouter>
                <SessionContext.Provider value={{ sessionId: '1234', username: 'testUser' }}>

                    <UserHistory />
                </SessionContext.Provider>

            </BrowserRouter>
        );

        fireEvent.click(screen.getByText('Main Page'));
        expect(mockNavigate).toHaveBeenCalledWith('/homepage');
    });
});