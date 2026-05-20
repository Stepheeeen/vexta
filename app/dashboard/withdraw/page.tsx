'use client';

import { DashboardLayout } from '@/components/dashboard-layout';
import { ArrowUpRight, ArrowDownRight, Wallet, Calendar, AlertCircle, Loader2, ArrowLeftRight, CheckCircle2, Play, HelpCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/components/translation-provider';
import { useToast } from '@/hooks/use-toast';

interface StatsData {
  stats: {
    totalInvested: number;
    totalEarned: number;
    totalCommissions: number;
    availableBalance: number;
    activeInvestments: number;
    directReferrals: number;
  };
}

interface WithdrawalItem {
  id: string;
  amount: number;
  status: string;
  walletAddress: string;
  network: string;
  createdAt: string;
}

const inputClass =
  'w-full bg-white/3 dark:bg-white/3 border border-slate-200 dark:border-white/8 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-white placeholder-gray-600 focus:outline-none focus:border-violet-500/50 focus:bg-white/5 transition-all font-mono';

const sectionClass =
  'bg-white dark:bg-[#0A0F14]/60 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-2xl p-6 mb-5';

export default function WithdrawPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [withdrawals, setWithdrawals] = useState<WithdrawalItem[]>([]);

  // Form states
  const [amount, setAmount] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [network, setNetwork] = useState('TRC20');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const [simulating, setSimulating] = useState(false);

  const fetchWithdrawalData = async () => {
    try {
      setPageError(null);
      const [statsRes, withdrawRes] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/withdrawals'),
      ]);

      if (statsRes.status === 401 || withdrawRes.status === 401) {
        window.location.href = '/login';
        return;
      }

      if (!statsRes.ok || !withdrawRes.ok) throw new Error('Failed to fetch financial data');

      const sJson = await statsRes.json();
      const wJson = await withdrawRes.json();

      setBalance(sJson.stats.availableBalance ?? 0);
      setWithdrawals(wJson.withdrawals || []);
    } catch (err: any) {
      console.error(err);
      setPageError(err.message || 'An error occurred while loading withdrawal panel');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawalData();
  }, []);

  const handleSimulate = async () => {
    setSimulating(true);
    try {
      const res = await fetch('/api/dashboard/simulate-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'deposit' }),
      });
      const json = await res.json();
      if (res.ok) {
        toast({
          title: 'Simulation Successful',
          description: json.message || 'Demo deposit of $5,000 completed successfully!',
        });
        await fetchWithdrawalData();
      } else {
        toast({
          title: 'Simulation Failed',
          description: json.error || 'Failed to simulate demo deposit',
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        title: 'Network Error',
        description: 'Error communicating with demo simulation server',
        variant: 'destructive',
      });
    } finally {
      setSimulating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess(null);
    setError(null);

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount < 10) {
      setError('Minimum withdrawal amount is $10.00');
      toast({
        title: 'Validation Error',
        description: 'Minimum withdrawal amount is $10.00',
        variant: 'destructive',
      });
      setSubmitting(false);
      return;
    }

    if (numericAmount > balance) {
      setError(`Insufficient balance. Maximum available: $${balance.toLocaleString()}`);
      toast({
        title: 'Withdrawal Failed',
        description: `Insufficient balance. Maximum available: $${balance.toLocaleString()}`,
        variant: 'destructive',
      });
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: numericAmount,
          walletAddress,
          network,
        }),
      });

      if (res.status === 401) {
        window.location.href = '/login';
        return;
      }

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to request withdrawal');

      setSuccess(`Your withdrawal of $${numericAmount.toLocaleString()} (${network}) was requested successfully!`);
      toast({
        title: 'Withdrawal Requested',
        description: `Your withdrawal of $${numericAmount.toLocaleString()} (${network}) was requested successfully!`,
      });
      setAmount('');
      setWalletAddress('');
      await fetchWithdrawalData();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to process withdrawal request');
      toast({
        title: 'Withdrawal Failed',
        description: err.message || 'Failed to process withdrawal request',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const statusColor: Record<string, string> = {
    pending:  'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    approved: 'bg-emerald-500/10 text-emerald-600 dark:text-[#00FF88]',
    rejected: 'bg-red-500/10 text-red-600 dark:text-red-400',
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <p className="text-[10px] font-mono text-violet-600 dark:text-violet-400 uppercase tracking-[0.2em] mb-1">{t('withdraw')}</p>
        <h1 className="text-2xl font-bold text-slate-950 dark:text-white tracking-tight">{t('withdraw')}</h1>
      </div>

      {loading ? (
        <div className="min-h-[300px] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-violet-600 dark:text-violet-400" />
        </div>
      ) : pageError ? (
        <div className="p-6 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl font-mono text-sm max-w-xl mx-auto my-12 text-center">
          <p className="mb-4">{pageError}</p>
          <button onClick={fetchWithdrawalData} className="px-4 py-2 bg-red-500 text-white rounded-xl font-sans font-medium hover:bg-red-600 transition-colors">
            {t('withdrawRetry')}
          </button>
        </div>
      ) : (
        <>
          {/* Step-by-Step Guideline Banner */}
          <div className="bg-gradient-to-br from-violet-600/10 via-blue-600/5 to-transparent border border-violet-500/10 rounded-2xl p-6 mb-6 shadow-sm">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-violet-500 dark:text-violet-400" />
                  <h3 className="text-sm font-semibold text-slate-950 dark:text-white">{t('withdrawGuideTitle')}</h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-gray-400 max-w-2xl leading-relaxed">
                  {t('withdrawGuideDesc')}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-200/50 dark:border-white/5 text-[11px] font-mono">
                  <div className="p-2.5 bg-slate-50 dark:bg-white/2 rounded-xl">
                    <span className="text-violet-500 font-bold block mb-0.5">{t('withdrawGuideStep1Title')}</span>
                    <span className="text-slate-400">{t('withdrawGuideStep1Sub')}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 dark:bg-white/2 rounded-xl">
                    <span className="text-violet-500 font-bold block mb-0.5">{t('withdrawGuideStep2Title')}</span>
                    <span className="text-slate-400">{t('withdrawGuideStep2Sub')}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 dark:bg-white/2 rounded-xl">
                    <span className="text-violet-500 font-bold block mb-0.5">{t('withdrawGuideStep3Title')}</span>
                    <span className="text-slate-400">{t('withdrawGuideStep3Sub')}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 dark:bg-white/2 rounded-xl">
                    <span className="text-violet-500 font-bold block mb-0.5">{t('withdrawGuideStep4Title')}</span>
                    <span className="text-slate-400">{t('withdrawGuideStep4Sub')}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleSimulate}
                disabled={simulating}
                className="flex-shrink-0 flex items-center gap-1.5 px-5 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold shadow-md shadow-violet-600/15 transition-all hover:-translate-y-0.5 duration-200 disabled:opacity-50"
              >
                {simulating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{t('withdrawProcessingBtn')}</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{t('withdrawSimulateBtn')}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 items-start">
          {/* Form and info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Info Card */}
            <div className="bg-gradient-to-br from-violet-600/15 via-blue-600/5 to-transparent border border-violet-500/20 rounded-2xl p-6 relative overflow-hidden group shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-mono text-slate-400 dark:text-gray-400 uppercase tracking-widest mb-1">{t('withdrawAvailFunds')}</p>
                  <p className="text-3xl font-bold text-slate-950 dark:text-white font-mono tracking-tight">
                    ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <Wallet className="w-6 h-6 text-violet-600 dark:text-violet-400 flex-shrink-0" />
              </div>
            </div>

            {/* Withdrawal Form */}
            <form onSubmit={handleSubmit} className={sectionClass}>
              <div className="flex items-center gap-3 mb-6">
                <ArrowLeftRight className="w-5 h-5 text-violet-500 dark:text-violet-400 flex-shrink-0" />
                <h2 className="text-sm font-semibold text-slate-950 dark:text-white">{t('withdrawRequestTitle')}</h2>
              </div>

              {success && (
                <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-mono flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 rounded-xl text-xs font-mono flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-[10px] font-mono text-slate-500 dark:text-gray-500 uppercase tracking-wider mb-2">{t('withdrawNetworkLabel')}</label>
                  <select
                    value={network}
                    onChange={(e) => setNetwork(e.target.value)}
                    className="w-full bg-white/3 dark:bg-white/3 border border-slate-200 dark:border-white/8 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-violet-500/50 focus:bg-white/5 transition-all"
                  >
                    <option value="TRC20">USDT (TRC20) — TRON Network</option>
                    <option value="BEP20">USDT (BEP20) — BNB Smart Chain</option>
                    <option value="ERC20">USDT (ERC20) — Ethereum Network</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-500 dark:text-gray-500 uppercase tracking-wider mb-2">{t('withdrawAmountLabel')}</label>
                  <input
                    type="number"
                    step="any"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className={inputClass}
                    required
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-500 dark:text-gray-500 uppercase tracking-wider mb-2">{t('withdrawWalletLabel')}</label>
                  <input
                    type="text"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    placeholder={t('withdrawAddressPlaceholder')}
                    className={inputClass}
                    required
                    disabled={submitting}
                  />
                  <span className="block text-[9px] text-slate-400 dark:text-gray-500 font-mono mt-1.5 leading-relaxed">
                    {t('withdrawWalletHint')}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-md shadow-violet-600/15"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t('withdrawProcessing')}</span>
                  </>
                ) : (
                  <span>{t('withdrawSubmitBtn')}</span>
                )}
              </button>
            </form>
          </div>

          {/* Right sidebar: Recent history */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-[#0A0F14]/60 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">{t('withdrawHistory')}</h3>
              
              <div className="space-y-3.5">
                {withdrawals.length > 0 ? (
                  withdrawals.map((item) => (
                    <div key={item.id} className="p-3 bg-slate-50 dark:bg-white/2 border border-slate-100 dark:border-white/5 rounded-xl flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-slate-400 dark:text-gray-500 font-mono">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                        <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full ${statusColor[item.status] || 'bg-slate-200 text-slate-600'}`}>
                          {item.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <span className="text-xs text-slate-700 dark:text-gray-300 font-medium">
                          {item.network} {t('withdrawNetworkAddress')}
                        </span>
                        <span className="text-sm font-bold font-mono text-slate-900 dark:text-white">
                          -${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <span className="text-[9px] text-slate-400 dark:text-gray-500 font-mono truncate">
                        {item.walletAddress}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center text-xs text-slate-400 dark:text-gray-500 font-mono">
                    {t('withdrawNoPast')}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </>
    )}
    </DashboardLayout>
  );
}
