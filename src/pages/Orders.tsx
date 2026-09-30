import { useState, useMemo, useEffect } from 'react'
import {
  ShoppingBag,
  CheckCircle2,
  Truck,
  IndianRupee,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { type Order, getStoredOrders } from '@/data/mockOrders'
import OrdersTable from '@/components/OrdersTable/OrdersTable'

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    setOrders(getStoredOrders())
  }, [])

  // KPI Metrics
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

  return (
    <div className="space-y-4 max-w-full mx-auto">
      {/* Page Title */}
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
                ₹{metrics.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </h3>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                From paid customer orders
              </p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <IndianRupee className="h-6 w-6" />
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

      {/* Reusable Orders Table (filters + list + modals) */}
      <OrdersTable
        orders={orders}
        onOrdersChange={setOrders}
      />
    </div>
  )
}
