import AnnouncementBar from '@/components/layout/AnnouncementBar'
import Footer from '@/components/layout/Footer'
import Navbar from '@/components/layout/Navbar'
import DocsContent from './DocsContent'
import { getLandingStats } from '@/lib/landing-stats'

export default async function PublicDocsPage() {
  return (
    <div className="min-h-screen bg-[#F5F3EC]">
      <Navbar />
      <DocsContent />
      <Footer />
    </div>
  )
}
