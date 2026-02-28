import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import type { Poll, ChatMessage } from '../types';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export function useStudentSocket(studentName: string) {
    const socketRef = useRef<Socket | null>(null);
    const [connected, setConnected] = useState(false);
    const [activePoll, setActivePoll] = useState<Poll | null>(null);
    const [voted, setVoted] = useState(false);
    const [votedIndex, setVotedIndex] = useState<number | null>(null);
    const [kicked, setKicked] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [voteError, setVoteError] = useState<string | null>(null);

    useEffect(() => {
        if (!studentName) return;

        const socket = io(SOCKET_URL, { transports: ['websocket'] });
        socketRef.current = socket;

        socket.on('connect', () => {
            setConnected(true);
            socket.emit('student:join', { name: studentName });
        });

        socket.on('disconnect', () => setConnected(false));

        socket.on('poll:state', (data: { poll: Poll | null }) => {
            setActivePoll(data.poll);
            if (data.poll && data.poll.votedStudents.includes(studentName)) {
                setVoted(true);
            }
        });

        socket.on('poll:new', (data: { poll: Poll }) => {
            setActivePoll(data.poll);
            setVoted(false);
            setVotedIndex(null);
        });

        socket.on('poll:ended', (data: { poll: Poll }) => {
            setActivePoll(data.poll);
        });

        socket.on('poll:results-update', (data: { poll: Poll }) => {
            setActivePoll(data.poll);
        });

        socket.on('vote:confirmed', (data: { poll: Poll }) => {
            setVoted(true);
            setActivePoll(data.poll);
        });

        socket.on('vote:error', (data: { message: string }) => {
            setVoteError(data.message);
        });

        socket.on('student:kicked', () => {
            setKicked(true);
            socket.disconnect();
        });

        socket.on('chat:message', (msg: ChatMessage) => {
            setMessages((prev) => [...prev, msg]);
        });

        return () => { socket.disconnect(); };
    }, [studentName]);

    const submitVote = useCallback((pollId: string, optionIndex: number) => {
        socketRef.current?.emit('student:vote', { pollId, studentName, optionIndex });
        setVotedIndex(optionIndex);
    }, [studentName]);

    const sendMessage = useCallback((message: string) => {
        socketRef.current?.emit('chat:message', { sender: studentName, message, role: 'student' });
    }, [studentName]);

    return { connected, activePoll, voted, votedIndex, kicked, messages, voteError, submitVote, sendMessage };
}
