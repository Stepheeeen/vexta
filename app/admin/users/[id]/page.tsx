'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AdminLayout } from '@/components/admin-layout';
import { Loader2, ArrowLeft, ShieldAlert, Ban, RefreshCw, Edit, Unlock, Lock, ShieldCheck, KeyRound } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/components/translation-provider';

export default function AdminUserDetails() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useTranslation();
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newEmail, setNewEmail] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [unlockType, setUnlockType] = useState('none');
  const [unlockAmount, setUnlockAmount] = useState(0);

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

  useEffect(() => {
    if (data?.user) {
      setNewEmail(data.user.email || '');
      setUnlockType(data.user.withdrawalUnlockType || 'none');
      setUnlockAmount(data.user.withdrawalUnlockAmount || 0);
    }
  }, [data]);

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;
    await handleAction('change-email', newEmail.trim(), `${t('adminUserDetailChangeEmailReason') || 'Reason for email modification:'}`);
  };

  const handleSetTempPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempPassword.trim()) {
      toast({ title: t('adminAlertError') || 'Error', description: 'Password cannot be empty', variant: 'destructive' });
      return;
    }
    if (tempPassword.length < 6) {
      toast({ title: t('adminAlertError') || 'Error', description: 'Password must be at least 6 characters', variant: 'destructive' });
      return;
    }
    await handleAction('set-temp-password', tempPassword, `${t('adminUserDetailSetTempPasswordReason') || 'Reason for setting temporary password:'}`);
    setTempPassword('');
  };

  const handleSaveWithdrawalUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleAction('set-withdrawal-unlock', { type: unlockType, amount: Number(unlockAmount) }, `${t('adminUserDetailSaveOverrideReason') || 'Reason for updating withdrawal unlock override:'}`);
  };

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
      
      toast({ title: t('adminAlertSuccess') || 'Success', description: t('adminActionSuccess') || 'Action completed successfully' });
      fetchUser();
    } catch (err: any) {
      toast({ title: t('adminAlertError') || 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleAdjustBalance = () => {
    const newBalance = prompt(`${t('adminUserDetailAdjustBalancePrompt') || 'Enter new balance'} (Current: $${data?.user?.balance}):`);
    if (newBalance === null) return;
    
    const parsed = parseFloat(newBalance);
    if (isNaN(parsed)) {
      toast({ title: t('adminAlertError') || 'Error', description: 'Invalid number format', variant: 'destructive' });
      return;
    }
    
    handleAction('adjust-balance', parsed, `${t('adminUserDetailAdjustBalanceReason') || 'Reason for balance adjustment:'}`);
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
          <p className="text-slate-500 dark:text-gray-400 text-sm">{user.email} • {t('adminColJoined') || 'Joined'} {new Date(user.joinedAt).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Capital Control Panel */}
        <div className="bg-white dark:bg-[#0A0F14]/60 border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm flex flex-col col-span-2">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">{t('adminUserDetailCapitalControl') || 'Capital Control'}</h3>
          
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-500 dark:text-gray-400">{t('adminUserDetailPersonalDeposited') || 'Personal Deposited Capital'}</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">${user.totalPersonalDeposits.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-gray-400">{t('adminUserDetailCompanyProvided') || 'Company Provided Capital'}</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">${user.sponsoredGiftedAmount.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-gray-400">{t('adminUserDetailTotalOperational') || 'Total Operational Capital'}</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">${user.operationalCapital.toFixed(2)}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-500 dark:text-gray-400">{t('adminUserDetailAvailableBalance') || 'Available Balance'}</p>
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">${user.balance.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-gray-400">{t('adminUserDetailAccumulatedProfits') || 'Accumulated Profits (Total Earned)'}</p>
                <p className="text-xl font-bold text-violet-600 dark:text-violet-400">${user.totalEarned.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-gray-400">{t('adminUserDetailTotalWithdrawn') || 'Total Withdrawn Profits'}</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">${user.totalWithdrawn.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Administrative Actions */}
        <div className="bg-white dark:bg-[#0A0F14]/60 border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">{t('adminUserDetailAdminActions') || 'Administrative Actions'}</h3>
          
          <div className="flex flex-col gap-3 overflow-y-auto max-h-[300px] pr-1">
            {/* Toggle Status (Active / Suspended) */}
            <button
              onClick={() => handleAction('toggle-status', null, `${t('adminUserDetailToggleStatusReason') || 'Reason for toggling account active status:'}`)}
              className={`flex items-center gap-3 w-full p-3 rounded-xl border text-sm font-medium transition-colors ${
                user.isActive 
                ? 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-500/20' 
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
              }`}
            >
              <Ban className="w-4 h-4" />
              {user.isActive ? (t('adminUserDetailSuspend') || 'Suspend Account') : (t('adminUserDetailActivate') || 'Activate Account')}
            </button>

            {/* Toggle Verification (Verified / Unverified) */}
            <button
              onClick={() => handleAction('toggle-verified', null, `${t('adminUserDetailToggleVerifiedReason') || 'Reason for changing verification status:'}`)}
              className={`flex items-center gap-3 w-full p-3 rounded-xl border text-sm font-medium transition-colors ${
                user.isVerified 
                ? 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20' 
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              {user.isVerified ? (t('adminUserDetailUnverify') || 'Mark as Unverified') : (t('adminUserDetailVerify') || 'Manually Verify Account')}
            </button>

            {/* Toggle Freeze Funds */}
            <button
              onClick={() => handleAction('toggle-freeze-funds', null, `${t('adminUserDetailToggleFreezeReason') || 'Reason for freezing/unfreezing funds:'}`)}
              className={`flex items-center gap-3 w-full p-3 rounded-xl border text-sm font-medium transition-colors ${
                user.fundsFrozen 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20' 
                : 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-500/20'
              }`}
            >
              {user.fundsFrozen ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              {user.fundsFrozen ? (t('adminUserDetailUnfreezeFunds') || 'Unfreeze Funds') : (t('adminUserDetailFreezeFunds') || 'Freeze Funds')}
            </button>

            {/* Block/Unblock Withdrawals */}
            <button
              onClick={() => handleAction('toggle-withdrawals', null, `${t('adminUserDetailToggleWithdrawalsReason') || 'Reason for blocking/unblocking withdrawals:'}`)}
              className={`flex items-center gap-3 w-full p-3 rounded-xl border text-sm font-medium transition-colors ${
                user.withdrawalsBlocked 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20' 
                : 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-500/20'
              }`}
            >
              {user.withdrawalsBlocked ? <Unlock className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
              {user.withdrawalsBlocked ? (t('adminUserDetailUnblockWithdrawals') || 'Unblock Withdrawals') : (t('adminUserDetailBlockWithdrawals') || 'Block Withdrawals')}
            </button>

            <button
              onClick={handleAdjustBalance}
              className="flex items-center gap-3 w-full p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-gray-300 text-sm font-medium transition-colors"
            >
              <Edit className="w-4 h-4" />
              {t('adminUserDetailAdjustBalance') || 'Adjust Balance Manually'}
            </button>

            <button
              onClick={() => {
                if (confirm('Are you sure you want to reset all historical profits to 0 for this user?')) {
                  handleAction('reset-profits', null, `${t('adminUserDetailResetProfitsReason') || 'Reason for manual profit reset:'}`);
                }
              }}
              className="flex items-center gap-3 w-full p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-gray-300 text-sm font-medium transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              {t('adminUserDetailResetProfits') || 'Reset Accumulated Profits'}
            </button>

            {user.isSponsored && (
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to manually release this support account?')) {
                    handleAction('release-support', null, `${t('adminUserDetailReleaseSupportReason') || 'Reason for releasing support account:'}`);
                  }
                }}
                className="flex items-center gap-3 w-full p-3 rounded-xl border border-violet-500/20 bg-violet-500/10 text-violet-600 dark:text-violet-400 hover:bg-violet-500/20 text-sm font-medium transition-colors"
              >
                <ShieldAlert className="w-4 h-4" />
                {t('adminUserDetailReleaseSupport') || 'Release Support Account'}
              </button>
            )}

            {user.hasCompletedPromo && (
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to reactivate the promotional package for this user? This resets the business days and total earned on their promotional investment and increments operational capital.')) {
                    handleAction('reactivate-promotion', null, `${t('adminUserDetailReactivatePromoReason') || 'Reason for reactivating promotional investment:'}`);
                  }
                }}
                className="flex items-center gap-3 w-full p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 text-sm font-medium transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                {t('adminUserDetailReactivatePromo') || 'Reactivate Completed Promotion'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Account Settings, Withdrawal Unlock, and Security Status */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Account Settings */}
        <div className="bg-white dark:bg-[#0A0F14]/60 border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 font-semibold">{t('adminUserDetailAccountControls') || 'Account Controls'}</h3>
          
          <form onSubmit={handleChangeEmail} className="space-y-4 mb-6 pb-6 border-b border-slate-200 dark:border-white/5">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-2">{t('adminUserDetailChangeEmail') || 'Change Email Address'}</label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
                className="w-full bg-slate-50 dark:bg-white/2 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-violet-500 text-sm"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-violet-655 hover:bg-violet-700 text-white font-bold rounded-xl text-xs transition cursor-pointer"
            >
              {t('adminUserDetailUpdateEmail') || 'Update Email Address'}
            </button>
          </form>

          <form onSubmit={handleSetTempPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-2">{t('adminUserDetailSetTempPassword') || 'Set Temporary Password'}</label>
              <input
                type="text"
                value={tempPassword}
                onChange={(e) => setTempPassword(e.target.value)}
                placeholder="Enter temporary password..."
                required
                className="w-full bg-slate-50 dark:bg-white/2 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-violet-500 text-sm"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-violet-655 hover:bg-violet-750 text-white font-bold rounded-xl text-xs transition cursor-pointer"
            >
              {t('adminUserDetailSetTempPassword') || 'Set Temporary Password'}
            </button>
          </form>
        </div>

        {/* Withdrawal Unlock Override */}
        <div className="bg-white dark:bg-[#0A0F14]/60 border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 font-semibold">{t('adminUserDetailUnlockOverrides') || 'Withdrawal Unlock Overrides'}</h3>
          
          <form onSubmit={handleSaveWithdrawalUnlock} className="space-y-4 flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-2">{t('adminUserDetailOverrideMode') || 'Override Mode'}</label>
                <select
                  value={unlockType}
                  onChange={(e) => setUnlockType(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-white/2 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-2.5 text-slate-750 dark:text-gray-300 focus:outline-none focus:border-violet-500 text-sm"
                >
                  <option value="none">{t('adminUserDetailKeepStandard') || 'Keep Standard Rules'}</option>
                  <option value="amount">{t('adminUserDetailUnlockCustom') || 'Unlock Custom Amount (One-time)'}</option>
                  <option value="full">{t('adminUserDetailUnlockFull') || 'Unlock Full Balance (One-time)'}</option>
                  <option value="permanent">{t('adminUserDetailUnlockPermanent') || 'Unlock Permanently'}</option>
                </select>
              </div>

              {unlockType === 'amount' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-2">{t('adminUserDetailOverrideAmount') || 'Override Unlock Amount (USDT)'}</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={unlockAmount}
                    onChange={(e) => setUnlockAmount(Number(e.target.value))}
                    required
                    className="w-full bg-slate-50 dark:bg-white/2 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-violet-500 text-sm"
                  />
                  <p className="text-[10px] text-slate-400 dark:text-gray-500 mt-1">This specific amount is unlocked for passive withdrawals. Resets to 0 and type to none once used.</p>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-violet-655 hover:bg-violet-750 text-white font-bold rounded-xl text-sm transition cursor-pointer mt-6"
            >
              {t('adminUserDetailSaveOverride') || 'Save Unlock Override'}
            </button>
          </form>
        </div>

        {/* Security & Lockout Status */}
        <div className="bg-white dark:bg-[#0A0F14]/60 border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 font-semibold">{t('adminUserDetailSecurityStatus') || 'Security & Lockout Status'}</h3>
          
          <div className="space-y-4 flex-1 flex flex-col justify-between">
            <div className="space-y-3.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 dark:text-gray-400 font-medium">{t('adminUserDetailVerified') || 'Email Verified'}</span>
                <span className={`font-bold px-2 py-0.5 rounded-full text-xs border ${user.isVerified ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'}`}>
                  {user.isVerified ? (t('adminStatusActive') || 'Verified') : (t('adminStatusPending') || 'Unverified')}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 dark:text-gray-400 font-medium">{t('adminUserDetailAccess') || 'Account Status'}</span>
                <span className={`font-bold px-2 py-0.5 rounded-full text-xs border ${user.isActive ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                  {user.isActive ? (t('adminStatusActive') || 'Active') : (t('adminStatusSuspended') || 'Suspended')}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 dark:text-gray-400 font-medium">{t('adminUserDetailFreezeStatus') || 'Funds Status'}</span>
                <span className={`font-bold px-2 py-0.5 rounded-full text-xs border ${user.fundsFrozen ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'}`}>
                  {user.fundsFrozen ? (t('adminUserDetailFrozen') || 'Frozen') : (t('adminUserDetailNormal') || 'Normal')}
                </span>
              </div>
              <div className="border-t border-slate-100 dark:border-white/5 my-2" />
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-1">{t('adminUserDetailOtpAttempts') || 'OTP Failed Attempts'}</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{user.otpAttempts} / 5</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-1">{t('adminUserDetailOtpLockout') || 'OTP Lockout Status'}</p>
                {user.otpLockedUntil ? (
                  <p className="text-sm font-bold text-red-500 leading-tight">
                    {t('adminUserDetailLockedUntil') || 'Locked until'}: {new Date(user.otpLockedUntil).toLocaleString()}
                  </p>
                ) : (
                  <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{t('adminUserDetailNoLock') || 'No active lockout'}</p>
                )}
              </div>
            </div>
            
            {(user.otpAttempts > 0 || user.otpLockedUntil) && (
              <button
                onClick={() => handleAction('reset-otp-lock', null, `${t('adminUserDetailResetOtpReason') || 'Reason for resetting OTP lock:'}`)}
                className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition cursor-pointer mt-4"
              >
                {t('adminUserDetailResetOtp') || 'Reset OTP Lockout'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Network Visibility */}
      <div className="bg-white dark:bg-[#0A0F14]/60 border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm mb-8">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">{t('adminUserDetailNetworkVisibility') || 'Network Visibility'}</h3>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-4 bg-slate-50 dark:bg-white/2 rounded-xl border border-slate-100 dark:border-white/5">
            <p className="text-sm text-slate-500 dark:text-gray-400 mb-1">{t('adminUserDetailDirectReferrals') || 'Direct Referrals'}</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{networkStats.directReferralsCount}</p>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-white/2 rounded-xl border border-slate-100 dark:border-white/5">
            <p className="text-sm text-slate-500 dark:text-gray-400 mb-1">{t('adminUserDetailNetworkSize') || 'Total Network Size'}</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{networkStats.totalNetworkSize}</p>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-white/2 rounded-xl border border-slate-100 dark:border-white/5">
            <p className="text-sm text-slate-500 dark:text-gray-400 mb-1">{t('adminUserDetailNetworkVolume') || 'Total Network Volume'}</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">${networkStats.totalNetworkVolume.toFixed(2)}</p>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-white/2 rounded-xl border border-slate-100 dark:border-white/5">
            <p className="text-sm text-slate-500 dark:text-gray-400 mb-1">{t('adminUserDetailNetworkProfits') || 'Total Network Profits'}</p>
            <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">${networkStats.totalNetworkProfits.toFixed(2)}</p>
          </div>
        </div>
      </div>

    </AdminLayout>
  );
}
