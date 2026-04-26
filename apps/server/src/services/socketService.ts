import type { Server } from 'socket.io';
import type { Token, Queue } from '@virtualqueue/database';

let io: Server | null = null;

export function initSocketService(socket: Server): void {
  io = socket;
}

export function emitQueueUpdated(queueId: string): void {
  io?.emit('queue_updated', { queueId });
}

export function emitTokenCalled(queueId: string, token: Token): void {
  io?.emit('token_called', { queueId, token });
  sendNotification(token, 'Your turn is coming up! Please be ready.');
}

export function emitQueuePaused(queueId: string): void {
  io?.emit('queue_paused', { queueId });
}

export function emitQueueResumed(queueId: string): void {
  io?.emit('queue_resumed', { queueId });
}

export function sendNotification(token: Token, message: string): void {
  console.log(`[WhatsApp Mock] Sending to ${token.name}: ${message}`);
}

export function notifyNearTurn(token: Token, position: number, threshold: number = 3): void {
  if (position <= threshold) {
    sendNotification(
      token,
      `You are now #${position} in the queue. Please be ready!`
    );
  }
}