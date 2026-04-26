import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, RefreshCw } from 'lucide-react';
import { QueueCard } from './components/QueueCard';
import { CreateQueueForm } from './components/CreateQueueForm';
import { useAdminStore } from './store/adminStore';
import { adminApi } from './store/api';

const DEMO_QUEUE_ID = import.meta.env.VITE_QUEUE_ID || 'demo-queue';

function App() {
  const {
    selectedQueue,
    currentToken,
    queueStatus,
    setCurrentToken,
    setQueueStatus,
    setIsLoading,
    setError,
  } = useAdminStore();

  const [isCreating, setIsCreating] = useState(false);
  const [queueName, setQueueName] = useState('');

  const fetchStatus = async () => {
    if (!selectedQueue) return;
    setIsLoading(true);
    try {
      const response = await adminApi.getStatus(selectedQueue);
      setQueueStatus(response.data);
    } catch (err) {
      console.error('Failed to fetch status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedQueue) {
      setQueueName(DEMO_QUEUE_ID);
      return;
    }
    setQueueName(selectedQueue);
    fetchStatus();
  }, [selectedQueue]);

  const handleCreate = async (name: string) => {
    setIsCreating(true);
    try {
      await adminApi.createQueue({ name });
      setQueueName(name);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create queue');
    } finally {
      setIsCreating(false);
    }
  };

  const handleNext = async () => {
    if (!selectedQueue) return;
    try {
      const response = await adminApi.nextToken(selectedQueue);
      setCurrentToken(response.data);
      fetchStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get next token');
    }
  };

  const handlePause = async () => {
    if (!selectedQueue) return;
    try {
      await adminApi.pauseQueue(selectedQueue);
      fetchStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to pause queue');
    }
  };

  const handleResume = async () => {
    if (!selectedQueue) return;
    try {
      await adminApi.resumeQueue(selectedQueue);
      fetchStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resume queue');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="w-6 h-6 text-slate-900" />
            <h1 className="text-xl font-bold text-slate-900">Queue Admin</h1>
          </div>
          <motion.button
            onClick={fetchStatus}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 hover:bg-slate-100 rounded-lg"
          >
            <RefreshCw className="w-5 h-5 text-slate-600" />
          </motion.button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key="create"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-8"
          >
            <CreateQueueForm onCreate={handleCreate} isLoading={isCreating} />
          </motion.div>
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={queueName}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <QueueCard
                name={queueName || 'Queue'}
                status={queueStatus}
                currentToken={currentToken}
                onNext={handleNext}
                onPause={handlePause}
                onResume={handleResume}
                isLoading={false}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

export default App;