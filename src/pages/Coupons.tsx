import { useState, useEffect, useMemo } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import {
  Ticket, Plus, Search, SquarePen, Trash2, Eye, Copy, Check, CheckCircle2,
  AlertTriangle, Filter, Sparkles, Percent,
  Truck, Tag, Calendar, Layers, Clock, AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { type Coupon, INITIAL_COUPONS } from '@/data/mockCoupons'

export default function Coupons() {
  const [coupons, setCoupons] = useState<Coupon[]>(INITIAL_COUPONS)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Scheduled' | 'Expired' | 'Draft'>('All')
  const [typeFilter, setTypeFilter] = useState<'All' | 'percentage' | 'fixed' | 'free_shipping'>('All')

  // Infinite Scroll State
  const [visibleCount, setVisibleCount] = useState(10)

  // Reset scroll batch on filter change
  useEffect(() => {
    setVisibleCount(10)
  }, [searchQuery, statusFilter, typeFilter])

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [previewCoupon, setPreviewCoupon] = useState<Coupon | null>(null)
  const [deletingCoupon, setDeletingCoupon] = useState<Coupon | null>(null)

  // Form State
  const [formCode, setFormCode] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formDiscountType, setFormDiscountType] = useState<'percentage' | 'fixed' | 'free_shipping'>('percentage')
  const [formDiscountValue, setFormDiscountValue] = useState<number>(0)
  const [formMinSpend, setFormMinSpend] = useState<number>(0)
  const [formMaxDiscount, setFormMaxDiscount] = useState<number | ''>('')
  const [formUsageLimit, setFormUsageLimit] = useState<number | ''>('')
  const [formPerCustomerLimit, setFormPerCustomerLimit] = useState<number>(1)
  const [formStartDate, setFormStartDate] = useState('')
  const [formEndDate, setFormEndDate] = useState('')
  const [formStatus, setFormStatus] = useState<'Active' | 'Scheduled' | 'Expired' | 'Draft'>('Active')
  const [formError, setFormError] = useState<string | null>(null)

  // Toast & Copy Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const showNotification = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    showNotification(`Coupon code "${code}" copied to clipboard!`)
    setTimeout(() => setCopiedCode(null), 2500)
  }
 
  // Open Modal for Add
  const handleOpenAddModal = () => {
    setEditingCoupon(null)
    setFormCode('')
    setFormDescription('')
    setFormDiscountType('percentage')
    setFormDiscountValue(15)
    setFormMinSpend(499)
    setFormMaxDiscount('')
    setFormUsageLimit('')
    setFormPerCustomerLimit(1)
    
    const today = new Date().toISOString().split('T')[0]
    const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    setFormStartDate(today)
    setFormEndDate(nextMonth)
    setFormStatus('Active')
    setFormError(null)
    setIsModalOpen(true)
  }

  // Open Modal for Edit
  const handleOpenEditModal = (coup: Coupon) => {
    setEditingCoupon(coup)
    setFormCode(coup.code)
    setFormDescription(coup.description)
    setFormDiscountType(coup.discountType)
    setFormDiscountValue(coup.discountValue)
    setFormMinSpend(coup.minSpend)
    setFormMaxDiscount(coup.maxDiscount !== undefined ? coup.maxDiscount : '')
    setFormUsageLimit(coup.usageLimit !== null ? coup.usageLimit : '')
    setFormPerCustomerLimit(coup.perCustomerLimit)
    setFormStartDate(coup.startDate)
    setFormEndDate(coup.endDate)
    setFormStatus(coup.status)
    setFormError(null)
    setIsModalOpen(true)
  }

  // Save Coupon (Create / Update)
  const handleSaveCoupon = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!formCode.trim()) {
      setFormError('Please enter a coupon code.')
      return
    }

    const uppercaseCode = formCode.trim().toUpperCase().replace(/\s+/g, '')

    if (editingCoupon) {
      setCoupons((prev) =>
        prev.map((item) =>
          item.id === editingCoupon.id
            ? {
                ...item,
                code: uppercaseCode,
                description: formDescription.trim(),
                discountType: formDiscountType,
                discountValue: formDiscountType === 'free_shipping' ? 0 : Number(formDiscountValue),
                minSpend: Number(formMinSpend) || 0,
                maxDiscount: formMaxDiscount === '' ? undefined : Number(formMaxDiscount),
                usageLimit: formUsageLimit === '' ? null : Number(formUsageLimit),
                perCustomerLimit: Number(formPerCustomerLimit) || 1,
                startDate: formStartDate,
                endDate: formEndDate,
                status: formStatus,
              }
            : item
        )
      )
      showNotification(`Coupon "${uppercaseCode}" updated successfully!`)
    } else {
      const newCoup: Coupon = {
        id: `coup-${Date.now()}`,
        code: uppercaseCode,
        description: formDescription.trim(),
        discountType: formDiscountType,
        discountValue: formDiscountType === 'free_shipping' ? 0 : Number(formDiscountValue),
        minSpend: Number(formMinSpend) || 0,
        maxDiscount: formMaxDiscount === '' ? undefined : Number(formMaxDiscount),
        usageLimit: formUsageLimit === '' ? null : Number(formUsageLimit),
        usedCount: 0,
        perCustomerLimit: Number(formPerCustomerLimit) || 1,
        startDate: formStartDate,
        endDate: formEndDate,
        status: formStatus,
        applicableCategories: ['All Categories'],
      }
      setCoupons((prev) => [newCoup, ...prev])
      showNotification(`Coupon "${uppercaseCode}" created successfully!`)
    }

    setIsModalOpen(false)
  }

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (!deletingCoupon) return
    setCoupons((prev) => prev.filter((item) => item.id !== deletingCoupon.id))
    showNotification(`Coupon "${deletingCoupon.code}" deleted successfully!`)
    setDeletingCoupon(null)
  }

  // Filter Logic
  const filteredCoupons = useMemo(() => {
    return coupons.filter((coup) => {
      const matchesSearch =
        coup.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        coup.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'All' || coup.status === statusFilter
      const matchesType = typeFilter === 'All' || coup.discountType === typeFilter
      return matchesSearch && matchesStatus && matchesType
    })
  }, [coupons, searchQuery, statusFilter, typeFilter])

  // Displayed items slice for InfiniteScroll
  const displayedCoupons = useMemo(() => {
    return filteredCoupons.slice(0, visibleCount)
  }, [filteredCoupons, visibleCount])

  const fetchMoreCoupons = () => {
    if (visibleCount < filteredCoupons.length) {
      setVisibleCount((prev) => prev + 10)
    }
  }

  // Status Badge Component
  const getStatusBadge = (status: Coupon['status']) => {
    switch (status) {
      case 'Active':
        return (
          <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 border-emerald-500/30 gap-1 font-semibold">
            <CheckCircle2 className="h-3 w-3" /> Active
          </Badge>
        )
      case 'Scheduled':
        return (
          <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 hover:bg-amber-500/25 border-amber-500/30 gap-1 font-semibold">
            <Clock className="h-3 w-3" /> Scheduled
          </Badge>
        )
      case 'Expired':
        return (
          <Badge className="bg-rose-500/15 text-rose-600 dark:text-rose-400 hover:bg-rose-500/25 border-rose-500/30 gap-1 font-semibold">
            <AlertCircle className="h-3 w-3" /> Expired
          </Badge>
        )
      case 'Draft':
        return (
          <Badge className="bg-slate-500/15 text-slate-600 dark:text-slate-400 hover:bg-slate-500/25 border-slate-500/30 gap-1 font-semibold">
            <Tag className="h-3 w-3" /> Draft
          </Badge>
        )
    }
  }

  // Discount Type Badge
  const getTypeBadge = (type: Coupon['discountType'], value: number) => {
    switch (type) {
      case 'percentage':
        return (
          <Badge variant="outline" className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30 gap-1 font-mono font-bold">
            <Percent className="h-3 w-3" /> {value}% OFF
          </Badge>
        )
      case 'fixed':
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 gap-1 font-mono font-bold">
            <Tag className="h-3 w-3" /> ₹{value} OFF
          </Badge>
        )
      case 'free_shipping':
        return (
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 gap-1 font-mono font-bold">
            <Truck className="h-3 w-3" /> Free Shipping
          </Badge>
        )
    }
  }

  const totalRedemptions = coupons.reduce((acc, c) => acc + c.usedCount, 0)
  const activeCount = coupons.filter((c) => c.status === 'Active').length

  return (
    <div className="space-y-6 md:space-y-8 w-full font-sans pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary text-primary-foreground shadow-xs">
              <Ticket className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Coupons & Promo Codes
            </h1>
          </div>
          <p className="text-xs text-muted-foreground sm:pl-10">
            Create discount coupons, promotional codes, and free shipping vouchers for shoppers.
          </p>
        </div>

        {/* Add Coupon Button */}
        <Button
          onClick={handleOpenAddModal}
          className="rounded-full font-semibold text-xs px-5 py-2.5 gap-2 shadow-md shrink-0 cursor-pointer transition-all"
        >
          <Plus className="h-4 w-4" /> Create Coupon
        </Button>
      </div>

      {/* Notification Toast */}
      {toastMessage && (
        <div className="flex items-center gap-2 bg-muted border border-border text-foreground text-xs px-4 py-3 rounded-xl shadow-xs animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-foreground" />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card p-4 rounded-2xl border border-border flex items-center gap-4 shadow-xs">
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <Ticket className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Total Coupons</p>
            <p className="text-xl font-extrabold text-foreground">{coupons.length}</p>
          </div>
        </div>

        <div className="bg-card p-4 rounded-2xl border border-border flex items-center gap-4 shadow-xs">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Active Coupons</p>
            <p className="text-xl font-extrabold text-foreground">{activeCount}</p>
          </div>
        </div>

        <div className="bg-card p-4 rounded-2xl border border-border flex items-center gap-4 shadow-xs">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Total Redemptions</p>
            <p className="text-xl font-extrabold text-foreground">{totalRedemptions}</p>
          </div>
        </div>

        <div className="bg-card p-4 rounded-2xl border border-border flex items-center gap-4 shadow-xs">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Promo Discounts</p>
            <p className="text-xl font-extrabold text-foreground">3 Active Offers</p>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-card p-4 rounded-2xl border border-border shadow-xs">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search coupon code or description..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
            }}
            className="pl-10 h-10 text-xs bg-background rounded-xl border-border text-foreground"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 border border-border rounded-xl px-3 py-1.5 bg-background">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as any)
              }}
              className="bg-transparent text-xs font-semibold focus:outline-none text-foreground cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Expired">Expired</option>
              <option value="Draft">Draft</option>
            </select>
          </div>

          {/* Discount Type Filter */}
          <div className="flex items-center gap-1.5 border border-border rounded-xl px-3 py-1.5 bg-background">
            <Tag className="h-3.5 w-3.5 text-muted-foreground" />
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value as any)
              }}
              className="bg-transparent text-xs font-semibold focus:outline-none text-foreground cursor-pointer"
            >
              <option value="All">All Discount Types</option>
              <option value="percentage">Percentage OFF</option>
              <option value="fixed">Fixed Amount OFF</option>
              <option value="free_shipping">Free Shipping</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table / Mobile Card View */}
      <Card className="rounded-2xl border-border shadow-xs overflow-hidden bg-card">
        <CardContent className="p-0">
          {displayedCoupons.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="p-4 rounded-full bg-muted w-14 h-14 mx-auto flex items-center justify-center text-muted-foreground">
                <Ticket className="h-6 w-6" />
              </div>
              <p className="text-sm font-bold text-foreground">No coupons found</p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Try adjusting your search criteria or create a new promotional code.
              </p>
            </div>
          ) : (
            <InfiniteScroll
              dataLength={displayedCoupons.length}
              next={fetchMoreCoupons}
              hasMore={visibleCount < filteredCoupons.length}
              loader={
                <div className="py-4 text-center text-xs text-muted-foreground font-medium">
                  Loading more coupons...
                </div>
              }
              endMessage={
                <div className="py-4 text-center text-xs text-muted-foreground font-medium">
                  Showing all {filteredCoupons.length} coupons
                </div>
              }
            >
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-muted/30 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      <th className="py-3.5 px-4">Coupon Code</th>
                      <th className="py-3.5 px-4">Discount Details</th>
                      <th className="py-3.5 px-4">Min Spend</th>
                      <th className="py-3.5 px-4">Redemptions</th>
                      <th className="py-3.5 px-4">Validity Period</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-xs">
                    {displayedCoupons.map((coup) => (
                      <tr key={coup.id} className="hover:bg-muted/20 transition-colors">
                        {/* Coupon Code Column */}
                        <td className="py-3.5 px-4 font-bold text-foreground">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm bg-muted/60 px-2.5 py-1 rounded-lg border border-border flex items-center gap-1.5 font-bold tracking-wider">
                              {coup.code}
                              <button
                                onClick={() => handleCopyCode(coup.code)}
                                className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                title="Copy Code"
                              >
                                {copiedCode === coup.code ? (
                                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                                ) : (
                                  <Copy className="h-3.5 w-3.5" />
                                )}
                              </button>
                            </span>
                          </div>
                        </td>

                        {/* Discount Details */}
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-foreground">
                            {coup.discountType === 'percentage' && `${coup.discountValue}% OFF`}
                            {coup.discountType === 'fixed' && `₹${coup.discountValue} OFF`}
                            {coup.discountType === 'free_shipping' && `Free Shipping`}
                          </p>
                          <p className="text-[11px] text-muted-foreground line-clamp-1">{coup.description}</p>
                        </td>

                        {/* Min Spend */}
                        <td className="py-3.5 px-4 text-muted-foreground font-semibold">
                          ₹{coup.minSpend}
                        </td>

                        {/* Redemptions */}
                        <td className="py-3.5 px-4 text-muted-foreground font-semibold">
                          {coup.usedCount} {coup.usageLimit ? `/ ${coup.usageLimit}` : 'times'}
                        </td>

                        {/* Validity */}
                        <td className="py-3.5 px-4 text-muted-foreground">
                          {coup.startDate} – {coup.endDate}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">{getStatusBadge(coup.status)}</td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => setPreviewCoupon(coup)}
                              className="h-8 w-8 text-indigo-400 border-border hover:bg-indigo-500/10 cursor-pointer"
                              title="View Details"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleOpenEditModal(coup)}
                              className="h-8 w-8 text-amber-400 border-border hover:bg-amber-500/10 cursor-pointer"
                              title="Edit"
                            >
                              <SquarePen className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => setDeletingCoupon(coup)}
                              className="h-8 w-8 text-rose-500 border-border hover:bg-rose-500/10 cursor-pointer"
                              title="Delete"
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

              {/* Mobile Card Grid View */}
              <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
                {displayedCoupons.map((coup) => (
                  <Card key={coup.id} className="p-4 space-y-3 border border-border/80 bg-card rounded-2xl shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold bg-muted px-2 py-1 rounded border border-border">
                        {coup.code}
                      </span>
                      {getStatusBadge(coup.status)}
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground text-xs">{coup.description}</h4>
                    </div>
                    <div className="flex items-center justify-between text-[11px] pt-2 border-t border-border/60">
                      <span className="text-muted-foreground">Used: {coup.usedCount} times</span>
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setPreviewCoupon(coup)}
                          className="h-8 w-8 text-indigo-400 border-border hover:bg-indigo-500/10 cursor-pointer"
                          title="View"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleOpenEditModal(coup)}
                          className="h-8 w-8 text-amber-400 border-border hover:bg-amber-500/10 cursor-pointer"
                          title="Edit"
                        >
                          <SquarePen className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setDeletingCoupon(coup)}
                          className="h-8 w-8 text-rose-500 border-border hover:bg-rose-500/10 cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </InfiniteScroll>
          )}
        </CardContent>
      </Card>

      {/* Add / Edit Coupon Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto rounded-2xl">
          <form onSubmit={handleSaveCoupon}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
                <Ticket className="h-5 w-5 text-foreground" />
                {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Configure discount rules, promo code, minimum spend, and usage limits.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Form Error Alert */}
              {formError && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs font-semibold">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Coupon Code & Generate Button */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Coupon Code <span className="text-destructive">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="e.g., SUMMER20, WELCOME100"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                    className="h-10 font-mono text-xs uppercase font-bold text-foreground bg-background"
                    required
                  />
                </div>
              </div>

              {/* Discount Type & Discount Value Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Discount Type <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={formDiscountType}
                    onChange={(e) => setFormDiscountType(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-xl border border-input bg-background text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-ring text-foreground"
                    required
                  >
                    <option value="percentage">Percentage Discount (%)</option>
                    <option value="fixed">Fixed Amount Discount (₹)</option>
                    <option value="free_shipping">Free Shipping</option>
                  </select>
                </div>

                {formDiscountType !== 'free_shipping' && (
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Discount Value {formDiscountType === 'percentage' ? '(%)' : '(₹)'} <span className="text-destructive">*</span>
                    </label>
                    <Input
                      type="number"
                      min={1}
                      max={formDiscountType === 'percentage' ? 100 : 50000}
                      placeholder={formDiscountType === 'percentage' ? 'e.g., 20' : 'e.g., 250'}
                      value={formDiscountValue}
                      onChange={(e) => setFormDiscountValue(Number(e.target.value))}
                      className="h-10 text-xs font-semibold text-foreground bg-background"
                      required
                    />
                  </div>
                )}
              </div>

              {/* Min Spend & Max Discount Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Min Order Spend (₹)
                  </label>
                  <Input
                    type="number"
                    min={0}
                    placeholder="e.g., 499 (0 for no min spend)"
                    value={formMinSpend}
                    onChange={(e) => setFormMinSpend(Number(e.target.value))}
                    className="h-10 text-xs font-semibold text-foreground bg-background"
                  />
                </div>

                {formDiscountType === 'percentage' && (
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Max Cap Discount (₹) <span className="font-normal">(Optional)</span>
                    </label>
                    <Input
                      type="number"
                      min={0}
                      placeholder="e.g., 300 (leave empty for un-capped)"
                      value={formMaxDiscount}
                      onChange={(e) => setFormMaxDiscount(e.target.value === '' ? '' : Number(e.target.value))}
                      className="h-10 text-xs font-semibold text-foreground bg-background"
                    />
                  </div>
                )}
              </div>

              {/* Usage Limits */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Total Usage Limit <span className="font-normal">(Leave blank for unlimited)</span>
                  </label>
                  <Input
                    type="number"
                    min={1}
                    placeholder="e.g., 500 redemptions"
                    value={formUsageLimit}
                    onChange={(e) => setFormUsageLimit(e.target.value === '' ? '' : Number(e.target.value))}
                    className="h-10 text-xs font-semibold text-foreground bg-background"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Limit Per Customer
                  </label>
                  <Input
                    type="number"
                    min={1}
                    value={formPerCustomerLimit}
                    onChange={(e) => setFormPerCustomerLimit(Number(e.target.value))}
                    className="h-10 text-xs font-semibold text-foreground bg-background"
                    required
                  />
                </div>
              </div>

              {/* Dates & Status Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Start Date <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="date"
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="h-10 text-xs font-semibold text-foreground bg-background"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    End Date <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="date"
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className="h-10 text-xs font-semibold text-foreground bg-background"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Status <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-xl border border-input bg-background text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-ring text-foreground"
                    required
                  >
                    <option value="Active">Active</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Expired">Expired</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Terms & Description <span className="font-normal">(Optional)</span>
                </label>
                <textarea
                  placeholder="Details explaining the offer eligibility, rules, or restrictions..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={3}
                  className="w-full p-3 rounded-xl border border-input bg-background text-xs font-medium focus:outline-none focus:ring-1 focus:ring-ring resize-y text-foreground"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl text-xs cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs rounded-xl px-5 cursor-pointer"
              >
                {editingCoupon ? 'Update Coupon' : 'Save Coupon'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Coupon Preview / View Modal */}
      <Dialog open={Boolean(previewCoupon)} onOpenChange={(open) => !open && setPreviewCoupon(null)}>
        {previewCoupon && (
          <DialogContent className="sm:max-w-[500px] rounded-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
                <Ticket className="h-5 w-5 text-purple-500" /> Coupon Details
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-lg font-black tracking-widest text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-xl">
                    {previewCoupon.code}
                  </span>
                  {getStatusBadge(previewCoupon.status)}
                </div>
                <p className="text-xs text-foreground font-medium">{previewCoupon.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl border border-border bg-background space-y-1">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold">Discount</span>
                  <div className="font-extrabold text-foreground">
                    {getTypeBadge(previewCoupon.discountType, previewCoupon.discountValue)}
                  </div>
                </div>
                <div className="p-3 rounded-xl border border-border bg-background space-y-1">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold">Minimum Spend</span>
                  <p className="font-bold text-foreground">₹{previewCoupon.minSpend}</p>
                </div>
                <div className="p-3 rounded-xl border border-border bg-background space-y-1">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold">Redemptions</span>
                  <p className="font-bold text-foreground">
                    {previewCoupon.usedCount} {previewCoupon.usageLimit ? `/ ${previewCoupon.usageLimit}` : '(Unlimited)'}
                  </p>
                </div>
                <div className="p-3 rounded-xl border border-border bg-background space-y-1">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold">Customer Limit</span>
                  <p className="font-bold text-foreground">{previewCoupon.perCustomerLimit} per customer</p>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-border bg-background space-y-1 text-xs">
                <span className="text-[10px] text-muted-foreground uppercase font-bold flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Active Validity
                </span>
                <p className="font-semibold text-foreground">
                  {previewCoupon.startDate} to {previewCoupon.endDate}
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                onClick={() => setPreviewCoupon(null)}
                className="w-full rounded-xl text-xs font-semibold cursor-pointer"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={Boolean(deletingCoupon)} onOpenChange={(open) => !open && setDeletingCoupon(null)}>
        {deletingCoupon && (
          <DialogContent className="sm:max-w-[420px] rounded-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base font-bold text-destructive">
                <AlertTriangle className="h-5 w-5" /> Delete Coupon
              </DialogTitle>
              <DialogDescription className="text-xs pt-1 text-muted-foreground">
                Are you sure you want to delete this coupon? Users will no longer be able to apply this code during checkout.
              </DialogDescription>
            </DialogHeader>

            <div className="p-3 rounded-xl border border-border my-2 flex items-center justify-between bg-muted/20">
              <span className="font-mono font-bold text-xs text-foreground bg-background px-2.5 py-1 rounded-md border border-border">
                {deletingCoupon.code}
              </span>
              {getTypeBadge(deletingCoupon.discountType, deletingCoupon.discountValue)}
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeletingCoupon(null)}
                className="rounded-xl text-xs cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleConfirmDelete}
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold text-xs rounded-xl px-5 cursor-pointer"
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
