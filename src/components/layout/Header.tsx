import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, LogOut, User, Key, CheckCircle2, Menu, X, Sun, Moon, Laptop } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { useTheme } from '@/components/theme-provider'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import bigLogo from '@/assets/big-logo.png'

interface HeaderProps {
  onToggleMobileMenu?: () => void
  isMobileOpen?: boolean
}

export default function Header({ onToggleMobileMenu, isMobileOpen }: HeaderProps) {
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()
  const [isHovered, setIsHovered] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showLogoutAlert, setShowLogoutAlert] = useState(false)

  // Password Modal State
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' })
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  const confirmLogout = () => {
    setShowLogoutAlert(false)
    navigate('/login')
  }

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordSuccess(true)
    setTimeout(() => {
      setPasswordSuccess(false)
      setShowPasswordDialog(false)
      setPasswords({ current: '', new: '', confirm: '' })
    }, 1500)
  }

  return (
    <>
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between md:justify-end border-b border-border bg-background/80 backdrop-blur-md px-4 sm:px-6 w-full gap-4 shrink-0">
        {/* Mobile Header Left Brand + Toggle */}
        <div className="flex items-center gap-3 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleMobileMenu}
            className="h-9 w-9 p-0 text-foreground hover:bg-accent"
          >
            {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <img src={bigLogo} alt="Baha Logo" className="h-7 object-contain" />
        </div>

        {/* Right Action Icons (Theme Switcher + Notification Bell + Profile Avatar) */}
        <div className="flex items-center gap-3">
          {/* Theme Switch Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl cursor-pointer relative">
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-500" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-blue-400" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36 rounded-xl">
              <DropdownMenuItem
                onClick={() => setTheme('light')}
                className={`gap-2 text-xs cursor-pointer font-medium ${theme === 'light' ? 'bg-accent font-bold' : ''}`}
              >
                <Sun className="h-4 w-4 text-amber-500" /> Light
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTheme('dark')}
                className={`gap-2 text-xs cursor-pointer font-medium ${theme === 'dark' ? 'bg-accent font-bold' : ''}`}
              >
                <Moon className="h-4 w-4 text-blue-400" /> Dark
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTheme('system')}
                className={`gap-2 text-xs cursor-pointer font-medium ${theme === 'system' ? 'bg-accent font-bold' : ''}`}
              >
                <Laptop className="h-4 w-4 text-slate-500" /> System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notification Bell */}
          <Button variant="outline" size="icon" className="relative h-9 w-9 rounded-xl">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-blue-500 animate-ping" />
            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-blue-500" />
          </Button>

          {/* Profile Image with Hover / Click Popup */}
          <div
            className="relative"
            onMouseEnter={() => {
              setIsHovered(true)
              setIsMenuOpen(true)
            }}
            onMouseLeave={() => {
              setIsHovered(false)
            }}
          >
            <DropdownMenu open={isMenuOpen || isHovered} onOpenChange={setIsMenuOpen}>
              <DropdownMenuTrigger asChild>
                <button className="focus:outline-none cursor-pointer rounded-full ring-2 ring-primary/20 hover:ring-primary/60 transition-all">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150" alt="Admin Profile" />
                    <AvatarFallback>AD</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-64 p-3 shadow-xl border-border bg-card/95 backdrop-blur-md"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/40 border border-border/50">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150" />
                      <AvatarFallback>AD</AvatarFallback>
                    </Avatar>
                    <div className="overflow-hidden">
                      <p className="text-xs font-semibold truncate">Admin User</p>
                      <p className="text-[10px] text-muted-foreground truncate">admin@baha.io</p>
                    </div>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator className="my-2" />

                <DropdownMenuItem
                  onClick={() => {
                    setIsMenuOpen(false)
                    setIsHovered(false)
                    navigate('/profile')
                  }}
                  className="gap-2 text-xs cursor-pointer"
                >
                  <User className="h-3.5 w-3.5 text-blue-500" />
                  View Profile Settings
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => {
                    setIsMenuOpen(false)
                    setIsHovered(false)
                    setShowPasswordDialog(true)
                  }}
                  className="gap-2 text-xs cursor-pointer"
                >
                  <Key className="h-3.5 w-3.5 text-amber-500" />
                  Change Password
                </DropdownMenuItem>

                <DropdownMenuSeparator className="my-1" />

                <DropdownMenuItem
                  onClick={() => {
                    setIsMenuOpen(false)
                    setIsHovered(false)
                    setShowLogoutAlert(true)
                  }}
                  className="gap-2 text-xs text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer font-medium"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Change Password Dialog Modal */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handlePasswordSubmit}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 text-amber-500" /> Change Password
              </DialogTitle>
              <DialogDescription className="text-xs">
                Enter your current password and choose a new password for your account.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label className="text-xs font-medium">Current Password</label>
                <Input
                  type="password"
                  placeholder="••••••••••••"
                  value={passwords.current}
                  onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                  required
                />
              </div>

              <div className="grid gap-2">
                <label className="text-xs font-medium">New Password</label>
                <Input
                  type="password"
                  placeholder="Enter new password"
                  value={passwords.new}
                  onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                  required
                />
              </div>

              <div className="grid gap-2">
                <label className="text-xs font-medium">Confirm New Password</label>
                <Input
                  type="password"
                  placeholder="Confirm new password"
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                  required
                />
              </div>

              {passwordSuccess && (
                <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-xs p-2.5 rounded-lg">
                  <CheckCircle2 className="h-4 w-4" /> Password changed successfully!
                </div>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowPasswordDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">Update Password</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Logout Alert Dialog Confirmation */}
      <AlertDialog open={showLogoutAlert} onOpenChange={setShowLogoutAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to end your session and log out of Baha Control Center?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmLogout}>Log Out</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}