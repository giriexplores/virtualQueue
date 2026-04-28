import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, RefreshCw, Loader2, Plus } from 'lucide-react';
import { QueueCard } from './components/QueueCard';
import { QueueDetail } from './components/QueueDetail';
import { CreateQueueForm } from './components/CreateQueueForm';
import { useAdminStore } from './store/adminStore';
import { adminApi } from './store/api';

function App() {
  const {
    queues,
    selectedQueueId,
    queueStatuses,
    currentTokens,
    isLoading,
    error,
    setQueues,
    setSelectedQueueId,
    setQueueStatus,
    setCurrentToken,
    setIsLoading,
    setError,
  } = useAdminStore();

  const [isCreating, setIsCreating] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchQueues = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await adminApi.getAllQueues();
      setQueues(response.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch queues');
    } finally {
      setIsLoading(false);
    }
  }, [setQueues, setIsLoading, setError]);

  const fetchAllStatuses = useCallback(async () => {
    if (queues.length === 0) return;
    for (const queue of queues) {
      try {
        const response = await adminApi.getStatus(queue.id);
        setQueueStatus(queue.id, response.data);
      } catch (err) {
        console.error(`Failed to fetch status for queue ${queue.id}:`, err);
      }
    }
  }, [queues, setQueueStatus]);

  useEffect(() => {
    fetchQueues();
  }, [fetchQueues]);

  useEffect(() => {
    if (queues.length > 0) {
      fetchAllStatuses();
    }
  }, [queues, fetchAllStatuses]);

  const handleCreate = async (name: string, avgServiceTime: number) => {
    setIsCreating(true);
    try {
      await adminApi.createQueue({ name, avgServiceTime });
      await fetchQueues();
      setShowCreateModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create queue');
    } finally {
      setIsCreating(false);
    }
  };

  const handleNext = async (queueId: string) => {
    try {
      const response = await adminApi.nextToken(queueId);
      setCurrentToken(queueId, response.data);
      const statusResponse = await adminApi.getStatus(queueId);
      setQueueStatus(queueId, statusResponse.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get next token');
    }
  };

  const handlePause = async (queueId: string) => {
    try {
      await adminApi.pauseQueue(queueId);
      const response = await adminApi.getStatus(queueId);
      setQueueStatus(queueId, response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to pause queue');
    }
  };

  const handleResume = async (queueId: string) => {
    try {
      await adminApi.resumeQueue(queueId);
      const response = await adminApi.getStatus(queueId);
      setQueueStatus(queueId, response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resume queue');
    }
  };

  const handleQueueClick = (queueId: string) => {
    setSelectedQueueId(queueId);
  };

  const selectedQueue = queues.find((q) => q.id === selectedQueueId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="w-6 h-6 text-slate-900" />
            <h1 className="text-xl font-bold text-slate-900">Queue Admin</h1>
          </div>
          <div className="flex items-center gap-3">
            {isLoading && <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />}
            <motion.button
              onClick={fetchQueues}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 hover:bg-slate-100 rounded-lg"
              disabled={isLoading}
            >
              <RefreshCw className="w-5 h-5 text-slate-600" />
            </motion.button>
          </div>
        </div>
      </header>

      {error && (
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="bg-red-100 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            {error}
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {selectedQueueId && selectedQueue ? (
            <QueueDetail
              key="detail"
              queueId={selectedQueue.id}
              queueName={selectedQueue.name}
              avgServiceTime={selectedQueue.avgServiceTime}
              onBack={() => setSelectedQueueId(null)}
            />
          ) : (
            <motion.div key="list">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-slate-900">All Queues</h2>
                <motion.button
                  onClick={() => setShowCreateModal(true)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl font-medium flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  New Queue
                </motion.button>
              </div>

              {queues.length === 0 && !isLoading ? (
                <div className="text-center py-12 text-slate-400">
                  <p>No queues yet. Create one to get started.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <AnimatePresence mode="popLayout">
                    {queues.map((queue) => (
                      <motion.div
                        key={queue.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        layout
                        onClick={() => handleQueueClick(queue.id)}
                        className="cursor-pointer"
                      >
                        <QueueCard
                          queueId={queue.id}
                          name={queue.name}
                          status={queueStatuses[queue.id] || null}
                          currentToken={currentTokens[queue.id] || null}
                          onNext={(e) => {
                            e.stopPropagation();
                            handleNext(queue.id);
                          }}
                          onPause={(e) => {
                            e.stopPropagation();
                            handlePause(queue.id);
                          }}
                          onResume={(e) => {
                            e.stopPropagation();
                            handleResume(queue.id);
                          }}
                          isLoading={isLoading}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {showCreateModal && (
          <CreateQueueForm
            onCreate={handleCreate}
            isLoading={isCreating}
            showModal
            onClose={() => setShowCreateModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;