export const REDIS_KEYS = {
  queueTokens: (queueId: string) => `queue:${queueId}`,
  queueMeta: (queueId: string) => `queue:${queueId}:meta`,
  token: (tokenId: string) => `token:${tokenId}`,
  allQueues: 'queues:all',
} as const;

export const DEFAULT_AVG_SERVICE_TIME = 300000;
export const DEFAULT_MAX_SIZE = 100;
