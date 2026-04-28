import { create } from 'zustand';
import type { Token, QueueStatusResult, Queue } from './api';

interface QueueState {
  queues: Queue[];
  selectedQueueId: string | null;
  token: Token | null;
  status: QueueStatusResult | null;
  isJoining: boolean;
  isPolling: boolean;
  error: string | null;
  setQueues: (queues: Queue[]) => void;
  setSelectedQueueId: (id: string | null) => void;
  setToken: (token: Token) => void;
  setStatus: (status: QueueStatusResult) => void;
  setIsJoining: (value: boolean) => void;
  setIsPolling: (value: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useQueueStore = create<QueueState>((set) => ({
  queues: [],
  selectedQueueId: null,
  token: null,
  status: null,
  isJoining: false,
  isPolling: false,
  error: null,
  setQueues: (queues) => set({ queues }),
  setSelectedQueueId: (selectedQueueId) => set({ selectedQueueId }),
  setToken: (token) => set({ token }),
  setStatus: (status) => set({ status }),
  setIsJoining: (isJoining) => set({ isJoining }),
  setIsPolling: (isPolling) => set({ isPolling }),
  setError: (error) => set({ error }),
  reset: () => set({ token: null, status: null, error: null }),
}));