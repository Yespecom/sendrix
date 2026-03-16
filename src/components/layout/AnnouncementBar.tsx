type AnnouncementBarProps = {
  claimedSpots: number
  totalSpots: number
}

export default function AnnouncementBar({ claimedSpots, totalSpots }: AnnouncementBarProps) {
  return (
    <div className="w-full bg-[#04342C] text-white py-2 px-4 flex justify-center items-center gap-2">
      <div className="w-2 h-2 rounded-full bg-[#EF9F27] animate-pulse"></div>
      <span className="text-sm font-medium">
        Early Access — {totalSpots.toLocaleString()} Founding Member spots.
        <span className="font-bold text-[#EF9F27]"> {claimedSpots.toLocaleString()} claimed.</span>
      </span>
    </div>
  )
}
