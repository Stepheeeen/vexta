'use client';

import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin-layout';
import { CheckCircle2, Clock, AlertCircle, Loader2, Copy, Check } from 'lucide-react';
import { useTranslation } from '@/components/translation-provider';
import { useToast } from '@/hooks/use-toast';

interface Withdrawal {
  id: string;
  user: string;
  email: string;
  amount: string;
  method: string;
  account: string;
  walletAddress: string;
  date: string;
  status: string;
}

interface Metrics {
  pending: number;
  todayProcessed: number;
}

export default function AdminWithdrawals() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [metrics, setMetrics] = useState<Metrics>({ pending: 0, todayProcessed: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (address: string, id: string) => {
    navigator.clipboard.writeText(address);
    setCopiedId(id);
    toast({
      title: t('depCopiedBtn') || 'Copied!',
      description: 'Address copied to clipboard.',
    });
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/withdrawals');
      if (!res.ok) throw new Error('Failed to fetch withdrawals');
      const data = await res.json();
      setWithdrawals(data.withdrawals || []);
      setMetrics(data.metrics || { pending: 0, todayProcessed: 0 });
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    const actionWord = action === 'approve' ? (t('adminActionApprove') || 'approve') : (t('adminActionReject') || 'reject');
    const confirmMsg = (t('adminWithdrawalsConfirmAction') || 'Are you sure you want to {action} this withdrawal request?').replace('{action}', actionWord);
    if (!confirm(confirmMsg)) return;
    try {
      const res = await fetch('/api/admin/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action }),
      });
      if (!res.ok) throw new Error('Action failed');
      toast({
        title: t('adminAlertSuccess'),
        description: t('adminActionSuccess'),
      });
      fetchWithdrawals();
    } catch (err: any) {
      toast({
        title: t('adminAlertError'),
        description: err.message || `Failed to ${action} withdrawal`,
        variant: 'destructive',
      });
    }
  };

  const getStatusLabel = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'pending') return t('adminStatusPending') || 'Pending';
    if (s === 'completed' || s === 'approved' || s === 'success') return t('adminStatusCompleted') || 'Completed';
    if (s === 'rejected' || s === 'failed') return t('adminStatusRejected') || 'Rejected';
    return status;
  };

  const statusConfig = {
    Completed: { icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    Pending: { icon: Clock, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    Rejected: { icon: AlertCircle, color: 'text-slate-400 dark:text-slate-500', bg: 'bg-slate-100 dark:bg-white/5', border: 'border-slate-200 dark:border-white/5' }
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{t('adminWithdrawalsTitle') || 'Withdrawal Management'}</h1>
        <p className="text-slate-500 dark:text-gray-400">{t('adminWithdrawalsSub') || 'Process and manage user withdrawal requests'}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-[#0A0F14]/60 border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 dark:text-gray-400 text-sm font-medium mb-1">{t('adminWithdrawalsAwaitingReview') || 'Awaiting Review'}</p>
              <p className="text-3xl font-bold text-red-500">
                ${metrics.pending.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
              <AlertCircle className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0A0F14]/60 border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 dark:text-gray-400 text-sm font-medium mb-1">{t('adminWithdrawalsTodayProcessed') || 'Today Processed'}</p>
              <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                ${metrics.todayProcessed.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Withdrawals Table */}
      <div className="bg-white dark:bg-[#0A0F14]/60 border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-200 dark:border-white/5">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('adminWithdrawalsTitle') || 'All Withdrawal Requests'}</h3>
        </div>

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
                  <th className="px-6 py-4 text-left text-slate-500 dark:text-gray-400 font-semibold text-sm">{t('adminColId') || 'ID'}</th>
                  <th className="px-6 py-4 text-left text-slate-500 dark:text-gray-400 font-semibold text-sm">{t('adminColDetails') || 'User'}</th>
                  <th className="px-6 py-4 text-right text-slate-500 dark:text-gray-400 font-semibold text-sm">{t('adminColAmount') || 'Amount'}</th>
                  <th className="px-6 py-4 text-center text-slate-500 dark:text-gray-400 font-semibold text-sm">{t('adminColMethod') || 'Method'}</th>
                  <th className="px-6 py-4 text-left text-slate-500 dark:text-gray-400 font-semibold text-sm">{t('adminColAccount') || 'Account'}</th>
                  <th className="px-6 py-4 text-center text-slate-500 dark:text-gray-400 font-semibold text-sm">{t('adminColDate') || 'Date'}</th>
                  <th className="px-6 py-4 text-center text-slate-500 dark:text-gray-400 font-semibold text-sm">{t('adminColStatus') || 'Status'}</th>
                  <th className="px-6 py-4 text-center text-slate-500 dark:text-gray-400 font-semibold text-sm">{t('adminColActions') || 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map((withdrawal) => {
                  const config = statusConfig[withdrawal.status as keyof typeof statusConfig] || statusConfig.Pending;
                  const StatusIcon = config.icon;
                  return (
                    <tr key={withdrawal.id} className="border-b border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/1 transition-colors">
                      <td className="px-6 py-4 text-violet-600 dark:text-violet-400 font-mono text-sm">{withdrawal.id.slice(-6)}</td>
                      <td className="px-6 py-4">
                        <p className="text-slate-900 dark:text-white font-medium text-sm">{withdrawal.user}</p>
                        <p className="text-xs text-slate-500 dark:text-gray-400">{withdrawal.email}</p>
                      </td>
                      <td className="px-6 py-4 text-right text-emerald-600 dark:text-emerald-400 font-bold">{withdrawal.amount}</td>
                      <td className="px-6 py-4 text-center text-slate-500 dark:text-gray-400 text-sm">{withdrawal.method}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 dark:text-gray-400 font-mono text-xs max-w-[180px] truncate" title={withdrawal.walletAddress}>
                            {withdrawal.account}
                          </span>
                          {withdrawal.walletAddress && (
                            <button
                              onClick={() => handleCopy(withdrawal.walletAddress, withdrawal.id)}
                              className="p-1 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-gray-400 rounded-md transition-colors"
                              title="Copy Wallet Address"
                            >
                              {copiedId === withdrawal.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-slate-500 dark:text-gray-400 text-sm">{withdrawal.date}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center justify-center gap-1 w-fit mx-auto ${config.bg} ${config.color} ${config.border}`}>
                          <StatusIcon className="w-3 h-3" />
                          {getStatusLabel(withdrawal.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {withdrawal.status === 'Pending' ? (
                          <div className="flex gap-3 justify-center">
                            <button
                              onClick={() => handleAction(withdrawal.id, 'approve')}
                              className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-semibold text-sm transition-colors"
                            >
                              {t('adminActionApprove') || 'Approve'}
                            </button>
                            <button
                              onClick={() => handleAction(withdrawal.id, 'reject')}
                              className="text-red-500 hover:text-red-600 font-semibold text-sm transition-colors"
                            >
                              {t('adminActionReject') || 'Reject'}
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 dark:text-gray-500 text-sm">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {withdrawals.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-slate-400 dark:text-gray-500 text-sm">
                      {t('adminWithdrawalsNoMatch') || 'No withdrawal requests found.'}
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
