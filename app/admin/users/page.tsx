'use client';

import { AdminLayout } from '@/components/admin-layout';
import { Search, MoreVertical } from 'lucide-react';
import { useState } from 'react';

export default function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState('');

  const users = [
    { id: '001', name: 'Alice Johnson', email: 'alice@example.com', joined: '2024-01-15', status: 'Active', balance: '$12,450', referrals: 8 },
    { id: '002', name: 'Bob Smith', email: 'bob@example.com', joined: '2024-02-03', status: 'Active', balance: '$8,230', referrals: 5 },
    { id: '003', name: 'Carol Davis', email: 'carol@example.com', joined: '2024-01-28', status: 'Pending', balance: '$0', referrals: 0 },
    { id: '004', name: 'David Wilson', email: 'david@example.com', joined: '2024-03-01', status: 'Suspended', balance: '$0', referrals: 0 },
    { id: '005', name: 'Eve Martinez', email: 'eve@example.com', joined: '2024-02-15', status: 'Active', balance: '$15,680', referrals: 12 },
  ];

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#FFFFFF] mb-2">User Management</h1>
        <p className="text-[#A0A0A0]">Manage platform users and accounts</p>
      </div>

      {/* Search and Filter */}
      <div className="bg-[#1A1F2E] border border-[#2A2E3E] rounded-lg p-6 mb-8">
        <div className="flex items-center gap-2 bg-[#0F1419] border border-[#2A2E3E] rounded-lg px-4 py-3">
          <Search className="w-5 h-5 text-[#A0A0A0]" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-[#0F1419] text-[#FFFFFF] placeholder-[#606060] focus:outline-none"
          />
        </div>

        <div className="flex gap-4 mt-4">
          {['All', 'Active', 'Pending', 'Suspended'].map((filter) => (
            <button
              key={filter}
              className="px-4 py-2 rounded-lg border border-[#2A2E3E] text-[#A0A0A0] hover:border-[#00D9FF] hover:text-[#00D9FF] transition-colors"
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#1A1F2E] border border-[#2A2E3E] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2A2E3E] bg-[#0F1419]">
                <th className="px-6 py-4 text-left text-[#A0A0A0] font-semibold text-sm">ID</th>
                <th className="px-6 py-4 text-left text-[#A0A0A0] font-semibold text-sm">Name</th>
                <th className="px-6 py-4 text-left text-[#A0A0A0] font-semibold text-sm">Email</th>
                <th className="px-6 py-4 text-center text-[#A0A0A0] font-semibold text-sm">Joined</th>
                <th className="px-6 py-4 text-right text-[#A0A0A0] font-semibold text-sm">Balance</th>
                <th className="px-6 py-4 text-center text-[#A0A0A0] font-semibold text-sm">Referrals</th>
                <th className="px-6 py-4 text-center text-[#A0A0A0] font-semibold text-sm">Status</th>
                <th className="px-6 py-4 text-center text-[#A0A0A0] font-semibold text-sm">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-[#2A2E3E] hover:bg-[#0F1419]/50 transition-colors">
                  <td className="px-6 py-4 text-[#A0A0A0] font-mono text-sm">{user.id}</td>
                  <td className="px-6 py-4">
                    <p className="text-[#FFFFFF] font-medium">{user.name}</p>
                  </td>
                  <td className="px-6 py-4 text-[#A0A0A0] text-sm">{user.email}</td>
                  <td className="px-6 py-4 text-center text-[#A0A0A0] text-sm">{user.joined}</td>
                  <td className="px-6 py-4 text-right text-[#00FF88] font-bold">{user.balance}</td>
                  <td className="px-6 py-4 text-center text-[#00D9FF] font-bold">{user.referrals}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                      user.status === 'Active'
                        ? 'bg-[#00FF88]/10 text-[#00FF88] border-[#00FF88]/30'
                        : user.status === 'Pending'
                        ? 'bg-[#00D9FF]/10 text-[#00D9FF] border-[#00D9FF]/30'
                        : 'bg-red-500/10 text-red-500 border-red-500/30'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button className="p-2 hover:bg-[#2A2E3E] rounded transition-colors">
                      <MoreVertical className="w-4 h-4 text-[#A0A0A0]" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
