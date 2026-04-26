import type { Request, Response } from 'express';
import {
  createQueue,
  joinQueue,
  getQueueStatus,
  nextToken,
  skipToken,
  pauseQueue,
  resumeQueue,
} from '@virtualqueue/database';
import type { CreateQueueInput, JoinQueueInput } from '@virtualqueue/database';
import {
  emitQueueUpdated,
  emitTokenCalled,
  emitQueuePaused,
  emitQueueResumed,
} from '../services/socketService';
import { AppError } from '../middleware/errorHandler';

function getIdParam(params: Record<string, string | string[] | undefined>): string {
  const id = params['id'];
  if (Array.isArray(id)) return id[0] || '';
  return id || '';
}

export async function createQueueHandler(req: Request, res: Response): Promise<void> {
  const input: CreateQueueInput = req.body;
  const queue = await createQueue(input);
  emitQueueUpdated(queue.id);
  res.status(201).json(queue);
}

export async function listQueuesHandler(_req: Request, res: Response): Promise<void> {
  res.json({ message: 'List queues not fully implemented - add getAllQueues to database' });
}

export async function joinQueueHandler(req: Request, res: Response): Promise<void> {
  const id = getIdParam(req.params);
  const input: JoinQueueInput = req.body;

  try {
    const token = await joinQueue({ queueId: id, name: input.name });
    emitQueueUpdated(id);
    res.status(201).json(token);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('paused') || error.message.includes('closed') || error.message.includes('full')) {
        throw new AppError(400, error.message);
      }
    }
    throw error;
  }
}

export async function getQueueStatusHandler(req: Request, res: Response): Promise<void> {
  const id = getIdParam(req.params);
  const tokenId = req.query['tokenId'] as string | undefined;

  const status = await getQueueStatus(id, tokenId);
  res.json(status);
}

export async function nextTokenHandler(req: Request, res: Response): Promise<void> {
  const id = getIdParam(req.params);

  const token = await nextToken(id);
  if (!token) {
    res.json({ message: 'No tokens in queue' });
    return;
  }

  emitTokenCalled(id, token);
  emitQueueUpdated(id);
  res.json(token);
}

export async function skipTokenHandler(req: Request, res: Response): Promise<void> {
  const id = getIdParam(req.params);
  const { tokenId } = req.body as { tokenId: string };

  const success = await skipToken(id, tokenId);
  if (!success) {
    throw new AppError(404, 'Token not found or cannot be skipped');
  }

  emitQueueUpdated(id);
  res.json({ success: true });
}

export async function pauseQueueHandler(req: Request, res: Response): Promise<void> {
  const id = getIdParam(req.params);

  const queue = await pauseQueue(id);
  emitQueuePaused(id);
  res.json(queue);
}

export async function resumeQueueHandler(req: Request, res: Response): Promise<void> {
  const id = getIdParam(req.params);

  const queue = await resumeQueue(id);
  emitQueueResumed(id);
  res.json(queue);
}