import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import { errorHandler } from './middleware/errorHandler';
import queueRoutes from './routes/queueRoutes';
import { initSocketService } from './services/socketService';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

app.use('/queues', queueRoutes(io));

app.use(errorHandler);

const PORT = process.env.PORT || 3001;

initSocketService(io);

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});