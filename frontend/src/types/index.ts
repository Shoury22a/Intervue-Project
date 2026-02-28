export interface PollOption {
    text: string;
    isCorrect: boolean;
    votes: number;
}

export interface Poll {
    _id: string;
    question: string;
    options: PollOption[];
    timer: number;
    startedAt: string;
    status: 'active' | 'ended';
    timeRemaining: number;
    votedStudents: string[];
    createdAt: string;
}

export interface ChatMessage {
    sender: string;
    message: string;
    role: 'teacher' | 'student';
    timestamp: string;
}
