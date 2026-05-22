'use client';

import { DashboardLayout } from '@/components/dashboard-layout';
import {
  useState, useEffect, useRef, useCallback
} from 'react';
import {
  Copy, Check, ShieldCheck, Zap, AlertTriangle, ArrowRight,
  Wallet, QrCode, Clock, Loader2, X, CheckCircle2, ChevronRight,
  TrendingUp, Gift, Star, Rocket, History
} from 'lucide-react';
import { useTranslation } from '@/components/translation-provider';
import { useToast } from '@/hooks/use-toast';

const DEPOSIT_ADDRESS = '0x71C7656EC7ab88b098defB751B7401B5f6d8976F';
const EXPIRY_SECONDS = 15 * 60; // 15 minutes

interface Plan {
  id: string;
  name: string;
  tag: string;
  minDeposit: number;
  dailyROI: number;
  duration: number;
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
  const icons: Record<string, React.ReactNode> = {
    'STARTER PLAN': <Zap className="w-5 h-5 text-emerald-400" />,
    'PRIME PLAN': <Star className="w-5 h-5 text-amber-400" />,
    'ULTRA PLAN': <Rocket className="w-5 h-5 text-violet-400" />,
  };
  const colors: Record<string, string> = {
    'STARTER PLAN': 'from-emerald-600/20 to-emerald-600/5 border-emerald-500/20',
    'PRIME PLAN': 'from-amber-500/20 to-amber-500/5 border-amber-500/20',
    'ULTRA PLAN': 'from-violet-600/25 to-violet-600/5 border-violet-500/30',
  };
  const colorBadge: Record<string, string> = {
    'STARTER PLAN': 'bg-emerald-500/20 text-emerald-400',
    'PRIME PLAN': 'bg-amber-500/20 text-amber-400',
    'ULTRA PLAN': 'bg-violet-500/20 text-violet-400',
  };

