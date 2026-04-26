import redis from './client';
import {
  Queue,
  Token,
  QueueMeta,
  CreateQueueInput,
  JoinQueueInput,
  QueueStatusResult,
  QueueStatus,
  TokenStatus,
} from './types';
import { REDIS_KEYS, DEFAULT_AVG_SERVICE_TIME, DEFAULT_MAX_SIZE } from './schema';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export async function createQueue(input: CreateQueueInput): Promise<Queue> {
  const id = generateId();
  const now = Date.now();
  const maxSize = input.maxSize ?? DEFAULT_MAX_SIZE;
  const avgServiceTime = input.avgServiceTime ?? DEFAULT_AVG_SERVICE_TIME;

  const meta: QueueMeta = {
    id,
    name: input.name,
    status: QueueStatus.ACTIVE,
    maxSize,
    avgServiceTime,
    currentPosition: 0,
    createdAt: now,
    updatedAt: now,
  };

  await redis.hset(REDIS_KEYS.queueMeta(id), toHash(meta));

  return toQueue(meta);
}

export async function joinQueue(input: JoinQueueInput): Promise<Token> {
  const { queueId, name } = input;

  const meta = await getQueueMeta(queueId);
  if (!meta) throw new Error(`Queue ${queueId} not found`);

  if (meta.status === QueueStatus.PAUSED) {
    throw new Error('Cannot join a paused queue');
  }

  if (meta.status === QueueStatus.CLOSED) {
    throw new Error('Cannot join a closed queue');
  }

  const queueLength = await redis.llen(REDIS_KEYS.queueTokens(queueId));
  if (queueLength >= meta.maxSize) {
    throw new Error('Queue is full');
  }

  const tokenId = generateId();
  const now = Date.now();
  const position = queueLength + 1;

  const token: Token = {
    id: tokenId,
    queueId,
    name,
    position,
    status: TokenStatus.WAITING,
    createdAt: now,
  };

  await redis.rpush(REDIS_KEYS.queueTokens(queueId), tokenId);
  await redis.hset(REDIS_KEYS.token(tokenId), toHash(token));

  await redis.hset(REDIS_KEYS.queueMeta(queueId), 'updatedAt', now.toString());

  return token;
}

export async function getQueueStatus(queueId: string, tokenId?: string): Promise<QueueStatusResult> {
  const meta = await getQueueMeta(queueId);
  if (!meta) throw new Error(`Queue ${queueId} not found`);

  let position = 0;
  let tokensAhead = 0;

  if (tokenId) {
    const token = await getToken(tokenId);
    if (token && token.queueId === queueId) {
      position = token.position;
      tokensAhead = position - 1;
    }
  }

  const estimatedWaitMinutes = tokensAhead > 0
    ? Math.ceil((tokensAhead * meta.avgServiceTime) / 60000)
    : 0;

  return {
    id: meta.id,
    name: meta.name,
    status: meta.status,
    position,
    estimatedWaitMinutes,
    tokensAhead,
  };
}

export async function nextToken(queueId: string): Promise<Token | null> {
  const meta = await getQueueMeta(queueId);
  if (!meta) throw new Error(`Queue ${queueId} not found`);

  if (meta.status !== QueueStatus.ACTIVE) {
    throw new Error('Queue is not active');
  }

  const tokenId = await redis.lpop(REDIS_KEYS.queueTokens(queueId));
  if (!tokenId) return null;

  const token = await getToken(tokenId);
  if (!token) return null;

  const updatedToken: Token = {
    ...token,
    status: TokenStatus.CALLED,
    calledAt: Date.now(),
  };

  await redis.hset(REDIS_KEYS.token(tokenId), toHash(updatedToken));
  await redis.hset(REDIS_KEYS.queueMeta(queueId), 'currentPosition', token.position.toString());

  return updatedToken;
}

export async function skipToken(queueId: string, tokenId: string): Promise<boolean> {
  const token = await getToken(tokenId);
  if (!token || token.queueId !== queueId) return false;

  if (token.status !== TokenStatus.WAITING) return false;

  const updatedToken: Token = {
    ...token,
    status: TokenStatus.SKIPPED,
  };

  await redis.hset(REDIS_KEYS.token(tokenId), toHash(updatedToken));
  return true;
}

export async function pauseQueue(queueId: string): Promise<Queue> {
  const meta = await getQueueMeta(queueId);
  if (!meta) throw new Error(`Queue ${queueId} not found`);

  await redis.hset(REDIS_KEYS.queueMeta(queueId), 'status', QueueStatus.PAUSED, 'updatedAt', Date.now().toString());

  return toQueue({ ...meta, status: QueueStatus.PAUSED });
}

export async function resumeQueue(queueId: string): Promise<Queue> {
  const meta = await getQueueMeta(queueId);
  if (!meta) throw new Error(`Queue ${queueId} not found`);

  await redis.hset(REDIS_KEYS.queueMeta(queueId), 'status', QueueStatus.ACTIVE, 'updatedAt', Date.now().toString());

  return toQueue({ ...meta, status: QueueStatus.ACTIVE });
}

export async function closeQueue(queueId: string): Promise<Queue> {
  const meta = await getQueueMeta(queueId);
  if (!meta) throw new Error(`Queue ${queueId} not found`);

  await redis.hset(REDIS_KEYS.queueMeta(queueId), 'status', QueueStatus.CLOSED, 'updatedAt', Date.now().toString());

  return toQueue({ ...meta, status: QueueStatus.CLOSED });
}

async function getQueueMeta(queueId: string): Promise<QueueMeta | null> {
  const data = await redis.hgetall(REDIS_KEYS.queueMeta(queueId));
  if (!data || Object.keys(data).length === 0) return null;
  return fromHashQueueMeta(data);
}

async function getToken(tokenId: string): Promise<Token | null> {
  const data = await redis.hgetall(REDIS_KEYS.token(tokenId));
  if (!data || Object.keys(data).length === 0) return null;
  return fromHashToken(data);
}

function toHash<T extends object>(obj: T): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      result[key] = typeof value === 'object' ? JSON.stringify(value) : String(value);
    }
  }
  return result;
}

function fromHashToken(data: Record<string, string>): Token {
  return {
    id: data['id']!,
    queueId: data['queueId']!,
    name: data['name']!,
    position: parseInt(data['position']!, 10),
    status: data['status'] as TokenStatus,
    createdAt: parseInt(data['createdAt']!, 10),
    calledAt: data['calledAt'] ? parseInt(data['calledAt'], 10) : undefined,
    completedAt: data['completedAt'] ? parseInt(data['completedAt'], 10) : undefined,
  };
}

function fromHashQueueMeta(data: Record<string, string>): QueueMeta {
  return {
    id: data['id']!,
    name: data['name']!,
    status: data['status'] as QueueStatus,
    maxSize: parseInt(data['maxSize']!, 10),
    avgServiceTime: parseInt(data['avgServiceTime']!, 10),
    currentPosition: parseInt(data['currentPosition'] || '0', 10),
    createdAt: parseInt(data['createdAt']!, 10),
    updatedAt: parseInt(data['updatedAt']!, 10),
  };
}

function toQueue(meta: QueueMeta): Queue {
  return {
    id: meta.id,
    name: meta.name,
    status: meta.status,
    maxSize: meta.maxSize,
    avgServiceTime: meta.avgServiceTime,
    createdAt: meta.createdAt,
    updatedAt: meta.updatedAt,
  };
}