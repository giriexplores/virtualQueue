import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const redisOptions: Redis.RedisOptions = {
  maxRetriesPerRequest: 3,
  retryStrategy: (times: number) => {
    if (times > 3) {
      return null;
    }
    return Math.min(times * 200, 2000);
  },
  reconnectOnError: (err: Error) => {
    const targetErrors = ['READONLY', 'ECONNRESET', 'ETIMEDOUT'];
    return targetErrors.some(e => err.message.includes(e));
  },
  enableReadyCheck: true,
  lazyConnect: false,
};

const redis = new Redis(redisUrl, {
  ...redisOptions,
  retryStrategy: (times: number) => {
    if (times > 3) {
      console.error('Redis: Max retry attempts reached');
      return null;
    }
    const delay = Math.min(times * 200, 2000);
    console.log(`Redis: Reconnecting in ${delay}ms (attempt ${times})`);
    return delay;
  },
});

redis.on('connect', () => {
  console.log('Redis: Connected');
});

redis.on('ready', () => {
  console.log('Redis: Ready');
});

redis.on('error', (err: Error) => {
  console.error('Redis error:', err.message);
});

redis.on('close', () => {
  console.log('Redis: Connection closed');
});

export default redis;