import type { Poll } from '../types';

interface PollResultsProps {
    poll: Poll;
    highlightIndex?: number;
}

export default function PollResults({ poll, highlightIndex }: PollResultsProps) {
    const totalVotes = poll.options.reduce((sum, o) => sum + o.votes, 0);
    const labels = ['A', 'B', 'C', 'D', 'E', 'F'];

    return (
        <div className="poll-results">
            <div className="results-header">
                <span className="total-votes">{totalVotes} vote{totalVotes !== 1 ? 's' : ''}</span>
            </div>
            <div className="results-bars">
                {poll.options.map((option, idx) => {
                    const pct = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
                    const isHighlighted = highlightIndex === idx;
                    const isCorrect = option.isCorrect;
                    return (
                        <div key={idx} className={`result-row ${isHighlighted ? 'highlighted' : ''}`}>
                            <div className="result-label-area">
                                <span className="result-option-label">{labels[idx]}</span>
                                <span className="result-option-text">{option.text}</span>
                                {isCorrect && <span className="correct-badge">✓ Correct</span>}
                            </div>
                            <div className="result-bar-container">
                                <div
                                    className={`result-bar-fill ${isHighlighted ? 'highlighted-bar' : ''} ${isCorrect ? 'correct-bar' : ''}`}
                                    style={{ width: `${pct}%` }}
                                ></div>
                            </div>
                            <div className="result-stats">
                                <span className="result-votes">{option.votes}</span>
                                <span className="result-pct">{pct}%</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
