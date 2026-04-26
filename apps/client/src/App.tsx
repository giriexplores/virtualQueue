import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { JoinForm } from './components/JoinForm';
import { TokenDisplay } from './components/TokenDisplay';
import { LoadingSkeleton } from './components/LoadingSkeleton';
import { useQueueStore } from './store/queueStore';
import { queueApi } from './store/api';
import { useSocket } from './hooks/useSocket';

const QUEUE_ID = import.meta.env.VITE_QUEUE_ID || 'demo-queue';

function App() {
  const { token, status, setStatus, setIsPolling } = useQueueStore();
  const [isLoading] = useState(false);
  const { subscribe } = useSocket(QUEUE_ID);

  useEffect(() => {
    const unsubUpdated = subscribe('queue_updated', () => {
      if (token) {
        pollStatus();
      }
    });

    const unsubTokenCalled = subscribe('token_called', (data: unknown) => {
      const payload = data as { token?: { id: string } };
      if (token && payload.token?.id === token.id) {
        pollStatus();
      }
    });

    return () => {
      unsubUpdated?.();
      unsubTokenCalled?.();
    };
  }, [subscribe, token]);

  const pollStatus = async () => {
    if (!token) return;
    setIsPolling(true);
    try {
      const response = await queueApi.getStatus(QUEUE_ID, token.id);
      setStatus(response.data);
    } catch (err) {
      console.error('Failed to poll status:', err);
    } finally {
      setIsPolling(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    const interval = setInterval(pollStatus, 5000);
    return () => clearInterval(interval);
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Virtual Queue</h1>
          <p className="text-slate-600">Get in line, skip the wait</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!token ? (
            <motion.div
              key="join"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <JoinForm onJoin={() => {}} />
            </motion.div>
          ) : isLoading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <LoadingSkeleton />
            </motion.div>
          ) : (
            <motion.div
              key="token"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <TokenDisplay token={token} status={status} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;