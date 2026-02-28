import { Router } from 'express';
import { pollController } from '../controllers/PollController';

const router = Router();

router.get('/active', (req, res) => pollController.getActivePoll(req, res));
router.get('/history', (req, res) => pollController.getPollHistory(req, res));
router.get('/:id', (req, res) => pollController.getPollById(req, res));
router.post('/', (req, res) => pollController.createPoll(req, res));
router.patch('/:id/end', (req, res) => pollController.endPoll(req, res));

export default router;
