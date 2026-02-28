import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useStudentSocket } from '../hooks/useStudentSocket';
import { usePollTimer } from '../hooks/usePollTimer';
import PollResults from '../components/PollResults';
import ChatPanel from '../components/ChatPanel';

export default function StudentView() {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [joinedName, setJoinedName] = useState('');
    const [showChat, setShowChat] = useState(false);

    const { connected, activePoll, voted, votedIndex, kicked, messages, voteError, submitVote, sendMessage } =
        useStudentSocket(joinedName);

    const { formatted: timerDisplay, secondsLeft } = usePollTimer(
        activePoll?.timeRemaining ?? 0,
        () => {
            if (activePoll?.status === 'active') toast('⏰ Time is up!', { icon: '⏰' });
        }
    );

    const handleJoin = () => {
        const trimmed = name.trim();
        if (!trimmed) { toast.error('Please enter your name'); return; }
        setJoinedName(trimmed);
    };

    const handleVote = (optionIndex: number) => {
        if (!activePoll) return;
        if (voted) { toast.error('You already voted!'); return; }
        if (secondsLeft <= 0) { toast.error('Time is up!'); return; }
        submitVote(activePoll._id, optionIndex);
    };

    if (voteError) toast.error(voteError);

    if (kicked) {
        return (
            <div className="kicked-page">
                <div className="kicked-card">
                    <div className="kicked-icon">🚫</div>
                    <h2>You've been removed</h2>
                    <p>The teacher has removed you from this session.</p>
                    <button onClick={() => navigate('/')}>Go Home</button>
                </div>
            </div>
        );
    }

    if (!joinedName) {
        return (
            <div className="student-join-page">
                <div className="join-card">
                    <div className="join-logo">
                        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                            <rect width="40" height="40" rx="12" fill="#7C3AED" />
                            <path d="M10 28L20 12L30 28H10Z" fill="white" opacity="0.9" />
                            <circle cx="20" cy="24" r="3" fill="white" />
                        </svg>
                        <span>Intervue Poll</span>
                    </div>
                    <h1>Join the Session</h1>
                    <p>Enter your name to participate in live polls</p>
                    <div className="join-form">
                        <input
                            type="text"
                            className="name-input"
                            placeholder="Your name..."
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                            maxLength={30}
                            autoFocus
                        />
                        <button className="join-btn" onClick={handleJoin}>
                            Continue →
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const isTimerUrgent = secondsLeft <= 10 && secondsLeft > 0;
    const isPollEnded = activePoll?.status === 'ended' || secondsLeft <= 0;
    const showResults = voted || isPollEnded;

    return (
        <div className="student-layout">
            <header className="student-header">
                <div className="header-left">
                    <button className="back-btn" onClick={() => navigate('/')}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                    <div className="logo-text-sm">
                        <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
                            <rect width="40" height="40" rx="10" fill="#7C3AED" />
                            <path d="M10 28L20 12L30 28H10Z" fill="white" opacity="0.9" />
                            <circle cx="20" cy="24" r="3" fill="white" />
                        </svg>
                        <span>Intervue Poll</span>
                    </div>
                </div>
                <div className="student-name-badge">
                    <span className="name-avatar">{joinedName[0].toUpperCase()}</span>
                    <span>{joinedName}</span>
                </div>
                <button className="chat-toggle-btn" onClick={() => setShowChat(!showChat)}>
                    💬 Chat {messages.length > 0 && <span className="badge">{messages.length}</span>}
                </button>
            </header>

            <main className="student-main">
                {!activePoll ? (
                    <div className="waiting-state">
                        <div className="spinner-container">
                            <div className="spinner"></div>
                        </div>
                        <h2>Wait for the teacher to ask a question...</h2>
                        <p>You'll be notified when a poll starts</p>
                        <div className={`conn-status ${connected ? 'online' : 'offline'}`}>
                            {connected ? '🟢 Connected' : '🔴 Connecting...'}
                        </div>
                    </div>
                ) : (
                    <div className="poll-container">
                        {/* Question header */}
                        <div className="poll-header">
                            <div className="question-label">Question</div>
                            {activePoll.status === 'active' && !voted && (
                                <div className={`timer-display ${isTimerUrgent ? 'urgent' : ''}`}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                                        <path d="M12 7V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                    <span>{timerDisplay}</span>
                                </div>
                            )}
                        </div>

                        <h2 className="student-question">{activePoll.question}</h2>

                        {showResults ? (
                            <div className="results-section">
                                {voted && <div className="voted-banner">✅ Your vote has been recorded!</div>}
                                {isPollEnded && !voted && <div className="ended-banner">⏰ Poll has ended</div>}
                                <PollResults poll={activePoll} highlightIndex={votedIndex ?? undefined} />
                                <p className="thanks-msg">Thanks for participating! 🎉</p>
                            </div>
                        ) : (
                            <div className="options-grid">
                                {activePoll.options.map((option, idx) => {
                                    const labels = ['A', 'B', 'C', 'D', 'E', 'F'];
                                    return (
                                        <button
                                            key={idx}
                                            className={`option-card ${votedIndex === idx ? 'selected' : ''} ${secondsLeft <= 0 ? 'disabled' : ''}`}
                                            onClick={() => handleVote(idx)}
                                            disabled={secondsLeft <= 0}
                                        >
                                            <span className="option-label">{labels[idx]}</span>
                                            <span className="option-text">{option.text}</span>
                                            {votedIndex === idx && (
                                                <span className="option-check">✓</span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Chat drawer */}
            {showChat && (
                <div className="chat-drawer">
                    <div className="chat-drawer-header">
                        <span>Chat</span>
                        <button onClick={() => setShowChat(false)}>✕</button>
                    </div>
                    <ChatPanel messages={messages} onSend={sendMessage} senderName={joinedName} />
                </div>
            )}
        </div>
    );
}
