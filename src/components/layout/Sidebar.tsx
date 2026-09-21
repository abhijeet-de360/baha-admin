import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, Settings, ChevronLeft, ChevronRight, HelpCircle, BookOpen, Ruler, FolderTree, Package, Palette, MessageSquareQuote, ShoppingBag, ShoppingCart, Users, Sliders, Ticket, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

import bigLogo from '@/assets/big-logo.png'
import smallLogo from '@/assets/small-logo.png'

interface NavItem {
  label: string
  path: string
  icon: React.ComponentType<{ className?: string }>
  iconColor: string
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    path: '/',
    icon: LayoutDashboard,
    iconColor: 'text-blue-500',
  },
  {
    label: 'Orders',
    path: '/orders',
    icon: ShoppingBag,
    iconColor: 'text-emerald-500',
  },
  {
    label: 'Customers',
    path: '/customers',
    icon: Users,
    iconColor: 'text-indigo-500',
  },
  {
    label: 'Products',
    path: '/products',
    icon: Package,
    iconColor: 'text-cyan-500',
  },
  {
    label: 'Categories',
    path: '/categories',
    icon: FolderTree,
    iconColor: 'text-indigo-500',
  },
  {
    label: 'Clothing Sizes',
    path: '/sizes',
    icon: Ruler,
    iconColor: 'text-pink-500',
  },
  {
    label: 'Colors',
    path: '/colors',
    icon: Palette,
    iconColor: 'text-rose-500',
  },
  {
    label: 'Hero Sliders',
    path: '/banners',
    icon: Sliders,
    iconColor: 'text-amber-500',
  },
  {
    label: 'Coupons',
    path: '/coupons',
    icon: Ticket,
    iconColor: 'text-violet-500',
  },
  {
    label: 'Blogs',
    path: '/blogs',
    icon: BookOpen,
    iconColor: 'text-purple-500',
  },
  {
    label: 'Notifications',
    path: '/notifications',
    icon: Bell,
    iconColor: 'text-amber-500',
  },
  {
    label: 'Abandoned Carts',
    path: '/abandoned-carts',
    icon: ShoppingCart,
    iconColor: 'text-amber-500',
  },
  {
    label: 'Testimonials',
    path: '/testimonials',
    icon: MessageSquareQuote,
    iconColor: 'text-sky-500',
  },
  {
    label: 'FAQ',
    path: '/faq',
    icon: HelpCircle,
    iconColor: 'text-emerald-500',
  },
  {
    label: 'Settings',
    path: '/settings',
    icon: Settings,
    iconColor: 'text-amber-500',
  },
]

interface SidebarProps {
  isMobileOpen?: boolean
  onCloseMobile?: () => void
}

export default function Sidebar({ isMobileOpen = false, onCloseMobile }: SidebarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const handleNavClick = (path: string) => {
    navigate(path)
    if (onCloseMobile) {
      onCloseMobile()
    }
  }

  const renderNavContent = (collapsed: boolean) => (
    <>
      {/* Sidebar Top Header Section - h-16 aligned with Header */}
      <div className="h-16 px-4 border-b border-border flex items-center justify-center">
        <div className="flex items-center justify-center gap-3 overflow-hidden w-full">
          {collapsed ? (
            <img src={smallLogo} alt="Baha Logo" className="h-16 w-16 object-contain transition-all" />
          ) : (
            <img src={bigLogo} alt="Baha Admin Logo" className="h-9 object-contain max-w-[170px] transition-all" />
          )}
        </div>
      </div>

      {/* Navigation Section */}
      <nav className="p-4 space-y-2">
        {navItems.map((item) => {
          const IconComponent = item.icon
          const isActive = location.pathname === item.path

          const navButton = (
            <Button
              key={item.path}
              variant={isActive ? 'secondary' : 'ghost'}
              className={`w-full gap-3 text-sm font-medium transition-all ${collapsed ? 'justify-center px-0 h-10 w-10 mx-auto flex' : 'justify-start px-3'
                }`}
              onClick={() => handleNavClick(item.path)}
            >
              <IconComponent className={`h-4 w-4 shrink-0 ${item.iconColor}`} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Button>
          )

          if (collapsed) {
            return (
              <Tooltip key={item.path}>
                <TooltipTrigger asChild>{navButton}</TooltipTrigger>
                <TooltipContent side="right" className="font-medium">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            )
          }

          return navButton
        })}
      </nav>
    </>
  )

  return (
    <TooltipProvider delayDuration={100}>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden animate-in fade-in"
          onClick={onCloseMobile}
        />
      )}

      {/* Mobile Slide-out Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border flex flex-col justify-between transform transition-transform duration-300 ease-in-out md:hidden ${isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
          }`}
      >
        <div>{renderNavContent(false)}</div>
      </aside>

      {/* Desktop Sticky Sidebar */}
      <aside
        className={`hidden md:flex relative border-r border-border bg-card/60 backdrop-blur-md flex-col justify-between shrink-0 h-screen sticky top-0 z-40 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'
          }`}
      >
        {/* Floating Toggle Button - z-50 to float above Header */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-4 top-[60px] -translate-y-1/2 z-50 h-8 w-8 rounded-full bg-background border border-border shadow-md flex items-center justify-center text-foreground hover:bg-accent hover:scale-110 transition-all cursor-pointer ring-1 ring-border/50"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>

        <div>{renderNavContent(isCollapsed)}</div>
      </aside>
    </TooltipProvider>
  )
}
