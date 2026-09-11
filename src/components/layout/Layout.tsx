import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'

export default function Layout() {
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  return (
    <div className="h-screen w-screen overflow-hidden bg-background text-foreground flex flex-col md:flex-row font-sans transition-colors duration-300">
      {/* Left Sidebar */}
      <Sidebar isMobileOpen={isMobileOpen} onCloseMobile={() => setIsMobileOpen(false)} />

      {/* Main Container with Sticky Header & Scrollable Body */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {/* Fixed Top Header */}
        <Header
          isMobileOpen={isMobileOpen}
          onToggleMobileMenu={() => setIsMobileOpen(!isMobileOpen)}
        />

        {/* Scrollable Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8 w-full">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
