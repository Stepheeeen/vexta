'use client';

import { DashboardLayout } from '@/components/dashboard-layout';
import { ArrowUpRight, ArrowDownRight, Wallet, AlertCircle, Loader2, ArrowLeftRight, CheckCircle2, Play, HelpCircle, Send, Users } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/components/translation-provider';
import { useToast } from '@/hooks/use-toast';

// ── P2P Quick Transfer Panel ───────────────────────────────────────────────────
function P2PTransferPanel({ balance, onSuccess }: { balance: number; onSuccess: () => void }) {
  const { toast } = useToast();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount]       = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone]           = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amtNum = parseFloat(amount);
    if (!recipient.trim()) {
      toast({ title: 'Recipient required', variant: 'destructive' }); return;
    }
    if (isNaN(amtNum) || amtNum <= 0) {
      toast({ title: 'Invalid amount', variant: 'destructive' }); return;
    }
    if (amtNum > balance) {
      toast({ title: 'Insufficient balance', description: `Available: $${balance.toFixed(2)}`, variant: 'destructive' }); return;
    }

    setSubmitting(true);
    try {
      const res  = await fetch('/api/p2p/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientIdentifier: recipient.trim(), amount: amtNum }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Transfer failed');
      toast({ title: '✅ Transfer Sent!', description: json.message || `$${amtNum.toFixed(2)} sent instantly with 0% fee.` });
      setRecipient(''); setAmount('');
      setDone(true);
      setTimeout(() => setDone(false), 3000);
      onSuccess();
    } catch (err: any) {
      toast({ title: 'Transfer Failed', description: err.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative mb-6 rounded-3xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0f1420]/60 backdrop-blur-xl p-6 shadow-xl overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute -top-8 -right-8 w-45 h-45 rounded-full bg-violet-600/10 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-indigo-500/5 blur-2xl pointer-events-none" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shadow-md">
              <Users className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">P2P Internal Transfer</h3>
                <span className="text-[10px] font-extrabold bg-violet-500/10 text-violet-700 dark:text-violet-400 border border-violet-500/25 px-2.5 py-0.5 rounded-full uppercase tracking-wider">0% FEE</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">Transfer directly to any Vexta user with zero deductions and instant settlement</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono font-bold text-violet-600 dark:text-violet-400">
            <div className="relative w-1.5 h-1.5">
              <div className="absolute inset-0 rounded-full bg-violet-500 animate-ping opacity-60" />
              <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />
            </div>
            LIVE
          </div>
        </div>

        {/* Fee comparison mini banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white/70 dark:bg-black/30 rounded-2xl border border-slate-200 dark:border-white/5 mb-5 text-xs">
          <div className="flex flex-wrap items-center gap-2 font-mono">
            <span className="text-red-650 dark:text-red-400 font-bold">External withdrawal: up to 6% fee</span>
            <span className="text-slate-400 dark:text-slate-600">vs</span>
            <span className="text-violet-700 dark:text-violet-400 font-bold">P2P: 0% fee always</span>
          </div>
          <span className="self-start sm:self-auto text-violet-700 dark:text-violet-400 text-[10px] bg-violet-500/10 px-3 py-1 rounded-xl border border-violet-500/20 font-bold uppercase tracking-wider">
            Save up to $60 per $1,000
          </span>
        </div>

        {done ? (
          <div className="flex items-center justify-center gap-3 py-6 bg-violet-500/5 border border-violet-500/10 rounded-2xl">
            <CheckCircle2 className="w-8 h-8 text-violet-500" />
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Transfer complete!</p>
              <p className="text-xs text-violet-500/80 font-mono">Recipient balance updated instantly · 0% deducted</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid sm:grid-cols-5 gap-4 items-end">
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-bold font-mono text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Recipient (email or referral code)
              </label>
              <input
                type="text"
                value={recipient}
                onChange={e => setRecipient(e.target.value)}
                placeholder="email@example.com or VEXTA_CODE"
                disabled={submitting}
                className="w-full bg-white dark:bg-white/3 border border-slate-300 dark:border-white/8 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-zinc-400 focus:outline-none focus:border-violet-500/50 focus:bg-white/5 transition-all font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[10px] font-bold font-mono text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Amount (USDT)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 font-bold text-sm">$</span>
                <input
                  type="number"
                  step="any"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0.00"
                  disabled={submitting}
                  className="w-full pl-8 bg-white dark:bg-white/3 border border-slate-300 dark:border-white/8 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-zinc-400 focus:outline-none focus:border-violet-500/50 focus:bg-white/5 transition-all font-mono"
                />
              </div>
            </div>

            <div className="sm:col-span-1">
              <button
                type="submit"
                disabled={submitting || !recipient.trim() || !amount}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-violet-600/10 hover:shadow-violet-600/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" /> Send
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}


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
  'w-full bg-white/3 dark:bg-white/3 border border-slate-200 dark:border-white/8 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-white placeholder-slate-500 dark:placeholder-zinc-500 focus:outline-none focus:border-violet-500/50 focus:bg-white/5 transition-all font-mono';

const sectionClass =
  'bg-white dark:bg-[#0A0F14]/60 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-2xl p-6 mb-5';

export default function WithdrawPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [withdrawals, setWithdrawals] = useState<WithdrawalItem[]>([]);

  // Sponsorship & Pool States
  const [pools, setPools] = useState<{
    availableRoi: number;
    availableCommission: number;
    blockedRoi: number;
    fundsFrozen: boolean;
  } | null>(null);

  const [userSponsorship, setUserSponsorship] = useState<{
    isSponsored: boolean;
    sponsoredType: 'free' | 'goal_locked';
    sponsoredGoalAmount: number;
    sponsoredDirectSales: number;
    roiBlocked: boolean;
    fundsFrozen: boolean;
  } | null>(null);

  const [withdrawType, setWithdrawType] = useState<'roi' | 'commission'>('roi');

  // Form states
  const [amount, setAmount] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [network, setNetwork] = useState('BEP20');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [requiresOtp, setRequiresOtp] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
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
      setPools(sJson.pools ?? null);
      setUserSponsorship(sJson.userSponsorship ?? null);
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

    const limit = withdrawType === 'roi' ? (pools?.availableRoi ?? 0) : (pools?.availableCommission ?? 0);
    if (numericAmount > limit) {
      setError(`Insufficient ${withdrawType === 'roi' ? 'ROI' : 'Commission'} balance. Maximum available: $${limit.toLocaleString()}`);
      toast({
        title: 'Withdrawal Failed',
        description: `Insufficient ${withdrawType === 'roi' ? 'ROI' : 'Commission'} balance. Maximum available: $${limit.toLocaleString()}`,
        variant: 'destructive',
      });
      setSubmitting(false);
      return;
    }

    try {
      const payload: any = {
        amount: numericAmount,
        walletAddress,
        network,
        type: withdrawType,
      };

      if (requiresOtp) {
        payload.verificationCode = verificationCode;
      }

      const res = await fetch('/api/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        window.location.href = '/login';
        return;
      }

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to request withdrawal');

      if (json.requiresOtp) {
        setRequiresOtp(true);
        setSuccess(json.message || 'Verification code sent to your email.');
        toast({
          title: 'Verification Required',
          description: json.message || 'Verification code sent to your email.',
        });
        return;
      }

      setSuccess(`Your withdrawal of $${numericAmount.toLocaleString()} (${network}) was requested successfully!`);
      toast({
        title: 'Withdrawal Requested',
        description: `Your withdrawal of $${numericAmount.toLocaleString()} (${network}) was requested successfully!`,
      });
      setAmount('');
      setWalletAddress('');
      setRequiresOtp(false);
      setVerificationCode('');
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
        <p className="text-xs font-extrabold text-violet-600 dark:text-violet-300 uppercase tracking-[0.2em] mb-1">{t('withdraw')}</p>
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
          <div className="bg-gradient-to-br from-violet-600/10 via-blue-600/5 to-transparent border border-violet-500/15 rounded-2xl p-6 mb-6 shadow-sm">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-violet-600 dark:text-violet-300" />
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-950 dark:text-white">{t('withdrawGuideTitle')}</h3>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-zinc-300 max-w-2xl leading-relaxed">
                  {t('withdrawGuideDesc')}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-200/50 dark:border-white/5 text-xs font-mono">
                  <div className="p-3 bg-slate-50 dark:bg-white/2 rounded-xl">
                    <span className="text-xs sm:text-sm font-extrabold block mb-1 text-violet-600 dark:text-violet-300">{t('withdrawGuideStep1Title')}</span>
                    <span className="text-slate-600 dark:text-zinc-300 font-semibold">{t('withdrawGuideStep1Sub')}</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-white/2 rounded-xl">
                    <span className="text-xs sm:text-sm font-extrabold block mb-1 text-violet-600 dark:text-violet-300">{t('withdrawGuideStep2Title')}</span>
                    <span className="text-slate-600 dark:text-zinc-300 font-semibold">{t('withdrawGuideStep2Sub')}</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-white/2 rounded-xl">
                    <span className="text-xs sm:text-sm font-extrabold block mb-1 text-violet-600 dark:text-violet-300">{t('withdrawGuideStep3Title')}</span>
                    <span className="text-slate-600 dark:text-zinc-300 font-semibold">{t('withdrawGuideStep3Sub')}</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-white/2 rounded-xl">
                    <span className="text-xs sm:text-sm font-extrabold block mb-1 text-violet-600 dark:text-violet-300">{t('withdrawGuideStep4Title')}</span>
                    <span className="text-slate-600 dark:text-zinc-300 font-semibold">{t('withdrawGuideStep4Sub')}</span>
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

          {/* ── Commission Comparison Block ──────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">

            {/* Card 1 — 6% fee (high, discouraging) */}
            <div className="relative flex flex-col gap-3 p-5 rounded-2xl border border-orange-400/30 bg-gradient-to-br from-orange-500/10 via-red-500/5 to-transparent">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">💸</span>
                </div>
                <div>
                  <p className="text-base font-extrabold text-orange-500 dark:text-orange-400 leading-tight">6% Commission</p>
                  <p className="text-[11px] font-mono text-slate-600 dark:text-zinc-400 uppercase tracking-wider font-semibold">External withdrawal</p>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-zinc-300 leading-relaxed font-medium">
                Applies to withdrawals <span className="font-extrabold text-orange-600 dark:text-orange-400">under $600</span>. A processing fee is deducted before payout.
              </p>
              <div className="mt-auto flex items-center gap-1.5 pt-2 border-t border-orange-400/10">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0" />
                <span className="text-xs font-mono text-orange-400 font-bold">Higher cost tier</span>
              </div>
            </div>

            {/* Card 2 — 2% fee (lower, still costs money) */}
            <div className="relative flex flex-col gap-3 p-5 rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 via-teal-500/5 to-transparent">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">📉</span>
                </div>
                <div>
                  <p className="text-base font-extrabold text-cyan-500 dark:text-cyan-400 leading-tight">2% Commission</p>
                  <p className="text-[11px] font-mono text-slate-600 dark:text-zinc-400 uppercase tracking-wider font-semibold">External withdrawal</p>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-zinc-300 leading-relaxed font-medium">
                Applies to withdrawals of <span className="font-extrabold text-cyan-600 dark:text-cyan-400">$600 or more</span>. Reduced fee for larger amounts.
              </p>
              <div className="mt-auto flex items-center gap-1.5 pt-2 border-t border-cyan-400/10">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0" />
                <span className="text-xs font-mono text-cyan-400 font-bold">Reduced cost tier</span>
              </div>
            </div>

            {/* Card 3 — FREE P2P (featured, glowing, recommended) */}
            <div className="relative flex flex-col gap-3 p-5 rounded-2xl border border-emerald-400/50 bg-gradient-to-br from-emerald-500/20 via-green-500/10 to-emerald-600/5 shadow-lg shadow-emerald-500/10 overflow-hidden">
              {/* Glow pulse behind card */}
              <div className="absolute inset-0 rounded-2xl bg-emerald-500/5 animate-pulse pointer-events-none" />

              {/* RECOMMENDED badge */}
              <div className="absolute top-3 right-3 bg-emerald-500 text-white text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-md shadow-emerald-500/40 flex items-center gap-1">
                <span>⭐</span> Recommended
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/45 flex items-center justify-center flex-shrink-0 shadow-sm shadow-emerald-500/20">
                  <span className="text-lg">🚀</span>
                </div>
                <div>
                  <p className="text-base font-black text-emerald-400 dark:text-emerald-300 leading-tight tracking-tight">FREE P2P</p>
                  <p className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 uppercase tracking-wider font-extrabold">Zero fees · Instant</p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-800 dark:text-zinc-100 leading-relaxed font-semibold relative z-10">
                Transfer to any Vexta user <span className="font-extrabold text-emerald-500 dark:text-emerald-400">instantly with 0% fee</span>. Keep value inside the network and grow together.
              </p>

              <div className="mt-auto flex items-center justify-between pt-2 border-t border-emerald-400/20 relative z-10">
                <div className="flex items-center gap-1.5">
                  <div className="relative w-1.5 h-1.5">
                    <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  </div>
                  <span className="text-xs font-mono text-emerald-500 dark:text-emerald-400 font-extrabold">No deductions, ever</span>
                </div>
                <a
                  href="/dashboard"
                  className="text-xs font-bold text-emerald-500 hover:text-emerald-400 underline underline-offset-2 transition-colors"
                >
                  Use P2P →
                </a>
              </div>
            </div>
          </div>

          {/* ── P2P Quick Transfer Panel ─────────────────────────────── */}
          <P2PTransferPanel balance={balance} onSuccess={fetchWithdrawalData} />

          <div className="grid lg:grid-cols-3 gap-6 items-start">
          {/* Form and info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Info Card */}
            <div className="bg-gradient-to-br from-violet-600/15 via-blue-600/5 to-transparent border border-violet-500/20 rounded-2xl p-6 relative overflow-hidden group shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-widest mb-1">{t('withdrawAvailFunds')}</p>
                  <p className="text-3xl font-extrabold text-slate-950 dark:text-white font-mono tracking-tight">
                    ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <Wallet className="w-6 h-6 text-violet-600 dark:text-violet-400 flex-shrink-0" />
              </div>
            </div>

            {/* Withdrawal Form */}
            <form onSubmit={handleSubmit} className={sectionClass}>
              <div className="flex items-center gap-3 mb-6">
                <ArrowLeftRight className="w-5 h-5 text-violet-600 dark:text-violet-300 flex-shrink-0" />
                <h2 className="text-base font-bold text-slate-950 dark:text-white">{t('withdrawRequestTitle')}</h2>
              </div>

              {/* Pool Balance Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <button
                  type="button"
                  onClick={() => setWithdrawType('roi')}
                  className={`relative p-5 rounded-2xl border text-left transition-all ${
                    withdrawType === 'roi'
                      ? 'border-violet-600 bg-violet-600/5 dark:bg-violet-600/10'
                      : 'border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/3 hover:bg-slate-100 dark:hover:bg-white/5'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 font-mono uppercase tracking-wider">ROI Profits</span>
                    {withdrawType === 'roi' && <CheckCircle2 className="w-4 h-4 text-violet-500" />}
                  </div>
                  <p className="text-lg font-black text-slate-905 dark:text-white font-mono">
                    ${pools ? pools.availableRoi.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00'}
                  </p>
                  {userSponsorship?.isSponsored && userSponsorship.roiBlocked && (
                    <span className="text-[10px] text-amber-500 font-bold block mt-2">ROI Blocked</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setWithdrawType('commission')}
                  className={`relative p-5 rounded-2xl border text-left transition-all ${
                    withdrawType === 'commission'
                      ? 'border-violet-600 bg-violet-600/5 dark:bg-violet-600/10'
                      : 'border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/3 hover:bg-slate-100 dark:hover:bg-white/5'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 font-mono uppercase tracking-wider">Referral Commissions</span>
                    {withdrawType === 'commission' && <CheckCircle2 className="w-4 h-4 text-violet-500" />}
                  </div>
                  <p className="text-lg font-black text-slate-905 dark:text-white font-mono">
                    ${pools ? pools.availableCommission.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00'}
                  </p>
                </button>
              </div>

              {/* Warnings and Goals for Sponsored Accounts */}
              {userSponsorship?.isSponsored && (
                <div className="mb-6 p-4 rounded-xl border bg-amber-500/10 border-amber-500/20 text-slate-800 dark:text-zinc-200 text-xs">
                  {userSponsorship.sponsoredType === 'goal_locked' ? (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center font-bold">
                        <span className="text-amber-600 dark:text-amber-400">Direct Sales Goal Progress</span>
                        <span className="font-mono">
                          ${userSponsorship.sponsoredDirectSales.toLocaleString()} / ${userSponsorship.sponsoredGoalAmount.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-[11px] leading-relaxed">
                        To unlock virtual ROI withdrawals, you must generate double the value of your assigned package in direct sales (Level 1 only).
                      </p>
                      {userSponsorship.sponsoredDirectSales < userSponsorship.sponsoredGoalAmount ? (
                        <div className="w-full bg-slate-200 dark:bg-white/5 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-amber-505 h-full rounded-full transition-all"
                            style={{ width: `${Math.min(100, Math.round((userSponsorship.sponsoredDirectSales / userSponsorship.sponsoredGoalAmount) * 100))}%` }}
                          />
                        </div>
                      ) : (
                        <p className="text-emerald-600 dark:text-emerald-400 font-bold">✓ Goal completed! Pending admin approval to unlock.</p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p className="font-bold text-amber-600 dark:text-amber-400">Free Account Limitation</p>
                      <p className="text-[11px] leading-relaxed">
                        ROI withdrawals are limited to $12 USD. To withdraw more than $12 USD, you must refer real investments totaling at least $10 USD. Network commissions can be withdrawn normally.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {userSponsorship?.fundsFrozen && (
                <div className="mb-6 p-4 rounded-xl border bg-red-500/10 border-red-500/20 text-red-500 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Account frozen. Payouts and transfers are temporarily locked.</span>
                </div>
              )}

              {success && (
                <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-mono flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span className="font-bold">{success}</span>
                </div>
              )}

              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 rounded-xl text-xs font-mono flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span className="font-bold">{error}</span>
                </div>
              )}

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-2">{t('withdrawNetworkLabel')}</label>
                  <select
                    value={network}
                    onChange={(e) => setNetwork(e.target.value)}
                    className="w-full bg-white/3 dark:bg-white/3 border border-slate-200 dark:border-white/8 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-violet-500/50 focus:bg-white/5 transition-all"
                  >
                    <option value="BEP20">USDT (BEP20) — BNB Smart Chain</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-2">{t('withdrawAmountLabel')}</label>
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
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-2">{t('withdrawWalletLabel')}</label>
                  <input
                    type="text"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    placeholder={t('withdrawAddressPlaceholder')}
                    className={inputClass}
                    required
                    disabled={submitting}
                  />
                  <span className="block text-xs text-slate-500 dark:text-zinc-400 font-semibold font-mono mt-1.5 leading-relaxed">
                    {t('withdrawWalletHint')}
                  </span>
                </div>
              </div>

              {requiresOtp && (
                <div className="p-4 bg-slate-100/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl">
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                    {t('verifyTitle') || 'Verification Code'}
                  </label>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mb-3 leading-relaxed">
                    {t('verifySubtitle') || 'Enter the 6-digit code we sent to your email address.'}
                  </p>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="123456"
                    className="w-full bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-center text-xl tracking-[0.5em] font-mono text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-violet-500 transition-all"
                    required
                    disabled={submitting}
                    maxLength={6}
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 text-xs font-extrabold text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-md shadow-violet-600/15"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t('withdrawProcessing')}</span>
                  </>
                ) : (
                  <span>{requiresOtp ? (t('verifySubmitBtn') || 'Verify & Withdraw') : t('withdrawSubmitBtn')}</span>
                )}
              </button>
            </form>
          </div>

          {/* Right sidebar: Recent history */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-[#0A0F14]/60 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 mb-4">{t('withdrawHistory')}</h3>
              
              <div className="space-y-3.5">
                {withdrawals.length > 0 ? (
                  withdrawals.map((item) => (
                    <div key={item.id} className="p-3 bg-slate-50 dark:bg-white/2 border border-slate-100 dark:border-white/5 rounded-xl flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-500 dark:text-zinc-400 font-mono">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                        <span className={`text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full ${statusColor[item.status] || 'bg-slate-200 text-slate-600'}`}>
                          {item.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <span className="text-xs sm:text-sm text-slate-700 dark:text-zinc-300 font-bold">
                          {item.network} {t('withdrawNetworkAddress')}
                        </span>
                        <span className="text-sm sm:text-base font-extrabold font-mono text-slate-900 dark:text-white">
                          -${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 dark:text-zinc-400 font-mono truncate">
                        {item.walletAddress}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center text-xs text-slate-500 dark:text-zinc-400 font-mono font-semibold">
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
