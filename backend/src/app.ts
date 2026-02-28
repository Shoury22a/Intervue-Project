import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import pollRoutes from './routes/pollRoutes';
import { initPollSocketHandler } from './sockets/PollSocketHandler';

const app = express();
const server = http.createServer(app);

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

const io = new Server(server, {
    cors: {
        origin: [CLIENT_URL, 'http://localhost:5173', 'http://localhost:4173'],
        methods: ['GET', 'POST', 'PATCH', 'DELETE'],
        credentials: true,
    },
});

// Middleware
app.use(cors({ origin: [CLIENT_URL, 'http://localhost:5173'], credentials: true }));
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Routes
app.use('/api/polls', pollRoutes);

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('[Error]', err.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
});

// Socket.io
initPollSocketHandler(io);

// MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/intervue_poll';
const PORT = parseInt(process.env.PORT || '5000', 10);

async function start() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('[DB] MongoDB connected');
        server.listen(PORT, () => {
            console.log(`[Server] Running on http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('[Server] Failed to start:', err);
        process.exit(1);
    }
}

start();

export { io };
