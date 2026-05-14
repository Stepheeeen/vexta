export function GrowthCard({ 
  title, 
  value, 
  change, 
  icon,
  isPositive = true 
}: { 
  title: string
  value: string | number
  change?: string | number
  icon?: React.ReactNode
  isPositive?: boolean
}) {
  return (
    <div className="bg-[#1A1F2E] border border-[#2A2E3E] rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-[#A0A0A0] text-sm font-medium mb-1">{title}</p>
          <p className="text-[#FFFFFF] text-3xl font-bold">{value}</p>
        </div>
        {icon && <div className="text-[#00D9FF]">{icon}</div>}
      </div>
      {change !== undefined && (
        <p className={`text-sm font-medium ${isPositive ? 'text-[#00FF88]' : 'text-red-500'}`}>
          {isPositive ? '+' : ''}{change}%
        </p>
      )}
    </div>
  );
}

export function VerifiedBadge() {
  return (
    <div className="flex items-center gap-1 bg-[#00D9FF]/10 px-3 py-1 rounded-full border border-[#00D9FF]/30">
      <span className="text-[#00D9FF] text-xs font-bold">✓</span>
      <span className="text-[#00D9FF] text-xs font-medium">Verified</span>
    </div>
  );
}

export function ProfitBadge({ amount }: { amount: string | number }) {
  return (
    <div className="flex items-center gap-2 bg-[#00FF88]/10 px-4 py-2 rounded-lg border border-[#00FF88]/30">
      <span className="text-[#00FF88] text-sm font-bold">↑</span>
      <span className="text-[#00FF88] text-sm font-semibold">${amount}</span>
    </div>
  );
}
