import { useState, useMemo, useEffect } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import {
  ShoppingCart,
  Search,
  Clock,
  X
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

import {
  type AbandonedCart,
  getStoredAbandonedCarts,
} from '@/data/mockAbandonedCarts'

export default function AbandonedCarts() {
  const [carts] = useState<AbandonedCart[]>(getStoredAbandonedCarts)
  const [searchQuery, setSearchQuery] = useState('')

  // Infinite Scroll State
  const [visibleCount, setVisibleCount] = useState(10)

  // Reset scroll batch on search change
  useEffect(() => {
    setVisibleCount(10)
  }, [searchQuery])

  // Search Filtering
  const filteredCarts = useMemo(() => {
    const query = searchQuery.toLowerCase().trim()
    if (!query) return carts

    return carts.filter((cart) => {
      const matchesCustomer =
        cart.customer.name.toLowerCase().includes(query) ||
        cart.customer.email.toLowerCase().includes(query) ||
        cart.customer.phone.toLowerCase().includes(query) ||
        cart.cartNumber.toLowerCase().includes(query)

      const matchesItems = cart.items.some((item) =>
        item.name.toLowerCase().includes(query)
      )

      return matchesCustomer || matchesItems
    })
  }, [carts, searchQuery])

  // Displayed items slice for InfiniteScroll
  const displayedCarts = useMemo(() => {
    return filteredCarts.slice(0, visibleCount)
  }, [filteredCarts, visibleCount])

  const fetchMoreCarts = () => {
    if (visibleCount < filteredCarts.length) {
      setVisibleCount((prev) => prev + 10)
    }
  }

  // Relative Time Helper
  const getRelativeTime = (isoString: string) => {
    const diffMs = Date.now() - new Date(isoString).getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffHours < 1) return 'Just now'
    if (diffHours === 1) return '1 hour ago'
    if (diffHours < 24) return `${diffHours} hours ago`
    if (diffDays === 1) return '1 day ago'
    return `${diffDays} days ago`
  }

  return (
    <div className="space-y-3 w-full max-w-full overflow-x-hidden mx-auto">
      {/* Top Banner Header & Search Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-card border border-border/80 rounded-xl p-3 sm:p-4 shadow-2xs w-full">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
              <ShoppingCart className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground truncate">
                  Abandoned Carts
                </h1>
                <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 font-semibold px-2 py-0 text-[11px] shrink-0">
                  {filteredCarts.length} {filteredCarts.length === 1 ? 'Cart' : 'Carts'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                Overview of customers and products left unpurchased in checkout carts.
              </p>
            </div>
          </div>
        </div>

        {/* Search Input Box */}
        <div className="relative w-full md:w-72 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search customer, email, phone or product..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
            }}
            className="pl-9 pr-8 h-9 w-full bg-background/80 rounded-lg text-xs border-border/80 focus-visible:ring-amber-500/30"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground hover:text-foreground rounded-full"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Main Table / Cards Display */}
      <Card className="border border-border/80 shadow-2xs bg-card rounded-xl overflow-hidden w-full">
        {displayedCarts.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground p-4">
            <ShoppingCart className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm font-semibold text-foreground">No abandoned carts found</p>
          </div>
        ) : (
          <InfiniteScroll
            dataLength={displayedCarts.length}
            next={fetchMoreCarts}
            hasMore={visibleCount < filteredCarts.length}
            loader={
              <div className="py-4 text-center text-xs text-muted-foreground font-medium">
                Loading more abandoned carts...
              </div>
            }
            endMessage={
              <div className="py-4 text-center text-xs text-muted-foreground font-medium">
                Showing all {filteredCarts.length} abandoned carts
              </div>
            }
          >
            {/* Desktop Table View (Visible on Large Screens >= lg) */}
            <div className="hidden lg:block overflow-x-auto w-full">
              <table className="w-full text-left text-xs border-collapse min-w-[850px]">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold uppercase tracking-wider">
                    <th className="py-2.5 px-4 min-w-[220px]">Customer</th>
                    <th className="py-2.5 px-4 min-w-[380px]">Cart Items</th>
                    <th className="py-2.5 px-4 text-right min-w-[120px]">Total Amount</th>
                    <th className="py-2.5 px-4 text-right min-w-[130px]">Abandoned</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {displayedCarts.map((cart) => (
                    <tr key={cart.id} className="hover:bg-accent/30 transition-colors">
                      {/* Customer Details */}
                      <td className="py-3 px-4 align-top">
                        <div className="flex items-center gap-2.5">
                          <Avatar className="h-8 w-8 border border-border shrink-0">
                            <AvatarImage src={cart.customer.avatar} alt={cart.customer.name} />
                            <AvatarFallback className="bg-amber-500/10 text-amber-600 font-bold text-[10px]">
                              {cart.customer.name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-bold text-foreground text-xs leading-tight truncate">
                              {cart.customer.name}
                            </p>
                            <p className="text-[11px] text-muted-foreground truncate">{cart.customer.email}</p>
                            <p className="text-[11px] text-muted-foreground truncate">{cart.customer.phone}</p>
                          </div>
                        </div>
                      </td>

                      {/* Items List */}
                      <td className="py-3 px-4 align-top">
                        <div className="space-y-1.5 max-w-md">
                          {cart.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center gap-2 text-xs bg-muted/30 p-1.5 rounded-lg border border-border/40"
                            >
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-7 w-7 rounded object-cover border border-border shrink-0"
                              />
                              <div className="min-w-0 flex-1">
                                <p className="font-semibold text-foreground text-xs truncate">{item.name}</p>
                                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                  <span>{item.size}</span>
                                  <span>•</span>
                                  <span>{item.color}</span>
                                  <span>•</span>
                                  <span>Qty: {item.quantity}</span>
                                </div>
                              </div>
                              <span className="font-bold text-foreground text-xs shrink-0">
                                ${(item.price * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Total Price */}
                      <td className="py-3 px-4 text-right align-top font-bold text-foreground text-xs">
                        ${cart.totalAmount.toFixed(2)}
                      </td>

                      {/* Abandoned Time */}
                      <td className="py-3 px-4 text-right align-top">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                          <Clock className="h-3 w-3" />
                          {getRelativeTime(cart.createdAt)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile & Tablet Card View (Visible < lg) */}
            <div className="block lg:hidden divide-y divide-border/60 w-full">
              {displayedCarts.map((cart) => (
                <div key={cart.id} className="p-3 sm:p-4 space-y-3 w-full">
                  {/* User Header & Total */}
                  <div className="flex items-start justify-between gap-2.5 w-full">
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      <Avatar className="h-9 w-9 border border-border shrink-0">
                        <AvatarImage src={cart.customer.avatar} alt={cart.customer.name} />
                        <AvatarFallback className="bg-amber-500/10 text-amber-600 font-bold text-[11px]">
                          {cart.customer.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-foreground text-xs truncate">{cart.customer.name}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{cart.customer.email}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{cart.customer.phone}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-base font-bold text-foreground block">
                        ${cart.totalAmount.toFixed(2)}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-600 dark:text-amber-400">
                        <Clock className="h-3 w-3" />
                        {getRelativeTime(cart.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Items List Container */}
                  <div className="bg-muted/30 p-2.5 rounded-xl space-y-1.5 border border-border/60 w-full">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground px-0.5 font-medium">
                      <span>Abandoned Items ({cart.items.length})</span>
                      <span>Subtotal</span>
                    </div>

                    {cart.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-2 p-1.5 px-2 rounded-lg bg-background border border-border/60 w-full">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-8 w-8 rounded-md object-cover border border-border/80 shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-xs text-foreground truncate">{item.name}</p>
                            <div className="flex flex-wrap items-center gap-1 text-[10px] text-muted-foreground">
                              <span>{item.size}</span>
                              <span>•</span>
                              <span>{item.color}</span>
                              <span>•</span>
                              <span>Qty: {item.quantity}</span>
                            </div>
                          </div>
                        </div>
                        <span className="font-semibold text-xs text-foreground shrink-0">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </InfiniteScroll>
        )}
      </Card>
    </div>
  )
}
