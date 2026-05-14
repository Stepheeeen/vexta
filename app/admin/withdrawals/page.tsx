'use client';

import { AdminLayout } from '@/components/admin-layout';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export default function AdminWithdrawals() {
  const withdrawals = [
    { id: 'W001', user: 'John Doe', amount: '$5,000', method: 'Bank Transfer', date: '2024-03-15', status: 'Pending', account: '****1234' },
    { id: 'W002', user: 'Jane Smith', amount: '$3,500', method: 'Crypto Wallet', date: '2024-03-15', status: 'Pending', account: '0x7f...9K2L' },
    { id: 'W003', user: 'Mike Johnson', amount: '$8,000', method: 'Bank Transfer', date: '2024-03-14', status: 'Under Review', account: '****5678' },
    { id: 'W004', user: 'Sarah Lee', amount: '$2,500', method: 'Crypto Wallet', date: '2024-03-13', status: 'Completed', account: '0x3f...4M9N' },
    { id: 'W005', user: 'Tom Brown', amount: '$6,000', method: 'Bank Transfer', date: '2024-03-12', status: 'Completed', account: '****9012' },
  ];

  const statusConfig = {
    Completed: { icon: CheckCircle2, color: 'text-[#00FF88]', bg: 'bg-[#00FF88]/10', border: 'border-[#00FF88]/30' },
    'Under Review': { icon: Clock, color: 'text-[#FFB347]', bg: 'bg-[#FFB347]/10', border: 'border-[#FFB347]/30' },
    Pending: { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/30' },
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#FFFFFF] mb-2">Withdrawal Management</h1>
        <p className="text-[#A0A0A0]">Process and manage user withdrawal requests</p>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#1A1F2E] border border-red-500/30 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#A0A0A0] text-sm font-medium mb-1">Pending</p>
              <p className="text-3xl font-bold text-red-500">$8,500</p>
            </div>
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
        </div>

        <div className="bg-[#1A1F2E] border border-[#FFB347]/30 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#A0A0A0] text-sm font-medium mb-1">Under Review</p>
              <p className="text-3xl font-bold text-[#FFB347]">$8,000</p>
            </div>
            <Clock className="w-10 h-10 text-[#FFB347]" />
          </div>
        </div>

        <div className="bg-[#1A1F2E] border border-[#00FF88]/30 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#A0A0A0] text-sm font-medium mb-1">Today Processed</p>
              <p className="text-3xl font-bold text-[#00FF88]">$8,500</p>
            </div>
            <CheckCircle2 className="w-10 h-10 text-[#00FF88]" />
          </div>
        </div>
      </div>

      {/* Withdrawals Table */}
      <div className="bg-[#1A1F2E] border border-[#2A2E3E] rounded-lg overflow-hidden">
        <div className="p-6 border-b border-[#2A2E3E]">
          <h3 className="text-lg font-bold text-[#FFFFFF]">All Withdrawal Requests</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2A2E3E] bg-[#0F1419]">
                <th className="px-6 py-4 text-left text-[#A0A0A0] font-semibold text-sm">ID</th>
                <th className="px-6 py-4 text-left text-[#A0A0A0] font-semibold text-sm">User</th>
                <th className="px-6 py-4 text-right text-[#A0A0A0] font-semibold text-sm">Amount</th>
                <th className="px-6 py-4 text-center text-[#A0A0A0] font-semibold text-sm">Method</th>
                <th className="px-6 py-4 text-left text-[#A0A0A0] font-semibold text-sm">Account</th>
                <th className="px-6 py-4 text-center text-[#A0A0A0] font-semibold text-sm">Date</th>
                <th className="px-6 py-4 text-center text-[#A0A0A0] font-semibold text-sm">Status</th>
                <th className="px-6 py-4 text-center text-[#A0A0A0] font-semibold text-sm">Action</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.map((withdrawal) => {
                const config = statusConfig[withdrawal.status as keyof typeof statusConfig];
                const StatusIcon = config?.icon;
                return (
                  <tr key={withdrawal.id} className="border-b border-[#2A2E3E] hover:bg-[#0F1419]/50 transition-colors">
                    <td className="px-6 py-4 text-[#00D9FF] font-mono text-sm">{withdrawal.id}</td>
                    <td className="px-6 py-4 text-[#FFFFFF]">{withdrawal.user}</td>
                    <td className="px-6 py-4 text-right text-[#00FF88] font-bold">{withdrawal.amount}</td>
                    <td className="px-6 py-4 text-center text-[#A0A0A0] text-sm">{withdrawal.method}</td>
                    <td className="px-6 py-4 text-[#A0A0A0] font-mono text-sm">{withdrawal.account}</td>
                    <td className="px-6 py-4 text-center text-[#A0A0A0] text-sm">{withdrawal.date}</td>
                    <td className="px-6 py-4 text-center">
                      {config && (
                        <span className={`text-xs font-bold px-3 py-1 rounded-full border flex items-center justify-center gap-1 w-fit mx-auto ${config.bg} ${config.color} ${config.border}`}>
                          <StatusIcon className="w-3 h-3" />
                          {withdrawal.status}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {withdrawal.status === 'Pending' ? (
                        <div className="flex gap-2 justify-center">
                          <button className="text-[#00FF88] hover:text-[#00E070] font-medium text-sm">
                            Approve
                          </button>
                          <button className="text-red-500 hover:text-red-400 font-medium text-sm">
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[#A0A0A0] text-sm">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
