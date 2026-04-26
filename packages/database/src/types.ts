export enum QueueStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  CLOSED = 'closed',
}

export interface Queue {
  id: string;
  name: string;
  status: QueueStatus;
  maxSize: number;
  avgServiceTime: number;
  createdAt: number;
  updatedAt: number;
}

export interface Token {
  id: string;
  queueId: string;
  name: string;
  position: number;
  status: TokenStatus;
  createdAt: number;
  calledAt?: number;
  completedAt?: number;
}

export enum TokenStatus {
  WAITING = 'waiting',
  CALLED = 'called',
  COMPLETED = 'completed',
  SKIPPED = 'skipped',
}

export interface QueueMeta {
  id: string;
  name: string;
  status: QueueStatus;
  maxSize: number;
  avgServiceTime: number;
  currentPosition: number;
  createdAt: number;
  updatedAt: number;
}

export interface CreateQueueInput {
  name: string;
  maxSize?: number;
  avgServiceTime?: number;
}

export interface JoinQueueInput {
  queueId: string;
  name: string;
}

export interface QueueStatusResult {
  id: string;
  name: string;
  status: QueueStatus;
  position: number;
  estimatedWaitMinutes: number;
  tokensAhead: number;
}