  return (
    <div className={`relative flex flex-col p-5 rounded-2xl border bg-gradient-to-br ${colors[plan.tag] || 'from-white/5 to-white/2 border-white/10'} transition-all hover:scale-[1.01] hover:shadow-lg group`}>
      {plan.tag === 'PRIME PLAN' && (
        <div className="absolute -top-2.5 right-4 bg-amber-500 text-white text-[9px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow">
          Most Popular
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
          <span className="text-slate-500 dark:text-gray-400">Daily ROI</span>
          <span className="font-bold text-emerald-500">{(plan.dailyROI * 100).toFixed(1)}% / day</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500 dark:text-gray-400">Total ROI</span>
          <span className="font-bold text-emerald-400">300%</span>
        </div>
        <div className="flex justify-between border-t border-white/5 pt-2.5">
          <span className="text-slate-500 dark:text-gray-400">Min. Deposit</span>
          <span className="font-bold text-slate-900 dark:text-white font-mono">${plan.minDeposit.toLocaleString()}</span>
        </div>
      </div>

      <button
        onClick={() => onSelect(plan.minDeposit)}
        className="w-full mt-auto py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-violet-600 hover:text-white text-slate-800 dark:text-white border border-white/10 hover:border-violet-600 transition-all duration-200 flex items-center justify-center gap-1.5 group-hover:border-violet-500/50"
      >
        Deposit from ${plan.minDeposit.toLocaleString()}
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// Simulated QR grid using CSS
function SimpleQR({ address }: { address: string }) {
  // Deterministic pseudo-QR pattern from address characters
  const cells = Array.from({ length: 25 }, (_, i) => {
    const char = address.charCodeAt(i % address.length);
    return (char + i) % 3 !== 0;
  });

  return (
    <div className="w-full aspect-square grid grid-cols-5 gap-0.5 p-3 bg-white rounded-xl border border-slate-200">
      {/* Corner markers */}
      {cells.map((filled, i) => (
        <div key={i} className={`rounded-sm ${filled ? 'bg-slate-900' : 'bg-transparent'}`} />
      ))}
    </div>
  );
}

// Countdown timer hook
function useCountdown(seconds: number) {
  const [remaining, setRemaining] = useState(seconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setRemaining(seconds);
    intervalRef.current = setInterval(() => {
      setRemaining(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [seconds]);

  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');
  return { remaining, formatted: `${mm}:${ss}`, expired: remaining === 0 };
}

// CoinRemitter Checkout Modal
function CheckoutModal({
  amount,
  onClose,
  onInstant,
}: {
  amount: number;
  onClose: () => void;
  onInstant: () => Promise<void>;
}) {
  const { formatted, expired } = useCountdown(EXPIRY_SECONDS);
  const [copied, setCopied] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState(false);
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(DEPOSIT_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInstant = async () => {
    setConfirming(true);
    try {
      await onInstant();
      setDone(true);
    } catch {
      toast({ title: 'Error', description: 'Simulation failed', variant: 'destructive' });
    } finally {
      setConfirming(false);
    }
  };

  const handleHashSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txHash.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, network: 'USDT BEP20', txHash: txHash.trim(), instant: false }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast({ title: 'Submitted', description: 'TX Hash submitted. Pending admin review.' });
      onClose();
    } catch (err: any) {
      toast({ title: 'Failed', description: err.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white dark:bg-[#0D1420] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header strip */}
        <div className="bg-gradient-to-r from-violet-600 to-blue-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-white" />
            <span className="text-sm font-bold text-white">USDT BEP20 Payment</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {done ? (
          <div className="p-10 flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Deposit Confirmed!</h3>
            <p className="text-xs text-slate-500 dark:text-gray-400">Your balance has been updated. Check your dashboard overview.</p>
            <button onClick={onClose} className="mt-2 px-8 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold rounded-xl transition-colors">
              Back to Dashboard
            </button>
          </div>
        ) : (
          <div className="p-6 space-y-5">
            {/* Amount */}
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/3 rounded-2xl border border-slate-200 dark:border-white/8">
              <div>
                <p className="text-[10px] uppercase font-mono text-slate-400 tracking-widest mb-0.5">Amount Due</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">${amount.toLocaleString()} <span className="text-sm font-bold text-slate-400">USDT</span></p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase font-mono text-slate-400 tracking-widest mb-0.5">Network</p>
                <span className="text-xs font-bold text-violet-600 dark:text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-full">BEP20</span>
              </div>
            </div>

            {/* Timer */}
            <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-mono font-bold transition-colors ${
              expired
                ? 'bg-red-500/10 border-red-500/20 text-red-500'
                : 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400'
            }`}>
              <Clock className="w-4 h-4 flex-shrink-0" />
              <span>{expired ? 'Invoice expired — please refresh' : `Invoice expires in ${formatted}`}</span>
            </div>

            {/* QR + Address */}
            <div className="grid grid-cols-5 gap-4 items-center">
              <div className="col-span-2">
                <SimpleQR address={DEPOSIT_ADDRESS} />
              </div>
              <div className="col-span-3 space-y-2">
                <p className="text-[10px] text-slate-500 dark:text-gray-400 font-mono uppercase tracking-wider">Send USDT to:</p>
                <div className="flex items-center gap-1.5 p-2.5 bg-slate-50 dark:bg-white/3 border border-slate-200 dark:border-white/8 rounded-xl">
                  <span className="flex-1 font-mono text-[10px] text-slate-900 dark:text-white break-all">{DEPOSIT_ADDRESS}</span>
                  <button onClick={handleCopy} className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 transition-colors flex-shrink-0">
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-[9px] text-slate-400 dark:text-gray-500 leading-relaxed">
                  ⚠️ Only send USDT on BEP20 (Binance Smart Chain). Incorrect network may result in permanent loss.
                </p>
              </div>
            </div>

            {/* Status pulse */}
            <div className="flex items-center gap-2.5 p-3 bg-blue-500/5 border border-blue-500/20 rounded-xl">
              <div className="relative w-2 h-2 flex-shrink-0">
                <div className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-75" />
                <div className="w-2 h-2 rounded-full bg-blue-500" />
              </div>
              <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400">Awaiting network confirmation…</span>
            </div>

            {/* Instant Simulation Button */}
            <button
              onClick={handleInstant}
              disabled={confirming || expired}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.01] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {confirming ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</>
              ) : (
                <><Zap className="w-4 h-4" /> Simulate Instant Confirmation (Demo)</>
              )}
            </button>

            {/* TX Hash form */}
            <div className="border-t border-slate-200 dark:border-white/5 pt-4">
              <p className="text-[10px] uppercase font-mono text-slate-400 tracking-wider mb-2">Or submit TX hash manually</p>
              <form onSubmit={handleHashSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={txHash}
                  onChange={e => setTxHash(e.target.value)}
                  placeholder="0x..."
                  className="flex-1 bg-slate-50 dark:bg-white/3 border border-slate-200 dark:border-white/8 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-violet-500 transition-all"
                />
                <button
                  type="submit"
                  disabled={submitting || !txHash.trim()}
                  className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold disabled:opacity-50 transition-colors"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit'}
                </button>
              </form>
            </div>
          </div>
        )}
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
  const [showModal, setShowModal] = useState(false);
  const [modalAmount, setModalAmount] = useState(0);

  const statusColor: Record<string, string> = {
    pending: 'text-amber-600 dark:text-amber-400 bg-amber-500/10',
    completed: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10',
    failed: 'text-red-500 bg-red-500/10',
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
          setPlans(plansData.plans || []);
        }

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          const txs: DepositTx[] = (statsData.recentTransactions || []).filter((tx: any) => tx.type === 'deposit');
          setDeposits(txs.slice(0, 8));
          const total = txs.filter(tx => tx.status === 'completed').reduce((sum, tx) => sum + tx.amount, 0);
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

  const handleProceed = () => {
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt < 10) {
      toast({ title: 'Invalid Amount', description: 'Minimum deposit is $10 USDT.', variant: 'destructive' });
      return;
    }
    setModalAmount(amt);
    setShowModal(true);
  };

  const handleInstantSimulation = async () => {
    const res = await fetch('/api/deposit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: modalAmount, instant: true }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Simulation failed');
    // refresh page after a short delay
    setTimeout(() => window.location.reload(), 2000);
  };

  return (
    <DashboardLayout>
      {showModal && (
        <CheckoutModal
          amount={modalAmount}
          onClose={() => setShowModal(false)}
          onInstant={handleInstantSimulation}
        />
      )}

      {/* Header */}
      <div className="mb-8">
        <p className="text-[10px] font-mono text-violet-600 dark:text-violet-400 uppercase tracking-[0.2em] mb-1">
          {t('deposit')}
        </p>
        <h1 className="text-2xl font-bold text-slate-950 dark:text-white tracking-tight">Fund Your Account</h1>
        <p className="text-xs text-slate-500 dark:text-gray-400 mt-1 max-w-xl">
          Deposit USDT via BEP20 (Binance Smart Chain) exclusively. Choose a plan below to see minimum requirements, then submit your payment.
        </p>
      </div>

      {/* BEP20 Only Banner */}
      <div className="flex items-center gap-3 p-4 mb-8 bg-gradient-to-r from-violet-600/10 via-blue-600/5 to-transparent border border-violet-500/20 rounded-2xl">
        <ShieldCheck className="w-5 h-5 text-violet-500 flex-shrink-0" />
        <p className="text-xs text-slate-700 dark:text-gray-300">
          <span className="font-bold text-violet-600 dark:text-violet-400">USDT BEP20 Only</span> — We exclusively accept USDT on the Binance Smart Chain (BEP20). Do not send via TRC20 or ERC20.
        </p>
      </div>

      {loading ? (
        <div className="min-h-[300px] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-violet-600 dark:text-violet-400" />
        </div>
      ) : (
        <div className="space-y-10">

          {/* ── Section 1: Investment Plans ────────────────────────────── */}
          <section>
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp className="w-5 h-5 text-violet-500" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Investment Plans</h2>
            </div>
            {plans.length === 0 ? (
              <p className="text-sm text-slate-400 dark:text-gray-500 font-mono">No plans configured.</p>
            ) : (
              <div className="flex justify-center md:justify-start w-full">
                {plans.map(plan => (
                  <div key={plan.id} className="w-full max-w-sm">
                    <PlanCard
                      plan={plan}
                      onSelect={(minAmt) => setAmount(String(minAmt))}
                    />
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ── Section 2: Deposit Stats + History ─────────────────────── */}
          <section>
            <div className="flex items-center gap-2 mb-5">
              <History className="w-5 h-5 text-violet-500" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Your Deposit History</h2>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
              {[
                { label: 'Total Deposited', value: `$${totalDeposited.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, sub: 'USDT BEP20' },
                { label: 'Completed', value: deposits.filter(d => d.status === 'completed').length, sub: 'deposits' },
                { label: 'Pending Review', value: deposits.filter(d => d.status === 'pending').length, sub: 'transactions' },
                { label: 'Network', value: 'BEP20', sub: 'Binance Smart Chain' },
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
                  No deposit history yet. Make your first deposit below.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-white/5">
                  {deposits.map((dep) => (
                    <div key={dep.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-white/1 transition-colors">
                      <div>
                        <p className="text-xs font-semibold text-slate-800 dark:text-white">{dep.description || 'Deposit'}</p>
                        <p className="text-[10px] text-slate-400 dark:text-gray-500 font-mono mt-0.5">
                          {new Date(dep.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
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

          {/* ── Section 3: Deposit Input + Proceed ─────────────────────── */}
          <section>
            <div className="flex items-center gap-2 mb-5">
              <Wallet className="w-5 h-5 text-violet-500" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Make a Deposit</h2>
            </div>

            <div className="max-w-lg bg-white dark:bg-[#0A0F14]/60 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm space-y-5">
              {/* Network badge */}
              <div className="flex items-center gap-2 p-3 bg-violet-500/5 border border-violet-500/20 rounded-xl">
                <ShieldCheck className="w-4 h-4 text-violet-500" />
                <span className="text-[10px] font-mono font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider">
                  USDT · BEP20 · Binance Smart Chain Only
                </span>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Deposit Amount (USDT)
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
                <p className="text-[10px] text-slate-400 dark:text-gray-500 mt-1.5 font-mono">
                  Minimum: $10.00 USDT • No maximum limit
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
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white text-sm font-bold shadow-lg shadow-violet-600/25 transition-all hover:scale-[1.01] flex items-center justify-center gap-2"
              >
                Proceed to Payment
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </section>

        </div>
      )}
    </DashboardLayout>
  );
}
