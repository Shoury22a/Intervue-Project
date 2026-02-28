import { useState } from 'react';
import PollResults from './PollResults';

interface HistoryPoll {
    _id: string;
    question: string;
    options: { text: string; isCorrect: boolean; votes: number }[];
    timer: number;
    startedAt: string;
    status: string;
    totalVotes: number;
    createdAt: string;
}

interface PollHistoryProps {
    polls: HistoryPoll[];
    loading: boolean;
}

export default function PollHistory({ polls, loading }: PollHistoryProps) {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    if (loading) {
        return (
            <div className="history-loading">
                <div className="spinner"></div>
                <p>Loading history...</p>
            </div>
        );
    }

    const totalVotesAll = polls.reduce((s, p) => s + p.totalVotes, 0);

    return (
        <div className="poll-history">
            <h2 className="history-title">Poll History</h2>
            <div className="history-stats">
                <div className="stat-card">
                    <span className="stat-number">{polls.length}</span>
                    <span className="stat-label">Total Polls</span>
                </div>
                <div className="stat-card">
                    <span className="stat-number">{totalVotesAll}</span>
                    <span className="stat-label">Total Votes</span>
                </div>
            </div>

            {polls.length === 0 ? (
                <div className="no-history">
                    <p>No polls yet. Create your first poll!</p>
                </div>
            ) : (
                <div className="history-list">
                    {polls.map((poll) => (
                        <div key={poll._id} className="history-item">
                            <div className="history-item-header" onClick={() => setExpandedId(expandedId === poll._id ? null : poll._id)}>
                                <div className="history-item-info">
                                    <span className={`history-status-badge ${poll.status}`}>{poll.status}</span>
                                    <h3 className="history-question">{poll.question}</h3>
                                    <div className="history-meta">
                                        <span>{new Date(poll.createdAt).toLocaleDateString()} • {new Date(poll.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        <span>• {poll.totalVotes} vote{poll.totalVotes !== 1 ? 's' : ''}</span>
                                        <span>• {poll.timer}s timer</span>
                                    </div>
                                </div>
                                <button className="view-results-btn">
                                    {expandedId === poll._id ? 'Hide ▲' : 'View Results ▼'}
                                </button>
                            </div>
                            {expandedId === poll._id && (
                                <div className="history-results">
                                    <PollResults
                                        poll={{
                                            ...poll,
                                            status: poll.status as 'active' | 'ended',
                                            timeRemaining: 0,
                                            votedStudents: [],
                                            startedAt: poll.startedAt,
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
