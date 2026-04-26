import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

interface CreateQueueFormProps {
  onCreate: (name: string) => Promise<void>;
  isLoading: boolean;
}

export function CreateQueueForm({ onCreate, isLoading }: CreateQueueFormProps) {
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await onCreate(name);
    setName('');
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6"
    >
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Create New Queue</h3>

      <div className="flex gap-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Queue name..."
          className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
          disabled={isLoading}
        />

        <motion.button
          type="submit"
          disabled={isLoading || !name.trim()}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-6 py-3 bg-slate-900 text-white rounded-xl font-medium flex items-center gap-2 disabled:opacity-50"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Plus className="w-5 h-5" />
              Create
            </>
          )}
        </motion.button>
      </div>
    </motion.form>
  );
}