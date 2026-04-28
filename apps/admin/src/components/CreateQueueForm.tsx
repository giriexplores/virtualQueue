import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, X } from 'lucide-react';

interface CreateQueueFormProps {
  onCreate: (name: string, avgServiceTime: number) => Promise<void>;
  isLoading: boolean;
  onClose?: () => void;
  showModal?: boolean;
}

export function CreateQueueForm({ onCreate, isLoading, onClose, showModal }: CreateQueueFormProps) {
  const [name, setName] = useState('');
  const [avgServiceTime, setAvgServiceTime] = useState(5);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await onCreate(name, avgServiceTime);
    setName('');
    setAvgServiceTime(5);
  };

  const content = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Queue Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter queue name..."
          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
          disabled={isLoading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Average Service Time (minutes)</label>
        <input
          type="number"
          value={avgServiceTime}
          onChange={(e) => setAvgServiceTime(Number(e.target.value))}
          min={1}
          max={60}
          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
          disabled={isLoading}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <motion.button
          type="submit"
          disabled={isLoading || !name.trim()}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Plus className="w-5 h-5" />
              Create Queue
            </>
          )}
        </motion.button>
        {showModal && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-3 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </form>
  );

  if (showModal) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={(e) => e.target === e.currentTarget && onClose?.()}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md"
        >
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Create New Queue</h3>
          {content}
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6"
    >
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Create New Queue</h3>
      {content}
    </motion.div>
  );
}