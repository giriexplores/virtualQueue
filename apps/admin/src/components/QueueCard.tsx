import { motion } from 'framer-motion';
import { Pause, Play, ArrowRight, Users } from 'lucide-react';
import type { QueueStatusResult, Token } from '../store/api';

interface QueueCardProps {
  name: string;
  status: QueueStatusResult | null;
  currentToken: Token | null;
  onNext: () => void;
  onPause: () => void;
  onResume: () => void;
  isLoading: boolean;
}

export function QueueCard({
  name,
  status,
  currentToken,
  onNext,
  onPause,
  onResume,
  isLoading,
}: QueueCardProps) {
  const isPaused = status?.status === 'paused';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden"
    >
      <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">{name}</h3>
        <span
          className={`px-3 py-1 rounded-full text-sm ${
            isPaused ? 'bg-amber-500' : 'bg-green-500'
          }`}
        >
          {isPaused ? 'Paused' : 'Active'}
        </span>
      </div>

      <div className="p-6">
        {currentToken ? (
          <div className="text-center mb-6">
            <p className="text-slate-500 text-sm mb-2">Now Serving</p>
            <div className="text-5xl font-bold text-slate-900">{currentToken.position}</div>
            <p className="text-slate-600 mt-2">{currentToken.name}</p>
          </div>
        ) : (
          <div className="text-center mb-6 py-8 text-slate-400">
            <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No one being served</p>
          </div>
        )}

        {status && (
          <div className="flex justify-center gap-6 text-sm text-slate-600 mb-6">
            <div>
              <span className="font-semibold text-slate-900">{status.tokensAhead}</span>
              <span className="ml-1">in queue</span>
            </div>
            <div>
              <span className="font-semibold text-slate-900">~{status.estimatedWaitMinutes}</span>
              <span className="ml-1">min wait</span>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <motion.button
            onClick={onNext}
            disabled={isLoading || isPaused}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <ArrowRight className="w-5 h-5" />
            Next
          </motion.button>

          <motion.button
            onClick={isPaused ? onResume : onPause}
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`px-4 py-3 rounded-xl font-medium ${
              isPaused
                ? 'bg-green-600 text-white'
                : 'bg-amber-500 text-white'
            } disabled:opacity-50`}
          >
            {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}