'use client';

import { AdminLayout } from '@/components/admin-layout';
import { Search, Filter } from 'lucide-react';
import { useState } from 'react';

export default function AdminTransactions() {
  const [searchTerm, setSearchTerm] = useState('');

  const transactions = [
    { id: 'TXN001', user: 'Alice Johnson', type: 'Deposit', amount: '$5,000', status: 'Completed', date: '2024-03-15', method: 'Bank Transfer' },
    { id: 'TXN002', user: 'Bob Smith', type: 'Arbitrage', amount: '+$245.30', status: 'Completed', date: '2024-03-15', method: 'Auto Trade' },
    { id: 'TXN003', user: 'Carol Davis', type: 'Withdrawal', amount: '-$2,000', status: 'Pending', date: '2024-03-15', method: 'Bank Transfer' },
    { id: 'TXN004', user: 'David Wilson', type: 'Deposit', amount: '$10,000', status: 'Completed', date: '2024-03-14', method: 'Crypto' },
    { id: 'TXN005', user: 'Eve Martinez', type: 'Referral', amount: '+$125.00', status: 'Completed', date: '2024-03-14', method: 'Auto Credit' },
  ];

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#FFFFFF] mb-2">Transaction Management</h1>
        <p className="text-[#A0A0A0]">View and manage all platform transactions</p>
      </div>

      {/* Search and Filter */}
      <div className="bg-[#1A1F2E] border border-[#2A2E3E] rounded-lg p-6 mb-8">
        <div className="flex items-center gap-2 bg-[#0F1419] border border-[#2A2E3E] rounded-lg px-4 py-3 mb-4">
          <Search className="w-5 h-5 text-[#A0A0A0]" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-[#0F1419] text-[#FFFFFF] placeholder-[#606060] focus:outline-none"
          />
        </div>

        <div className="flex gap-4">
          <select className="px-4 py-2 bg-[#0F1419] border border-[#2A2E3E] rounded-lg text-[#A0A0A0] focus:outline-none focus:border-[#00D9FF]">
            <option>All Types</option>
            <option>Deposit</option>
            <option>Withdrawal</option>
            <option>Arbitrage</option>
            <option>Referral</option>
          </select>
          <select className="px-4 py-2 bg-[#0F1419] border border-[#2A2E3E] rounded-lg text-[#A0A0A0] focus:outline-none focus:border-[#00D9FF]">
            <option>All Status</option>
            <option>Completed</option>
            <option>Pending</option>
            <option>Failed</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-[#1A1F2E] border border-[#2A2E3E] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2A2E3E] bg-[#0F1419]">
                <th className="px-6 py-4 text-left text-[#A0A0A0] font-semibold text-sm">TXN ID</th>
                <th className="px-6 py-4 text-left text-[#A0A0A0] font-semibold text-sm">User</th>
                <th className="px-6 py-4 text-left text-[#A0A0A0] font-semibold text-sm">Type</th>
                <th className="px-6 py-4 text-right text-[#A0A0A0] font-semibold text-sm">Amount</th>
                <th className="px-6 py-4 text-center text-[#A0A0A0] font-semibold text-sm">Method</th>
                <th className="px-6 py-4 text-center text-[#A0A0A0] font-semibold text-sm">Status</th>
                <th className="px-6 py-4 text-center text-[#A0A0A0] font-semibold text-sm">Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} className="border-b border-[#2A2E3E] hover:bg-[#0F1419]/50 transition-colors">
                  <td className="px-6 py-4 text-[#00D9FF] font-mono text-sm">{tx.id}</td>
                  <td className="px-6 py-4 text-[#FFFFFF]">{tx.user}</td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#00D9FF]/10 text-[#00D9FF] border border-[#00D9FF]/30">
                      {tx.type}
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-right font-bold ${
                    tx.amount.startsWith('+') ? 'text-[#00FF88]' : tx.amount.startsWith('-') ? 'text-red-500' : 'text-[#FFFFFF]'
                  }`}>
                    {tx.amount}
                  </td>
                  <td className="px-6 py-4 text-center text-[#A0A0A0] text-sm">{tx.method}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                      tx.status === 'Completed'
                        ? 'bg-[#00FF88]/10 text-[#00FF88] border-[#00FF88]/30'
                        : 'bg-[#FFB347]/10 text-[#FFB347] border-[#FFB347]/30'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-[#A0A0A0] text-sm">{tx.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
