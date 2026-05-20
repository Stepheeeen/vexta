'use client';

import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin-layout';
import { Search, Loader2 } from 'lucide-react';
import { useTranslation } from '@/components/translation-provider';

interface Transaction {
  id: string;
  user: string;
  email: string;
  type: string;
  amount: string;
  status: string;
  date: string;
  description: string;
}

export default function AdminTransactions() {
  const { t } = useTranslation();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/transactions');
      if (!res.ok) throw new Error('Failed to fetch transactions');
      const data = await res.json();
      setTransactions(data.transactions || []);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const getTypeLabel = (type: string) => {
    const tp = type.toLowerCase();
    if (tp === 'deposit') return t('adminTxTypeDeposit') || 'Deposit';
    if (tp === 'withdrawal') return t('adminTxTypeWithdrawal') || 'Withdrawal';
    if (tp === 'roi') return t('adminTxTypeRoi') || 'ROI';
    if (tp === 'commission') return t('adminTxTypeCommission') || 'Commission';
    return type;
  };

  const getStatusLabel = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'completed' || s === 'approved' || s === 'success') return t('adminStatusCompleted') || 'Completed';
    if (s === 'pending') return t('adminStatusPending') || 'Pending';
    if (s === 'failed' || s === 'rejected') return t('adminStatusFailed') || 'Failed';
    return status;
  };

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch = 
      tx.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'All Types' || tx.type === typeFilter;
    const matchesStatus = statusFilter === 'All Status' || tx.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{t('adminTransactionsTitle') || 'Transaction Management'}</h1>
        <p className="text-slate-500 dark:text-gray-400">{t('adminTransactionsSub') || 'View and manage all platform transactions'}</p>
      </div>

      {/* Search and Filter */}
      <div className="bg-white dark:bg-[#0A0F14]/60 border border-slate-200 dark:border-white/5 rounded-2xl p-6 mb-8 shadow-sm">
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-white/2 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 mb-4">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder={t('adminTransactionsSearchPlaceholder') || 'Search by ID, user, email or details...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none text-sm"
          />
        </div>

        <div className="flex gap-4">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 bg-slate-50 dark:bg-white/2 border border-slate-200 dark:border-white/5 rounded-xl text-slate-700 dark:text-gray-300 focus:outline-none focus:border-violet-500 text-sm"
          >
            <option value="All Types">{t('adminTransactionsAllTypes') || 'All Types'}</option>
            <option value="Deposit">{t('adminTxTypeDeposit') || 'Deposit'}</option>
            <option value="Withdrawal">{t('adminTxTypeWithdrawal') || 'Withdrawal'}</option>
            <option value="Roi">{t('adminTxTypeRoi') || 'ROI'}</option>
            <option value="Commission">{t('adminTxTypeCommission') || 'Commission'}</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-slate-50 dark:bg-white/2 border border-slate-200 dark:border-white/5 rounded-xl text-slate-700 dark:text-gray-300 focus:outline-none focus:border-violet-500 text-sm"
          >
            <option value="All Status">{t('adminTransactionsAllStatus') || 'All Status'}</option>
            <option value="Completed">{t('adminStatusCompleted') || 'Completed'}</option>
            <option value="Pending">{t('adminStatusPending') || 'Pending'}</option>
            <option value="Failed">{t('adminStatusFailed') || 'Failed'}</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
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
                  <th className="px-6 py-4 text-left text-slate-500 dark:text-gray-400 font-semibold text-sm">{t('adminColId') || 'TXN ID'}</th>
                  <th className="px-6 py-4 text-left text-slate-500 dark:text-gray-400 font-semibold text-sm">{t('adminColDetails') || 'User'}</th>
                  <th className="px-6 py-4 text-left text-slate-500 dark:text-gray-400 font-semibold text-sm">{t('adminColType') || 'Type'}</th>
                  <th className="px-6 py-4 text-right text-slate-500 dark:text-gray-400 font-semibold text-sm">{t('adminColAmount') || 'Amount'}</th>
                  <th className="px-6 py-4 text-left text-slate-500 dark:text-gray-400 font-semibold text-sm">{t('adminColDetails') || 'Details'}</th>
                  <th className="px-6 py-4 text-center text-slate-500 dark:text-gray-400 font-semibold text-sm">{t('adminColStatus') || 'Status'}</th>
                  <th className="px-6 py-4 text-center text-slate-500 dark:text-gray-400 font-semibold text-sm">{t('adminColDate') || 'Date'}</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/1 transition-colors">
                    <td className="px-6 py-4 text-violet-600 dark:text-violet-400 font-mono text-sm">{tx.id.slice(-6)}</td>
                    <td className="px-6 py-4">
                      <p className="text-slate-900 dark:text-white font-medium text-sm">{tx.user}</p>
                      <p className="text-xs text-slate-500 dark:text-gray-400">{tx.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
                        {getTypeLabel(tx.type)}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-right font-bold text-sm ${
                      tx.amount.startsWith('+') ? 'text-emerald-600 dark:text-emerald-400' : tx.amount.startsWith('-') ? 'text-red-500' : 'text-slate-900 dark:text-white'
                    }`}>
                      {tx.amount}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 dark:text-gray-400 max-w-[200px] truncate" title={tx.description}>
                      {tx.description}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        tx.status === 'Completed'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                      }`}>
                        {getStatusLabel(tx.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-slate-500 dark:text-gray-400 text-sm">{tx.date}</td>
                  </tr>
                ))}
                {filteredTransactions.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-slate-400 dark:text-gray-500 text-sm">
                      {t('adminTransactionsNoMatch') || 'No matching transactions found.'}
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
