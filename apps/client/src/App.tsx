import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QueueSelector } from './components/QueueSelector';
import { JoinForm } from './components/JoinForm';
import { TokenDisplay } from './components/TokenDisplay';
import { LoadingSkeleton } from './components/LoadingSkeleton';
import { useQueueStore } from './store/queueStore';
import { queueApi } from './store/api';
import { useSocket } from './hooks/useSocket';

function App() {
  const {
    queues,
    selectedQueueId,
    token,
    status,
    setQueues,
    setSelectedQueueId,
    setStatus,
    setIsPolling,
    error,
    setError,
  } = useQueueStore();

  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);

  const { subscribe } = useSocket(selectedQueueId);

  useEffect(() => {
    const fetchQueues = async () => {
      try {
        const response = await queueApi.getAllQueues();
        setQueues(response.data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch queues');
      } finally {
        setIsInitialLoading(false);
      }
    };
    fetchQueues();
  }, [setQueues, setError]);

  useEffect(() => {
    if (!token || !selectedQueueId) return;

    const unsubUpdated = subscribe('queue_updated', () => {
      pollStatus(selectedQueueId);
    });

    const unsubTokenCalled = subscribe('token_called', (data: unknown) => {
      const payload = data as { token?: { id: string } };
      if (payload.token?.id === token.id) {
        pollStatus(selectedQueueId);
      }
    });

    return () => {
      unsubUpdated?.();
      unsubTokenCalled?.();
    };
  }, [subscribe, token, selectedQueueId]);

  const pollStatus = async (queueId: string) => {
    if (!token) return;
    setIsPolling(true);
    try {
      const response = await queueApi.getStatus(queueId, token.id);
      setStatus(response.data);
    } catch (err) {
      console.error('Failed to poll status:', err);
    } finally {
      setIsPolling(false);
    }
  };

  useEffect(() => {
    if (!token || !selectedQueueId) return;
    const interval = setInterval(() => pollStatus(selectedQueueId), 5000);
    return () => clearInterval(interval);
  }, [token, selectedQueueId]);

  const handleSelectQueue = (queueId: string) => {
    setSelectedQueueId(queueId);
    setIsJoining(true);
  };

  const handleBackToQueues = () => {
    setSelectedQueueId(null);
    setIsJoining(false);
  };

  const handleJoin = () => {
    setIsJoining(false);
  };

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

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-200 text-red-800 rounded-xl">
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          {isInitialLoading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <LoadingSkeleton />
            </motion.div>
          ) : !selectedQueueId ? (
            <motion.div
              key="selector"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <QueueSelector
                queues={queues}
                onSelect={handleSelectQueue}
                isLoading={isInitialLoading}
              />
            </motion.div>
          ) : isJoining ? (
            <motion.div
              key="join"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <JoinForm queueId={selectedQueueId} onBack={handleBackToQueues} onJoin={handleJoin} />
            </motion.div>
          ) : token ? (
            <motion.div
              key="token"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <TokenDisplay token={token} status={status} />
              <button
                onClick={handleBackToQueues}
                className="mt-6 w-full py-3 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50"
              >
                Back to queues
              </button>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;