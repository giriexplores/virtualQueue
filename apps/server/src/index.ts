import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import { config } from './config';
import { logger } from './services/logger';
import { securityMiddleware, rateLimiter } from './middleware/security';
import { errorHandler } from './middleware/errorHandler';
import queueRoutes from './routes/queueRoutes';
import { initSocketService } from './services/socketService';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: config.cors.origin,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

app.use(cors({ origin: config.cors.origin, credentials: true }));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.use(securityMiddleware);
app.use(rateLimiter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/queues', queueRoutes(io));

app.use(errorHandler);

initSocketService(io);

httpServer.listen(config.port, () => {
  logger.info({ port: config.port, env: config.env }, 'Server started');
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  httpServer.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error({ reason }, 'Unhandled Rejection at:', promise);
});