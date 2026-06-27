'use client';

import { useEffect, useState, useCallback } from 'react';
import { AdminLayout } from '@/components/admin-layout';
import {
  FileDown, Play, ShieldCheck, AlertTriangle, Clock, CheckCircle2,
  Loader2, RefreshCw, Download, Send, Eye, EyeOff, History, Copy, Check
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// ─── Types ────────────────────────────────────────────────────────────────────

interface WithdrawalPreview {
  id:            string;
  userName:      string;
  email:         string;
  walletAddress: string;
  amount:        number;
}

interface BatchPreviewData {
  pendingCount: number;
  totalAmount:  number;
  withdrawals:  WithdrawalPreview[];
  history:      BatchHistoryEntry[];
}

interface GeneratedBatch {
  runId:          string;
  totalAmount:    number;
  withdrawalCount: number;
  csvData:        string;
  withdrawals:    WithdrawalPreview[];
}

interface BatchHistoryEntry {
  id:             string;
  generatedAt:    string;
  totalAmount:    number;
  withdrawalCount: number;
  status:         string;
  executedAt:     string | null;
}

// ─── Component ────────────────────────────────────────────────────────────────

type Stage = 'preview' | 'generated' | 'otp' | 'executed';

export default function BatchPayoutPage() {
  const { toast } = useToast();

  const [stage, setStage]             = useState<Stage>('preview');
  const [preview, setPreview]         = useState<BatchPreviewData | null>(null);
  const [batch, setBatch]             = useState<GeneratedBatch | null>(null);
  const [otpCode, setOtpCode]         = useState('');
  const [showOtp, setShowOtp]         = useState(false);
  const [loading, setLoading]         = useState(false);
  const [sendingOtp, setSendingOtp]   = useState(false);
  const [previewLoading, setPreviewLoading] = useState(true);
  const [copiedId, setCopiedId]       = useState<string | null>(null);

  const handleCopy = (address: string, id: string) => {
    navigator.clipboard.writeText(address);
    setCopiedId(id);
    toast({
      title: 'Copied!',
      description: 'Address copied to clipboard.',
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  // ─── Load preview data ───────────────────────────────────────────────────

  const loadPreview = useCallback(async () => {
    setPreviewLoading(true);
    try {
      const res  = await fetch('/api/admin/batch-payout');
      const data = await res.json();
      if (res.ok) setPreview(data);
    } catch (err) {
      console.error('[BatchPayout] Failed to load preview:', err);
    } finally {
      setPreviewLoading(false);
    }
  }, []);

  useEffect(() => { loadPreview(); }, [loadPreview]);

  // ─── Step 1: Generate CSV export ────────────────────────────────────────

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res  = await fetch('/api/admin/batch-payout', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ action: 'generate' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate batch');

      setBatch(data);
      setStage('generated');
      toast({ title: 'Batch Report Generated', description: `$${data.totalAmount.toFixed(2)} USDT across ${data.withdrawalCount} withdrawals.` });
    } catch (err: any) {
      toast({ title: 'Generation Failed', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // ─── Step 2: Download CSV ────────────────────────────────────────────────

  const handleDownloadCSV = () => {
    if (!batch) return;
    const blob = new Blob([batch.csvData], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `vexta-batch-payout-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ─── Step 3: Send OTP ───────────────────────────────────────────────────

  const handleSendOtp = async () => {
    setSendingOtp(true);
    try {
      const res  = await fetch('/api/admin/batch-payout/send-otp', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
      setStage('otp');
      toast({ title: 'OTP Sent', description: data.message });
    } catch (err: any) {
      toast({ title: 'OTP Send Failed', description: err.message, variant: 'destructive' });
    } finally {
      setSendingOtp(false);
    }
  };

  // ─── Step 4: Execute batch with OTP ─────────────────────────────────────

  const handleExecute = async () => {
    if (!batch || otpCode.length !== 6) return;
    setLoading(true);
    try {
      const res  = await fetch('/api/admin/batch-payout', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ action: 'execute', runId: batch.runId, otpCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Execution failed');

      setStage('executed');
      toast({ title: '✅ Batch Executed', description: `${data.approvedCount} withdrawals approved.` });
      await loadPreview();
    } catch (err: any) {
      toast({ title: 'Execution Failed', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const statusColor: Record<string, string> = {
    generated: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    funded:    'text-blue-400 bg-blue-500/10 border-blue-500/20',
    executed:  'text-violet-400 bg-violet-500/10 border-violet-500/20',
    completed: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  };

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-extrabold text-amber-500 uppercase tracking-[0.2em] mb-1">Admin — Financial Operations</p>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Friday Batch Payout</h1>
        <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
          Weekly USDT BEP-20 mass withdrawal distribution via Plisio gateway
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
        {[
          { key: 'preview',   label: '1. Preview',  icon: Eye },
          { key: 'generated', label: '2. Generated', icon: FileDown },
          { key: 'otp',       label: '3. Authorize', icon: ShieldCheck },
          { key: 'executed',  label: '4. Executed',  icon: CheckCircle2 },
        ].map(({ key, label, icon: Icon }, i) => {
          const stages = ['preview', 'generated', 'otp', 'executed'];
          const active  = stages.indexOf(stage) >= i;
          return (
            <div key={key} className="flex items-center gap-2 flex-shrink-0">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                active
                  ? 'bg-violet-600 text-white border-violet-500'
                  : 'bg-white dark:bg-white/5 text-slate-400 border-slate-200 dark:border-white/10'
              }`}>
                <Icon className="w-3.5 h-3.5" />
                {label}
              </div>
              {i < 3 && <div className="w-6 h-px bg-slate-200 dark:bg-white/10" />}
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">

          {/* Preview card */}
          {previewLoading ? (
            <div className="bg-white dark:bg-[#0A0F14]/60 border border-slate-200 dark:border-white/5 rounded-2xl p-12 flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
            </div>
          ) : (
            <div className="bg-white dark:bg-[#0A0F14]/60 border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Eye className="w-4 h-4 text-violet-500" />
                  Pending Withdrawal Queue
                </h2>
                <button
                  onClick={loadPreview}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 transition-colors"
                  title="Refresh"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              {/* Total banner */}
              <div className="p-5 bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 rounded-2xl mb-6">
                <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-1">
                  Total USDT Required
                </p>
                <p className="text-3xl font-black text-slate-900 dark:text-white font-mono">
                  ${(preview?.totalAmount ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} USDT
                </p>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                  {preview?.pendingCount ?? 0} withdrawal request(s) pending
                </p>
              </div>

              {/* Withdrawals table */}
              {(preview?.withdrawals?.length ?? 0) > 0 ? (
                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-white/5">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 dark:bg-white/2">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase">User</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase">Wallet</th>
                        <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                      {(batch?.withdrawals ?? preview?.withdrawals ?? []).map((w) => (
                        <tr key={w.id} className="hover:bg-slate-50 dark:hover:bg-white/2 transition-colors">
                          <td className="px-4 py-3">
                            <p className="font-semibold text-slate-900 dark:text-white text-xs">{w.userName}</p>
                            <p className="text-slate-400 dark:text-zinc-500 text-[10px]">{w.email}</p>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[10px] text-slate-400 dark:text-zinc-400 max-w-[120px] truncate" title={w.walletAddress}>
                                {w.walletAddress}
                              </span>
                              {w.walletAddress && (
                                <button
                                  onClick={() => handleCopy(w.walletAddress, w.id)}
                                  className="p-1 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-gray-400 rounded-md transition-colors cursor-pointer shrink-0"
                                  title="Copy Wallet Address"
                                >
                                  {copiedId === w.id ? (
                                    <Check className="w-3 h-3 text-emerald-500" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400 font-mono text-xs">
                            ${w.amount.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400 dark:text-zinc-500 text-sm">
                  No pending withdrawal requests.
                </div>
              )}
            </div>
          )}

          {/* Stage-specific action panels */}
          {stage === 'preview' && (preview?.pendingCount ?? 0) > 0 && (
            <div className="bg-white dark:bg-[#0A0F14]/60 border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <FileDown className="w-4 h-4 text-violet-500" />
                Step 1 — Generate Batch Report
              </h2>
              <p className="text-sm text-slate-500 dark:text-zinc-400 mb-6">
                Lock the current pending queue and generate the Plisio-compatible CSV export. The report will be stored in the system audit log.
              </p>
              <button
                id="btn-generate-batch"
                onClick={handleGenerate}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-violet-600/20 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
                {loading ? 'Generating...' : 'Generate Batch Report'}
              </button>
            </div>
          )}

          {stage === 'generated' && batch && (
            <div className="bg-white dark:bg-[#0A0F14]/60 border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm space-y-6">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileDown className="w-4 h-4 text-emerald-500" />
                Step 2 — Download & Fund Plisio Wallet
              </h2>

              {/* CSV download */}
              <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">CSV Export Ready</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                    vexta-batch-payout-{new Date().toISOString().split('T')[0]}.csv
                  </p>
                </div>
                <button
                  id="btn-download-csv"
                  onClick={handleDownloadCSV}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download CSV
                </button>
              </div>

              {/* Funding instruction */}
              <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  <p className="text-xs font-bold text-amber-600 dark:text-amber-400">Manual Funding Required</p>
                </div>
                <ol className="text-xs text-slate-600 dark:text-zinc-300 space-y-1.5 ml-6 list-decimal">
                  <li>Log in to your <strong>Plisio dashboard</strong>.</li>
                  <li>Navigate to <strong>Mass Payments → Fund Wallet</strong>.</li>
                  <li>
                    Transfer exactly{' '}
                    <span className="font-black text-amber-500 font-mono">
                      ${batch.totalAmount.toFixed(2)} USDT
                    </span>{' '}
                    (BEP-20) from the master wallet.
                  </li>
                  <li>Upload the downloaded CSV to Plisio's mass payment interface.</li>
                  <li>Return here and click <strong>Send OTP</strong> to authorize execution.</li>
                </ol>
              </div>

              <button
                id="btn-send-otp"
                onClick={handleSendOtp}
                disabled={sendingOtp}
                className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-amber-500/20 disabled:opacity-50"
              >
                {sendingOtp ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {sendingOtp ? 'Sending OTP...' : 'Send Authorization OTP to My Email'}
              </button>
            </div>
          )}

          {stage === 'otp' && batch && (
            <div className="bg-white dark:bg-[#0A0F14]/60 border border-red-500/20 rounded-2xl p-6 shadow-sm space-y-6">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-red-500" />
                Step 3 — Enter Authorization Code
              </h2>

              <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-red-500">IRREVERSIBLE ACTION</p>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                    Executing this batch will approve <strong>{batch.withdrawalCount} withdrawal(s)</strong> totalling{' '}
                    <strong className="text-red-400">${batch.totalAmount.toFixed(2)} USDT</strong>.
                    Ensure Plisio has been funded before proceeding.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                  6-Digit Email OTP
                </label>
                <div className="relative max-w-xs">
                  <input
                    id="input-otp-code"
                    type={showOtp ? 'text' : 'password'}
                    value={otpCode}
                    onChange={e => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-center font-mono text-xl font-bold tracking-[0.5em] text-slate-900 dark:text-white focus:outline-none focus:border-violet-500 transition-all"
                  />
                  <button
                    onClick={() => setShowOtp(v => !v)}
                    className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
                  >
                    {showOtp ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5">Check your admin email for the 6-digit code (valid 15 min).</p>
              </div>

              <div className="flex gap-3">
                <button
                  id="btn-execute-batch"
                  onClick={handleExecute}
                  disabled={loading || otpCode.length !== 6}
                  className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-red-600/20 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  {loading ? 'Executing...' : 'Execute Batch Payout'}
                </button>
                <button
                  onClick={handleSendOtp}
                  disabled={sendingOtp}
                  className="flex items-center gap-2 px-4 py-3 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
                >
                  <RefreshCw className="w-4 h-4" />
                  Resend OTP
                </button>
              </div>
            </div>
          )}

          {stage === 'executed' && (
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-8 text-center space-y-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h2 className="text-lg font-bold text-emerald-600 dark:text-emerald-400">Batch Payout Executed</h2>
              <p className="text-sm text-slate-500 dark:text-zinc-400">
                All pending withdrawals have been approved and linked to this batch run.
                The Plisio gateway should now distribute the funds automatically.
              </p>
              <button
                onClick={() => { setStage('preview'); setBatch(null); setOtpCode(''); loadPreview(); }}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-all"
              >
                Start New Batch
              </button>
            </div>
          )}
        </div>

        {/* Sidebar — Audit History */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0A0F14]/60 border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <History className="w-4 h-4 text-violet-500" />
              Batch History
            </h2>

            {(preview?.history?.length ?? 0) === 0 ? (
              <p className="text-xs text-slate-400 dark:text-zinc-500 text-center py-6">No batch runs yet.</p>
            ) : (
              <div className="space-y-3">
                {preview?.history?.map(h => (
                  <div key={h.id} className="p-3 bg-slate-50 dark:bg-white/2 border border-slate-200 dark:border-white/5 rounded-xl">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColor[h.status] ?? 'text-slate-400 bg-slate-100 border-slate-200'}`}>
                        {h.status.toUpperCase()}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(h.generatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                      ${h.totalAmount.toFixed(2)} USDT
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {h.withdrawalCount} withdrawal(s)
                      {h.executedAt ? ` · Executed ${new Date(h.executedAt).toLocaleDateString()}` : ''}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Instructions card */}
          <div className="bg-white dark:bg-[#0A0F14]/60 border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              Friday Process
            </h2>
            <ol className="text-xs text-slate-500 dark:text-zinc-400 space-y-2 list-decimal list-inside">
              <li>Friday: withdrawal window closes.</li>
              <li>Generate the batch report here.</li>
              <li>Download the Plisio CSV file.</li>
              <li>Fund Plisio wallet with exact USDT amount.</li>
              <li>Upload CSV to Plisio mass payment tool.</li>
              <li>Return here, request OTP, execute batch.</li>
              <li>Plisio distributes to all wallet addresses.</li>
              <li>Gateway balance returns to $0.</li>
            </ol>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
