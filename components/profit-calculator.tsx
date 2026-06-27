'use client';

import { useState, useEffect } from 'react';
import { Percent, ChevronRight, Loader2 } from 'lucide-react';
import { useTranslation } from '@/components/translation-provider';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

interface ProfitCalculatorProps {
  availableBalance: number;
  p2pBalance?: number;
  onSuccess: () => void;
}

export function ProfitCalculator({ availableBalance, p2pBalance = 0, onSuccess }: ProfitCalculatorProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [calcAmount, setCalcAmount] = useState(1000);
  const [plans, setPlans] = useState<any[]>([]);
  const [activating, setActivating] = useState(false);
  const [useP2p, setUseP2p] = useState(false);
  const [p2pUsedAmount, setP2pUsedAmount] = useState(0);

  const maxP2pAllowed = +(calcAmount * 0.50).toFixed(2);
  const maxP2pSpendable = Math.min(p2pBalance, maxP2pAllowed);

  useEffect(() => {
    if (useP2p) {
      if (p2pUsedAmount > maxP2pSpendable) {
        setP2pUsedAmount(maxP2pSpendable);
      }
    } else {
      setP2pUsedAmount(0);
    }
  }, [useP2p, calcAmount, p2pBalance, maxP2pSpendable, p2pUsedAmount]);

  const handleToggleP2p = (checked: boolean) => {
    setUseP2p(checked);
    if (checked) {
      setP2pUsedAmount(maxP2pSpendable);
    } else {
      setP2pUsedAmount(0);
    }
  };

  useEffect(() => {
    fetch('/api/plans')
      .then(res => res.json())
      .then(data => setPlans(data.plans || []))
      .catch(console.error);
  }, []);

  const getCalcDetails = () => {
    if (!calcAmount || calcAmount < 10) return null;
    let matchingPlan = plans
      .slice()
      .sort((a, b) => b.minDeposit - a.minDeposit)
      .find(p => calcAmount >= p.minDeposit);
    
    if (!matchingPlan) {
      let minDeposit = 10;
      let name = 'STARTER PLAN';
      let bonus = 0;
      if (calcAmount >= 3000) {
        name = 'ULTRA PLAN';
        minDeposit = 3000;
        bonus = 0.20;
      } else if (calcAmount >= 1000) {
        name = 'ADVANCE PLAN';
        minDeposit = 1000;
        bonus = 0.10;
      }
      matchingPlan = { id: '', name, minDeposit, bonus, dailyROI: 0.01 };
    }

    const bonusAmt = calcAmount * (matchingPlan.bonus || 0);
    const startingCapital = calcAmount + bonusAmt;
    const dailyReturn = startingCapital * (matchingPlan.dailyROI || 0.01);
    const endingBalance = startingCapital * 2;

    return {
      tier: matchingPlan.name,
      bonusPct: (matchingPlan.bonus || 0) * 100 + "%",
      bonusAmt,
      startingCapital,
      dailyReturn,
      endingBalance,
      matchingPlan
    };
  };

  const calc = getCalcDetails();

  const handleActivate = async () => {
    const amountNum = Number(calcAmount);
    if (!calc || !calc.matchingPlan || amountNum < 10) {
      toast({
        title: 'Validation Error',
        description: 'Amount must be at least $10.00 to match STARTER PLAN.',
        variant: 'destructive',
      });
      return;
    }
    
    const realPlan = plans.find(p => p.name === calc.matchingPlan.name);
    if (!realPlan) {
      toast({
        title: 'Error',
        description: 'Plans are still loading, please try again in a moment.',
        variant: 'destructive',
      });
      return;
    }

    const internalNeeded = +(amountNum - p2pUsedAmount).toFixed(2);
    if (internalNeeded > availableBalance) {
      toast({
        title: 'Insufficient Balance',
        description: `Your available Internal Wallet balance is $${availableBalance.toFixed(2)} USDT, but you need $${internalNeeded.toFixed(2)} USDT.`,
        variant: 'destructive',
      });
      return;
    }

    if (p2pUsedAmount > p2pBalance) {
      toast({
        title: 'Insufficient P2P Balance',
        description: `Your P2P Wallet balance is $${p2pBalance.toFixed(2)} USDT.`,
        variant: 'destructive',
      });
      return;
    }

    setActivating(true);
    try {
      const res = await fetch('/api/investments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: realPlan.id, amount: amountNum, p2pAmount: p2pUsedAmount }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to activate investment');

      toast({
        title: 'Investment Activated',
        description: `Successfully activated ${realPlan.name} with $${amountNum.toFixed(2)}.`,
      });
      onSuccess();
    } catch (err: any) {
      const msg = err.message || 'An unexpected error occurred. Please refresh and try again.';
      toast({
        title: 'Activation Failed',
        description: msg,
        variant: 'destructive',
      });
    } finally {
      setActivating(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-[#0A0F14]/80 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm w-full relative">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <Percent className="w-4 h-4 text-emerald-500" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">{t('calcTitle') || 'Profit Calculator'}</h2>
          <p className="text-xs text-slate-600 dark:text-zinc-300 font-semibold font-mono mt-0.5">{t("dashCalcTitle") || "Simulate your potential returns"}</p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4 p-3 bg-slate-50/50 dark:bg-white/2 border border-slate-200/50 dark:border-white/5 rounded-xl text-xs font-mono">
        <span className="text-slate-600 dark:text-zinc-400 font-bold uppercase">{t('arbAvailBal') || 'AVAILABLE BALANCE'}</span>
        <span className="text-xs font-extrabold text-violet-600 dark:text-violet-400 font-mono">
          ${availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })} USDT
        </span>
      </div>

      <div className="space-y-5 flex-1">
        {/* Amount slider */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-bold font-mono text-slate-700 dark:text-zinc-300 uppercase tracking-wider">
              {t('calcAmount') || 'Investment Amount'}
            </label>
            <div className="flex items-center text-sm font-black font-mono text-slate-900 dark:text-white bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-2 py-0.5 shadow-inner">
              <span className="text-slate-400 mr-0.5">$</span>
              <input
                type="number"
                value={calcAmount || ''}
                onChange={e => {
                  const val = e.target.value === '' ? 0 : Number(e.target.value);
                  setCalcAmount(val);
                }}
                className="w-20 bg-transparent text-right font-black font-mono focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </div>
          <input
            type="range" min={10} max={50000} step={10} value={calcAmount}
            onChange={e => setCalcAmount(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 dark:bg-white/10 rounded-full appearance-none cursor-pointer accent-violet-600"
          />
          <div className="flex justify-between text-xs text-slate-500 dark:text-zinc-400 font-bold font-mono mt-1">
            <span>$10</span><span>$50,000</span>
          </div>
          {/* Quick percents */}
          <div className="grid grid-cols-4 gap-2 mt-2">
            {[0.25, 0.50, 0.75, 1.0].map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => {
                  setCalcAmount(Math.round(availableBalance * pct));
                }}
                className="py-1.5 text-xs font-bold font-mono bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/5 rounded text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white transition-all"
              >
                {pct === 1.0 ? (t('arbMax') || 'MAX') : `${pct * 100}%`}
              </button>
            ))}
          </div>
        </div>

        {/* P2P Funding Option */}
        {p2pBalance > 0 && (
          <div className="bg-slate-50/50 dark:bg-white/2 border border-slate-200/50 dark:border-white/5 rounded-xl p-3.5 space-y-2.5 transition-all">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={useP2p}
                  onChange={(e) => handleToggleP2p(e.target.checked)}
                  className="rounded border-slate-350 dark:border-white/15 text-violet-600 focus:ring-violet-500 cursor-pointer w-4 h-4"
                />
                <span className="text-xs font-extrabold font-mono text-slate-700 dark:text-zinc-300 uppercase tracking-wider">
                  {t('p2pUseForActivation') || 'Use P2P Balance'} (${p2pBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })} USDT)
                </span>
              </label>
            </div>

            {useP2p && (
              <div className="space-y-2.5 pt-2 border-t border-slate-200/50 dark:border-white/5">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-500 dark:text-zinc-400 font-semibold">{t('p2pFromWallet') || 'From P2P Wallet'}:</span>
                  <div className="flex items-center font-black text-slate-900 dark:text-white bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded px-2 py-0.5">
                    <span className="text-slate-400 mr-0.5">$</span>
                    <input
                      type="number"
                      value={p2pUsedAmount || ''}
                      onChange={(e) => {
                        const val = e.target.value === '' ? 0 : Number(e.target.value);
                        if (val > maxP2pSpendable) {
                          setP2pUsedAmount(maxP2pSpendable);
                        } else if (val < 0) {
                          setP2pUsedAmount(0);
                        } else {
                          setP2pUsedAmount(val);
                        }
                      }}
                      className="w-16 bg-transparent text-right font-black focus:outline-none"
                    />
                  </div>
                </div>
                <input
                  type="range"
                  min={0}
                  max={maxP2pSpendable}
                  step={1}
                  value={p2pUsedAmount}
                  onChange={(e) => setP2pUsedAmount(Number(e.target.value))}
                  className="w-full h-1 bg-slate-200 dark:bg-white/10 rounded-full appearance-none cursor-pointer accent-violet-600"
                />
                <div className="flex justify-between text-[10px] text-slate-500 dark:text-zinc-400 font-bold font-mono">
                  <span>$0</span>
                  <span className="text-amber-500">Max Spendable (50%): ${maxP2pSpendable.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Results */}
        <div className="bg-slate-50 dark:bg-white/3 rounded-2xl p-4 space-y-2.5 border border-slate-200 dark:border-white/5">
          {calc ? (
            <>
              {[
                { label: t('depPlanTier') || 'Tier', value: calc.tier + " · 1.0%/day" },
                { label: t('depSignupBonus') || 'Bonus', value: "+" + calc.bonusPct + " (+$" + calc.bonusAmt.toFixed(2) + ")", color: 'text-emerald-600 dark:text-emerald-400' },
                { label: t('depOperatingCapital') || 'Capital', value: "$" + calc.startingCapital.toFixed(2) },
                { label: t('depDailyReturn') || 'Daily Return', value: "$" + calc.dailyReturn.toFixed(2) + " / day", color: 'text-emerald-600 dark:text-emerald-400' },
                { label: t('depPayoutLimit') || 'Max Payout Limit', value: t('depBusinessDays200') || '200% ROI (200 Days)', color: 'text-black dark:text-white text-sm font-black' },
              ].map(({ label, value, color }) => (
                <div key={label} className={`flex justify-between items-center text-xs ${color?.includes('text-sm') ? 'mt-1' : ''}`}>
                  <span className="text-slate-600 dark:text-zinc-400 font-semibold font-mono">{label}</span>
                  <span className={`font-bold font-mono ${color || 'text-slate-900 dark:text-white'}`}>{value}</span>
                </div>
              ))}

              {/* Dynamic 50/50 Split Progress Bar */}
              {useP2p && p2pUsedAmount > 0 && (
                <div className="space-y-2 border-t border-slate-200 dark:border-white/5 pt-2.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-600 dark:text-zinc-400 font-semibold">{t('p2p50Rule') || 'Max 50% from P2P Wallet'}</span>
                    <span className="text-slate-900 dark:text-white font-bold">Composition</span>
                  </div>
                  <div className="flex h-3 w-full bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden text-[9px] font-mono text-white text-center font-bold">
                    <div
                      className="bg-amber-500 flex items-center justify-center transition-all duration-300"
                      style={{ width: `${(p2pUsedAmount / calcAmount) * 100}%` }}
                      title={`P2P Wallet: $${p2pUsedAmount.toFixed(2)}`}
                    >
                      {((p2pUsedAmount / calcAmount) * 100) >= 15 ? 'P2P' : ''}
                    </div>
                    <div
                      className="bg-violet-600 flex items-center justify-center transition-all duration-300 flex-1"
                      title={`Internal Wallet: $${(calcAmount - p2pUsedAmount).toFixed(2)}`}
                    >
                      {((calcAmount - p2pUsedAmount) / calcAmount * 100) >= 15 ? 'Internal' : ''}
                    </div>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>P2P: ${p2pUsedAmount.toFixed(2)} ({(p2pUsedAmount / calcAmount * 100).toFixed(0)}%)</span>
                    <span>Internal: ${(calcAmount - p2pUsedAmount).toFixed(2)} ({((calcAmount - p2pUsedAmount) / calcAmount * 100).toFixed(0)}%)</span>
                  </div>
                </div>
              )}

              <div className="border-t border-slate-200 dark:border-white/5 pt-3">
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-600 dark:text-zinc-300 font-bold font-mono">{t("dashMaxReturn") || 'Max Total Return'}</span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold font-mono mt-0.5">{t('depMaxReturnDesc') || 'Original capital included'}</span>
                  </div>
                  <span className="text-base font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-blue-600 dark:from-violet-400 dark:to-blue-400">
                    {"$" + calc.endingBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <p className="text-xs text-center text-slate-500 dark:text-zinc-400 font-mono py-4">
              Enter an amount of at least $10 to see projections.
            </p>
          )}
        </div>

        {availableBalance >= (calcAmount - p2pUsedAmount) && calcAmount >= 10 ? (
          <button
            onClick={handleActivate}
            disabled={activating}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white text-xs font-bold shadow-lg shadow-violet-600/20 transition-all hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer"
          >
            {activating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t('arbProcessing') || 'Activating...'}</span>
              </>
            ) : (
              <>
                <span>{t('arbActivate') || 'Activate Arbitrage'}</span>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        ) : (
          <Link
            href={`/dashboard/deposit?amount=${calcAmount - p2pUsedAmount}`}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white text-xs font-bold shadow-lg shadow-violet-600/20 transition-all hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer"
          >
            <>{t('depDepositPrefix') || 'Deposit'} ${(calcAmount - p2pUsedAmount).toLocaleString()} {t('depDepositSuffix') || 'Now'}</>
            <ChevronRight className="w-4 h-4" />
          </Link>
        )}
      </div>
    </div>
  );
}
