import { z } from 'zod';

export const createQueueSchema = z.object({
  name: z.string().min(1).max(100),
  maxSize: z.number().int().positive().optional(),
  avgServiceTime: z.number().int().positive().optional(),
});

export const joinQueueSchema = z.object({
  name: z.string().min(1).max(100),
});

export const skipTokenSchema = z.object({
  tokenId: z.string().min(1),
});