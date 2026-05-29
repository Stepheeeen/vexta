'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AdminLayout } from '@/components/admin-layout';
import { Loader2, ArrowLeft, ShieldAlert, Ban, RefreshCw, Edit, Unlock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminUserDetails() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/users/${params.id}`);
      if (!res.ok) throw new Error('Failed to fetch user details');
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      fetchUser();
    }
  }, [params.id]);

  const handleAction = async (action: string, value?: any, promptText?: string) => {
    let reason = '';
    if (promptText) {
      const input = prompt(promptText);
      if (input === null) return; // User cancelled
      reason = input;
    }

    try {
      const res = await fetch(`/api/admin/users/${params.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, value, reason }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Action failed');
      }
      
      toast({ title: 'Success', description: 'Action completed successfully' });
      fetchUser();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleAdjustBalance = () => {
    const newBalance = prompt(`Enter new balance (Current: $${data?.user?.balance}):`);
    if (newBalance === null) return;
    
    const parsed = parseFloat(newBalance);
    if (isNaN(parsed)) {
      toast({ title: 'Error', description: 'Invalid number format', variant: 'destructive' });
      return;
    }
    
    handleAction('adjust-balance', parsed, 'Reason for balance adjustment:');
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-violet-600 dark:text-violet-400" />
        </div>
      </AdminLayout>
    );
  }

  if (error || !data) {
    return (
      <AdminLayout>
        <div className="p-6 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl font-mono text-sm">
          {error || 'User not found'}
        </div>
      </AdminLayout>
    );
  }

  const { user, networkStats } = data;

  return (
    <AdminLayout>
      <div className="mb-8 flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 bg-slate-100 dark:bg-white/5 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 transition">
          <ArrowLeft className="w-5 h-5 text-slate-700 dark:text-gray-300" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{user.name}</h1>
          <p className="text-slate-500 dark:text-gray-400 text-sm">{user.email} • Joined {new Date(user.joinedAt).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Capital Control Panel */}
        <div className="bg-white dark:bg-[#0A0F14]/60 border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm flex flex-col col-span-2">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Capital Control</h3>
          
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-500 dark:text-gray-400">Personal Deposited Capital</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">${user.totalPersonalDeposits.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-gray-400">Company Provided Capital</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">${user.sponsoredGiftedAmount.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-gray-400">Total Operational Capital</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">${user.operationalCapital.toFixed(2)}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-500 dark:text-gray-400">Available Balance</p>
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">${user.balance.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-gray-400">Accumulated Profits (Total Earned)</p>
                <p className="text-xl font-bold text-violet-600 dark:text-violet-400">${user.totalEarned.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-gray-400">Total Withdrawn Profits</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">${user.totalWithdrawn.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Administrative Actions */}
        <div className="bg-white dark:bg-[#0A0F14]/60 border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Administrative Actions</h3>
          
          <div className="flex flex-col gap-3">
            <button
              onClick={() => handleAction('toggle-withdrawals', null, 'Reason for blocking/unblocking withdrawals:')}
              className={`flex items-center gap-3 w-full p-3 rounded-xl border text-sm font-medium transition-colors ${
                user.withdrawalsBlocked 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20' 
                : 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-500/20'
              }`}
            >
              {user.withdrawalsBlocked ? <Unlock className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
              {user.withdrawalsBlocked ? 'Unblock Withdrawals' : 'Block Withdrawals'}
            </button>

            <button
              onClick={handleAdjustBalance}
              className="flex items-center gap-3 w-full p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-gray-300 text-sm font-medium transition-colors"
            >
              <Edit className="w-4 h-4" />
              Adjust Balance Manually
            </button>

            <button
              onClick={() => {
                if (confirm('Are you sure you want to reset all historical profits to 0 for this user?')) {
                  handleAction('reset-profits', null, 'Reason for manual profit reset:');
                }
              }}
              className="flex items-center gap-3 w-full p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-gray-300 text-sm font-medium transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Reset Accumulated Profits
            </button>

            {user.isSponsored && (
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to manually release this support account?')) {
                    handleAction('release-support', null, 'Reason for releasing support account:');
                  }
                }}
                className="flex items-center gap-3 w-full p-3 rounded-xl border border-violet-500/20 bg-violet-500/10 text-violet-600 dark:text-violet-400 hover:bg-violet-500/20 text-sm font-medium transition-colors mt-2"
              >
                <ShieldAlert className="w-4 h-4" />
                Release Support Account
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Network Visibility */}
      <div className="bg-white dark:bg-[#0A0F14]/60 border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm mb-8">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Network Visibility</h3>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-4 bg-slate-50 dark:bg-white/2 rounded-xl border border-slate-100 dark:border-white/5">
            <p className="text-sm text-slate-500 dark:text-gray-400 mb-1">Direct Referrals</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{networkStats.directReferralsCount}</p>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-white/2 rounded-xl border border-slate-100 dark:border-white/5">
            <p className="text-sm text-slate-500 dark:text-gray-400 mb-1">Total Network Size</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{networkStats.totalNetworkSize}</p>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-white/2 rounded-xl border border-slate-100 dark:border-white/5">
            <p className="text-sm text-slate-500 dark:text-gray-400 mb-1">Total Network Volume</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">${networkStats.totalNetworkVolume.toFixed(2)}</p>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-white/2 rounded-xl border border-slate-100 dark:border-white/5">
            <p className="text-sm text-slate-500 dark:text-gray-400 mb-1">Total Network Profits</p>
            <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">${networkStats.totalNetworkProfits.toFixed(2)}</p>
          </div>
        </div>
      </div>

    </AdminLayout>
  );
}
