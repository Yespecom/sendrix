type SpotsBarProps = {
  claimedSpots: number
  totalSpots: number
}

export default function SpotsBar({ claimedSpots, totalSpots }: SpotsBarProps) {
  const denominator = totalSpots > 0 ? totalSpots : 1
  const widthPercent = Math.min(100, Math.max(0, Math.round((claimedSpots / denominator) * 100)))

  return (
    <div className="w-full max-w-md mx-auto mt-8 mb-6">
      <div className="flex justify-between text-sm font-bold text-[#0e0e10] mb-2 uppercase tracking-wider">
        <span>{claimedSpots.toLocaleString()} of {totalSpots.toLocaleString()}</span>
        <span className="text-[#888780]">founding spots claimed</span>
      </div>
      <div className="h-2 w-full bg-[#D3D1C7] rounded-full overflow-hidden">
        <div className="h-full bg-[#EF9F27]" style={{ width: `${widthPercent}%` }}></div>
      </div>
    </div>
  )
}
