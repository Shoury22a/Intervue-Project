import { Request, Response } from 'express';
import { pollService } from '../services/PollService';

export class PollController {
    async getActivePoll(req: Request, res: Response): Promise<void> {
        try {
            const poll = await pollService.getActivePoll();
            res.json({ success: true, poll });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Failed to fetch active poll' });
        }
    }

    async getPollHistory(req: Request, res: Response): Promise<void> {
        try {
            const polls = await pollService.getPollHistory();
            res.json({ success: true, polls });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Failed to fetch poll history' });
        }
    }

    async createPoll(req: Request, res: Response): Promise<void> {
        try {
            const { question, options, timer } = req.body;
            if (!question || !options || !Array.isArray(options) || options.length < 2) {
                res.status(400).json({ success: false, message: 'Invalid poll data' });
                return;
            }
            const check = await pollService.canCreateNewPoll();
            if (!check.allowed) {
                res.status(409).json({ success: false, message: check.reason });
                return;
            }
            const poll = await pollService.createPoll({ question, options, timer: timer || 60 });
            res.status(201).json({ success: true, poll });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Failed to create poll' });
        }
    }

    async endPoll(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const poll = await pollService.endPoll(id);
            if (!poll) {
                res.status(404).json({ success: false, message: 'Poll not found' });
                return;
            }
            res.json({ success: true, poll });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Failed to end poll' });
        }
    }

    async getPollById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const poll = await pollService.getPollById(id);
            if (!poll) {
                res.status(404).json({ success: false, message: 'Poll not found' });
                return;
            }
            res.json({ success: true, poll });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Failed to fetch poll' });
        }
    }
}

export const pollController = new PollController();
