/**
 * Digital Garden - Server Entry Point
 * Express server with Socket.io for real-time multiplayer
 */

import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { setupSocketHandlers } from './socket.js';
import flowerRoutes from './routes/flowers.js';

const app = express();
const httpServer = createServer(app);

// CORS origins - add your Vercel domain here
const ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://digital-garden.vercel.app',      // Your Vercel domain
    /\.vercel\.app$/                           // Any Vercel preview deploy
];

const io = new Server(httpServer, {
    cors: {
        origin: ALLOWED_ORIGINS,
        methods: ['GET', 'POST']
    }
});

// Middleware
app.use(cors({
    origin: ALLOWED_ORIGINS
}));
app.use(express.json({ limit: '5mb' })); // For flower image data

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/flowers', flowerRoutes);

// Setup Socket.io handlers
setupSocketHandlers(io);

// Start server
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
    console.log(`🌸 Digital Garden server running on port ${PORT}`);
});

export { app, io };
