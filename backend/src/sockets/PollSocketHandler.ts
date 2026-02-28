import { Server, Socket } from 'socket.io';
import { pollService } from '../services/PollService';

interface ConnectedStudent {
    name: string;
    socketId: string;
    joinedAt: Date;
}

// In-memory store for connected students
const connectedStudents = new Map<string, ConnectedStudent>();
const teacherSockets = new Set<string>();

export function initPollSocketHandler(io: Server): void {
    io.on('connection', (socket: Socket) => {
        console.log(`[Socket] Connected: ${socket.id}`);

        // ─── TEACHER ─────────────────────────────────────────────
        socket.on('teacher:connect', async () => {
            teacherSockets.add(socket.id);
            socket.join('teacher-room');
            try {
                const activePoll = await pollService.getActivePoll();
                socket.emit('poll:state', { poll: activePoll, students: getStudentList() });
            } catch (err) {
                socket.emit('error', { message: 'Failed to load state' });
            }
        });

        socket.on('teacher:create-poll', async (data: { question: string; options: { text: string; isCorrect: boolean }[]; timer: number }) => {
            try {
                const check = await pollService.canCreateNewPoll();
                if (!check.allowed) {
                    socket.emit('error', { message: check.reason });
                    return;
                }
                const poll = await pollService.createPoll(data);
                const enriched = await pollService.getPollById(poll._id.toString());

                // Broadcast to everyone
                io.emit('poll:new', { poll: enriched });
                console.log(`[Poll] New poll created: "${data.question}"`);
            } catch (err) {
                socket.emit('error', { message: 'Failed to create poll' });
            }
        });

        socket.on('teacher:end-poll', async (data: { pollId: string }) => {
            try {
                await pollService.endPoll(data.pollId);
                const enriched = await pollService.getPollById(data.pollId);
                io.emit('poll:ended', { poll: enriched });
            } catch (err) {
                socket.emit('error', { message: 'Failed to end poll' });
            }
        });

        socket.on('teacher:kick-student', (data: { studentName: string }) => {
            const student = Array.from(connectedStudents.values()).find(
                (s) => s.name === data.studentName
            );
            if (student) {
                const targetSocket = io.sockets.sockets.get(student.socketId);
                if (targetSocket) {
                    targetSocket.emit('student:kicked', { message: 'You have been removed by the teacher' });
                    targetSocket.disconnect(true);
                }
                connectedStudents.delete(student.socketId);
                io.to('teacher-room').emit('students:update', { students: getStudentList() });
            }
        });

        // ─── CHAT ────────────────────────────────────────────────
        socket.on('chat:message', (data: { sender: string; message: string; role: 'teacher' | 'student' }) => {
            io.emit('chat:message', {
                sender: data.sender,
                message: data.message,
                role: data.role,
                timestamp: new Date().toISOString(),
            });
        });

        // ─── STUDENT ─────────────────────────────────────────────
        socket.on('student:join', async (data: { name: string }) => {
            const trimmedName = data.name.trim();
            if (!trimmedName) {
                socket.emit('error', { message: 'Name cannot be empty' });
                return;
            }

            // Store the student
            connectedStudents.set(socket.id, {
                name: trimmedName,
                socketId: socket.id,
                joinedAt: new Date(),
            });
            socket.join('student-room');

            console.log(`[Student] "${trimmedName}" joined`);

            // Notify teachers of new participant
            io.to('teacher-room').emit('students:update', { students: getStudentList() });

            // Send current poll state with synced timer
            try {
                const activePoll = await pollService.getActivePoll();
                socket.emit('poll:state', { poll: activePoll, studentName: trimmedName });
            } catch (err) {
                socket.emit('error', { message: 'Failed to load poll' });
            }
        });

        socket.on('student:vote', async (data: { pollId: string; studentName: string; optionIndex: number }) => {
            try {
                const result = await pollService.submitVote(data.pollId, data.studentName, data.optionIndex);
                if (!result.success) {
                    socket.emit('vote:error', { message: result.message });
                    return;
                }
                // Confirm vote to student
                socket.emit('vote:confirmed', { poll: result.poll });
                // Broadcast updated results to ALL
                io.emit('poll:results-update', { poll: result.poll });
            } catch (err) {
                socket.emit('vote:error', { message: 'Failed to submit vote' });
            }
        });

        // ─── DISCONNECT ──────────────────────────────────────────
        socket.on('disconnect', () => {
            teacherSockets.delete(socket.id);
            if (connectedStudents.has(socket.id)) {
                const student = connectedStudents.get(socket.id)!;
                connectedStudents.delete(socket.id);
                console.log(`[Student] "${student.name}" disconnected`);
                io.to('teacher-room').emit('students:update', { students: getStudentList() });
            }
            console.log(`[Socket] Disconnected: ${socket.id}`);
        });
    });
}

function getStudentList(): string[] {
    return Array.from(connectedStudents.values()).map((s) => s.name);
}
