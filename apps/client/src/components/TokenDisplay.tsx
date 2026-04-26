import { motion } from 'framer-motion';
import { Clock, Users, Bell } from 'lucide-react';
import type { Token, QueueStatusResult } from '../store/api';

interface TokenDisplayProps {
  token: Token;
  status: QueueStatusResult | null;
}

export function TokenDisplay({ token, status }: TokenDisplayProps) {
  const estimatedTime = status?.estimatedWaitMinutes || 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="bg-slate-900 text-white py-8 px-6 text-center">
          <p className="text-slate-400 text-sm mb-2">Your Token Number</p>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="text-6xl font-bold tracking-tight"
          >
            #{token.position}
          </motion.div>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3 text-slate-600">
            <Clock className="w-5 h-5" />
            <span>Estimated wait: <strong>{estimatedTime} min</strong></span>
          </div>

          {status && (
            <div className="flex items-center gap-3 text-slate-600">
              <Users className="w-5 h-5" />
              <span>{status.tokensAhead} people ahead of you</span>
            </div>
          )}

          <div className="flex items-center gap-3 text-slate-600">
            <Bell className="w-5 h-5" />
            <span>You'll be notified when it's your turn</span>
          </div>
        </div>

        <div className="px-6 pb-6">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm ${
            token.status === 'waiting'
              ? 'bg-amber-100 text-amber-800'
              : token.status === 'called'
              ? 'bg-green-100 text-green-800'
              : 'bg-slate-100 text-slate-800'
          }`}>
            <span className={`w-2 h-2 rounded-full ${
              token.status === 'waiting' ? 'bg-amber-500' : 'bg-green-500'
            }`} />
            {token.status === 'waiting' ? 'In Queue' : token.status === 'called' ? 'Your Turn!' : token.status}
          </div>
        </div>
      </div>
    </motion.div>
  );
}