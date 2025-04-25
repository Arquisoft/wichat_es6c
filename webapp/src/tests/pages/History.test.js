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
    observe() { }
    unobserve() { }
    disconnect() { }
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

    const mockLeaderboard = {
        topPlayers: [
            { _id: 'Player1', totalScore: 500, accuracy: 90.00, totalCorrect: 45, totalGames: 10, globalRank: 1 },
            { _id: 'Player2', totalScore: 400, accuracy: 85.00, totalCorrect: 40, totalGames: 8, globalRank: 2 },
        ],
        userPosition: {
            _id: 'testUser',
            totalScore: 300,
            accuracy: 80,
            totalCorrect: 30,
            totalGames: 6,
            globalRank: 3,
        },
    };

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

        render(
            <BrowserRouter>
                <SessionContext.Provider value={{ sessionId: '1234', username: 'testUser' }}>
                    <UserHistory />
                </SessionContext.Provider>
            </BrowserRouter>
        );
        axios.get.mockResolvedValueOnce({ data: mockLeaderboard });

        fireEvent.click(screen.getByText('View Ranking'));
        await waitFor(() => {
            mockLeaderboard.topPlayers.forEach((player) => {
                expect(screen.getByText(player._id)).toBeInTheDocument();
                expect(screen.getByText(player.totalScore.toString())).toBeInTheDocument();
                expect(screen.getByText(`${player.accuracy}.00%`)).toBeInTheDocument();
                expect(screen.getByText(player.totalCorrect.toString())).toBeInTheDocument();
                expect(screen.getByText(player.totalGames.toString())).toBeInTheDocument();
            });
    
            expect(screen.getByText(`${mockLeaderboard.userPosition._id} (Tú)`)).toBeInTheDocument();
            expect(screen.getByText(mockLeaderboard.userPosition.totalScore.toString())).toBeInTheDocument();
            expect(screen.getByText(`${mockLeaderboard.userPosition.accuracy}.00%`)).toBeInTheDocument();
            expect(screen.getByText(mockLeaderboard.userPosition.totalCorrect.toString())).toBeInTheDocument();
            expect(screen.getByText(mockLeaderboard.userPosition.totalGames.toString())).toBeInTheDocument();            
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