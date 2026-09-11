import { useState, useMemo, useEffect } from 'react'
import {
  ShoppingBag,
  Search,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  AlertCircle,
  DollarSign,
  Printer,
  ChevronLeft,
  ChevronRight,
  User,
  MapPin,
  CreditCard,
  Calendar,
  Edit3,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  type Order,
  type OrderStatus,
  type PaymentStatus,
  getStoredOrders,
  saveStoredOrders,
} from '@/data/mockOrders'

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [paymentFilter, setPaymentFilter] = useState<string>('All')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest')

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  // Modal States
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false)
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)

  // Status Edit State
  const [editStatus, setEditStatus] = useState<OrderStatus>('Pending')
  const [editTrackingNumber, setEditTrackingNumber] = useState('')
  const [editNotes, setEditNotes] = useState('')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  useEffect(() => {
    setOrders(getStoredOrders())
  }, [])

  const showNotification = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Calculate Metrics
  const metrics = useMemo(() => {
    const totalRevenue = orders
      .filter((o) => o.paymentStatus === 'Paid')
      .reduce((sum, o) => sum + o.totalAmount, 0)

    const totalOrders = orders.length
    const activeOrders = orders.filter(
      (o) => o.orderStatus === 'Pending' || o.orderStatus === 'Processing' || o.orderStatus === 'Shipped'
    ).length
    const deliveredOrders = orders.filter((o) => o.orderStatus === 'Delivered').length

    return { totalRevenue, totalOrders, activeOrders, deliveredOrders }
  }, [orders])

  // Filter & Sort Logic
  const filteredOrders = useMemo(() => {
    return orders
      .filter((order) => {
        const query = searchQuery.toLowerCase().trim()
        const matchesSearch =
          !query ||
          order.orderNumber.toLowerCase().includes(query) ||
          order.customer.name.toLowerCase().includes(query) ||
          order.customer.email.toLowerCase().includes(query) ||
          order.items.some((i) => i.productName.toLowerCase().includes(query))

        const matchesStatus = statusFilter === 'All' || order.orderStatus === statusFilter
        const matchesPayment = paymentFilter === 'All' || order.paymentStatus === paymentFilter

        return matchesSearch && matchesStatus && matchesPayment
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        if (sortBy === 'highest') return b.totalAmount - a.totalAmount
        if (sortBy === 'lowest') return a.totalAmount - b.totalAmount
        return 0
      })
  }, [orders, searchQuery, statusFilter, paymentFilter, sortBy])

  // Pagination Logic
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredOrders.slice(start, start + itemsPerPage)
  }, [filteredOrders, currentPage])

  // Reset filter page if search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter, paymentFilter, sortBy])

  // Open Details Modal
  const handleOpenDetails = (order: Order) => {
    setSelectedOrder(order)
    setIsDetailModalOpen(true)
  }

  // Open Status Modal
  const handleOpenStatusEdit = (order: Order) => {
    setSelectedOrder(order)
    setEditStatus(order.orderStatus)
    setEditTrackingNumber(order.trackingNumber || '')
    setEditNotes(order.notes || '')
    setIsStatusModalOpen(true)
  }

  // Save Status Updates
  const handleSaveStatus = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedOrder) return

    const updatedList = orders.map((o) => {
      if (o.id === selectedOrder.id) {
        return {
          ...o,
          orderStatus: editStatus,
          trackingNumber: editTrackingNumber,
          notes: editNotes,
          updatedAt: new Date().toISOString(),
        }
      }
      return o
    })

    setOrders(updatedList)
    saveStoredOrders(updatedList)
    if (selectedOrder) {
      setSelectedOrder({
        ...selectedOrder,
        orderStatus: editStatus,
        trackingNumber: editTrackingNumber,
        notes: editNotes,
        updatedAt: new Date().toISOString(),
      })
    }
    setIsStatusModalOpen(false)
    showNotification(`Order ${selectedOrder.orderNumber} status updated to "${editStatus}"`)
  }

  // Open Invoice Modal
  const handleOpenInvoice = (order: Order) => {
    setSelectedOrder(order)
    setIsInvoiceModalOpen(true)
  }

  // Status Badge Styling Helper
  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="h-3.5 w-3.5" /> Delivered
          </span>
        )
      case 'Shipped':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <Truck className="h-3.5 w-3.5" /> Shipped
          </span>
        )
      case 'Processing':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Clock className="h-3.5 w-3.5 animate-spin" /> Processing
          </span>
        )
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
            <AlertCircle className="h-3.5 w-3.5" /> Pending
          </span>
        )
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <XCircle className="h-3.5 w-3.5" /> Cancelled
          </span>
        )
      default:
        return null
    }
  }

  const getPaymentBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'Paid':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
            Paid
          </span>
        )
      case 'Pending':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300">
            Pending
          </span>
        )
      case 'Refunded':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-500/15 text-slate-700 dark:text-slate-300">
            Refunded
          </span>
        )
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 bg-popover text-popover-foreground text-xs font-semibold px-4 py-3 rounded-2xl shadow-2xl border border-border animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2.5 text-foreground">
            <ShoppingBag className="h-7 w-7 text-emerald-500" /> Orders Management
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Track customer orders, manage shipping status, view payment breakdowns, and issue invoices.
          </p>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-3xl border border-border/60 bg-gradient-to-br from-emerald-500/5 via-card to-card shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Revenue</p>
              <h3 className="text-2xl font-black mt-1 text-foreground">
                ${metrics.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </h3>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                From paid customer orders
              </p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <DollarSign className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-border/60 bg-gradient-to-br from-blue-500/5 via-card to-card shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Orders</p>
              <h3 className="text-2xl font-black mt-1 text-foreground">{metrics.totalOrders}</h3>
              <p className="text-[11px] text-muted-foreground font-medium mt-1">Lifetime store orders</p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
              <ShoppingBag className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-border/60 bg-gradient-to-br from-amber-500/5 via-card to-card shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">In Progress</p>
              <h3 className="text-2xl font-black mt-1 text-foreground">{metrics.activeOrders}</h3>
              <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-1">
                Pending, processing & shipped
              </p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
              <Truck className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-border/60 bg-gradient-to-br from-purple-500/5 via-card to-card shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Delivered</p>
              <h3 className="text-2xl font-black mt-1 text-foreground">{metrics.deliveredOrders}</h3>
              <p className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold mt-1">
                Successfully fulfilled
              </p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Filter & Search Control Panel */}
      <Card className="rounded-3xl border border-border bg-card shadow-sm">
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by Order #, Customer Name, Email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 rounded-2xl text-xs bg-muted/30 border-border focus-visible:ring-1"
              />
            </div>

            {/* Dropdown Filters */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Order Status Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-muted-foreground hidden sm:inline">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-10 px-3 rounded-2xl border border-input bg-background text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {/* Payment Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-muted-foreground hidden sm:inline">Payment:</span>
                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="h-10 px-3 rounded-2xl border border-input bg-background text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
                >
                  <option value="All">All Payments</option>
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                  <option value="Refunded">Refunded</option>
                </select>
              </div>

              {/* Sort By */}
              <div className="flex items-center gap-1.5">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="h-10 px-3 rounded-2xl border border-input bg-background text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="highest">Amount: High to Low</option>
                  <option value="lowest">Amount: Low to High</option>
                </select>
              </div>
            </div>
          </div>

          {/* Quick Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pt-2 scrollbar-none border-t border-border/40">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider shrink-0 mr-1">
              Quick Filter:
            </span>
            {['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === st
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Orders Table Container */}
      <Card className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
        <CardContent className="p-0">
          {paginatedOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center space-y-3">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                <ShoppingBag className="h-8 w-8" />
              </div>
              <h3 className="text-base font-bold">No orders found</h3>
              <p className="text-xs text-muted-foreground max-w-sm">
                No orders match your search query or selected filter options. Try resetting your search terms.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('')
                  setStatusFilter('All')
                  setPaymentFilter('All')
                }}
                className="rounded-full text-xs mt-2"
              >
                Reset Filters
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/30 text-[11px] font-extrabold uppercase text-muted-foreground tracking-wider">
                    <th className="py-3.5 px-6">Order ID & Date</th>
                    <th className="py-3.5 px-6">Customer</th>
                    <th className="py-3.5 px-6">Items Purchased</th>
                    <th className="py-3.5 px-6">Payment</th>
                    <th className="py-3.5 px-6">Total Amount</th>
                    <th className="py-3.5 px-6">Order Status</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-xs">
                  {paginatedOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-muted/20 transition-colors">
                      {/* Order ID & Date */}
                      <td className="py-4 px-6 font-medium">
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground font-mono">{order.orderNumber}</span>
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Calendar className="h-3 w-3" />
                            {new Date(order.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </td>

                      {/* Customer Info */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          {order.customer.avatar ? (
                            <img
                              src={order.customer.avatar}
                              alt={order.customer.name}
                              className="h-9 w-9 rounded-full object-cover border border-border"
                            />
                          ) : (
                            <div className="h-9 w-9 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs">
                              {order.customer.name.charAt(0)}
                            </div>
                          )}
                          <div className="flex flex-col">
                            <span className="font-bold text-foreground">{order.customer.name}</span>
                            <span className="text-[11px] text-muted-foreground truncate max-w-[150px]">
                              {order.customer.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Items Purchased Preview */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2 overflow-hidden">
                            {order.items.slice(0, 3).map((item) => (
                              <img
                                key={item.id}
                                src={item.image}
                                alt={item.productName}
                                className="inline-block h-8 w-8 rounded-full ring-2 ring-background object-cover"
                                title={`${item.productName} (${item.size})`}
                              />
                            ))}
                          </div>
                          <span className="text-xs font-semibold text-muted-foreground">
                            {order.items.reduce((acc, i) => acc + i.quantity, 0)} item
                            {order.items.reduce((acc, i) => acc + i.quantity, 0) > 1 ? 's' : ''}
                          </span>
                        </div>
                      </td>

                      {/* Payment Status & Method */}
                      <td className="py-4 px-6">
                        <div className="flex flex-col gap-1 items-start">
                          {getPaymentBadge(order.paymentStatus)}
                          <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                            <CreditCard className="h-3 w-3" /> {order.paymentMethod}
                          </span>
                        </div>
                      </td>

                      {/* Total Amount */}
                      <td className="py-4 px-6">
                        <span className="font-extrabold text-foreground text-sm font-mono">
                          ${order.totalAmount.toFixed(2)}
                        </span>
                      </td>

                      {/* Order Status */}
                      <td className="py-4 px-6">{getStatusBadge(order.orderStatus)}</td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDetails(order)}
                            className="h-8 w-8 p-0 rounded-xl border-border hover:bg-muted cursor-pointer"
                            title="View Order Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenStatusEdit(order)}
                            className="h-8 w-8 p-0 rounded-xl border-border text-primary hover:bg-primary/10 cursor-pointer"
                            title="Update Status"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenInvoice(order)}
                            className="h-8 w-8 p-0 rounded-xl border-border text-muted-foreground hover:bg-muted cursor-pointer"
                            title="Print Invoice"
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Footer */}
          {filteredOrders.length > 0 && (
            <div className="p-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredOrders.length)} to{' '}
                {Math.min(currentPage * itemsPerPage, filteredOrders.length)} of {filteredOrders.length} orders
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  className="h-8 text-xs rounded-lg px-3 cursor-pointer"
                >
                  <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Previous
                </Button>
                <span className="font-bold text-foreground px-2">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  className="h-8 text-xs rounded-lg px-3 cursor-pointer"
                >
                  Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Details Drawer Modal */}
      {selectedOrder && (
        <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
          <DialogContent className="sm:max-w-2xl rounded-3xl p-6 max-h-[90vh] overflow-y-auto">
            <DialogHeader className="pb-3 border-b border-border">
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-lg font-bold flex items-center gap-2">
                    Order {selectedOrder.orderNumber}
                  </DialogTitle>
                  <DialogDescription className="text-xs">
                    Placed on{' '}
                    {new Date(selectedOrder.createdAt).toLocaleString('en-US', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </DialogDescription>
                </div>
                <div className="flex items-center gap-2">{getStatusBadge(selectedOrder.orderStatus)}</div>
              </div>
            </DialogHeader>

            <div className="space-y-6 py-3 text-xs">
              {/* Order Status Progress Tracker */}
              <div className="p-4 rounded-2xl bg-muted/40 border border-border">
                <h4 className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider mb-3">
                  Fulfillment Status Tracker
                </h4>
                <div className="grid grid-cols-4 gap-2 text-center">
                  {[
                    { label: 'Order Placed', step: 1, active: true },
                    {
                      label: 'Processing',
                      step: 2,
                      active: ['Processing', 'Shipped', 'Delivered'].includes(selectedOrder.orderStatus),
                    },
                    {
                      label: 'Shipped',
                      step: 3,
                      active: ['Shipped', 'Delivered'].includes(selectedOrder.orderStatus),
                    },
                    { label: 'Delivered', step: 4, active: selectedOrder.orderStatus === 'Delivered' },
                  ].map((s, idx) => (
                    <div key={idx} className="flex flex-col items-center space-y-1">
                      <div
                        className={`h-7 w-7 rounded-full flex items-center justify-center font-bold text-xs ${
                          s.active
                            ? 'bg-emerald-500 text-white shadow-xs'
                            : 'bg-muted text-muted-foreground border border-border'
                        }`}
                      >
                        {s.active ? <CheckCircle2 className="h-4 w-4" /> : s.step}
                      </div>
                      <span
                        className={`text-[10px] font-semibold ${
                          s.active ? 'text-foreground font-bold' : 'text-muted-foreground'
                        }`}
                      >
                        {s.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer & Shipping Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Customer Details */}
                <div className="p-4 rounded-2xl border border-border bg-card space-y-2">
                  <h4 className="font-bold text-foreground flex items-center gap-1.5 text-xs">
                    <User className="h-4 w-4 text-primary" /> Customer Details
                  </h4>
                  <div className="space-y-1 pt-1 text-muted-foreground">
                    <p className="font-bold text-foreground">{selectedOrder.customer.name}</p>
                    <p>{selectedOrder.customer.email}</p>
                    <p>{selectedOrder.customer.phone}</p>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="p-4 rounded-2xl border border-border bg-card space-y-2">
                  <h4 className="font-bold text-foreground flex items-center gap-1.5 text-xs">
                    <MapPin className="h-4 w-4 text-primary" /> Shipping Address
                  </h4>
                  <div className="space-y-1 pt-1 text-muted-foreground">
                    <p className="font-semibold text-foreground">{selectedOrder.shippingAddress.street}</p>
                    <p>
                      {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}{' '}
                      {selectedOrder.shippingAddress.zipCode}
                    </p>
                    <p>{selectedOrder.shippingAddress.country}</p>
                    {selectedOrder.trackingNumber && (
                      <p className="font-mono text-[11px] font-bold text-primary pt-1">
                        Tracking: {selectedOrder.trackingNumber}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Ordered Items Table */}
              <div className="space-y-2">
                <h4 className="font-bold text-foreground text-xs uppercase tracking-wider">Items Breakdown</h4>
                <div className="border border-border rounded-2xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-muted/40 text-[10px] uppercase font-bold text-muted-foreground border-b border-border">
                      <tr>
                        <th className="p-3">Product</th>
                        <th className="p-3">Color & Size</th>
                        <th className="p-3 text-center">Qty</th>
                        <th className="p-3 text-right">Price</th>
                        <th className="p-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {selectedOrder.items.map((item) => (
                        <tr key={item.id}>
                          <td className="p-3 flex items-center gap-2.5">
                            <img
                              src={item.image}
                              alt={item.productName}
                              className="h-10 w-10 rounded-xl object-cover border border-border shrink-0"
                            />
                            <span className="font-semibold text-foreground line-clamp-1">{item.productName}</span>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-1.5">
                              <span
                                className="h-3 w-3 rounded-full border border-border shrink-0"
                                style={{ backgroundColor: item.colorHex }}
                              />
                              <span className="font-medium text-foreground">{item.color}</span>
                              <span className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-bold">
                                {item.size}
                              </span>
                            </div>
                          </td>
                          <td className="p-3 text-center font-bold">{item.quantity}</td>
                          <td className="p-3 text-right font-mono">${item.unitPrice.toFixed(2)}</td>
                          <td className="p-3 text-right font-mono font-bold">
                            ${(item.quantity * item.unitPrice).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="p-4 rounded-2xl bg-muted/30 border border-border flex flex-col sm:flex-row justify-between gap-4">
                <div>
                  <h5 className="font-bold text-foreground mb-1">Payment Method</h5>
                  <p className="text-muted-foreground flex items-center gap-1">
                    <CreditCard className="h-3.5 w-3.5" /> {selectedOrder.paymentMethod} ({selectedOrder.paymentStatus})
                  </p>
                  {selectedOrder.notes && (
                    <div className="mt-2 text-[11px] bg-background p-2 rounded-xl border border-border">
                      <span className="font-bold text-foreground">Notes: </span>
                      <span className="text-muted-foreground">{selectedOrder.notes}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 text-right font-mono text-xs shrink-0 min-w-[200px]">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal:</span>
                    <span>${selectedOrder.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping:</span>
                    <span>${selectedOrder.shippingFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Estimated Tax:</span>
                    <span>${selectedOrder.tax.toFixed(2)}</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                      <span>Discount:</span>
                      <span>-${selectedOrder.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-black text-foreground border-t border-border pt-1.5">
                    <span>Grand Total:</span>
                    <span>${selectedOrder.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 border-t border-border pt-3">
              <Button
                variant="outline"
                onClick={() => setIsDetailModalOpen(false)}
                className="rounded-full text-xs cursor-pointer"
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  setIsDetailModalOpen(false)
                  handleOpenStatusEdit(selectedOrder)
                }}
                className="rounded-full font-semibold text-xs px-5 cursor-pointer"
              >
                <Edit3 className="h-3.5 w-3.5 mr-1.5" /> Update Status
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Order Status Modal */}
      {selectedOrder && (
        <Dialog open={isStatusModalOpen} onOpenChange={setIsStatusModalOpen}>
          <DialogContent className="sm:max-w-md rounded-3xl p-6">
            <form onSubmit={handleSaveStatus}>
              <DialogHeader className="pb-2">
                <DialogTitle className="text-base font-bold">Update Order Status</DialogTitle>
                <DialogDescription className="text-xs">
                  Change fulfillment status for Order #{selectedOrder.orderNumber}.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-3 text-xs">
                {/* Status Dropdown */}
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground uppercase text-[10px]">Order Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as OrderStatus)}
                    className="w-full h-10 px-3 rounded-xl border border-input bg-background text-xs font-semibold focus:ring-1 focus:ring-ring"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Tracking Number */}
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground uppercase text-[10px]">
                    Shipping / Tracking Number
                  </label>
                  <Input
                    placeholder="e.g. FEDEX-98421034US"
                    value={editTrackingNumber}
                    onChange={(e) => setEditTrackingNumber(e.target.value)}
                    className="h-10 text-xs rounded-xl font-mono"
                  />
                </div>

                {/* Admin Notes */}
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground uppercase text-[10px]">Internal Notes</label>
                  <textarea
                    rows={3}
                    placeholder="Add fulfillment notes or customer instructions..."
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-input bg-background text-xs focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsStatusModalOpen(false)}
                  className="rounded-full text-xs cursor-pointer"
                >
                  Cancel
                </Button>
                <Button type="submit" className="rounded-full font-semibold text-xs px-5 cursor-pointer">
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Printable Invoice Modal */}
      {selectedOrder && (
        <Dialog open={isInvoiceModalOpen} onOpenChange={setIsInvoiceModalOpen}>
          <DialogContent className="sm:max-w-xl rounded-3xl p-6 overflow-hidden">
            <DialogHeader className="pb-2">
              <DialogTitle className="text-base font-bold flex items-center justify-between">
                <span>Invoice Preview</span>
                <Button
                  size="sm"
                  onClick={() => window.print()}
                  className="rounded-full text-xs font-semibold cursor-pointer"
                >
                  <Printer className="h-3.5 w-3.5 mr-1.5" /> Print Invoice
                </Button>
              </DialogTitle>
            </DialogHeader>

            {/* Printable Container */}
            <div className="p-6 rounded-2xl border border-border bg-card space-y-6 text-xs font-sans">
              {/* Invoice Header */}
              <div className="flex justify-between items-start border-b border-border pb-4">
                <div>
                  <h2 className="text-xl font-extrabold text-foreground tracking-tight">BAHA KIDS CLOTHING</h2>
                  <p className="text-[11px] text-muted-foreground">Official Sales Receipt & Invoice</p>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold text-foreground text-sm">{selectedOrder.orderNumber}</p>
                  <p className="text-[11px] text-muted-foreground">
                    Date: {new Date(selectedOrder.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Addresses */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-bold text-muted-foreground uppercase text-[10px]">Billed To</p>
                  <p className="font-bold text-foreground">{selectedOrder.customer.name}</p>
                  <p className="text-muted-foreground">{selectedOrder.customer.email}</p>
                  <p className="text-muted-foreground">{selectedOrder.customer.phone}</p>
                </div>
                <div>
                  <p className="font-bold text-muted-foreground uppercase text-[10px]">Ship To</p>
                  <p className="text-muted-foreground">{selectedOrder.shippingAddress.street}</p>
                  <p className="text-muted-foreground">
                    {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}{' '}
                    {selectedOrder.shippingAddress.zipCode}
                  </p>
                  <p className="text-muted-foreground">{selectedOrder.shippingAddress.country}</p>
                </div>
              </div>

              {/* Items List */}
              <div className="border border-border rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-muted/40 text-[10px] uppercase font-bold text-muted-foreground">
                    <tr>
                      <th className="p-2.5">Item Description</th>
                      <th className="p-2.5 text-center">Qty</th>
                      <th className="p-2.5 text-right">Price</th>
                      <th className="p-2.5 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {selectedOrder.items.map((item) => (
                      <tr key={item.id}>
                        <td className="p-2.5">
                          <span className="font-semibold text-foreground">{item.productName}</span>
                          <span className="block text-[10px] text-muted-foreground">
                            Color: {item.color} | Size: {item.size}
                          </span>
                        </td>
                        <td className="p-2.5 text-center font-bold">{item.quantity}</td>
                        <td className="p-2.5 text-right font-mono">${item.unitPrice.toFixed(2)}</td>
                        <td className="p-2.5 text-right font-mono font-bold">
                          ${(item.quantity * item.unitPrice).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Total Calculation */}
              <div className="flex justify-end pt-2">
                <div className="space-y-1 text-right font-mono min-w-[180px]">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal:</span>
                    <span>${selectedOrder.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping:</span>
                    <span>${selectedOrder.shippingFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Tax:</span>
                    <span>${selectedOrder.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-extrabold text-foreground border-t border-border pt-1 text-sm">
                    <span>Total:</span>
                    <span>${selectedOrder.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsInvoiceModalOpen(false)}
                className="rounded-full text-xs cursor-pointer"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
