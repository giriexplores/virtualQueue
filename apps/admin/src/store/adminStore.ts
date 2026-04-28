import { create } from 'zustand';
import type { Queue, Token, QueueStatusResult } from './api';

interface AdminState {
  queues: Queue[];
  selectedQueueId: string | null;
  queueStatuses: Record<string, QueueStatusResult>;
  currentTokens: Record<string, Token | null>;
  tokens: Token[];
  isLoading: boolean;
  error: string | null;
  setQueues: (queues: Queue[]) => void;
  setSelectedQueueId: (id: string | null) => void;
  setQueueStatus: (queueId: string, status: QueueStatusResult) => void;
  setCurrentToken: (queueId: string, token: Token | null) => void;
  setTokens: (tokens: Token[]) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  queues: [],
  selectedQueueId: null,
  queueStatuses: {},
  currentTokens: {},
  tokens: [],
  isLoading: false,
  error: null,
  setQueues: (queues) => set({ queues }),
  setSelectedQueueId: (selectedQueueId) => set({ selectedQueueId }),
  setQueueStatus: (queueId, status) =>
    set((state) => ({ queueStatuses: { ...state.queueStatuses, [queueId]: status } })),
  setCurrentToken: (queueId, token) =>
    set((state) => ({ currentTokens: { ...state.currentTokens, [queueId]: token } })),
  setTokens: (tokens) => set({ tokens }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));