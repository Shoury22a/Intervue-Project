import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import type { Poll, ChatMessage } from '../types';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export function useTeacherSocket() {
    const socketRef = useRef<Socket | null>(null);
    const [connected, setConnected] = useState(false);
    const [activePoll, setActivePoll] = useState<Poll | null>(null);
    const [students, setStudents] = useState<string[]>([]);
    const [messages, setMessages] = useState<ChatMessage[]>([]);

    useEffect(() => {
        const socket = io(SOCKET_URL, { transports: ['websocket'] });
        socketRef.current = socket;

        socket.on('connect', () => {
            setConnected(true);
            socket.emit('teacher:connect');
        });

        socket.on('disconnect', () => setConnected(false));

        socket.on('poll:state', (data: { poll: Poll | null; students: string[] }) => {
            setActivePoll(data.poll);
            setStudents(data.students);
        });

        socket.on('poll:new', (data: { poll: Poll }) => {
            setActivePoll(data.poll);
        });

        socket.on('poll:ended', (data: { poll: Poll }) => {
            setActivePoll(data.poll);
        });

        socket.on('poll:results-update', (data: { poll: Poll }) => {
            setActivePoll(data.poll);
        });

        socket.on('students:update', (data: { students: string[] }) => {
            setStudents(data.students);
        });

        socket.on('chat:message', (msg: ChatMessage) => {
            setMessages((prev) => [...prev, msg]);
        });

        socket.on('error', (data: { message: string }) => {
            console.error('[Socket Error]', data.message);
        });

        return () => { socket.disconnect(); };
    }, []);

    const createPoll = useCallback((question: string, options: { text: string; isCorrect: boolean }[], timer: number) => {
        socketRef.current?.emit('teacher:create-poll', { question, options, timer });
    }, []);

    const endPoll = useCallback((pollId: string) => {
        socketRef.current?.emit('teacher:end-poll', { pollId });
    }, []);

    const kickStudent = useCallback((studentName: string) => {
        socketRef.current?.emit('teacher:kick-student', { studentName });
    }, []);

    const sendMessage = useCallback((message: string) => {
        socketRef.current?.emit('chat:message', { sender: 'Teacher', message, role: 'teacher' });
    }, []);

    return { connected, activePoll, students, messages, createPoll, endPoll, kickStudent, sendMessage };
}
