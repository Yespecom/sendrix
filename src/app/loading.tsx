import SendrixLoader from '@/components/SendrixLoader'

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#F5F3EC] flex items-center justify-center px-6">
      <SendrixLoader label="Loading Sendrix..." />
    </div>
  )
}
