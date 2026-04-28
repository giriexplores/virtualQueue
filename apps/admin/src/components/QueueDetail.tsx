import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Users, Clock, Loader2 } from 'lucide-react';
import { adminApi } from '../store/api';
import type { Token } from '../store/api';

interface QueueDetailProps {
  queueId: string;
  queueName: string;
  avgServiceTime: number;
  onBack: () => void;
}

interface PaginatedTokens {
  data: Token[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const PAGE_SIZE = 10;

export function QueueDetail({ queueId, queueName, avgServiceTime, onBack }: QueueDetailProps) {
  const [tokens, setTokens] = useState<PaginatedTokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalInQueue, setTotalInQueue] = useState(0);

  const fetchTokens = async (page: number) => {
    setIsLoading(true);
    try {
      const response = await adminApi.getTokens(queueId);
      const allTokens = response.data;
      setTotalInQueue(allTokens.length);

      const start = (page - 1) * PAGE_SIZE;
      const end = start + PAGE_SIZE;
      const paginatedData = allTokens.slice(start, end);

      setTokens({
        data: paginatedData,
        total: allTokens.length,
        page,
        pageSize: PAGE_SIZE,
        totalPages: Math.ceil(allTokens.length / PAGE_SIZE) || 1,
      });
    } catch (err) {
      console.error('Failed to fetch tokens:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTokens(currentPage);
  }, [currentPage, queueId]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const totalPages = tokens?.totalPages || 1;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 mb-6 hover:text-slate-700 transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
        Back to queues
      </button>

      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">{queueName}</h2>
            <p className="text-slate-400 text-sm font-mono">{queueId.slice(0, 12)}...</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2">
                <Users className="w-5 h-5 text-slate-400" />
                <span className="text-2xl font-bold">{totalInQueue}</span>
              </div>
              <p className="text-slate-400 text-xs mt-1">in queue</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2">
                <Clock className="w-5 h-5 text-slate-400" />
                <span className="text-2xl font-bold">{Math.ceil(totalInQueue * avgServiceTime)}</span>
              </div>
              <p className="text-slate-400 text-xs mt-1">min wait</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
            </div>
          ) : tokens?.data.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No one in the queue yet</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {tokens?.data.map((token, index) => (
                  <motion.div
                    key={token.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-xl"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 font-semibold">
                        {(currentPage - 1) * PAGE_SIZE + index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{token.name}</p>
                        <p className="text-sm text-slate-500 font-mono">{token.id.slice(0, 8)}...</p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        token.status === 'waiting'
                          ? 'bg-blue-100 text-blue-800'
                          : token.status === 'called'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {token.status}
                    </span>
                  </motion.div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 border border-slate-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 text-slate-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 border border-slate-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}