import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import type { Queue } from '../store/api';

interface QueueSelectorProps {
  queues: Queue[];
  onSelect: (queueId: string) => void;
  isLoading: boolean;
}

export function QueueSelector({ queues, onSelect, isLoading }: QueueSelectorProps) {
  if (queues.length === 0 && !isLoading) {
    return (
      <div className="text-center py-8 text-slate-500">
        <p>No queues available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-900 text-center mb-6">
        Select a Queue
      </h2>
      <div className="grid gap-4">
        {queues.map((queue) => (
          <motion.button
            key={queue.id}
            onClick={() => onSelect(queue.id)}
            disabled={queue.status !== 'active'}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full p-6 bg-white rounded-2xl shadow-lg border border-slate-100 text-left disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-slate-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{queue.name}</h3>
                  <p className="text-sm text-slate-500 font-mono">{queue.id.slice(0, 8)}...</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm ${
                queue.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : queue.status === 'paused'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-slate-100 text-slate-800'
              }`}>
                {queue.status}
              </span>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}