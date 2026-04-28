import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Phone, ArrowRight, ChevronLeft } from 'lucide-react';
import { useQueueStore } from '../store/queueStore';
import { queueApi } from '../store/api';

interface JoinFormProps {
  queueId: string;
  onBack: () => void;
  onJoin: (tokenId: string) => void;
}

export function JoinForm({ queueId, onBack, onJoin }: JoinFormProps) {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setToken, setError } = useQueueStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await queueApi.join(queueId, {
        name,
        contact: contact || undefined,
      });
      setToken(response.data);
      onJoin(response.data.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join queue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto"
    >
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 mb-6 hover:text-slate-700"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to queues
      </button>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full pl-12 pr-4 py-4 text-lg border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
            disabled={isLoading}
          />
        </div>

        <div className="relative">
          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="tel"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="Contact number (optional)"
            className="w-full pl-12 pr-4 py-4 text-lg border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
            disabled={isLoading}
          />
        </div>

        <motion.button
          type="submit"
          disabled={isLoading || !name.trim()}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 bg-slate-900 text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              Join Queue
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
}