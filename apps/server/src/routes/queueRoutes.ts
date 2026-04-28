import { Router } from 'express';
import type { Server } from 'socket.io';
import {
  createQueueHandler,
  listQueuesHandler,
  joinQueueHandler,
  getQueueStatusHandler,
  getQueueTokensHandler,
  nextTokenHandler,
  skipTokenHandler,
  pauseQueueHandler,
  resumeQueueHandler,
} from '../controllers/queueController';
import { validate } from '../middleware/validate';
import { createQueueSchema, joinQueueSchema, skipTokenSchema } from '../middleware/schemas';

const router = Router();

export default function queueRoutes(io: Server) {
  router.post('/', validate(createQueueSchema), createQueueHandler);
  router.get('/', listQueuesHandler);
  router.get('/:id/tokens', getQueueTokensHandler);
  router.post('/:id/join', validate(joinQueueSchema), joinQueueHandler);
  router.get('/:id/status', getQueueStatusHandler);
  router.post('/:id/next', nextTokenHandler);
  router.post('/:id/skip', validate(skipTokenSchema), skipTokenHandler);
  router.post('/:id/pause', pauseQueueHandler);
  router.post('/:id/resume', resumeQueueHandler);

  return router;
}