import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTeacherSocket } from '../hooks/useTeacherSocket';
import PollResults from '../components/PollResults';
import CreatePollForm from '../components/CreatePollForm';
import ChatPanel from '../components/ChatPanel';
import PollHistory from '../components/PollHistory';
type Tab = 'poll' | 'history';
type SidebarTab = 'chat' | 'participants';

export default function TeacherView() {
    const navigate = useNavigate();
    const { connected, activePoll, students, messages, createPoll, endPoll, kickStudent, sendMessage } = useTeacherSocket();
    const [tab, setTab] = useState<Tab>('poll');
    const [sidebarTab, setSidebarTab] = useState<SidebarTab>('participants');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [historyPolls, setHistoryPolls] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    const fetchHistory = useCallback(async () => {
        setLoadingHistory(true);
        try {
            const res = await fetch(`${API}/polls/history`);
            const data = await res.json();
            if (data.success) setHistoryPolls(data.polls);
        } catch {
            toast.error('Failed to load poll history');
        } finally {
            setLoadingHistory(false);
        }
    }, [API]);

    useEffect(() => {
        if (tab === 'history') fetchHistory();
    }, [tab, fetchHistory]);

    const handleCreatePoll = (question: string, options: { text: string; isCorrect: boolean }[], timer: number) => {
        if (activePoll && activePoll.status === 'active') {
            const elapsed = (Date.now() - new Date(activePoll.startedAt).getTime()) / 1000;
            if (elapsed < activePoll.timer) {
                toast.error('A poll is already active. End it first or wait for it to expire.');
                return;
            }
        }
        createPoll(question, options, timer);
        setShowCreateForm(false);
        toast.success('Poll created!');
    };

    const handleEndPoll = () => {
        if (activePoll) {
            endPoll(activePoll._id);
            toast.success('Poll ended');
        }
    };

    const canCreateNew = !activePoll || activePoll.status === 'ended' ||
        (Date.now() - new Date(activePoll.startedAt).getTime()) / 1000 >= activePoll.timer;

    return (
        <div className="teacher-layout">
            {/* Header */}
            <header className="teacher-header">
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
                <div className="header-tabs">
                    <button className={`tab-btn ${tab === 'poll' ? 'active' : ''}`} onClick={() => setTab('poll')}>Live Poll</button>
                    <button className={`tab-btn ${tab === 'history' ? 'active' : ''}`} onClick={() => setTab('history')}>History</button>
                </div>
                <div className="header-right">
                    <span className={`connection-dot ${connected ? 'connected' : 'disconnected'}`}></span>
                    <span className="connection-label">{connected ? 'Live' : 'Connecting...'}</span>
                </div>
            </header>

            {tab === 'history' ? (
                <div className="history-container">
                    <PollHistory polls={historyPolls} loading={loadingHistory} />
                </div>
            ) : (
                <div className="teacher-content">
                    {/* Main area */}
                    <main className="teacher-main">
                        {showCreateForm ? (
                            <CreatePollForm
                                onSubmit={handleCreatePoll}
                                onCancel={() => setShowCreateForm(false)}
                            />
                        ) : activePoll ? (
                            <div className="active-poll-container">
                                <div className="active-poll-header">
                                    <div>
                                        <span className={`poll-status-badge ${activePoll.status}`}>
                                            {activePoll.status === 'active' ? '🔴 Live' : '✅ Ended'}
                                        </span>
                                        <h2 className="poll-question">{activePoll.question}</h2>
                                    </div>
                                    {activePoll.status === 'active' && (
                                        <button className="end-poll-btn" onClick={handleEndPoll}>End Poll</button>
                                    )}
                                </div>
                                <PollResults poll={activePoll} />
                                {canCreateNew && (
                                    <button className="new-question-btn" onClick={() => setShowCreateForm(true)}>
                                        + Ask a new question
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <div className="empty-icon">
                                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                                        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round" />
                                        <path d="M12 12v4M10 14h4" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round" />
                                    </svg>
                                </div>
                                <h2>No active poll</h2>
                                <p>Create your first question to get started</p>
                                <button className="create-poll-btn-main" onClick={() => setShowCreateForm(true)}>
                                    + Create a Poll
                                </button>
                            </div>
                        )}
                    </main>

                    {/* Sidebar */}
                    <aside className="teacher-sidebar">
                        <div className="sidebar-tabs">
                            <button className={`sidebar-tab ${sidebarTab === 'participants' ? 'active' : ''}`} onClick={() => setSidebarTab('participants')}>
                                Participants ({students.length})
                            </button>
                            <button className={`sidebar-tab ${sidebarTab === 'chat' ? 'active' : ''}`} onClick={() => setSidebarTab('chat')}>
                                Chat {messages.length > 0 && <span className="badge">{messages.length}</span>}
                            </button>
                        </div>

                        {sidebarTab === 'participants' ? (
                            <div className="participants-list">
                                {students.length === 0 ? (
                                    <p className="no-students">Waiting for students to join...</p>
                                ) : (
                                    students.map((name) => (
                                        <div key={name} className="participant-item">
                                            <div className="participant-avatar">{name[0].toUpperCase()}</div>
                                            <span className="participant-name">{name}</span>
                                            <button className="kick-btn" onClick={() => { kickStudent(name); toast.success(`${name} removed`); }}>
                                                Kick
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        ) : (
                            <ChatPanel messages={messages} onSend={sendMessage} senderName="Teacher" />
                        )}
                    </aside>
                </div>
            )}
        </div>
    );
}
