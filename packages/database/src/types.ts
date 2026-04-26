export interface QueueItem {
  id: string;
  name: string;
  position: number;
  status: 'waiting' | 'called' | 'completed';
  createdAt: number;
}

export interface QueueConfig {
  name: string;
  maxSize: number;
}