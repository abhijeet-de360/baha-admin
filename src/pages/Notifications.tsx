import { useState, useMemo, useEffect } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import {
  Bell,
  Search,
  Send,
  Trash2,
  Eye,
  RotateCcw,
  CheckCircle2,
  Users,
  Smartphone,
  TrendingUp,
  Clock,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
import {
  type NotificationItem,
  type TargetAudience,
  type NotificationType,
  type NotificationStatus,
  getStoredNotifications,
  saveStoredNotifications,
} from '@/data/mockNotifications'

export default function Notifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(getStoredNotifications)
  const [searchQuery, setSearchQuery] = useState('')
  const [audienceFilter, setAudienceFilter] = useState<string>('All')
  const [typeFilter, setTypeFilter] = useState<string>('All')

  // Infinite Scroll State
  const [visibleCount, setVisibleCount] = useState(10)

  // Reset scroll batch on filter change
  useEffect(() => {
    setVisibleCount(10)
  }, [searchQuery, audienceFilter, typeFilter])

  // Modals & Active items
  const [isComposeModalOpen, setIsComposeModalOpen] = useState(false)
  const [previewNotification, setPreviewNotification] = useState<NotificationItem | null>(null)
  const [deletingNotification, setDeletingNotification] = useState<NotificationItem | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage(null)
    }, 3500)
  }

  // Compose Form State
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    targetAudience: 'All Users' as TargetAudience,
    type: 'Promotional' as NotificationType,
    actionUrl: '',
    promoCode: '',
  })

  // Computed Metrics
  const metrics = useMemo(() => {
    const totalSent = notifications.filter(n => n.status === 'Sent').length
    const totalReach = notifications.reduce((sum, n) => sum + (n.recipientsCount || 0), 0)
    const sentList = notifications.filter(n => n.status === 'Sent' && (n.openRate ?? 0) > 0)
    const avgOpenRate = sentList.length > 0
      ? (sentList.reduce((sum, n) => sum + (n.openRate ?? 0), 0) / sentList.length).toFixed(1)
      : '0.0'
    const scheduledCount = notifications.filter(n => n.status === 'Scheduled').length

    return { totalSent, totalReach, avgOpenRate, scheduledCount }
  }, [notifications])

  // Filtered Notifications List
  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        n.title.toLowerCase().includes(q) ||
        n.body.toLowerCase().includes(q) ||
        n.id.toLowerCase().includes(q)

      const matchesAudience = audienceFilter === 'All' || n.targetAudience === audienceFilter
      const matchesType = typeFilter === 'All' || n.type === typeFilter

      return matchesSearch && matchesAudience && matchesType
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [notifications, searchQuery, audienceFilter, typeFilter])

  // Displayed items slice for InfiniteScroll
  const displayedNotifications = useMemo(() => {
    return filteredNotifications.slice(0, visibleCount)
  }, [filteredNotifications, visibleCount])

  const fetchMoreNotifications = () => {
    if (visibleCount < filteredNotifications.length) {
      setVisibleCount((prev) => prev + 10)
    }
  }

  // Handle Send Notification
  const handleSendNotification = (asDraft = false) => {
    if (!formData.title.trim() || !formData.body.trim()) {
      showToast('Please enter both title and message body for the notification.')
      return
    }

    let recipientsCount = 0
    if (formData.targetAudience === 'All Users') recipientsCount = 1500
    else if (formData.targetAudience === 'VIP Customers') recipientsCount = 240
    else if (formData.targetAudience === 'New Users') recipientsCount = 380
    else recipientsCount = 110

    const newNotif: NotificationItem = {
      id: `NOTIF-${Date.now()}`,
      title: formData.title,
      body: formData.body,
      targetAudience: formData.targetAudience,
      type: formData.type,
      status: asDraft ? 'Draft' : 'Sent',
      sentAt: asDraft ? undefined : new Date().toISOString(),
      recipientsCount: asDraft ? 0 : recipientsCount,
      openRate: asDraft ? 0 : Math.floor(35 + Math.random() * 30),
      actionUrl: formData.actionUrl || undefined,
      promoCode: formData.promoCode ? formData.promoCode.toUpperCase() : undefined,
      createdAt: new Date().toISOString(),
    }

    const updated = [newNotif, ...notifications]
    setNotifications(updated)
    saveStoredNotifications(updated)

    // Reset Form
    setFormData({
      title: '',
      body: '',
      targetAudience: 'All Users',
      type: 'Promotional',
      actionUrl: '',
      promoCode: '',
    })

    setIsComposeModalOpen(false)
    showToast(asDraft ? 'Notification saved as draft.' : `Notification sent to ${recipientsCount} users!`)
  }

  // Handle Resend Notification
  const handleResend = (notif: NotificationItem) => {
    const updated = notifications.map(n => {
      if (n.id === notif.id) {
        return {
          ...n,
          status: 'Sent' as NotificationStatus,
          sentAt: new Date().toISOString(),
          recipientsCount: n.recipientsCount || 1200,
        }
      }
      return n
    })
    setNotifications(updated)
    saveStoredNotifications(updated)
    showToast(`Notification broadcast resent to ${notif.targetAudience}!`)
  }

  // Handle Delete Notification
  const handleDelete = (id: string) => {
    const updated = notifications.filter(n => n.id !== id)
    setNotifications(updated)
    saveStoredNotifications(updated)
    setDeletingNotification(null)
    showToast('Notification deleted.')
  }

  // Helper Badge Colors
  const getTypeBadge = (type: NotificationType) => {
    switch (type) {
      case 'Promotional':
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 font-medium">Promotional</Badge>
      case 'Discount Offer':
        return <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 font-medium">Discount Offer</Badge>
      case 'Product Drop':
        return <Badge variant="outline" className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 font-medium">Product Drop</Badge>
      case 'System Alert':
        return <Badge variant="outline" className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 font-medium">System Alert</Badge>
    }
  }

  const getAudienceBadge = (audience: TargetAudience) => {
    switch (audience) {
      case 'All Users':
        return <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">All Users</Badge>
      case 'VIP Customers':
        return <Badge className="bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30">VIP Customers</Badge>
      case 'New Users':
        return <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30">New Users</Badge>
      case 'Wholesale Buyers':
        return <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">Wholesale</Badge>
    }
  }

  return (
    <div className="p-3 sm:p-4 space-y-4 w-full max-w-full overflow-x-hidden mx-auto">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2.5 bg-emerald-950/90 text-emerald-100 border border-emerald-800 px-4 py-3 rounded-xl shadow-lg backdrop-blur-md animate-in slide-in-from-top text-xs font-medium">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-card border border-border/80 rounded-xl p-3 sm:p-4 shadow-2xs w-full">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
              <Bell className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground truncate">
                  User Notifications
                </h1>
                <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 font-semibold px-2 py-0 text-[11px] shrink-0">
                  Broadcast Center
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                Create and dispatch push notifications & promotional announcements to customers.
              </p>
            </div>
          </div>
        </div>

        <Button
          onClick={() => setIsComposeModalOpen(true)}
          className="text-white gap-2 text-xs h-9 font-semibold shrink-0"
        >
          <Send className="h-3.5 w-3.5" />
          Send Notification
        </Button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-card border-border/80 shadow-2xs">
          <CardContent className="p-3.5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-muted-foreground">Total Broadcasts</p>
              <h3 className="text-xl font-bold mt-0.5 text-foreground">{metrics.totalSent}</h3>
            </div>
            <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-lg">
              <Bell className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/80 shadow-2xs">
          <CardContent className="p-3.5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-muted-foreground">Recipients Reached</p>
              <h3 className="text-xl font-bold mt-0.5 text-emerald-600 dark:text-emerald-400">
                {metrics.totalReach.toLocaleString()}
              </h3>
            </div>
            <div className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-lg">
              <Users className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/80 shadow-2xs">
          <CardContent className="p-3.5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-muted-foreground">Avg. Open Rate</p>
              <h3 className="text-xl font-bold mt-0.5 text-purple-600 dark:text-purple-400">
                {metrics.avgOpenRate}%
              </h3>
            </div>
            <div className="p-2.5 bg-purple-500/10 text-purple-500 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/80 shadow-2xs">
          <CardContent className="p-3.5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-muted-foreground">Scheduled / Active</p>
              <h3 className="text-xl font-bold mt-0.5 text-blue-600 dark:text-blue-400">
                {metrics.scheduledCount}
              </h3>
            </div>
            <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="bg-card border-border/80 shadow-2xs p-3">
        <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search by notification title, message body, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-8 h-9 text-xs bg-background/80 rounded-lg"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Target Audience Filter */}
            <select
              value={audienceFilter}
              onChange={(e) => setAudienceFilter(e.target.value)}
              className="h-9 px-2.5 text-xs rounded-lg border border-input bg-background text-foreground focus:outline-hidden"
            >
              <option value="All">All Audiences</option>
              <option value="All Users">All Users</option>
              <option value="VIP Customers">VIP Customers</option>
              <option value="New Users">New Users</option>
              <option value="Wholesale Buyers">Wholesale</option>
            </select>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-9 px-2.5 text-xs rounded-lg border border-input bg-background text-foreground focus:outline-hidden"
            >
              <option value="All">All Types</option>
              <option value="Promotional">Promotional</option>
              <option value="Discount Offer">Discount Offer</option>
              <option value="Product Drop">Product Drop</option>
              <option value="System Alert">System Alert</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Main Notifications Table & Card Grid */}
      <Card className="border border-border/80 shadow-2xs bg-card rounded-xl overflow-hidden w-full">
        {displayedNotifications.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground p-4">
            <Bell className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm font-semibold text-foreground">No notifications found</p>
          </div>
        ) : (
          <InfiniteScroll
            dataLength={displayedNotifications.length}
            next={fetchMoreNotifications}
            hasMore={visibleCount < filteredNotifications.length}
            loader={
              <div className="py-4 text-center text-xs text-muted-foreground font-medium">
                Loading more notifications...
              </div>
            }
            endMessage={
              <div className="py-4 text-center text-xs text-muted-foreground font-medium">
                Showing all {filteredNotifications.length} notifications
              </div>
            }
          >
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto w-full">
              <table className="w-full text-left text-xs border-collapse min-w-[850px]">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4 min-w-[300px]">Notification Title & Message</th>
                    <th className="py-3 px-4">Target Audience</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Reach & Performance</th>
                    <th className="py-3 px-4 text-right">Sent Time</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {displayedNotifications.map((notif) => (
                    <tr key={notif.id} className="hover:bg-accent/30 transition-colors">
                      {/* Title & Body */}
                      <td className="py-3 px-4 align-top max-w-sm">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-foreground text-xs">{notif.title}</span>
                            {notif.promoCode && (
                              <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-mono text-purple-600 border-purple-500/30">
                                [{notif.promoCode}]
                              </Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground text-[11px] line-clamp-2 leading-relaxed">
                            {notif.body}
                          </p>
                        </div>
                      </td>

                      {/* Audience */}
                      <td className="py-3 px-4 align-top">
                        {getAudienceBadge(notif.targetAudience)}
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 align-top">
                        {getTypeBadge(notif.type)}
                      </td>

                      {/* Performance */}
                      <td className="py-3 px-4 align-top">
                        <div className="space-y-0.5">
                          <div className="font-semibold text-foreground text-xs">
                            {(notif.recipientsCount ?? 0).toLocaleString()} users
                          </div>
                          {(notif.openRate ?? 0) > 0 && (
                            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                              {notif.openRate}% open rate
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Sent Date */}
                      <td className="py-3 px-4 text-right align-top text-[11px] text-muted-foreground">
                        {notif.sentAt ? (
                          <span>
                            {new Date(notif.sentAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        ) : notif.scheduledFor ? (
                          <span className="text-amber-600 font-semibold">
                            Scheduled
                          </span>
                        ) : (
                          <span className="text-muted-foreground italic">Draft</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right align-top">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setPreviewNotification(notif)}
                            className="h-8 w-8 text-indigo-400 border-border hover:bg-indigo-500/10 cursor-pointer"
                            title="View Notification Details"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleResend(notif)}
                            className="h-8 w-8 text-amber-400 border-border hover:bg-amber-500/10 cursor-pointer"
                            title="Resend Broadcast"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setDeletingNotification(notif)}
                            className="h-8 w-8 text-rose-500 border-border hover:bg-rose-500/10 cursor-pointer"
                            title="Delete Notification"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View Cards */}
            <div className="lg:hidden p-3 sm:p-4 space-y-3 w-full">
              {displayedNotifications.map((notif) => (
                <div
                  key={notif.id}
                  className="bg-card border border-border/80 rounded-xl p-3.5 space-y-3 shadow-2xs hover:border-border transition-all"
                >
                  {/* Header: Badges & Status */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {getTypeBadge(notif.type)}
                      {getAudienceBadge(notif.targetAudience)}
                      {notif.promoCode && (
                        <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-mono text-purple-600 border-purple-500/30">
                          [{notif.promoCode}]
                        </Badge>
                      )}
                    </div>
                    <span className="text-[10px] font-medium text-muted-foreground shrink-0">
                      {notif.sentAt ? (
                        new Date(notif.sentAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                      ) : notif.scheduledFor ? (
                        <span className="text-amber-600 font-semibold">Scheduled</span>
                      ) : (
                        <span className="italic">Draft</span>
                      )}
                    </span>
                  </div>

                  {/* Content: Title & Message */}
                  <div className="space-y-1">
                    <h4 className="font-bold text-foreground text-xs leading-snug">{notif.title}</h4>
                    <p className="text-muted-foreground text-[11px] leading-relaxed line-clamp-2">{notif.body}</p>
                  </div>

                  {/* Performance & Action Bar */}
                  <div className="flex items-center justify-between pt-2.5 border-t border-border/60 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground text-[11px]">
                        {(notif.recipientsCount ?? 0).toLocaleString()} users
                      </span>
                      {(notif.openRate ?? 0) > 0 && (
                        <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                          {notif.openRate}% open
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setPreviewNotification(notif)}
                        className="h-8 w-8 text-indigo-400 border-border hover:bg-indigo-500/10 cursor-pointer"
                        title="View Notification Details"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleResend(notif)}
                        className="h-8 w-8 text-amber-400 border-border hover:bg-amber-500/10 cursor-pointer"
                        title="Resend Broadcast"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setDeletingNotification(notif)}
                        className="h-8 w-8 text-rose-500 border-border hover:bg-rose-500/10 cursor-pointer"
                        title="Delete Notification"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </InfiniteScroll>
        )}
      </Card>

      {/* ================= MODAL 1: COMPOSE NOTIFICATION WITH LIVE MOBILE PREVIEW ================= */}
      <Dialog open={isComposeModalOpen} onOpenChange={setIsComposeModalOpen}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden">
          <div className="p-4 bg-muted/40 border-b border-border flex items-center justify-between">
            <div>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <Send className="h-4 w-4 text-amber-500" />
                Create & Broadcast Notification
              </DialogTitle>
              <DialogDescription className="text-xs">
                Send a real-time push and in-app message to your store customers.
              </DialogDescription>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 p-4 gap-4">
            {/* Form Inputs (3 cols) */}
            <div className="md:col-span-3 space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Notification Title *</label>
                <Input
                  placeholder="e.g. 🎉 Flash Sale Alert: 25% Off Summer Wear!"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Message Body *</label>
                <textarea
                  placeholder="Write a clear, compelling message for customers..."
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  rows={3}
                  className="w-full text-xs p-2.5 rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Target Audience</label>
                  <select
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value as any })}
                    className="w-full h-9 px-2 text-xs rounded-md border border-input bg-background text-foreground"
                  >
                    <option value="All Users">All Users (~1,500)</option>
                    <option value="VIP Customers">VIP Members (~240)</option>
                    <option value="New Users">New Registrations (~380)</option>
                    <option value="Wholesale Buyers">Wholesale (~110)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Category</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full h-9 px-2 text-xs rounded-md border border-input bg-background text-foreground"
                  >
                    <option value="Promotional">Promotional</option>
                    <option value="Discount Offer">Discount Offer</option>
                    <option value="Product Drop">Product Drop</option>
                    <option value="System Alert">System Alert</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Promo Code (Optional)</label>
                  <Input
                    placeholder="e.g. SAVE25"
                    value={formData.promoCode}
                    onChange={(e) => setFormData({ ...formData, promoCode: e.target.value })}
                    className="h-9 text-xs font-mono uppercase"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Action Link URL (Optional)</label>
                  <Input
                    placeholder="e.g. /products/sale"
                    value={formData.actionUrl}
                    onChange={(e) => setFormData({ ...formData, actionUrl: e.target.value })}
                    className="h-9 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Real-time Phone Banner Preview (2 cols) */}
            <div className="md:col-span-2 bg-muted/40 p-3 rounded-xl border border-border flex flex-col justify-between space-y-3">
              <div>
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5 mb-2">
                  <Smartphone className="h-3.5 w-3.5 text-amber-500" />
                  Live Mobile Banner Preview
                </span>

                {/* Simulated Phone Lockscreen / In-App Notification Toast */}
                <div className="p-3 bg-card border border-border shadow-md rounded-xl space-y-1.5 animate-in fade-in">
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground border-b border-border/50 pb-1">
                    <span className="font-semibold text-amber-500 flex items-center gap-1">
                      <Bell className="h-2.5 w-2.5" /> Baha App
                    </span>
                    <span>Just now</span>
                  </div>

                  <p className="font-bold text-xs text-foreground leading-tight">
                    {formData.title || 'Notification Title Preview'}
                  </p>

                  <p className="text-[11px] text-muted-foreground leading-snug">
                    {formData.body || 'Your broadcast message text will appear here for users on their phones...'}
                  </p>

                  {formData.promoCode && (
                    <div className="pt-1">
                      <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/30 text-[10px] font-mono">
                        Code: {formData.promoCode.toUpperCase()}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              <div className="text-[10px] text-muted-foreground">
                Targeting <strong className="text-foreground">{formData.targetAudience}</strong>. Delivered instantly to push channels.
              </div>
            </div>
          </div>

          <DialogFooter className="p-3 bg-muted/20 border-t border-border gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsComposeModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="secondary" size="sm" onClick={() => handleSendNotification(true)}>
              Save Draft
            </Button>
            <Button size="sm" onClick={() => handleSendNotification(false)} className="text-white gap-1.5">
              <Send className="h-3.5 w-3.5" />
              Send Broadcast Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ================= MODAL 2: VIEW PREVIEW ================= */}
      <Dialog open={!!previewNotification} onOpenChange={() => setPreviewNotification(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground text-base">
              <Bell className="h-4 w-4 text-amber-500" />
              Notification Preview
            </DialogTitle>
          </DialogHeader>

          {previewNotification && (
            <div className="space-y-3 py-2">
              <div className="p-3.5 bg-muted/40 rounded-xl border border-border space-y-2">
                <div className="flex items-center justify-between text-xs">
                  {getAudienceBadge(previewNotification.targetAudience)}
                  {getTypeBadge(previewNotification.type)}
                </div>

                <h3 className="font-bold text-sm text-foreground">{previewNotification.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{previewNotification.body}</p>

                {previewNotification.promoCode && (
                  <div className="pt-1">
                    <Badge variant="outline" className="font-mono text-xs text-purple-600 border-purple-500/30">
                      Promo Code: {previewNotification.promoCode}
                    </Badge>
                  </div>
                )}
              </div>

              <div className="text-xs text-muted-foreground space-y-1 bg-muted/20 p-3 rounded-lg">
                <div>Sent At: <span className="font-semibold text-foreground">{previewNotification.sentAt ? new Date(previewNotification.sentAt).toLocaleString() : 'Not sent'}</span></div>
                <div>Recipients Reached: <span className="font-semibold text-foreground">{previewNotification.recipientsCount ?? 0}</span></div>
                <div>Open Rate: <span className="font-semibold text-emerald-600">{previewNotification.openRate ?? 0}%</span></div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setPreviewNotification(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Helper Modal State setter alias */}
      {/* ================= DELETE ALERT ================= */}
      <AlertDialog open={!!deletingNotification} onOpenChange={() => setDeletingNotification(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-rose-600 text-base">
              <Trash2 className="h-4 w-4" />
              Delete Notification
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Are you sure you want to delete notification broadcast <strong className="text-foreground">{deletingNotification?.title}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingNotification && handleDelete(deletingNotification.id)}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
