import { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';

interface ChatPanelProps {
    messages: ChatMessage[];
    onSend: (message: string) => void;
    senderName: string;
}

export default function ChatPanel({ messages, onSend, senderName }: ChatPanelProps) {
    const [input, setInput] = useState('');
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = () => {
        if (!input.trim()) return;
        onSend(input.trim());
        setInput('');
    };

    return (
        <div className="chat-panel">
            <div className="chat-messages">
                {messages.length === 0 ? (
                    <p className="no-messages">No messages yet. Say hi! 👋</p>
                ) : (
                    messages.map((msg, idx) => {
                        const isSelf = msg.sender === senderName;
                        return (
                            <div key={idx} className={`chat-bubble-wrapper ${isSelf ? 'self' : 'other'}`}>
                                {!isSelf && <span className="chat-sender">{msg.sender}</span>}
                                <div className={`chat-bubble ${isSelf ? 'self' : 'other'} ${msg.role === 'teacher' ? 'teacher-bubble' : ''}`}>
                                    {msg.message}
                                </div>
                                <span className="chat-time">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                        );
                    })
                )}
                <div ref={bottomRef} />
            </div>
            <div className="chat-input-row">
                <input
                    type="text"
                    className="chat-input"
                    placeholder="Type a message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    maxLength={300}
                />
                <button className="chat-send-btn" onClick={handleSend}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
