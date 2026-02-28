import { useNavigate } from 'react-router-dom';

export default function RoleSelect() {
    const navigate = useNavigate();

    return (
        <div className="role-select-page">
            <div className="logo-area">
                <div className="logo-icon">
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                        <rect width="40" height="40" rx="12" fill="#7C3AED" />
                        <path d="M10 28L20 12L30 28H10Z" fill="white" opacity="0.9" />
                        <circle cx="20" cy="24" r="3" fill="white" />
                    </svg>
                </div>
                <span className="logo-text">Intervue Poll</span>
            </div>

            <div className="role-card">
                <h1 className="role-title">Welcome to Live Polling</h1>
                <p className="role-subtitle">Select your role to get started</p>

                <div className="role-buttons">
                    <button className="role-btn teacher-btn" onClick={() => navigate('/teacher')}>
                        <div className="role-btn-icon">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                                <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
                                <path d="M8 21H16M12 17V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </div>
                        <div className="role-btn-text">
                            <span className="role-btn-title">I'm a Teacher</span>
                            <span className="role-btn-desc">Create and manage polls</span>
                        </div>
                    </button>

                    <button className="role-btn student-btn" onClick={() => navigate('/student')}>
                        <div className="role-btn-icon">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
                                <path d="M4 20C4 17 7.6 15 12 15C16.4 15 20 17 20 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </div>
                        <div className="role-btn-text">
                            <span className="role-btn-title">I'm a Student</span>
                            <span className="role-btn-desc">Join and answer polls</span>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}
