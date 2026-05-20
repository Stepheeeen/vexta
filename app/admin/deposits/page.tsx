'use client';

import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin-layout';
import { Search, Loader2, CheckCircle2, XCircle, ExternalLink, RefreshCw, Copy, Check } from 'lucide-react';

interface DepositRequest {
  id: string;
  userId: string;
  user: string;
  email: string;
  amount: number;
  network: string;
  txHash: string;
  date: string;
  status: string;
  description: string;
}

export default function AdminDeposits() {
  const [deposits, setDeposits] = useState<DepositRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchDeposits = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/admin/deposits?status=${statusFilter}`);
      if (!res.ok) throw new Error('Failed to fetch deposits');
      const data = await res.json();
      setDeposits(data.deposits || []);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeposits();
  }, [statusFilter]);

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    setActionLoadingId(id);
    try {
      const res = await fetch('/api/admin/deposits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to process request');
      }

      // Reload list
      await fetchDeposits();
    } catch (err: any) {
      alert(err.message || 'An error occurred');
    } finally {
      setActionLoadingId(null);
    }
  };

  const copyTxHash = (id: string, hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredDeposits = deposits.filter((dep) => {
    const matchesSearch =
      dep.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dep.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dep.txHash.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dep.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Deposit Approvals</h1>
          <p className="text-slate-500 dark:text-gray-400">Review and approve manual blockchain deposits</p>
        </div>
        <button
          onClick={fetchDeposits}
          className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 rounded-xl transition-colors text-slate-700 dark:text-slate-200"
          title="Refresh list"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-[#0A0F14]/60 border border-slate-200 dark:border-white/5 rounded-2xl p-6 mb-8 shadow-sm space-y-4">
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-white/2 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by ID, user, email or transaction hash..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none text-sm"
          />
        </div>

        <div className="flex gap-2">
          {['pending', 'completed', 'failed', 'all'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all border ${
                statusFilter === status
                  ? 'bg-violet-600 border-violet-600 text-white shadow-sm'
                  : 'bg-slate-50 dark:bg-white/2 border-slate-200 dark:border-white/5 text-slate-600 dark:text-gray-300 hover:border-slate-300 dark:hover:border-white/10'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Requests list */}
      <div className="bg-white dark:bg-[#0A0F14]/60 border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-violet-600 dark:text-violet-400" />
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-500 font-mono text-sm">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/2">
                  <th className="px-6 py-4 text-left text-slate-500 dark:text-gray-400 font-semibold text-sm">User Details</th>
                  <th className="px-6 py-4 text-left text-slate-500 dark:text-gray-400 font-semibold text-sm">Network</th>
                  <th className="px-6 py-4 text-left text-slate-500 dark:text-gray-400 font-semibold text-sm">TX Hash / Reference</th>
                  <th className="px-6 py-4 text-right text-slate-500 dark:text-gray-400 font-semibold text-sm">Amount</th>
                  <th className="px-6 py-4 text-center text-slate-500 dark:text-gray-400 font-semibold text-sm">Submitted Date</th>
                  <th className="px-6 py-4 text-center text-slate-500 dark:text-gray-400 font-semibold text-sm">Status</th>
                  {statusFilter === 'pending' && (
                    <th className="px-6 py-4 text-center text-slate-500 dark:text-gray-400 font-semibold text-sm">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredDeposits.map((dep) => (
                  <tr key={dep.id} className="border-b border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/1 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-slate-900 dark:text-white font-medium text-sm">{dep.user}</p>
                      <p className="text-xs text-slate-500 dark:text-gray-400">{dep.email}</p>
                      <p className="text-[10px] text-slate-400 font-mono">ID: {dep.id.slice(-8)}</p>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-700 dark:text-gray-300">
                      {dep.network}
                    </td>
                    <td className="px-6 py-4 max-w-[200px]">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-slate-500 dark:text-gray-400 truncate" title={dep.txHash}>
                          {dep.txHash}
                        </span>
                        <button
                          onClick={() => copyTxHash(dep.id, dep.txHash)}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors shrink-0"
                          title="Copy hash"
                        >
                          {copiedId === dep.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <a
                          href={`https://tronscan.org/#/transaction/${dep.txHash}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-violet-500 hover:text-violet-600 transition-colors shrink-0"
                          title="Check on TronScan"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-sm text-slate-900 dark:text-white">
                      ${dep.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-center text-slate-500 dark:text-gray-400 text-sm">
                      {dep.date}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        dep.status === 'completed'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                          : dep.status === 'failed'
                          ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                      }`}>
                        {dep.status}
                      </span>
                    </td>
                    {statusFilter === 'pending' && (
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            disabled={actionLoadingId !== null}
                            onClick={() => handleAction(dep.id, 'approve')}
                            className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-600 dark:text-emerald-400 hover:text-white border border-emerald-500/20 rounded-lg transition-all"
                            title="Approve Deposit"
                          >
                            {actionLoadingId === dep.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            disabled={actionLoadingId !== null}
                            onClick={() => handleAction(dep.id, 'reject')}
                            className="p-1.5 bg-red-500/10 hover:bg-red-500 text-red-600 dark:text-red-400 hover:text-white border border-red-500/20 rounded-lg transition-all"
                            title="Reject Deposit"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
                {filteredDeposits.length === 0 && (
                  <tr>
                    <td colSpan={statusFilter === 'pending' ? 7 : 6} className="px-6 py-12 text-center text-slate-400 dark:text-gray-500 text-sm">
                      No matching deposit requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
