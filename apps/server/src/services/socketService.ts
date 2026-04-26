import type { Server } from 'socket.io';
import type { Token } from '@virtualqueue/database';
import { createLogger } from './logger';

const logger = createLogger('socketService');
let io: Server | null = null;

export function initSocketService(socket: Server): void {
  io = socket;
  logger.info('Socket.IO service initialized');
}

export function emitQueueUpdated(queueId: string): void {
  logger.debug({ queueId }, 'Emitting queue_updated');
  io?.emit('queue_updated', { queueId });
}

export function emitTokenCalled(queueId: string, token: Token): void {
  logger.info({ queueId, tokenId: token.id }, 'Emitting token_called');
  io?.emit('token_called', { queueId, token });
  sendNotification(token, 'Your turn is coming up! Please be ready.');
}

export function emitQueuePaused(queueId: string): void {
  logger.info({ queueId }, 'Emitting queue_paused');
  io?.emit('queue_paused', { queueId });
}

export function emitQueueResumed(queueId: string): void {
  logger.info({ queueId }, 'Emitting queue_resumed');
  io?.emit('queue_resumed', { queueId });
}

export function sendNotification(token: Token, message: string): void {
  logger.info({ tokenName: token.name, message }, 'Sending notification (mock)');
  console.log(`[WhatsApp Mock] Sending to ${token.name}: ${message}`);
}

export function notifyNearTurn(token: Token, position: number, threshold = 3): void {
  if (position <= threshold) {
    sendNotification(
      token,
      `You are now #${position} in the queue. Please be ready!`
    );
  }
}