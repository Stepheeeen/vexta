'use client';

import { AdminLayout } from '@/components/admin-layout';
import { useState, useEffect } from 'react';
import { useTranslation } from '@/components/translation-provider';
import { useToast } from '@/hooks/use-toast';
import { 
  Zap, Users, DollarSign, Award, ShieldAlert, 
  Lock, Unlock, ArrowDownRight, Edit2, 
  Loader2, Plus, Search, Check, RefreshCw 
} from 'lucide-react';

interface Leader {
  id: string;
  name: string;
  email: string;
  type: 'free' | 'goal_locked';
  giftedAmount: number;
  goalAmount: number;
  directSales: number;
  networkSales: number;
  totalRoiWithdrawn: number;
  totalCommissionWithdrawn: number;
  roiBlocked: boolean;
  fundsFrozen: boolean;
  joined: string;
}

interface PendingWithdrawal {
  id: string;
  userId: string;
  user: string;
  email: string;
  amount: number;
  walletAddress: string;
  network: string;
  type: 'roi' | 'commission';
  date: string;
}

export default function AdminSponsorship() {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [pendingWithdrawals, setPendingWithdrawals] = useState<PendingWithdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Gifting modal states
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [sponsoredType, setSponsoredType] = useState<'free' | 'goal_locked'>('free');
  const [giftAmount, setGiftAmount] = useState('');
  const [gifting, setGifting] = useState(false);

  // Adjustment modal states
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<PendingWithdrawal | null>(null);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjusting, setAdjusting] = useState(false);

  const fetchLeaders = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    
    try {
      const res = await fetch('/api/admin/sponsorship');
      if (!res.ok) throw new Error('Failed to fetch sponsored accounts');
      const data = await res.json();
      setLeaders(data.leaders || []);

      // Fetch pending withdrawals for leaders
      const wRes = await fetch('/api/admin/withdrawals?status=pending');
      if (wRes.ok) {
        const wData = await wRes.json();
        // Filter withdrawals where the user is sponsored
        const leaderIds = new Set((data.leaders || []).map((l: Leader) => l.id));
        const filtered = (wData.withdrawals || []).filter((w: any) => leaderIds.has(w.userId));
        setPendingWithdrawals(filtered);
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Error loading sponsored accounts',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLeaders();
  }, []);

  const handleSearchUsers = async () => {
    if (!searchQuery.trim()) return;
    try {
      const res = await fetch(`/api/admin/sponsorship?mode=search_users&search=${encodeURIComponent(searchQuery)}`);
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();
      setSearchResults(data.users || []);
    } catch (err: any) {
      toast({ title: 'Search Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleGiftPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !giftAmount) return;
    const amount = parseFloat(giftAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: 'Invalid amount', variant: 'destructive' });
      return;
    }

    setGifting(true);
    try {
      const res = await fetch('/api/admin/sponsorship', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser.id,
          sponsoredType,
          sponsoredGiftedAmount: amount
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to gift plan');

      toast({ title: 'Success', description: `Successfully gifted $${amount} plan to ${selectedUser.firstName}.` });
      setShowGiftModal(false);
      setSelectedUser(null);
      setGiftAmount('');
      setSearchQuery('');
      setSearchResults([]);
      await fetchLeaders();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setGifting(false);
    }
  };

  const handleToggleBlock = async (leaderId: string) => {
    try {
      const res = await fetch('/api/admin/sponsorship', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: leaderId, action: 'toggle_roi_block' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      
      toast({ title: 'Updated', description: data.message });
      await fetchLeaders(true);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleToggleFreeze = async (leaderId: string) => {
    try {
      const res = await fetch('/api/admin/sponsorship', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: leaderId, action: 'toggle_freeze' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      
      toast({ title: 'Updated', description: data.message });
      await fetchLeaders(true);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleAdjustWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWithdrawal || !adjustAmount) return;
    const amount = parseFloat(adjustAmount);
    if (isNaN(amount) || amount <= 0 || amount > selectedWithdrawal.amount) {
      toast({ title: 'Invalid payout amount', description: 'Must be positive and less than or equal to requested amount.', variant: 'destructive' });
      return;
    }

    setAdjusting(true);
    try {
      const res = await fetch('/api/admin/sponsorship', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedWithdrawal.userId,
          action: 'modify_withdrawal',
          withdrawalId: selectedWithdrawal.id,
          newAmount: amount
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Adjustment failed');

      toast({ title: 'Success', description: data.message });
      setShowAdjustModal(false);
      setSelectedWithdrawal(null);
      setAdjustAmount('');
      await fetchLeaders();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setAdjusting(false);
    }
  };

  // Quick Stats
  const totalGifted = leaders.reduce((sum, l) => sum + l.giftedAmount, 0);
  const totalNetworkVolume = leaders.reduce((sum, l) => sum + l.networkSales, 0);
  const totalWithdrawn = leaders.reduce((sum, l) => sum + l.totalRoiWithdrawn + l.totalCommissionWithdrawn, 0);

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <p className="text-xs font-bold text-violet-600 dark:text-violet-300 uppercase tracking-widest mb-1">
            System Control
          </p>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Sponsored Accounts (Leadership)
          </h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => fetchLeaders(true)}
            disabled={refreshing}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-700 dark:text-gray-300 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowGiftModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-650 hover:bg-violet-700 text-white text-xs font-bold shadow-md shadow-violet-600/10 transition-all hover:scale-[1.01] cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Gift Sponsored Package
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Leaders', value: leaders.length.toString(), icon: Users, color: 'text-violet-600 dark:text-violet-400' },
          { label: 'Total Gifted Capital', value: `$${totalGifted.toLocaleString()}`, icon: DollarSign, color: 'text-amber-500 dark:text-amber-400' },
          { label: 'Total Team Sales', value: `$${totalNetworkVolume.toLocaleString()}`, icon: Award, color: 'text-emerald-500 dark:text-emerald-400' },
          { label: 'Leader Withdrawals', value: `$${totalWithdrawn.toLocaleString()}`, icon: ArrowDownRight, color: 'text-red-500 dark:text-red-400' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white dark:bg-[#0A0F14]/60 border border-slate-200 dark:border-white/5 rounded-2xl p-5 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <span className="text-slate-500 dark:text-gray-400 text-xs font-semibold">{stat.label}</span>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Pending Leader Withdrawals */}
      {pendingWithdrawals.length > 0 && (
        <div className="bg-white dark:bg-[#0A0F14]/60 border border-slate-250 dark:border-white/5 rounded-2xl p-6 mb-8 shadow-sm">
          <div className="flex items-center gap-2.5 mb-5">
            <ShieldAlert className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Pending Leader Payouts</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/5 text-slate-400 font-mono">
                  <th className="pb-3 font-semibold">User</th>
                  <th className="pb-3 font-semibold">Type</th>
                  <th className="pb-3 font-semibold">Wallet</th>
                  <th className="pb-3 font-semibold font-mono">Amount Requested</th>
                  <th className="pb-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {pendingWithdrawals.map((item) => (
                  <tr key={item.id} className="text-slate-700 dark:text-zinc-300">
                    <td className="py-3.5">
                      <p className="font-bold text-slate-900 dark:text-white">{item.user}</p>
                      <p className="text-[10px] text-slate-450 dark:text-gray-500 font-mono">{item.email}</p>
                    </td>
                    <td className="py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider font-mono ${
                        item.type === 'roi' ? 'bg-indigo-500/10 text-indigo-500' : 'bg-violet-500/10 text-violet-500'
                      }`}>
                        {item.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3.5 font-mono">
                      <p className="font-semibold">{item.network}</p>
                      <p className="text-[10px] text-slate-400 truncate max-w-[180px]">{item.walletAddress}</p>
                    </td>
                    <td className="py-3.5 font-bold font-mono text-slate-900 dark:text-white">
                      ${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => {
                          setSelectedWithdrawal(item);
                          setAdjustAmount(item.amount.toString());
                          setShowAdjustModal(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-800 dark:text-zinc-200 font-bold transition-all cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Adjust Amount
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Leaders Table */}
      <div className="bg-white dark:bg-[#0A0F14]/60 border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-6">Active Sponsored Leaders</h2>
        
        {loading ? (
          <div className="py-12 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-violet-600 dark:text-violet-400" />
          </div>
        ) : leaders.length === 0 ? (
          <div className="py-12 text-center text-slate-500 dark:text-zinc-400 font-mono text-xs font-bold">
            No sponsored accounts found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/5 text-slate-400 font-mono">
                  <th className="pb-3 font-semibold">User</th>
                  <th className="pb-3 font-semibold">Account Type</th>
                  <th className="pb-3 font-semibold font-mono">Gifted Capital</th>
                  <th className="pb-3 font-semibold">Goal Progress (L1 Sales)</th>
                  <th className="pb-3 font-semibold font-mono">Total Paid (ROI / Comm)</th>
                  <th className="pb-3 font-semibold text-center">Status</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {leaders.map((l) => {
                  const hasGoal = l.type === 'goal_locked';
                  const goalMet = l.directSales >= l.goalAmount;
                  const progressPct = hasGoal 
                    ? Math.min(100, Math.round((l.directSales / l.goalAmount) * 100))
                    : 100;

                  return (
                    <tr key={l.id} className="text-slate-700 dark:text-zinc-300">
                      <td className="py-4">
                        <p className="font-bold text-slate-900 dark:text-white">{l.name}</p>
                        <p className="text-[10px] text-slate-450 dark:text-gray-500 font-mono">{l.email}</p>
                      </td>
                      <td className="py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider font-mono ${
                          hasGoal ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'
                        }`}>
                          {l.type === 'goal_locked' ? 'Goal Locked' : 'Free Account'}
                        </span>
                      </td>
                      <td className="py-4 font-bold font-mono text-slate-900 dark:text-white">
                        ${l.giftedAmount.toLocaleString()}
                      </td>
                      <td className="py-4">
                        {hasGoal ? (
                          <div className="space-y-1.5 max-w-[160px]">
                            <div className="flex justify-between text-[10px] font-semibold">
                              <span className="font-mono">${l.directSales.toLocaleString()}</span>
                              <span className="text-slate-400">/ ${l.goalAmount.toLocaleString()}</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-white/5 h-1.5 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all ${
                                  goalMet ? 'bg-emerald-500' : 'bg-amber-500'
                                }`} 
                                style={{ width: `${progressPct}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-450 dark:text-gray-500 font-semibold font-mono">No Lock (L1: ${l.directSales.toLocaleString()})</span>
                        )}
                      </td>
                      <td className="py-4 font-mono">
                        <p className="font-bold text-slate-900 dark:text-white">ROI: ${l.totalRoiWithdrawn.toLocaleString()}</p>
                        <p className="text-[10px] text-violet-500 font-semibold">Comms: ${l.totalCommissionWithdrawn.toLocaleString()}</p>
                      </td>
                      <td className="py-4 text-center space-y-1">
                        <div className="flex flex-col items-center gap-1">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold font-mono uppercase ${
                            l.fundsFrozen 
                              ? 'bg-red-500/10 text-red-500 border border-red-500/20' 
                              : 'bg-green-500/10 text-green-500 border border-green-500/20'
                          }`}>
                            {l.fundsFrozen ? 'Frozen' : 'Unlocked'}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold font-mono uppercase ${
                            (l.roiBlocked || (hasGoal && !goalMet)) 
                              ? 'bg-red-500/10 text-red-500 border border-red-500/20' 
                              : 'bg-green-500/10 text-green-500 border border-green-500/20'
                          }`}>
                            {(l.roiBlocked || (hasGoal && !goalMet)) ? 'ROI Blocked' : 'ROI Open'}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleBlock(l.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-zinc-200 font-bold transition-all cursor-pointer"
                        >
                          {l.roiBlocked ? (
                            <><Unlock className="w-3.5 h-3.5 text-emerald-500" /> Unlock ROI</>
                          ) : (
                            <><Lock className="w-3.5 h-3.5 text-amber-500" /> Lock ROI</>
                          )}
                        </button>
                        <button
                          onClick={() => handleToggleFreeze(l.id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer font-bold ${
                            l.fundsFrozen
                              ? 'border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                              : 'border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400'
                          }`}
                        >
                          {l.fundsFrozen ? 'Unfreeze' : 'Freeze Funds'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Gift Plan Modal */}
      {showGiftModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0A0F14]/95 border border-slate-200 dark:border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl font-sans relative">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-5">
              Gift Sponsored Plan
            </h3>

            <div className="space-y-4">
              {/* Search User */}
              {!selectedUser ? (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase mb-2">
                    Search Leader Account
                  </label>
                  <div className="flex gap-2 mb-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-9 bg-slate-50 dark:bg-white/3 border border-slate-200 dark:border-white/8 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-violet-500/50"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleSearchUsers}
                      className="px-4 py-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/8 text-slate-800 dark:text-zinc-200 text-xs font-bold rounded-xl hover:bg-slate-250 cursor-pointer"
                    >
                      Search
                    </button>
                  </div>

                  {searchResults.length > 0 && (
                    <div className="max-h-40 overflow-y-auto border border-slate-200 dark:border-white/5 rounded-xl divide-y divide-slate-100 dark:divide-white/5">
                      {searchResults.map(user => (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => setSelectedUser(user)}
                          className="w-full text-left p-3 hover:bg-slate-50 dark:hover:bg-white/5 flex justify-between items-center text-xs"
                        >
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">{user.firstName} {user.lastName}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{user.email}</p>
                          </div>
                          <Check className="w-4 h-4 text-violet-500 opacity-0 hover:opacity-100" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-violet-500/5 border border-violet-500/20 rounded-xl flex justify-between items-center text-xs">
                  <div>
                    <p className="text-[10px] text-violet-500 font-bold uppercase tracking-wider">Selected Account</p>
                    <p className="font-bold text-slate-900 dark:text-white">{selectedUser.firstName} {selectedUser.lastName}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{selectedUser.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedUser(null)}
                    className="text-[10px] font-bold text-red-500 hover:underline"
                  >
                    Change
                  </button>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleGiftPlan} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase mb-2">
                    Account Rules/Type
                  </label>
                  <select
                    value={sponsoredType}
                    onChange={e => setSponsoredType(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-white/3 border border-slate-200 dark:border-white/8 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="free">Free Account (No initial lock. Blocked if withdrawn &gt; $12 without referrals)</option>
                    <option value="goal_locked">Goal-Locked Account (ROI withdrawals locked until 2x direct sales generated)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase mb-2">
                    Gift Amount (USD value of package)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 1000"
                    value={giftAmount}
                    onChange={e => setGiftAmount(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-white/3 border border-slate-200 dark:border-white/8 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-violet-500/50"
                    required
                  />
                </div>

                <div className="flex gap-2.5 pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowGiftModal(false);
                      setSelectedUser(null);
                      setSearchResults([]);
                    }}
                    className="flex-1 py-2.5 border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 rounded-xl hover:bg-slate-100 text-xs font-bold text-slate-700 dark:text-zinc-200 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={gifting || !selectedUser || !giftAmount}
                    className="flex-1 py-2.5 bg-violet-650 hover:bg-violet-700 disabled:opacity-50 rounded-xl text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    {gifting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Confirm Gift'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Adjust Payout Modal */}
      {showAdjustModal && selectedWithdrawal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0A0F14]/95 border border-slate-200 dark:border-white/10 rounded-2xl w-full max-w-sm p-6 shadow-2xl font-sans relative">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">
              Adjust Payout Amount
            </h3>
            <p className="text-xs text-slate-550 dark:text-zinc-400 mb-4">
              Modify the pending payout for <span className="font-bold text-slate-700 dark:text-zinc-200">{selectedWithdrawal.user}</span>. The difference will be automatically refunded back to their balance.
            </p>

            <form onSubmit={handleAdjustWithdrawal} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 font-mono uppercase mb-2">Original Request</label>
                <p className="text-sm font-bold font-mono text-slate-900 dark:text-white bg-slate-50 dark:bg-white/3 p-2.5 rounded-xl border border-slate-200 dark:border-white/5">
                  ${selectedWithdrawal.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 font-mono uppercase mb-2">New Payout Amount (USD)</label>
                <input
                  type="number"
                  step="any"
                  max={selectedWithdrawal.amount}
                  value={adjustAmount}
                  onChange={e => setAdjustAmount(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-white/3 border border-slate-200 dark:border-white/8 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-violet-500/50"
                  required
                />
              </div>

              <div className="flex gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAdjustModal(false);
                    setSelectedWithdrawal(null);
                  }}
                  className="flex-1 py-2.5 border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 rounded-xl hover:bg-slate-100 text-xs font-bold text-slate-700 dark:text-zinc-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adjusting || !adjustAmount}
                  className="flex-1 py-2.5 bg-violet-650 hover:bg-violet-700 disabled:opacity-50 rounded-xl text-white text-xs font-bold transition-all cursor-pointer"
                >
                  {adjusting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
