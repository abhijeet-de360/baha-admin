import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import InfiniteScroll from 'react-infinite-scroll-component'
import {
  Package,
  Plus,
  Search,
  SquarePen,
  Trash2,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Filter,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
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
  type Product,
  CATEGORIES_LIST,
  SIZES_LIST,
  getStoredProducts,
  saveStoredProducts,
} from '@/data/mockProducts'

export default function Products() {
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])

  // Filters & Controls
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('All')
  const [sizeFilter, setSizeFilter] = useState<string>('All')
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All')
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'name'>('newest')

  // Infinite Scroll State
  const [visibleCount, setVisibleCount] = useState(10)

  // Modal States
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Load products on mount
  useEffect(() => {
    setProducts(getStoredProducts())
  }, [])

  // Reset scroll batch on filter change
  useEffect(() => {
    setVisibleCount(10)
  }, [searchQuery, categoryFilter, sizeFilter, statusFilter, sortBy])

  const showNotification = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Delete product handler
  const handleConfirmDelete = () => {
    if (deletingProduct) {
      const updated = products.filter((p) => p.id !== deletingProduct.id)
      setProducts(updated)
      saveStoredProducts(updated)
      setDeletingProduct(null)
      showNotification(`Product "${deletingProduct.title}" has been deleted.`)
    }
  }

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesSearch =
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter
        const matchesSize = sizeFilter === 'All' || p.sizes.includes(sizeFilter)
        const matchesStatus = statusFilter === 'All' || p.status === statusFilter
        return matchesSearch && matchesCategory && matchesSize && matchesStatus
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        }
        if (sortBy === 'price-asc') {
          const priceA = a.salePrice || a.regularPrice
          const priceB = b.salePrice || b.regularPrice
          return priceA - priceB
        }
        if (sortBy === 'price-desc') {
          const priceA = a.salePrice || a.regularPrice
          const priceB = b.salePrice || b.regularPrice
          return priceB - priceA
        }
        if (sortBy === 'name') {
          return a.title.localeCompare(b.title)
        }
        return 0
      })
  }, [products, searchQuery, categoryFilter, sizeFilter, statusFilter, sortBy])

  // Displayed items slice for InfiniteScroll
  const displayedProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleCount)
  }, [filteredProducts, visibleCount])

  const fetchMoreProducts = () => {
    if (visibleCount < filteredProducts.length) {
      setVisibleCount((prev) => prev + 10)
    }
  }

  // Badge helpers
  const getStockBadge = (status: Product['stockStatus']) => {
    switch (status) {
      case 'In Stock':
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
      case 'Low Stock':
        return 'bg-amber-500/10 text-amber-600 border-amber-500/20'
      case 'Out of Stock':
        return 'bg-destructive/10 text-destructive border-destructive/20'
      default:
        return 'bg-muted text-muted-foreground border-border'
    }
  }

  return (
    <div className="space-y-4 max-w-full mx-auto">
      {/* Notification Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 bg-popover text-popover-foreground text-xs font-semibold px-4 py-3 rounded-2xl shadow-2xl border border-border animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-4 sm:p-5 rounded-2xl border border-border">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary text-primary-foreground shadow-md">
              <Package className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Products</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Manage your kids clothing products, pricing, sizes, images, and inventory.
          </p>
        </div>

        {/* Primary Navigate to Add Product Page Button */}
        <Button
          onClick={() => navigate('/products/add')}
          className="rounded-full px-5 py-2.5 shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2 shrink-0 text-xs font-semibold"
        >
          <Plus className="h-4 w-4" /> Add Product
        </Button>
      </div>

      {/* Top Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="rounded-2xl border border-border shadow-xs bg-card/60">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider">Total Products</p>
              <h3 className="text-2xl font-extrabold text-foreground mt-0.5">{products.length}</h3>
            </div>
            <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-600">
              <Package className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border shadow-xs bg-card/60">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider">In Stock</p>
              <h3 className="text-2xl font-extrabold text-emerald-600 mt-0.5">
                {products.filter((p) => p.stockStatus === 'In Stock').length}
              </h3>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border shadow-xs bg-card/60">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider">Low Stock</p>
              <h3 className="text-2xl font-extrabold text-amber-600 mt-0.5">
                {products.filter((p) => p.stockStatus === 'Low Stock').length}
              </h3>
            </div>
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border shadow-xs bg-card/60">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider">Active Items</p>
              <h3 className="text-2xl font-extrabold text-purple-600 mt-0.5">
                {products.filter((p) => p.status === 'Active').length}
              </h3>
            </div>
            <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-600">
              <Sparkles className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table / Grid Container */}
      <Card className="rounded-3xl border border-border shadow-xs overflow-hidden bg-card">
        {/* Controls Header */}
        <div className="p-4 sm:p-6 border-b border-border space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search product title, SKU, category..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                }}
                className="pl-10 h-10 text-xs rounded-xl border-border bg-background shadow-2xs font-semibold"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider shrink-0">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="h-10 px-3 rounded-xl border border-input bg-background text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name">Product Name (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Filter Chips Bar */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <div className="flex items-center gap-1.5 text-xs font-bold">
              <Filter className="h-3.5 w-3.5" />
              <span>Filters:</span>
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value)
              }}
              className="h-8 px-2.5 rounded-lg border border-input bg-background text-[11px] font-semibold focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
            >
              <option value="All">All Categories</option>
              {CATEGORIES_LIST.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Size Filter */}
            <select
              value={sizeFilter}
              onChange={(e) => {
                setSizeFilter(e.target.value)
              }}
              className="h-8 px-2.5 rounded-lg border border-input bg-background text-[11px] font-semibold focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
            >
              <option value="All">All Sizes</option>
              {SIZES_LIST.map((sz) => (
                <option key={sz} value={sz}>
                  Size: {sz}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as any)
              }}
              className="h-8 px-2.5 rounded-lg border border-input bg-background text-[11px] font-semibold focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Status: Active</option>
              <option value="Inactive">Status: Inactive</option>
            </select>

            {(searchQuery || categoryFilter !== 'All' || sizeFilter !== 'All' || statusFilter !== 'All') && (
              <button
                onClick={() => {
                  setSearchQuery('')
                  setCategoryFilter('All')
                  setSizeFilter('All')
                  setStatusFilter('All')
                }}
                className="text-[11px] font-bold text-destructive hover:underline ml-auto cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Product List: Mobile/Tablet Cards (< md) & Desktop Table (>= md) */}
        <CardContent className="p-0">
          {displayedProducts.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="p-4 rounded-full bg-muted inline-block text-muted-foreground">
                <Package className="h-8 w-8" />
              </div>
              <h3 className="text-sm font-bold text-foreground">No products found</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                No items matched your active search or filters. Try adjusting your search query or add a new product.
              </p>
              <Button
                onClick={() => navigate('/products/add')}
                size="sm"
                className="bg-primary text-primary-foreground rounded-xl text-xs font-semibold cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Product
              </Button>
            </div>
          ) : (
            <InfiniteScroll
              dataLength={displayedProducts.length}
              next={fetchMoreProducts}
              hasMore={visibleCount < filteredProducts.length}
              loader={
                <div className="py-4 text-center text-xs text-muted-foreground font-medium">
                  Loading more products...
                </div>
              }
              endMessage={
                <div className="py-4 text-center text-xs text-muted-foreground font-medium">
                  Showing all {filteredProducts.length} products
                </div>
              }
            >
              {/* Mobile / Tablet Card View (Visible below 'md' breakpoint) */}
              <div className="block md:hidden p-4 space-y-4">
                {displayedProducts.map((product) => {
                  const primaryImg = product.images[product.primaryImageIndex || 0] || product.images[0]
                  return (
                    <div
                      key={product.id}
                      className="p-4 rounded-2xl border border-border bg-card shadow-xs space-y-3.5"
                    >
                      {/* Top Row: Image, Title, Category, SKU */}
                      <div className="flex items-start gap-3">
                        <div className="h-16 w-16 rounded-xl overflow-hidden border border-border bg-muted shrink-0 relative">
                          <img
                            src={primaryImg}
                            alt={product.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-muted text-muted-foreground uppercase">
                              {product.category}
                            </span>
                            {product.featured && (
                              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 flex items-center gap-0.5">
                                <Sparkles className="h-3 w-3" /> Featured
                              </span>
                            )}
                          </div>
                          <h4 className="font-bold text-foreground text-sm leading-tight truncate">
                            {product.title}
                          </h4>
                          <p className="text-[11px] font-mono text-muted-foreground">SKU: {product.sku}</p>
                        </div>
                      </div>

                      {/* Middle Row: Price, Stock Badge */}
                      <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
                        <div>
                          <span className="text-[10px] text-muted-foreground block font-medium">Price</span>
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-extrabold text-foreground text-sm">
                              ${(product.salePrice || product.regularPrice).toFixed(2)}
                            </span>
                            {product.salePrice && (
                              <span className="line-through text-muted-foreground text-[10px]">
                                ${product.regularPrice.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] text-muted-foreground block font-medium">Status</span>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStockBadge(
                              product.stockStatus
                            )}`}
                          >
                            {product.stockStatus} ({product.stockQuantity})
                          </span>
                        </div>
                      </div>

                      {/* Bottom Row: Actions */}
                      <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-border/60">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/products/${product.id}`)}
                          className="h-8 px-3 text-xs text-indigo-400 border-border hover:bg-indigo-500/10 cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" /> View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/products/edit/${product.id}`)}
                          className="h-8 px-3 text-xs text-amber-400 border-border hover:bg-amber-500/10 cursor-pointer"
                        >
                          <SquarePen className="h-3.5 w-3.5 mr-1" /> Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeletingProduct(product)}
                          className="h-8 px-3 text-xs text-rose-500 border-border hover:bg-rose-500/10 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Desktop Table View (Visible on 'md' breakpoint and larger) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-muted/50 text-muted-foreground uppercase font-semibold text-[10px] tracking-wider">
                      <th className="py-3 px-6 min-w-[240px]">Product Info</th>
                      <th className="py-3 px-6">Category</th>
                      <th className="py-3 px-6">Price</th>
                      <th className="py-3 px-6">Stock Status</th>
                      <th className="py-3 px-6">Visibility</th>
                      <th className="py-3 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {displayedProducts.map((product) => {
                      const primaryImg = product.images[product.primaryImageIndex || 0] || product.images[0]
                      return (
                        <tr key={product.id} className="hover:bg-muted/30 transition-colors group">
                          {/* Info Column */}
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="h-12 w-12 rounded-xl overflow-hidden border border-border bg-muted shrink-0 relative">
                                <img
                                  src={primaryImg}
                                  alt={product.title}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <h4 className="font-bold text-foreground text-xs truncate max-w-[200px]">
                                    {product.title}
                                  </h4>
                                  {product.featured && (
                                    <span title="Featured">
                                      <Sparkles className="h-3 w-3 text-amber-500 shrink-0" />
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] font-mono text-muted-foreground">SKU: {product.sku}</p>
                              </div>
                            </div>
                          </td>

                          {/* Category Column */}
                          <td className="py-4 px-6 font-medium text-foreground">
                            <span className="inline-block px-2 py-0.5 rounded bg-muted text-[11px]">
                              {product.category}
                            </span>
                          </td>

                          {/* Price Column */}
                          <td className="py-4 px-6">
                            <div className="flex items-baseline gap-1.5">
                              <span className="font-bold text-foreground">
                                ${(product.salePrice || product.regularPrice).toFixed(2)}
                              </span>
                              {product.salePrice && (
                                <span className="line-through text-muted-foreground text-[10px]">
                                  ${product.regularPrice.toFixed(2)}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Stock Status Column */}
                          <td className="py-4 px-6">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStockBadge(
                                product.stockStatus
                              )}`}
                            >
                              {product.stockStatus} ({product.stockQuantity})
                            </span>
                          </td>

                          {/* Visibility Status Column */}
                          <td className="py-4 px-6">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                                product.status === 'Active'
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                  : 'bg-muted text-muted-foreground border-border'
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  product.status === 'Active' ? 'bg-emerald-500' : 'bg-muted-foreground'
                                }`}
                              />
                              {product.status}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/products/${product.id}`)}
                                className="h-8 px-3 text-xs text-indigo-400 border-border hover:bg-indigo-500/10 cursor-pointer"
                              >
                                <Eye className="h-3.5 w-3.5 mr-1" /> View
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/products/edit/${product.id}`)}
                                className="h-8 px-3 text-xs text-amber-400 border-border hover:bg-amber-500/10 cursor-pointer"
                              >
                                <SquarePen className="h-3.5 w-3.5 mr-1" /> Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setDeletingProduct(product)}
                                className="h-8 px-3 text-xs text-rose-500 border-border hover:bg-rose-500/10 cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </InfiniteScroll>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={Boolean(deletingProduct)} onOpenChange={(open) => !open && setDeletingProduct(null)}>
        <AlertDialogContent className="rounded-3xl max-w-md p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive font-bold">
              <AlertTriangle className="h-5 w-5" /> Confirm Delete Product
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground space-y-3 pt-2">
              <span>Are you sure you want to delete this product? This action cannot be undone.</span>
              {deletingProduct && (
                <div className="p-3 rounded-2xl bg-muted border border-border mt-2 flex items-center gap-3">
                  <img
                    src={deletingProduct.images[0]}
                    alt={deletingProduct.title}
                    className="h-10 w-10 rounded-xl object-cover border border-border shrink-0"
                  />
                  <div>
                    <p className="font-bold text-foreground text-xs">{deletingProduct.title}</p>
                    <p className="font-mono text-[10px] text-muted-foreground">SKU: {deletingProduct.sku}</p>
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 mt-4">
            <AlertDialogCancel className="rounded-full text-xs cursor-pointer">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold text-xs rounded-full cursor-pointer"
            >
              Delete Product
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
