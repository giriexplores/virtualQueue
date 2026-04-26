import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface CreateQueueInput {
  name: string;
  maxSize?: number;
  avgServiceTime?: number;
}

export interface QueueStatusResult {
  id: string;
  name: string;
  status: string;
  position: number;
  estimatedWaitMinutes: number;
  tokensAhead: number;
}

export interface Token {
  id: string;
  queueId: string;
  name: string;
  position: number;
  status: string;
  createdAt: number;
}

export const adminApi = {
  createQueue: (data: CreateQueueInput) => api.post('/queues', data),
  getStatus: (queueId: string) => api.get<QueueStatusResult>(`/queues/${queueId}/status`),
  joinQueue: (queueId: string, data: { name: string }) =>
    api.post<Token>(`/queues/${queueId}/join`, data),
  nextToken: (queueId: string) => api.post<Token>(`/queues/${queueId}/next`),
  skipToken: (queueId: string, data: { tokenId: string }) =>
    api.post(`/queues/${queueId}/skip`, data),
  pauseQueue: (queueId: string) => api.post(`/queues/${queueId}/pause`),
  resumeQueue: (queueId: string) => api.post(`/queues/${queueId}/resume`),
};

export default api;