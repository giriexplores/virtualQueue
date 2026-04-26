import { create } from 'zustand';
import type { Token, QueueStatusResult } from './api';

interface QueueState {
  token: Token | null;
  status: QueueStatusResult | null;
  isJoining: boolean;
  isPolling: boolean;
  error: string | null;
  setToken: (token: Token) => void;
  setStatus: (status: QueueStatusResult) => void;
  setIsJoining: (value: boolean) => void;
  setIsPolling: (value: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useQueueStore = create<QueueState>((set) => ({
  token: null,
  status: null,
  isJoining: false,
  isPolling: false,
  error: null,
  setToken: (token) => set({ token }),
  setStatus: (status) => set({ status }),
  setIsJoining: (isJoining) => set({ isJoining }),
  setIsPolling: (isPolling) => set({ isPolling }),
  setError: (error) => set({ error }),
  reset: () => set({ token: null, status: null, error: null }),
}));