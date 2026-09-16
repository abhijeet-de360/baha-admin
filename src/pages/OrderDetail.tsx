import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Calendar,
  User,
  MapPin,
  CreditCard,
  Printer,
  Edit3,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  AlertCircle,
  Package,
  DollarSign,
  FileText,
  Sparkles,
  Phone,
  Mail,
  Copy,
  Check
} from 'lucide-react'
import { Button } from '@/components/ui/button'
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
  type Order,
  type OrderStatus,
  type PaymentStatus,
  getStoredOrders,
  saveStoredOrders,
} from '@/data/mockOrders'
import { Input } from '@/components/ui/input'

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [orders, setOrders] = useState<Order[]>(getStoredOrders)
  const [order, setOrder] = useState<Order | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [copiedTracking, setCopiedTracking] = useState(false)

  // Status Edit Modal State
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const [editStatus, setEditStatus] = useState<OrderStatus>('Pending')
  const [editTrackingNumber, setEditTrackingNumber] = useState('')
  const [editNotes, setEditNotes] = useState('')

  // Invoice Modal State
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false)

  useEffect(() => {
    const stored = getStoredOrders()
    setOrders(stored)
    const found = stored.find((o) => o.id === id || o.orderNumber === id)
    if (found) {
      setOrder(found)
      setEditStatus(found.orderStatus)
      setEditTrackingNumber(found.trackingNumber || '')
      setEditNotes(found.notes || '')
    }
  }, [id])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const handleUpdateStatus = (e: React.FormEvent) => {
    e.preventDefault()
    if (!order) return

    const updatedList = orders.map((o) =>
      o.id === order.id
        ? {
            ...o,
            orderStatus: editStatus,
            trackingNumber: editTrackingNumber.trim() || undefined,
            notes: editNotes.trim() || undefined,
            updatedAt: new Date().toISOString(),
          }
        : o
    )

    const updatedOrder = updatedList.find((o) => o.id === order.id) || null
    setOrders(updatedList)
    saveStoredOrders(updatedList)
    setOrder(updatedOrder)
    setIsStatusModalOpen(false)
    showToast(`Order status updated to "${editStatus}"`)
  }

  const handleCopyTracking = (tracking: string) => {
    navigator.clipboard.writeText(tracking)
    setCopiedTracking(true)
    showToast('Tracking number copied to clipboard.')
    setTimeout(() => setCopiedTracking(false), 2000)
  }

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Delivered':
        return (
          <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-bold px-3 py-1 text-xs gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" /> Delivered
          </Badge>
        )
      case 'Shipped':
        return (
          <Badge className="bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20 font-bold px-3 py-1 text-xs gap-1.5">
            <Truck className="h-3.5 w-3.5" /> Shipped
          </Badge>
        )
      case 'Processing':
        return (
          <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20 font-bold px-3 py-1 text-xs gap-1.5">
            <Clock className="h-3.5 w-3.5" /> Processing
          </Badge>
        )
      case 'Pending':
        return (
          <Badge className="bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/20 font-bold px-3 py-1 text-xs gap-1.5">
            <AlertCircle className="h-3.5 w-3.5" /> Pending
          </Badge>
        )
      case 'Cancelled':
        return (
          <Badge className="bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/20 font-bold px-3 py-1 text-xs gap-1.5">
            <XCircle className="h-3.5 w-3.5" /> Cancelled
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPaymentBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'Paid':
        return (
          <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/20 font-bold text-xs">
            Paid
          </Badge>
        )
      case 'Pending':
        return (
          <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/20 font-bold text-xs">
            Pending
          </Badge>
        )
      case 'Refunded':
        return (
          <Badge className="bg-slate-500/15 text-slate-600 dark:text-slate-300 border-slate-500/20 font-bold text-xs">
            Refunded
          </Badge>
        )
    }
  }

  if (!order) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center space-y-4">
        <div className="p-4 rounded-full bg-muted inline-block text-muted-foreground">
          <Package className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold">Order Not Found</h2>
        <p className="text-xs text-muted-foreground">
          No order matching identifier "{id}" was found in the system.
        </p>
        <Button onClick={() => navigate('/orders')} className="gap-2 text-xs">
          <ArrowLeft className="h-4 w-4" /> Back to Orders
        </Button>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-[1400px] mx-auto pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 bg-primary text-primary-foreground text-xs font-semibold px-4 py-3 rounded-2xl shadow-2xl border border-border animate-in fade-in slide-in-from-top-4">
          <Sparkles className="h-4 w-4 text-amber-300 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/orders')}
            className="h-10 w-10 rounded-2xl border-border hover:bg-muted cursor-pointer shrink-0"
            title="Back to Orders"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight text-foreground font-mono">
                {order.orderNumber}
              </h1>
              {getStatusBadge(order.orderStatus)}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              Placed on{' '}
              {new Date(order.createdAt).toLocaleString('en-US', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setEditStatus(order.orderStatus)
              setEditTrackingNumber(order.trackingNumber || '')
              setEditNotes(order.notes || '')
              setIsStatusModalOpen(true)
            }}
            className="gap-2 text-xs font-semibold border-border hover:bg-accent cursor-pointer"
          >
            <Edit3 className="h-4 w-4 text-primary" /> Update Status
          </Button>

          <Button
            onClick={() => setIsInvoiceModalOpen(true)}
            className="gap-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md cursor-pointer"
          >
            <Printer className="h-4 w-4" /> Print Invoice
          </Button>
        </div>
      </div>

      {/* Fulfillment Status Tracker Card */}
      <Card className="rounded-3xl border border-border bg-card shadow-xs">
        <CardContent className="p-6">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">
            Order Fulfillment Progress
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Order Placed', step: 1, active: true },
              {
                label: 'Processing',
                step: 2,
                active: ['Processing', 'Shipped', 'Delivered'].includes(order.orderStatus),
              },
              {
                label: 'Shipped',
                step: 3,
                active: ['Shipped', 'Delivered'].includes(order.orderStatus),
              },
              { label: 'Delivered', step: 4, active: order.orderStatus === 'Delivered' },
            ].map((s, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-2xl border text-center transition-all ${
                  s.active
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-foreground'
                    : 'bg-muted/30 border-border/50 text-muted-foreground'
                }`}
              >
                <div
                  className={`h-8 w-8 mx-auto mb-2 rounded-full flex items-center justify-center font-bold text-xs ${
                    s.active
                      ? 'bg-emerald-500 text-white shadow-md'
                      : 'bg-muted text-muted-foreground border border-border'
                  }`}
                >
                  {s.active ? <CheckCircle2 className="h-4 w-4" /> : s.step}
                </div>
                <span className="text-xs font-bold block">{s.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 2-Column Info Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Customer & Shipping */}
        <div className="lg:col-span-2 space-y-6">
          {/* Purchased Items Card */}
          <Card className="rounded-3xl border border-border bg-card shadow-xs overflow-hidden">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Package className="h-4 w-4 text-indigo-500" />
                Items Purchased ({order.items.reduce((acc, i) => acc + i.quantity, 0)})
              </h3>

              <div className="border border-border rounded-2xl overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-muted/40 text-[11px] font-bold uppercase text-muted-foreground border-b border-border">
                    <tr>
                      <th className="py-3 px-4">Item Details</th>
                      <th className="py-3 px-4">Color & Size</th>
                      <th className="py-3 px-4 text-center">Qty</th>
                      <th className="py-3 px-4 text-right">Unit Price</th>
                      <th className="py-3 px-4 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {order.items.map((item) => (
                      <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={item.image}
                              alt={item.productName}
                              className="h-12 w-12 rounded-xl object-cover border border-border shrink-0 shadow-2xs"
                            />
                            <span className="font-bold text-foreground text-sm line-clamp-1">
                              {item.productName}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="h-3.5 w-3.5 rounded-full border border-border shrink-0 shadow-2xs"
                              style={{ backgroundColor: item.colorHex }}
                            />
                            <span className="font-medium text-foreground">{item.color}</span>
                            <span className="px-2 py-0.5 rounded-md bg-muted text-[10px] font-bold border border-border">
                              {item.size}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-sm">{item.quantity}</td>
                        <td className="py-3.5 px-4 text-right font-mono">${item.unitPrice.toFixed(2)}</td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-sm">
                          ${(item.quantity * item.unitPrice).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Customer & Address Details Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Customer Details */}
            <Card className="rounded-3xl border border-border bg-card shadow-xs">
              <CardContent className="p-5 space-y-3">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <User className="h-4 w-4 text-indigo-500" /> Customer Information
                </h4>
                <div className="flex items-center gap-3 pt-1">
                  {order.customer.avatar ? (
                    <img
                      src={order.customer.avatar}
                      alt={order.customer.name}
                      className="h-11 w-11 rounded-full object-cover border border-border shadow-2xs"
                    />
                  ) : (
                    <div className="h-11 w-11 rounded-full bg-indigo-500/10 text-indigo-500 font-bold flex items-center justify-center text-sm">
                      {order.customer.name.charAt(0)}
                    </div>
                  )}
                  <div className="space-y-0.5">
                    <p className="font-bold text-foreground text-sm">{order.customer.name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Mail className="h-3 w-3 shrink-0" /> {order.customer.email}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Phone className="h-3 w-3 shrink-0" /> {order.customer.phone}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card className="rounded-3xl border border-border bg-card shadow-xs">
              <CardContent className="p-5 space-y-3">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-indigo-500" /> Shipping Destination
                </h4>
                <div className="text-xs space-y-1 text-muted-foreground pt-1">
                  <p className="font-bold text-foreground text-sm">{order.shippingAddress.street}</p>
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                    {order.shippingAddress.zipCode}
                  </p>
                  <p className="font-medium">{order.shippingAddress.country}</p>

                  {order.trackingNumber && (
                    <div className="pt-2 flex items-center justify-between bg-muted/40 p-2 rounded-xl border border-border/50">
                      <span className="font-mono text-xs font-bold text-indigo-400">
                        {order.trackingNumber}
                      </span>
                      <button
                        onClick={() => handleCopyTracking(order.trackingNumber!)}
                        className="text-muted-foreground hover:text-foreground cursor-pointer"
                        title="Copy Tracking"
                      >
                        {copiedTracking ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column: Payment & Order Summary */}
        <div className="space-y-6">
          {/* Order Summary Box */}
          <Card className="rounded-3xl border border-border bg-card shadow-xs">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
                <DollarSign className="h-4 w-4 text-indigo-500" /> Payment & Billing Summary
              </h3>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between text-muted-foreground">
                  <span>Items Subtotal:</span>
                  <span className="text-foreground font-semibold">${order.subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping Fee:</span>
                  <span className="text-foreground font-semibold">${order.shippingFee.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-muted-foreground">
                  <span>Estimated Tax:</span>
                  <span className="text-foreground font-semibold">${order.tax.toFixed(2)}</span>
                </div>

                {order.discount > 0 && (
                  <div className="flex justify-between text-emerald-500 font-semibold">
                    <span>Discount Applied:</span>
                    <span>-${order.discount.toFixed(2)}</span>
                  </div>
                )}

                <div className="border-t border-border pt-3 mt-2 flex justify-between text-base font-bold text-foreground">
                  <span>Grand Total:</span>
                  <span className="text-indigo-400 font-extrabold">${order.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Status & Method */}
              <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground font-bold uppercase block">Payment Method</span>
                  <span className="font-semibold text-foreground flex items-center gap-1">
                    <CreditCard className="h-3.5 w-3.5 text-muted-foreground" /> {order.paymentMethod}
                  </span>
                </div>
                <div>{getPaymentBadge(order.paymentStatus)}</div>
              </div>
            </CardContent>
          </Card>

          {/* Admin Notes Card if present */}
          {order.notes && (
            <Card className="rounded-3xl border border-border bg-card shadow-xs">
              <CardContent className="p-5 space-y-2">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <FileText className="h-4 w-4 text-indigo-500" /> Customer Notes
                </h4>
                <p className="text-xs text-foreground italic bg-muted/30 p-3 rounded-xl border border-border/50">
                  "{order.notes}"
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Status Update Modal */}
      <Dialog open={isStatusModalOpen} onOpenChange={setIsStatusModalOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6 bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Edit3 className="h-5 w-5 text-indigo-400" /> Update Order Status
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Modify the order fulfillment status and add shipping tracking information.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdateStatus} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Order Status</label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as OrderStatus)}
                className="w-full h-10 rounded-xl border border-border bg-background px-3 py-1 text-sm font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Tracking Number</label>
              <Input
                placeholder="e.g. FEDEX-98421034US"
                value={editTrackingNumber}
                onChange={(e) => setEditTrackingNumber(e.target.value)}
                className="h-10 rounded-xl border-border bg-background text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Admin Notes</label>
              <textarea
                placeholder="Internal notes regarding delivery..."
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 min-h-[60px]"
              />
            </div>

            <DialogFooter className="pt-3 border-t border-border gap-2">
              <Button type="button" variant="outline" onClick={() => setIsStatusModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                Save Status
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Invoice Modal */}
      <Dialog open={isInvoiceModalOpen} onOpenChange={setIsInvoiceModalOpen}>
        <DialogContent className="sm:max-w-2xl rounded-3xl p-6 bg-card border-border max-h-[90vh] overflow-y-auto">
          <DialogHeader className="border-b border-border pb-3">
            <DialogTitle className="text-lg font-bold flex items-center justify-between">
              <span>Tax Invoice - {order.orderNumber}</span>
            </DialogTitle>
          </DialogHeader>

          <div id="printable-invoice" className="p-6 bg-white text-black rounded-xl space-y-6 text-xs">
            <div className="flex justify-between items-start border-b pb-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight">BAHA STORE</h2>
                <p className="text-[11px] text-gray-500">Official Purchase Invoice</p>
              </div>
              <div className="text-right font-mono text-[11px]">
                <p className="font-bold">{order.orderNumber}</p>
                <p className="text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-bold text-[11px] uppercase text-gray-500">Billed To:</p>
                <p className="font-bold text-sm">{order.customer.name}</p>
                <p>{order.customer.email}</p>
                <p>{order.customer.phone}</p>
              </div>
              <div>
                <p className="font-bold text-[11px] uppercase text-gray-500">Shipping Address:</p>
                <p className="font-semibold">{order.shippingAddress.street}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                <p>{order.shippingAddress.country}</p>
              </div>
            </div>

            <table className="w-full text-left border-collapse border-y border-gray-200">
              <thead>
                <tr className="bg-gray-50 text-[10px] uppercase font-bold text-gray-500">
                  <th className="p-2">Item</th>
                  <th className="p-2 text-center">Qty</th>
                  <th className="p-2 text-right">Price</th>
                  <th className="p-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="p-2 font-medium">{item.productName} ({item.color}, {item.size})</td>
                    <td className="p-2 text-center">{item.quantity}</td>
                    <td className="p-2 text-right font-mono">${item.unitPrice.toFixed(2)}</td>
                    <td className="p-2 text-right font-mono font-bold">${(item.quantity * item.unitPrice).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end font-mono text-xs">
              <div className="w-48 space-y-1 text-right">
                <div className="flex justify-between"><span>Subtotal:</span><span>${order.subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Shipping:</span><span>${order.shippingFee.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Tax:</span><span>${order.tax.toFixed(2)}</span></div>
                <div className="flex justify-between font-bold text-sm border-t pt-1"><span>Total:</span><span>${order.totalAmount.toFixed(2)}</span></div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 border-t border-border pt-3">
            <Button variant="outline" onClick={() => setIsInvoiceModalOpen(false)}>
              Close
            </Button>
            <Button onClick={() => window.print()} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              <Printer className="h-4 w-4 mr-1" /> Print / Save PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
