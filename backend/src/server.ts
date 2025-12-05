import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import routes from './routes';
import { rateLimitMiddleware } from './middleware/rateLimiter';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
  }
});
const PORT = process.env.PORT || 4000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));

// General middleware
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use(rateLimitMiddleware);

// API routes
app.use('/api', routes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'AetherDash Backend API',
    version: '1.0.0',
    status: 'Running',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
  });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler:', err);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

// Socket.io signaling
io.on('connection', (socket) => {
  socket.on('call:offer', ({ to, offer, from, callType, fromName, fromAvatar }) => {
    io.to(to).emit('call:incoming', { from, offer, callType, fromName, fromAvatar });
  });

  socket.on('call:answer', ({ to, answer }) => {
    io.to(to).emit('call:answer', { answer });
  });

  socket.on('call:ice-candidate', ({ to, candidate }) => {
    io.to(to).emit('call:ice-candidate', { candidate });
  });

  socket.on('call:end', ({ to }) => {
    io.to(to).emit('call:ended');
  });

  socket.on('call:decline', ({ to }) => {
    io.to(to).emit('call:declined');
  });

  socket.on('user:register', (userId) => {
    socket.join(userId);
  });
});

httpServer.listen(PORT, 'localhost', () => {
  console.log(`🚀 AetherDash Backend running on localhost:${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
});

export default app;