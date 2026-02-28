import { Poll, IPoll, IOption } from '../models/Poll';
import { Vote } from '../models/Vote';
import mongoose from 'mongoose';

export interface CreatePollDTO {
    question: string;
    options: { text: string; isCorrect: boolean }[];
    timer: number;
}

export interface PollWithTimeRemaining extends Omit<IPoll, 'options'> {
    options: IOption[];
    timeRemaining: number;
    votedStudents: string[];
}

class PollService {
    async createPoll(data: CreatePollDTO): Promise<IPoll> {
        const poll = new Poll({
            question: data.question,
            options: data.options.map((o) => ({ text: o.text, isCorrect: o.isCorrect, votes: 0 })),
            timer: data.timer,
            startedAt: new Date(),
            status: 'active',
        });
        return await poll.save();
    }

    async getActivePoll(): Promise<PollWithTimeRemaining | null> {
        const poll = await Poll.findOne({ status: 'active' }).sort({ createdAt: -1 });
        if (!poll) return null;
        return await this.enrichPoll(poll);
    }

    async getPollById(pollId: string): Promise<PollWithTimeRemaining | null> {
        const poll = await Poll.findById(pollId);
        if (!poll) return null;
        return await this.enrichPoll(poll);
    }

    private async enrichPoll(poll: IPoll): Promise<PollWithTimeRemaining> {
        const elapsed = (Date.now() - new Date(poll.startedAt).getTime()) / 1000;
        const timeRemaining = Math.max(0, poll.timer - Math.floor(elapsed));

        const votes = await Vote.find({ pollId: poll._id });
        const votedStudents = votes.map((v) => v.studentName);

        // Rebuild options with live vote counts
        const optionsWithVotes = poll.options.map((opt, idx) => ({
            ...opt.toObject(),
            votes: votes.filter((v) => v.optionIndex === idx).length,
        }));

        return {
            ...poll.toObject(),
            options: optionsWithVotes,
            timeRemaining,
            votedStudents,
        } as PollWithTimeRemaining;
    }

    async submitVote(
        pollId: string,
        studentName: string,
        optionIndex: number
    ): Promise<{ success: boolean; message: string; poll?: PollWithTimeRemaining }> {
        // Check poll exists and is active
        const poll = await Poll.findById(pollId);
        if (!poll) return { success: false, message: 'Poll not found' };
        if (poll.status === 'ended') return { success: false, message: 'Poll has ended' };

        // Check timer
        const elapsed = (Date.now() - new Date(poll.startedAt).getTime()) / 1000;
        if (elapsed > poll.timer) return { success: false, message: 'Time is up' };

        // Atomic duplicate prevention
        try {
            await Vote.create({ pollId: new mongoose.Types.ObjectId(pollId), studentName, optionIndex });
        } catch (err: any) {
            if (err.code === 11000) {
                return { success: false, message: 'You have already voted' };
            }
            throw err;
        }

        const enriched = await this.enrichPoll(poll);
        return { success: true, message: 'Vote recorded', poll: enriched };
    }

    async endPoll(pollId: string): Promise<IPoll | null> {
        return await Poll.findByIdAndUpdate(pollId, { status: 'ended' }, { new: true });
    }

    async endActivePoll(): Promise<IPoll | null> {
        const poll = await Poll.findOne({ status: 'active' });
        if (!poll) return null;
        return await Poll.findByIdAndUpdate(poll._id, { status: 'ended' }, { new: true });
    }

    async getPollHistory(): Promise<any[]> {
        const polls = await Poll.find().sort({ createdAt: -1 });
        const result = [];
        for (const poll of polls) {
            const votes = await Vote.countDocuments({ pollId: poll._id });
            const optionsWithVotes = poll.options.map((opt, idx) => ({
                text: opt.text,
                isCorrect: opt.isCorrect,
                votes: 0, // will fill
            }));
            // Count per option
            for (let i = 0; i < poll.options.length; i++) {
                optionsWithVotes[i].votes = await Vote.countDocuments({ pollId: poll._id, optionIndex: i });
            }
            result.push({
                _id: poll._id,
                question: poll.question,
                options: optionsWithVotes,
                timer: poll.timer,
                startedAt: poll.startedAt,
                status: poll.status,
                totalVotes: votes,
                createdAt: poll.createdAt,
            });
        }
        return result;
    }

    async canCreateNewPoll(): Promise<{ allowed: boolean; reason?: string }> {
        const activePoll = await Poll.findOne({ status: 'active' });
        if (!activePoll) return { allowed: true };

        const elapsed = (Date.now() - new Date(activePoll.startedAt).getTime()) / 1000;
        if (elapsed >= activePoll.timer) {
            // Auto-end it
            await Poll.findByIdAndUpdate(activePoll._id, { status: 'ended' });
            return { allowed: true };
        }

        // Check if all students voted (we track via votes vs connected students)
        return { allowed: false, reason: 'A poll is already active' };
    }
}

export const pollService = new PollService();
