'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AdminLayout } from '@/components/admin-layout';
import { Search, Loader2, ShieldAlert, ToggleLeft, ToggleRight } from 'lucide-react';
import { useTranslation } from '@/components/translation-provider';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  name: string;
  email: string;
  joined: string;
  status: string;
  balance: string;
  referrals: number;
}

export default function AdminUsers() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getStatusLabel = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'active') return t('adminStatusActive');
    if (s === 'pending') return t('adminStatusPending');
    if (s === 'suspended') return t('adminStatusSuspended');
    if (s === 'completed') return t('adminStatusCompleted');
    if (s === 'rejected') return t('adminStatusRejected');
    if (s === 'failed') return t('adminStatusFailed');
    return status;
  };

  const getFilterLabel = (filter: string) => {
    const f = filter.toLowerCase();
    if (f === 'all') return t('adminFilterAll');
    if (f === 'active') return t('adminStatusActive');
    if (f === 'pending') return t('adminStatusPending');
    if (f === 'suspended') return t('adminStatusSuspended');
    return filter;
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/users?search=${encodeURIComponent(searchTerm)}&status=${statusFilter}`);
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchUsers();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, statusFilter]);

  const handleToggleActive = async (userId: string) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'toggle-active' }),
      });
      if (!res.ok) throw new Error('Action failed');
      toast({
        title: t('adminAlertSuccess'),
        description: t('adminActionSuccess'),
      });
      fetchUsers();
    } catch (err: any) {
      toast({
        title: t('adminAlertError'),
        description: err.message || t('adminActionFailed') || 'Failed to update user status',
        variant: 'destructive',
      });
    }
  };

  const handlePromoteAdmin = async (userId: string) => {
    if (!confirm(t('adminUsersIrreversible') || 'Are you sure you want to promote this user to Admin? This action is irreversible.')) return;
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'promote-admin' }),
      });
      if (!res.ok) throw new Error('Action failed');
      toast({
        title: t('adminAlertSuccess'),
        description: t('adminUsersPromoteSuccess') || 'User promoted to Admin successfully',
      });
      fetchUsers();
    } catch (err: any) {
      toast({
        title: t('adminAlertError'),
        description: err.message || t('adminActionFailed') || 'Failed to promote user',
        variant: 'destructive',
      });
    }
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{t('adminUsersTitle') || 'User Management'}</h1>
        <p className="text-slate-500 dark:text-gray-400">{t('adminUsersSub') || 'Manage platform users and accounts'}</p>
      </div>

      {/* Search and Filter */}
      <div className="bg-white dark:bg-[#0A0F14]/60 border border-slate-200 dark:border-white/5 rounded-2xl p-6 mb-8 shadow-sm">
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-white/2 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder={t('adminUsersSearchPlaceholder') || 'Search by name or email...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none text-sm"
          />
        </div>

        <div className="flex gap-4 mt-4 overflow-x-auto pb-1">
          {['All', 'Active', 'Pending', 'Suspended'].map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                statusFilter === filter
                  ? 'border-violet-500 text-violet-600 dark:text-violet-400 bg-violet-500/10'
                  : 'border-slate-200 dark:border-white/10 text-slate-500 dark:text-gray-400 hover:border-violet-500/50 hover:text-violet-600'
              }`}
            >
              {getFilterLabel(filter)}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
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
                  <th className="px-6 py-4 text-left text-slate-500 dark:text-gray-400 font-semibold text-sm">{t('adminColId') || 'ID'}</th>
                  <th className="px-6 py-4 text-left text-slate-500 dark:text-gray-400 font-semibold text-sm">{t('adminColName') || 'Name'}</th>
                  <th className="px-6 py-4 text-left text-slate-500 dark:text-gray-400 font-semibold text-sm">{t('adminColEmail') || 'Email'}</th>
                  <th className="px-6 py-4 text-center text-slate-500 dark:text-gray-400 font-semibold text-sm">{t('adminColJoined') || 'Joined'}</th>
                  <th className="px-6 py-4 text-right text-slate-500 dark:text-gray-400 font-semibold text-sm">{t('adminColBalance') || 'Balance'}</th>
                  <th className="px-6 py-4 text-center text-slate-500 dark:text-gray-400 font-semibold text-sm">{t('adminColReferrals') || 'Referrals'}</th>
                  <th className="px-6 py-4 text-center text-slate-500 dark:text-gray-400 font-semibold text-sm">{t('adminColStatus') || 'Status'}</th>
                  <th className="px-6 py-4 text-center text-slate-500 dark:text-gray-400 font-semibold text-sm">{t('adminColActions') || 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/1 transition-colors">
                    <td className="px-6 py-4 text-slate-400 font-mono text-xs">{user.id.slice(-6)}</td>
                    <td className="px-6 py-4">
                      <p className="text-slate-900 dark:text-white font-medium text-sm">{user.name}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-gray-400 text-sm">{user.email}</td>
                    <td className="px-6 py-4 text-center text-slate-500 dark:text-gray-400 text-sm">{user.joined}</td>
                    <td className="px-6 py-4 text-right text-emerald-600 dark:text-emerald-400 font-bold">{user.balance}</td>
                    <td className="px-6 py-4 text-center text-violet-600 dark:text-violet-400 font-bold">{user.referrals}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        user.status === 'Active'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                          : user.status === 'Pending'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                          : 'bg-red-500/10 text-red-500 border-red-500/30'
                      }`}>
                        {getStatusLabel(user.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-4 justify-center items-center">
                        {/* Status Toggle (Standalone Icon - No container/radius) */}
                        <button
                          onClick={() => handleToggleActive(user.id)}
                          title={user.status === 'Suspended' ? 'Activate User' : 'Suspend User'}
                          className={`transition-colors flex items-center justify-center ${
                            user.status === 'Suspended'
                              ? 'text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300'
                              : 'text-red-500 hover:text-red-600'
                          }`}
                        >
                          {user.status === 'Suspended' ? (
                            <ToggleRight className="w-5 h-5" />
                          ) : (
                            <ToggleLeft className="w-5 h-5" />
                          )}
                        </button>
                        {/* Promote Admin (Standalone Icon - No container/radius) */}
                        <button
                          onClick={() => handlePromoteAdmin(user.id)}
                          title="Promote to Admin"
                          className="text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 transition-colors flex items-center justify-center"
                        >
                          <ShieldAlert className="w-4 h-4" />
                        </button>
                        <Link
                          href={`/admin/users/${user.id}`}
                          className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm px-3 py-1 bg-blue-500/10 rounded-lg transition-colors"
                        >
                          View
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-slate-400 dark:text-gray-500 text-sm">
                      {t('adminUsersNoMatch') || 'No users match the criteria.'}
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
