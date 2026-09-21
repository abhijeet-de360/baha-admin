import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  DollarSign,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Users,
  Package,
  AlertTriangle,
  ShoppingCart,
  TrendingUp,
  ArrowRight,
  Eye,
  RefreshCw,
  Sparkles,
  ChevronRight,
  BadgeAlert,
  CreditCard
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

import { getStoredOrders, type Order } from '@/data/mockOrders'
import { getStoredProducts, type Product } from '@/data/mockProducts'
import { getStoredCustomers, type Customer } from '@/data/mockCustomers'
import { getStoredAbandonedCarts, type AbandonedCart } from '@/data/mockAbandonedCarts'

export default function DashboardPage() {
  const navigate = useNavigate()
  const [orders] = useState<Order[]>(getStoredOrders)
  const [products] = useState<Product[]>(getStoredProducts)
  const [customers] = useState<Customer[]>(getStoredCustomers)
  const [abandonedCarts] = useState<AbandonedCart[]>(getStoredAbandonedCarts)

  // Computed Metrics
  const metrics = useMemo(() => {
    // Total Sales (Revenue from non-cancelled orders)
    const validOrders = orders.filter(o => o.orderStatus !== 'Cancelled')
    const totalSales = validOrders.reduce((sum, o) => sum + o.totalAmount, 0)
    
    // Total Orders Count
    const totalOrders = orders.length

    // Pending Orders Count
    const pendingOrders = orders.filter(o => o.orderStatus === 'Pending').length

    // Delivered Orders Count
    const deliveredOrders = orders.filter(o => o.orderStatus === 'Delivered').length

    // Total Customers Count
    const totalCustomers = customers.length

    // Total Products Count
    const totalProducts = products.length

    // Low Stock Products Count
    const lowStockProducts = products.filter(
      p => p.stockStatus === 'Low Stock' || p.stockQuantity <= p.lowStockThreshold || p.stockQuantity <= 10
    )

    // Abandoned Carts Count
    const activeAbandonedCarts = abandonedCarts.filter(c => c.status !== 'Recovered').length

    // Revenue breakdown
    const shippingCollected = validOrders.reduce((sum, o) => sum + (o.shippingFee || 0), 0)
    const avgOrderValue = validOrders.length > 0 ? (totalSales / validOrders.length).toFixed(2) : '0.00'
    const cancelledTotal = orders
      .filter(o => o.orderStatus === 'Cancelled')
      .reduce((sum, o) => sum + o.totalAmount, 0)

    return {
      totalSales,
      totalOrders,
      pendingOrders,
      deliveredOrders,
      totalCustomers,
      totalProducts,
      lowStockProductsList: lowStockProducts,
      lowStockCount: lowStockProducts.length,
      activeAbandonedCarts,
      shippingCollected,
      avgOrderValue,
      cancelledTotal,
    }
  }, [orders, products, customers, abandonedCarts])

  // Get recent 5 orders for table
  const recentOrders = useMemo(() => {
    return [...orders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
  }, [orders])

  const getOrderStatusBadge = (status: Order['orderStatus']) => {
    switch (status) {
      case 'Pending':
        return <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 font-medium">Pending</Badge>
      case 'Processing':
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 font-medium">Processing</Badge>
      case 'Shipped':
        return <Badge variant="outline" className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 font-medium">Shipped</Badge>
      case 'Delivered':
        return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-medium">Delivered</Badge>
      case 'Cancelled':
        return <Badge variant="outline" className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 font-medium">Cancelled</Badge>
    }
  }

  return (
    <div className="space-y-4 max-w-full mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Store Dashboard
            <Sparkles className="h-5 w-5 text-amber-500" />
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time overview of your sales revenue, orders status, inventory health, and customer growth.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="gap-2 text-xs"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh Data
          </Button>
          <Button
            size="sm"
            onClick={() => navigate('/products/add')}
            className="gap-2 text-xs"
          >
            <Package className="h-3.5 w-3.5" />
            Add Product
          </Button>
        </div>
      </div>

      {/* 8 Primary Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Sales */}
        <Card
          onClick={() => navigate('/orders')}
          className="border border-border/60 shadow-xs bg-card hover:border-border transition-all cursor-pointer group"
        >
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Total Sales
              </span>
              <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-foreground">
                ${metrics.totalSales.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-emerald-500" />
                <span>Revenue from all paid orders</span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 2. Total Orders */}
        <Card
          onClick={() => navigate('/orders')}
          className="border border-border/60 shadow-xs bg-card hover:border-border transition-all cursor-pointer group"
        >
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Total Orders
              </span>
              <div className="h-9 w-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ShoppingBag className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-foreground">{metrics.totalOrders}</div>
              <p className="text-xs text-muted-foreground mt-1">
                All time customer orders placed
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 3. Pending Orders */}
        <Card
          onClick={() => navigate('/orders')}
          className="border border-border/60 shadow-xs bg-card hover:border-border transition-all cursor-pointer group"
        >
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Pending Orders
              </span>
              <div className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Clock className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-foreground">{metrics.pendingOrders}</div>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-medium">
                Awaiting fulfillment & dispatch
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 4. Delivered Orders */}
        <Card
          onClick={() => navigate('/orders')}
          className="border border-border/60 shadow-xs bg-card hover:border-border transition-all cursor-pointer group"
        >
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Delivered Orders
              </span>
              <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-foreground">{metrics.deliveredOrders}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Successfully delivered orders
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 5. Customers */}
        <Card
          onClick={() => navigate('/customers')}
          className="border border-border/60 shadow-xs bg-card hover:border-border transition-all cursor-pointer group"
        >
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Total Customers
              </span>
              <div className="h-9 w-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-foreground">{metrics.totalCustomers}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Registered user accounts
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 6. Products */}
        <Card
          onClick={() => navigate('/products')}
          className="border border-border/60 shadow-xs bg-card hover:border-border transition-all cursor-pointer group"
        >
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Total Products
              </span>
              <div className="h-9 w-9 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Package className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-foreground">{metrics.totalProducts}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Items listed in catalog
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 7. Low-Stock Products */}
        <Card
          onClick={() => navigate('/products')}
          className={`border shadow-xs bg-card hover:border-border transition-all cursor-pointer group ${
            metrics.lowStockCount > 0 ? 'border-rose-500/30 bg-rose-500/5' : 'border-border/60'
          }`}
        >
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Low-Stock Products
              </span>
              <div className="h-9 w-9 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <AlertTriangle className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-foreground">{metrics.lowStockCount}</div>
              <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 font-medium">
                {metrics.lowStockCount > 0 ? 'Requires immediate restock' : 'All stock levels healthy'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 8. Abandoned Carts */}
        <Card
          onClick={() => navigate('/abandoned-carts')}
          className="border border-border/60 shadow-xs bg-card hover:border-border transition-all cursor-pointer group"
        >
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Abandoned Carts
              </span>
              <div className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ShoppingCart className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-foreground">{metrics.activeAbandonedCarts}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <span>Actionable for recovery</span>
                <ChevronRight className="h-3 w-3" />
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Breakdown & Low-Stock Alerts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Information Breakdown Card (2 cols) */}
        <Card className="lg:col-span-2 border border-border/60 shadow-xs bg-card">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-emerald-500" />
              Basic Revenue Information
            </CardTitle>
            <CardDescription className="text-xs">
              Summary breakdown of total earnings, shipping fees collected, and average order value.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-muted/40 border border-border/60">
                <span className="text-xs text-muted-foreground font-medium block">Average Order Value (AOV)</span>
                <span className="text-xl font-bold text-foreground mt-1 block">${metrics.avgOrderValue}</span>
                <span className="text-[11px] text-muted-foreground">Per completed checkout</span>
              </div>

              <div className="p-4 rounded-xl bg-muted/40 border border-border/60">
                <span className="text-xs text-muted-foreground font-medium block">Shipping Fees Collected</span>
                <span className="text-xl font-bold text-foreground mt-1 block">${metrics.shippingCollected.toFixed(2)}</span>
                <span className="text-[11px] text-muted-foreground">Total freight revenue</span>
              </div>

              <div className="p-4 rounded-xl bg-muted/40 border border-border/60">
                <span className="text-xs text-muted-foreground font-medium block">Cancelled Orders Lost</span>
                <span className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-1 block">${metrics.cancelledTotal.toFixed(2)}</span>
                <span className="text-[11px] text-muted-foreground">Returned / cancelled sales</span>
              </div>
            </div>

            {/* Quick action bar */}
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-foreground">Want to inspect detailed financial reports?</span>
                <p className="text-xs text-muted-foreground">Manage order statuses, invoices, and payment verification.</p>
              </div>
              <Button size="sm" onClick={() => navigate('/orders')} className="gap-1.5 text-xs shrink-0">
                <span>Manage Orders</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Low-Stock Alert List Card (1 col) */}
        <Card className="border border-border/60 shadow-xs bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BadgeAlert className="h-5 w-5 text-rose-500" />
                <span>Low-Stock Alerts</span>
              </div>
              <Badge variant="outline" className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 font-bold text-xs">
                {metrics.lowStockCount}
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs">
              Products running low on inventory threshold.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {metrics.lowStockProductsList.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                <CheckCircle2 className="h-8 w-8 text-emerald-500/50 mx-auto mb-2" />
                All product stock levels are sufficient.
              </div>
            ) : (
              <div className="space-y-3">
                {metrics.lowStockProductsList.slice(0, 4).map((product) => (
                  <div
                    key={product.id}
                    onClick={() => navigate(`/products/edit/${product.id}`)}
                    className="p-3 rounded-lg border border-border/60 hover:bg-accent/40 transition-colors flex items-center justify-between gap-3 cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className="h-10 w-10 rounded-md object-cover border border-border shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">{product.title}</p>
                        <p className="text-[11px] text-muted-foreground">{product.sku}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <Badge className="bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30 text-[11px] font-bold">
                        {product.stockQuantity} left
                      </Badge>
                    </div>
                  </div>
                ))}

                {metrics.lowStockProductsList.length > 4 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/products')}
                    className="w-full text-xs text-muted-foreground hover:text-foreground"
                  >
                    View all {metrics.lowStockProductsList.length} low-stock items →
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders Section */}
      <Card className="border border-border/60 shadow-xs bg-card">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-blue-500" />
              Recent Orders
            </CardTitle>
            <CardDescription className="text-xs">
              Latest transactions placed on the platform.
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/orders')}
            className="text-xs gap-1"
          >
            <span>View All Orders</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse min-w-[700px]">
              <thead>
                <tr className="border-y border-border bg-muted/40 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Order Number</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Total Amount</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-accent/30 transition-colors">
                    <td className="py-3 px-4 font-semibold text-foreground">
                      {order.orderNumber}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-7 w-7 border border-border">
                          <AvatarImage src={order.customer.avatar} />
                          <AvatarFallback className="text-[10px] font-bold">
                            {order.customer.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-xs font-medium text-foreground">{order.customer.name}</p>
                          <p className="text-[11px] text-muted-foreground">{order.customer.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-3 px-4">
                      {getOrderStatusBadge(order.orderStatus)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-foreground">
                      ${order.totalAmount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/orders/${order.id}`)}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
