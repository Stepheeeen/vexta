'use client';

import { DashboardLayout } from '@/components/dashboard-layout';
import { useState, useEffect } from 'react';
import {
  ShieldCheck, ArrowRight, Wallet, Loader2,
  TrendingUp, Star, Rocket, History,
  ChevronRight,
  Zap,
  Crown,
  Clock, AlertTriangle, FileText,
  Copy, Check, X, ExternalLink
} from 'lucide-react';
import { useTranslation } from '@/components/translation-provider';
import { useToast } from '@/hooks/use-toast';

interface Plan {
  id: string;
  name: string;
  tag: string;
  minDeposit: number;
  dailyROI: number;
  duration: number;
  bonus: number; // 0.00, 0.10, 0.20 — instant deposit bonus
}

interface DepositTx {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  description: string;
  reference?: string;
}

function PlanCard({ plan, onSelect }: { plan: Plan; onSelect: (amount: number) => void }) {
  const { t } = useTranslation();
  const icons: Record<string, React.ReactNode> = {
    'STARTER PLAN': <Zap className="w-5 h-5 text-emerald-400" />,
    'ADVANCE PLAN': <Star className="w-5 h-5 text-amber-400" />,
    'ULTRA PLAN': <Crown className="w-5 h-5 text-violet-400" />,
  };
  const colors: Record<string, string> = {
    'STARTER PLAN': 'from-emerald-600/20 to-emerald-600/5 border-emerald-500/20',
    'ADVANCE PLAN': 'from-amber-500/20 to-amber-500/5 border-amber-500/20',
    'ULTRA PLAN': 'from-violet-600/25 to-violet-600/5 border-violet-500/30',
  };
  const colorBadge: Record<string, string> = {
    'STARTER PLAN': 'bg-emerald-500/20 text-emerald-400',
    'ADVANCE PLAN': 'bg-amber-500/20 text-amber-400',
    'ULTRA PLAN': 'bg-violet-500/20 text-violet-400',
  };

  return (
    <div 
      onClick={() => onSelect(plan.minDeposit)}
      className={`cursor-pointer relative flex flex-col p-5 rounded-2xl border bg-gradient-to-br ${colors[plan.tag] || 'from-white/5 to-white/2 border-white/10'} transition-all hover:scale-[1.05] hover:shadow-xl hover:shadow-violet-500/10 group`}
    >
      {plan.tag === 'ADVANCE PLAN' && (
        <div className="absolute -top-2.5 right-4 bg-amber-500 text-white text-[9px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow">
          {t('mostPopular')}
        </div>
      )}

      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-xl bg-white/5">
          {icons[plan.tag] || <TrendingUp className="w-5 h-5 text-violet-400" />}
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">{plan.name}</h3>
          <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full ${colorBadge[plan.tag] || 'bg-white/10 text-white'}`}>
            {plan.tag}
          </span>
        </div>
      </div>

      <div className="space-y-2.5 mb-5 text-xs">
        <div className="flex justify-between">
          <span className="text-slate-500 dark:text-gray-400">{t('depDailyROI')}</span>
          <span className="font-bold text-emerald-500">{(plan.dailyROI * 100).toFixed(1)}% / day</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500 dark:text-gray-400">{t('depBonus')}</span>
          {plan.bonus > 0 ? (
            <span className={`font-bold ${
              plan.tag === 'ULTRA PLAN' ? 'text-violet-400' : 'text-amber-400'
            }`}>+{(plan.bonus * 100).toFixed(0)}%</span>
          ) : (
            <span className="text-slate-400 dark:text-slate-500 font-mono">—</span>
          )}
        </div>
        <div className="flex justify-between border-t border-white/5 pt-2.5">
          <span className="text-slate-500 dark:text-gray-400">{t('depMinDeposit')}</span>
          <span className="font-bold text-slate-900 dark:text-white font-mono">${plan.minDeposit.toLocaleString()}</span>
        </div>
      </div>

      <div
        className="w-full mt-auto py-2.5 rounded-xl text-xs font-bold bg-white/5 group-hover:bg-violet-600 group-hover:text-white text-slate-800 dark:text-white border border-slate-200 dark:border-white/10 group-hover:border-violet-600 transition-all duration-300 flex items-center justify-center gap-1.5"
      >
        {t('depDepositFrom')} ${plan.minDeposit.toLocaleString()}
        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
}



export default function DepositPage() {
  const { t } = useTranslation();
  const { toast } = useToast();

  const [plans, setPlans] = useState<Plan[]>([]);
  const [deposits, setDeposits] = useState<DepositTx[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalDeposited, setTotalDeposited] = useState(0);

  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Modal payment states
  const [invoiceDetails, setInvoiceDetails] = useState<{
    invoiceId: string;
    walletAddress: string;
    cryptoAmount: number;
    expireAt: number;
    invoiceUrl: string;
    txnId: string;
  } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const statusColor: Record<string, string> = {
    pending: 'text-amber-600 dark:text-amber-400 bg-amber-500/10',
    completed: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10',
    failed: 'text-red-500 bg-red-500/10',
  };

  // Expiration countdown timer effect
  useEffect(() => {
    if (!invoiceDetails || !showModal || paymentConfirmed) return;

    const updateTimer = () => {
      const secondsLeft = invoiceDetails.expireAt - Math.floor(Date.now() / 1000);
      if (secondsLeft <= 0) {
        setTimeLeft('Expired');
      } else {
        const m = Math.floor(secondsLeft / 60);
        const s = secondsLeft % 60;
        setTimeLeft(`${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [invoiceDetails, showModal, paymentConfirmed]);

  // Webhook polling effect to auto-detect confirmation
  useEffect(() => {
    if (!invoiceDetails || !showModal || paymentConfirmed) return;

    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch('/api/dashboard/stats');
        if (res.ok) {
          const statsData = await res.json();
          const txs = statsData.recentTransactions || [];
          const foundCompleted = txs.some(
            (tx: any) => tx.reference === invoiceDetails.txnId && tx.status === 'completed'
          );
          if (foundCompleted) {
            setPaymentConfirmed(true);
            toast({
              title: t('depConfirmed') || 'Deposit Confirmed!',
              description: t('depConfirmedDesc') || 'Your balance has been updated.',
            });
            
            // Reload stats and transactions
            const updatedTxs: DepositTx[] = txs.filter(
              (tx: any) =>
                tx.type === 'deposit' &&
                (tx.status === 'completed' || tx.status === 'pending') &&
                !tx.description?.includes('Investment activated')
            );
            setDeposits(updatedTxs.slice(0, 8));
            const total = updatedTxs.reduce((sum, tx) => (tx.status === 'completed' ? sum + tx.amount : sum), 0);
            setTotalDeposited(total);
          }
        }
      } catch (err) {
        console.error('[DepositModal] polling error:', err);
      }
    }, 5000);

    return () => clearInterval(pollInterval);
  }, [invoiceDetails, showModal, paymentConfirmed, t, toast]);

  const copyToClipboard = (text: string, type: 'address' | 'amount') => {
    navigator.clipboard.writeText(text);
    if (type === 'address') {
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    } else {
      setCopiedAmount(true);
      setTimeout(() => setCopiedAmount(false), 2000);
    }
    toast({
      title: t('copiedToClipboard') || 'Copied to clipboard!',
    });
  };

  useEffect(() => {
    async function load() {
      try {
        const [plansRes, statsRes] = await Promise.all([
          fetch('/api/plans'),
          fetch('/api/dashboard/stats'),
        ]);

        if (plansRes.ok) {
          const plansData = await plansRes.json();
          const sorted = (plansData.plans || []).sort((a: any, b: any) => a.minDeposit - b.minDeposit);
          setPlans(sorted);
        }

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          // Only show real USDT deposits (not investment activation transactions)
          const txs: DepositTx[] = (statsData.recentTransactions || []).filter(
            (tx: any) =>
              tx.type === 'deposit' &&
              (tx.status === 'completed' || tx.status === 'pending') &&
              !tx.description?.includes('Investment activated')
          );
          setDeposits(txs.slice(0, 8));
          const total = txs.reduce((sum, tx) => (tx.status === 'completed' ? sum + tx.amount : sum), 0);
          setTotalDeposited(total);
        }
      } catch (err) {
        console.error('[DepositPage] load error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleProceed = async () => {
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt < 10) {
      toast({ title: 'Invalid Amount', description: 'Minimum deposit is $10 USDT.', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/plisio/create-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amt }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to create payment invoice');

      if (data.invoiceUrl) {
        setInvoiceDetails({
          invoiceId: data.invoiceId,
          walletAddress: data.walletAddress,
          cryptoAmount: data.cryptoAmount,
          expireAt: data.expireAt,
          invoiceUrl: data.invoiceUrl,
          txnId: data.txnId,
        });
        setPaymentConfirmed(false);
        setShowModal(true);
      } else {
        throw new Error('No invoice URL returned from server');
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckStatus = async (invoiceDbId: string) => {
    setSyncingId(invoiceDbId);
    try {
      const res = await fetch('/api/plisio/check-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: invoiceDbId }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to sync status');
      
      if (data.status === 'completed' || data.status === 'mismatch') {
        toast({
          title: t('depConfirmed') || 'Deposit Confirmed!',
          description: data.message || 'Your balance has been updated.',
        });
      } else {
        toast({
          title: t('depPending') || 'Still Pending',
          description: data.message || 'Transaction is still awaiting confirmation.',
        });
      }

      // Reload stats and transactions
      const statsRes = await fetch('/api/dashboard/stats');
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        const txs: DepositTx[] = (statsData.recentTransactions || []).filter(
          (tx: any) =>
            tx.type === 'deposit' &&
            (tx.status === 'completed' || tx.status === 'pending') &&
            !tx.description?.includes('Investment activated')
        );
        setDeposits(txs.slice(0, 8));
        const total = txs.reduce((sum, tx) => (tx.status === 'completed' ? sum + tx.amount : sum), 0);
        setTotalDeposited(total);
      }
    } catch (err: any) {
      toast({
        title: 'Sync Failed',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setSyncingId(null);
    }
  };

  return (
    <DashboardLayout>

      {/* Header */}
      <div className="mb-8">
        <p className="text-[10px] font-mono text-violet-600 dark:text-violet-400 uppercase tracking-[0.2em] mb-1">
          {t('deposit')}
        </p>
        <h1 className="text-2xl font-bold text-slate-950 dark:text-white tracking-tight">{t('depFundYourAccount')}</h1>
        <p className="text-xs text-slate-500 dark:text-gray-400 mt-1 max-w-xl">
          {t('depSubtitle')}
        </p>
      </div>

      {/* Critical Deposit Rules Banner */}
      <div className="mb-8 overflow-hidden rounded-2xl border border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10 shadow-lg shadow-amber-500/5">
        <div className="bg-amber-500/20 px-5 py-3 border-b border-amber-500/20 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0" />
          <h3 className="font-bold text-amber-800 dark:text-amber-400 text-sm tracking-wide uppercase">
            {t('depCriticalRulesTitle') || 'Critical Deposit Rules (Read Before Paying)'}
          </h3>
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-white dark:bg-black/20 flex items-center justify-center flex-shrink-0 border border-amber-500/20">
              <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">{t('depRule1Title') || 'USDT BEP-20 Only'}</p>
              <p className="text-xs text-slate-600 dark:text-gray-400">
                {t('depRule1Desc') || 'Send ONLY Tether (USDT) on the Binance Smart Chain (BEP-20). Using TRC-20 or ERC-20 will result in permanent loss of funds.'}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-white dark:bg-black/20 flex items-center justify-center flex-shrink-0 border border-amber-500/20">
              <FileText className="w-4 h-4 text-amber-600 dark:text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">{t('depRule2Title') || 'Send the EXACT Amount'}</p>
              <p className="text-xs text-slate-600 dark:text-gray-400">
                {t('depRule2Desc') || 'If your exchange charges a withdrawal fee (e.g. $0.30), you must add it to your total. If the gateway receives even 1 cent less than the invoice amount, your payment will fail.'}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-white dark:bg-black/20 flex items-center justify-center flex-shrink-0 border border-amber-500/20">
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">{t('depRule3Title') || '30 Minute Time Limit'}</p>
              <p className="text-xs text-slate-600 dark:text-gray-400">
                {t('depRule3Desc') || 'Invoices expire after 30 minutes. Do not send funds from exchanges (like Coinbase or Luno) that delay withdrawals for hours.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="min-h-[300px] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-violet-600 dark:text-violet-400" />
        </div>
      ) : (
        <div className="space-y-10">

          {/* ── Section 1: {t('depInvPlans')} ────────────────────────────── */}
          <section>
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp className="w-5 h-5 text-violet-500" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">{t('depInvPlans')}</h2>
            </div>
            {plans.length === 0 ? (
              <p className="text-sm text-slate-400 dark:text-gray-500 font-mono">{t('depNoPlans')}</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                {plans.map(plan => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    onSelect={(minAmt) => {
                      setAmount(String(minAmt));
                      document.getElementById('make-deposit-section')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  />
                ))}
              </div>
            )}
          </section>

          {/* ── Section 2: Deposit Panel & History side-by-side ────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Left Column: Make a Deposit */}
            <section id="make-deposit-section" className="lg:col-span-5 space-y-5">
              <div className="flex items-center gap-2 mb-1">
                <Wallet className="w-5 h-5 text-violet-500" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">{t('depMakeDeposit')}</h2>
              </div>

              <div className="bg-white dark:bg-[#0A0F14]/60 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm space-y-5 w-full">
                {/* Network badge */}
                <div className="flex items-center gap-2 p-3 bg-violet-500/5 border border-violet-500/20 rounded-xl">
                  <ShieldCheck className="w-4 h-4 text-violet-500" />
                  <span className="text-[10px] font-mono font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider">
                    {t('depNetworkBscOnly')}
                  </span>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                    {t('depAmountUsdt')}
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">$</span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      min={10}
                      className="w-full pl-8 pr-4 py-3.5 bg-slate-50 dark:bg-white/3 border border-slate-200 dark:border-white/8 rounded-xl text-slate-900 dark:text-white font-mono text-base focus:outline-none focus:border-violet-500 transition-all"
                    />
                  </div>
                  {amount && parseFloat(amount) >= 10 && (
                    <div className="mt-2.5 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-[11px] text-amber-700 dark:text-amber-400 space-y-1">
                      <p className="font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500" />
                        {t('depExchangeFeeTitle') || 'Exchange Fee Reminder:'}
                      </p>
                      <p className="leading-normal">
                        {t('depExchangeFeeDesc') || 'If sending from an exchange (e.g. Binance, KuCoin), ensure you add their withdrawal fee to your withdrawal request so that exactly '}
                        <strong className="font-mono text-slate-900 dark:text-white font-bold">${parseFloat(amount).toFixed(2)} USDT</strong>
                        {t('depExchangeFeeDescSuffix') || ' USDT is received.'}
                      </p>
                    </div>
                  )}
                  <p className="text-[10px] text-slate-400 dark:text-gray-500 mt-1.5 font-mono">
                    {t('depMinUsdt')}
                  </p>
                </div>

                {/* Quick amounts */}
                <div className="flex flex-wrap gap-2">
                  {[100, 500, 1000, 2500, 5000].map(amt => (
                    <button
                      key={amt}
                      onClick={() => setAmount(String(amt))}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-white/5 hover:bg-violet-600 hover:text-white text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-white/5 hover:border-violet-600 transition-all"
                    >
                      ${amt.toLocaleString()}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleProceed}
                  disabled={submitting}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white text-sm font-bold shadow-lg shadow-violet-600/25 transition-all hover:scale-[1.01] flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                    <>
                      {t('depProceed')}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </section>

            {/* Right Column: Deposit Stats & History */}
            <section className="lg:col-span-7 space-y-5">
              <div className="flex items-center gap-2 mb-1">
                <History className="w-5 h-5 text-violet-500" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">{t('depHistory')}</h2>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: t('depTotalDep'), value: `$${totalDeposited.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, sub: 'USDT BEP20' },
                  { label: t('depCompleted'), value: deposits.filter(d => d.status === 'completed').length, sub: t('depDeposits') },
                  { label: t('depPendingRev'), value: deposits.filter(d => d.status === 'pending').length, sub: t('depTransactions') },
                  { label: t('depNetwork'), value: 'BEP20', sub: t('depBsc') },
                ].map((stat, i) => (
                  <div key={i} className="bg-white dark:bg-[#0A0F14]/60 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-2xl p-4">
                    <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">{stat.label}</p>
                    <p className="text-lg font-black text-slate-900 dark:text-white font-mono">{stat.value}</p>
                    <p className="text-[10px] text-slate-400 dark:text-gray-500 mt-0.5">{stat.sub}</p>
                  </div>
                ))}
              </div>

              {/* History list */}
              <div className="bg-white dark:bg-[#0A0F14]/60 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden">
                {deposits.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400 dark:text-gray-500 font-mono">
                    {t('depNoHistory')}
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-white/5">
                    {deposits.map((dep) => (
                      <div key={dep.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-white/1 transition-colors">
                        <div>
                          <p className="text-xs font-semibold text-slate-800 dark:text-white">{dep.description || t('deposit')}</p>
                          <p className="text-[10px] text-slate-400 dark:text-gray-500 font-mono mt-0.5">
                            {new Date(dep.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          {dep.status === 'pending' && dep.id.startsWith('plisio-pending-') && (
                            <button
                              disabled={syncingId !== null}
                              onClick={() => handleCheckStatus(dep.id.replace('plisio-pending-', ''))}
                              className="px-2.5 py-1 bg-violet-600/10 hover:bg-violet-600 border border-violet-500/20 text-violet-600 dark:text-violet-400 hover:text-white dark:hover:text-white text-[10px] font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                            >
                              {syncingId === dep.id.replace('plisio-pending-', '') ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Clock className="w-3.5 h-3.5" />
                              )}
                              {t('depCheckStatus') || 'Check Status'}
                            </button>
                          )}
                          <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded-full ${statusColor[dep.status] || 'bg-slate-200 text-slate-600'}`}>
                            {dep.status.toUpperCase()}
                          </span>
                          <span className="text-sm font-black text-slate-900 dark:text-white font-mono">
                            +${dep.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

          </div>

        </div>
      )}

      {/* USDT Payment Modal */}
      {showModal && invoiceDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-sans">
          <div className="relative w-full max-w-2xl bg-white dark:bg-[#0A0F14]/95 border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50 dark:bg-white/2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-violet-500" />
                <h3 className="font-bold text-sm text-slate-800 dark:text-white">
                  {t('depositModalTitle') || 'USDT BEP20 Payment'}
                </h3>
              </div>
              {!paymentConfirmed && (
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Modal Body */}
            <div className="p-6 flex-1 overflow-y-auto">
              {paymentConfirmed ? (
                <div className="py-8 flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 animate-bounce">
                    <Check className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-slate-900 dark:text-white">
                      {t('depConfirmed') || 'Deposit Confirmed!'}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-gray-400 mt-1 max-w-xs leading-normal">
                      {t('depConfirmedDesc') || 'Your balance has been updated. Check your dashboard overview.'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setInvoiceDetails(null);
                    }}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-600/20"
                  >
                    {t('depBackDash') || 'Back to Dashboard'}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  
                  {/* Left Column: QR Code & Countdown Timer */}
                  <div className="space-y-4">
                    {/* Expiration Timer Banner */}
                    <div className={`flex items-center justify-between p-3 border rounded-xl text-xs ${
                      timeLeft === 'Expired'
                        ? 'bg-red-500/5 dark:bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400 font-bold'
                        : 'bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/20 text-amber-800 dark:text-amber-400'
                    }`}>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span className="font-semibold">
                          {timeLeft === 'Expired'
                            ? (t('depInvoiceExpired') || 'Invoice expired — please refresh')
                            : (t('depositModalExpiry') || 'This invoice expires in')}
                        </span>
                      </div>
                      <span className="font-mono font-bold">{timeLeft}</span>
                    </div>

                    {/* QR Code Frame */}
                    <div className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-white/2 border border-slate-100 dark:border-white/5 rounded-2xl">
                      <div className={`p-3 bg-white border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm transition-opacity duration-300 ${
                        timeLeft === 'Expired' ? 'opacity-40' : ''
                      }`}>
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${invoiceDetails.walletAddress}`}
                          alt="USDT BEP20 QR Code"
                          className="w-36 h-36 object-contain"
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 dark:text-gray-500 font-medium mt-2">
                        {timeLeft === 'Expired' ? (t('depExpiredDoNotScan') || 'Expired — Do not scan') : (t('depositModalScan') || 'Scan QR Code')}
                      </p>
                    </div>

                    {/* Status Loading */}
                    {timeLeft !== 'Expired' && (
                      <div className="flex items-center justify-center gap-2 py-1 text-xs font-mono text-violet-500">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{t('depAwaiting') || 'Awaiting network confirmation…'}</span>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Payment Details & Warning Banner */}
                  <div className="space-y-4">
                    {/* Warning banner */}
                    <div className="p-3 bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 rounded-xl text-[10px] text-red-600 dark:text-red-400 leading-relaxed font-medium">
                      {t('depWarning') || '⚠️ Only send USDT on BEP20 (Binance Smart Chain). Incorrect network may result in permanent loss.'}
                    </div>

                    {/* Amount field */}
                    <div className={timeLeft === 'Expired' ? 'opacity-40 pointer-events-none' : ''}>
                      <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                        {t('depAmountDue') || 'Amount Due'} (USDT)
                      </label>
                      <div className="flex items-center gap-2 bg-slate-50 dark:bg-white/3 border border-slate-200 dark:border-white/5 p-3 rounded-xl">
                        <span className="flex-1 font-mono text-sm font-black text-slate-900 dark:text-white">
                          {invoiceDetails.cryptoAmount} USDT
                        </span>
                        <button
                          onClick={() => copyToClipboard(String(invoiceDetails.cryptoAmount), 'amount')}
                          disabled={timeLeft === 'Expired'}
                          className="p-1.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-gray-400 rounded-lg transition-all"
                        >
                          {copiedAmount ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Address field */}
                    <div className={timeLeft === 'Expired' ? 'opacity-40 pointer-events-none' : ''}>
                      <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                        {t('depositModalAddress') || 'Send exactly to this BEP20 address:'}
                      </label>
                      <div className="flex items-center gap-2 bg-slate-50 dark:bg-white/3 border border-slate-200 dark:border-white/5 p-3 rounded-xl">
                        <span className="flex-1 font-mono text-xs text-slate-500 dark:text-gray-300 break-all select-all leading-normal">
                          {invoiceDetails.walletAddress}
                        </span>
                        <button
                          onClick={() => copyToClipboard(invoiceDetails.walletAddress, 'address')}
                          disabled={timeLeft === 'Expired'}
                          className="p-1.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-gray-400 rounded-lg transition-all"
                        >
                          {copiedAddress ? <Check className="w-3.5 h-3.5 text-emerald-550" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Direct Link Alternative */}
                    <div className="text-center pt-2">
                      <a
                        href={invoiceDetails.invoiceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                      >
                        {t('depOpenSecureTab') || 'Open secure payment page in new tab'}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
