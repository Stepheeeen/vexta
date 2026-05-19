'use client';

import { DashboardLayout } from '@/components/dashboard-layout';
import { Users, Copy, ChevronRight, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ReferralData {
  referralCode: string;
  totals: {
    level1Count: number;
    totalNetworkCount: number;
    totalEarned: number;
  };
  byLevel: Array<{
    level: number;
    count: number;
    earned: number;
  }>;
  recentCommissions: Array<{
    id: string;
    amount: number;
    level: number;
    createdAt: string;
  }>;
}

export default function ReferralsPage() {
  const [data, setData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setError(null);
      const res = await fetch('/api/referrals');
      if (res.status === 401) {
        window.location.href = '/login';
        return;
      }
      if (!res.ok) {
        const errorJson = await res.json().catch(() => ({}));
        throw new Error(errorJson.error || 'Failed to fetch referrals');
      }
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while fetching referrals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const referralCode = data?.referralCode || 'VEXTA_CODE';
  const referralLink = typeof window !== 'undefined' ? `${window.location.origin}/signup?ref=${referralCode}` : `https://vexta.app/signup?ref=${referralCode}`;

  const stats = [
    { label: 'Direct Referrals', value: `${data?.totals.level1Count ?? 0}`,        sub: 'Level 1 network' },
    { label: 'Total Network',     value: `${data?.totals.totalNetworkCount ?? 0}`,       sub: 'Levels 1–5 total' },
    { label: 'Commission Matrix',   value: 'Level 1–5',       sub: '10%, 5%, 3%, 2%, 1%' },
    { label: 'Commissions Earned',        value: `$${(data?.totals.totalEarned ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,   sub: 'All level credits' },
  ];

  const levelLabels: Record<number, string> = {
    1: 'Direct Referrals',
    2: 'Second Generation',
    3: 'Third Generation',
    4: 'Fourth Generation',
    5: 'Fifth Generation',
  };

  const levelRates: Record<number, string> = {
    1: '10%',
    2: '5%',
    3: '3%',
    4: '2%',
    5: '1%',
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <p className="text-[10px] font-mono text-violet-600 dark:text-violet-400 uppercase tracking-[0.2em] mb-1">Network</p>
        <h1 className="text-2xl font-bold text-slate-950 dark:text-white tracking-tight">Referrals</h1>
      </div>

      {loading ? (
        <div className="min-h-[300px] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-violet-600 dark:text-violet-400" />
        </div>
      ) : error ? (
        <div className="p-6 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl font-mono text-sm max-w-xl mx-auto my-12 text-center">
          <p className="mb-4">{error}</p>
          <button onClick={fetchData} className="px-4 py-2 bg-red-500 text-white rounded-xl font-sans font-medium hover:bg-red-600 transition-colors">
            Retry
          </button>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map(({ label, value, sub }) => (
              <div key={label} className="bg-white dark:bg-[#0A0F14]/60 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 rounded-2xl p-5 shadow-sm dark:shadow-none">
                <p className="text-[10px] font-mono text-slate-400 dark:text-gray-500 uppercase tracking-widest mb-3">{label}</p>
                <p className="text-xl font-bold text-slate-950 dark:text-white font-mono mb-1">{value}</p>
                <p className="text-[10px] text-slate-500 dark:text-gray-400">{sub}</p>
              </div>
            ))}
          </div>

          {/* Referral code + levels */}
          <div className="grid md:grid-cols-2 gap-5 mb-5">
            {/* Code card */}
            <div className="bg-white dark:bg-[#0A0F14]/60 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 rounded-2xl p-6 shadow-sm dark:shadow-none">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                  <Users className="w-4 h-4 text-violet-500 dark:text-violet-400" />
                </div>
                <h2 className="text-sm font-semibold text-slate-950 dark:text-white">Your Referral Link</h2>
              </div>

              {/* Code */}
              <div className="flex items-center justify-between gap-3 p-4 bg-slate-50 dark:bg-white/2 border border-slate-200/50 dark:border-white/5 rounded-xl mb-4">
                <p className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-blue-600 dark:from-violet-400 dark:to-blue-400 font-mono tracking-wider truncate">
                  {referralCode}
                </p>
                <button
                  onClick={() => navigator.clipboard.writeText(referralCode)}
                  className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all flex-shrink-0"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>

              {/* Share URL */}
              <div className="flex items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-white/2 border border-slate-200/50 dark:border-white/5 rounded-xl mb-5">
                <p className="text-[10px] text-slate-500 dark:text-gray-500 font-mono truncate">{referralLink}</p>
                <button
                  onClick={() => navigator.clipboard.writeText(referralLink)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all flex-shrink-0"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(referralLink);
                  alert('Link copied to clipboard!');
                }}
                className="w-full py-2.5 text-xs font-mono font-semibold text-white bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 rounded-xl transition-all"
              >
                Copy & Share Link
              </button>
            </div>

            {/* Commission levels */}
            <div className="bg-white dark:bg-[#0A0F14]/60 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 rounded-2xl p-6 shadow-sm dark:shadow-none">
              <h2 className="text-sm font-semibold text-slate-950 dark:text-white mb-5">Commission Breakdown</h2>
              <div className="space-y-3">
                {(data?.byLevel || []).map(({ level, count, earned }) => (
                  <div key={level} className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-white/2 rounded-xl border border-slate-200/50 dark:border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-lg bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-[9px] font-bold text-violet-500 dark:text-violet-400">{level}</span>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-900 dark:text-white">{levelLabels[level] || `Level ${level}`}</p>
                        <p className="text-[10px] text-slate-500 dark:text-gray-500 font-mono">{count} members</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-green-600 dark:text-green-400 font-mono">${earned.toFixed(2)}</p>
                      <p className="text-[10px] text-slate-500 dark:text-gray-500 font-mono">{levelRates[level]}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-slate-200/60 dark:border-white/5 flex justify-between">
                <span className="text-xs text-slate-400 dark:text-gray-500 font-mono">Total multi-tier payout</span>
                <span className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-blue-600 dark:from-violet-400 dark:to-blue-400 font-mono">21%</span>
              </div>
            </div>
          </div>

          {/* Recent referrals */}
          <div className="bg-white dark:bg-[#0A0F14]/60 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 rounded-2xl p-6 shadow-sm dark:shadow-none">
            <h2 className="text-sm font-semibold text-slate-950 dark:text-white mb-5">Recent Commissions</h2>
            <div className="space-y-3">
              {data && data.recentCommissions.length > 0 ? (
                data.recentCommissions.map((commission, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/2 rounded-xl border border-slate-200/50 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-[10px] font-bold text-violet-500 dark:text-violet-400">
                        L{commission.level}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-900 dark:text-white">Commission Received</p>
                        <p className="text-[10px] text-slate-500 dark:text-gray-500 font-mono">
                          {new Date(commission.createdAt).toLocaleDateString()} · Level {commission.level} Network member
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-green-600 dark:text-green-400 font-mono">+${commission.amount.toFixed(2)}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-gray-500" />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 dark:text-gray-500 font-mono py-8 text-center">No recent referral commissions yet.</p>
              )}
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
