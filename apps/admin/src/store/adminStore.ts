import { create } from 'zustand';
import type { Token, QueueStatusResult } from './api';

interface AdminState {
  queues: Array<{ id: string; name: string }>;
  selectedQueue: string | null;
  currentToken: Token | null;
  queueStatus: QueueStatusResult | null;
  isLoading: boolean;
  error: string | null;
  setQueues: (queues: Array<{ id: string; name: string }>) => void;
  setSelectedQueue: (id: string | null) => void;
  setCurrentToken: (token: Token | null) => void;
  setQueueStatus: (status: QueueStatusResult | null) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  queues: [],
  selectedQueue: null,
  currentToken: null,
  queueStatus: null,
  isLoading: false,
  error: null,
  setQueues: (queues) => set({ queues }),
  setSelectedQueue: (selectedQueue) => set({ selectedQueue }),
  setCurrentToken: (currentToken) => set({ currentToken }),
  setQueueStatus: (queueStatus) => set({ queueStatus }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));