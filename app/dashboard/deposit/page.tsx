'use client';

import { DashboardLayout } from '@/components/dashboard-layout';
import { useState } from 'react';
import { Copy, Check, Info, ShieldCheck, Zap, AlertTriangle, ArrowRight, Wallet, QrCode } from 'lucide-react';
import { useTranslation } from '@/components/translation-provider';

export default function DepositPage() {
  const { t } = useTranslation();
  const [network, setNetwork] = useState('USDT_BEP20');
  const [amount, setAmount] = useState('');
  const [txHash, setTxHash] = useState('');
  const [copied, setCopied] = useState(false);
  
  // Loading & Feedback states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const walletAddresses: Record<string, string> = {
    USDT_BEP20: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(walletAddresses[network]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleManualDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const amt = parseFloat(amount);
    if (isNaN(amt) || amt < 10) {
      setError(t('depMinAmtError'));
      return;
    }

    if (!txHash.trim()) {
      setError(t('depTxHashRequired'));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amt,
          network: network.replace('_', ' '),
          txHash: txHash.trim(),
          instant: false
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || t('failedSubmitDeposit'));
      }

      setSuccess(t('depSuccessManual'));
      setAmount('');
      setTxHash('');
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{t('depFundWallet')}</h1>
        <p className="text-slate-500 dark:text-gray-400">{t('depAddFundsSub')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main interactive form */}
        <div className="lg:col-span-2 space-y-6">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-sm flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleManualDeposit} className="bg-white dark:bg-[#0A0F14]/60 border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm space-y-6">
            {/* Step 1: Select Network */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-3">{t('depSelectNetwork')}</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'USDT_BEP20', name: 'USDT', desc: 'BEP20 (BNB Smart Chain)' }
                ].map((net) => (
                  <button
                    key={net.id}
                    type="button"
                    onClick={() => setNetwork(net.id)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      network === net.id
                        ? 'border-violet-500 bg-violet-500/5 text-slate-900 dark:text-white ring-1 ring-violet-500'
                        : 'border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10'
                    }`}
                  >
                    <p className="font-bold text-sm">{net.name}</p>
                    <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">{net.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Pay Address */}
            <div className="p-5 bg-slate-50 dark:bg-white/2 rounded-xl border border-slate-200 dark:border-white/5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                  <Wallet className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                  <span>{t('depAddressDestination')}</span>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-violet-500/10 text-violet-600 dark:text-violet-400 rounded">
                  {network.replace('_', ' ')}
                </span>
              </div>

              <div className="flex gap-2 items-center bg-white dark:bg-[#0A0F14] border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3">
                <span className="flex-1 font-mono text-xs text-slate-900 dark:text-white truncate">
                  {walletAddresses[network]}
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                  title={t('depCopyBtn')}
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-gray-400">
                <Info className="w-4 h-4 text-violet-500 shrink-0" />
                <span>{t('depSendOnlySelected')}</span>
              </div>
            </div>

            {/* Step 3: Enter Details */}
            <div className="space-y-4">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{t('depSubmitProof')}</p>
              
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-gray-400 mb-2">{t('depAmountUsd')}</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  placeholder={t('depAmountUsdPlaceholder')}
                  className="w-full bg-slate-50 dark:bg-white/2 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-violet-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-gray-400 mb-2">{t('depTxHashLabel')}</label>
                <input
                  type="text"
                  value={txHash}
                  onChange={(e) => setTxHash(e.target.value)}
                  required
                  placeholder={t('depTxHashPlaceholder')}
                  className="w-full bg-slate-50 dark:bg-white/2 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-violet-500 font-mono text-sm"
                />
                <p className="text-[10px] text-slate-500 dark:text-gray-400 mt-2">{t('depTxHashExample')}</p>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-violet-600 hover:bg-violet-750 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
            >
              {loading ? t('depSubmitting') : t('depSubmitBtn')}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Sidebar Info/QR Block */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0A0F14]/60 border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
              <QrCode className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              <span>{t('depScanQr')}</span>
            </div>
            
            <div className="w-48 h-48 bg-white border border-slate-200 rounded-xl p-2 flex items-center justify-center shadow-inner">
              {/* Generated simulated QR Code placeholder with visual layout */}
              <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center p-4 rounded-lg text-slate-400">
                <span className="font-bold text-xs uppercase text-violet-600 mb-1">{network.replace('_', ' ')}</span>
                <span className="text-[9px] break-all leading-tight max-w-[150px] font-mono select-all">
                  {walletAddresses[network].slice(0, 10)}...{walletAddresses[network].slice(-10)}
                </span>
                <div className="w-24 h-24 mt-2 border-2 border-dashed border-slate-300 flex items-center justify-center text-[10px] text-slate-400">
                  {t('depScanQrReady')}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0A0F14]/60 border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t('depTimeline')}</h3>
            
            <div className="space-y-4 text-xs">
              <div className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold shrink-0">1</div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{t('depTimelineStep1')}</p>
                  <p className="text-slate-500 dark:text-gray-400">{t('depTimelineStep1Desc')}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold shrink-0">2</div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{t('depTimelineStep2')}</p>
                  <p className="text-slate-500 dark:text-gray-400">{t('depTimelineStep2Desc')}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold shrink-0">3</div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{t('depTimelineStep3')}</p>
                  <p className="text-slate-500 dark:text-gray-400">{t('depTimelineStep3Desc')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
