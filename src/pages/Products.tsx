import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Package,
  Plus,
  Search,
  SquarePen,
  Trash2,
  Eye,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Filter,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
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

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  // Modal States
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null)
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Load products on mount
  useEffect(() => {
    setProducts(getStoredProducts())
  }, [])

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
      showNotification(`Product "${deletingProduct.title}" deleted successfully.`)
      setDeletingProduct(null)
    }
  }

  // Filter & Search Logic
  const filteredProducts = useMemo(() => {
    return products
      .filter((prod) => {
        const matchesSearch =
          prod.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          prod.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
          prod.category.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = categoryFilter === 'All' || prod.category === categoryFilter
        const matchesSize = sizeFilter === 'All' || prod.sizes.includes(sizeFilter)
        const matchesStatus = statusFilter === 'All' || prod.status === statusFilter
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

  // Pagination calculation
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredProducts.slice(start, start + itemsPerPage)
  }, [filteredProducts, currentPage])

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
    <div className="space-y-6 pb-12">
      {/* Notification Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 bg-popover text-popover-foreground text-xs font-semibold px-4 py-3 rounded-2xl shadow-2xl border border-border animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-6 rounded-3xl border border-border">
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
                  setCurrentPage(1)
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
                setCurrentPage(1)
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
                setCurrentPage(1)
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
                setCurrentPage(1)
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
                  setCurrentPage(1)
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
          {paginatedProducts.length === 0 ? (
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
            <>
              {/* Mobile / Tablet Card View (Visible below 'md' breakpoint) */}
              <div className="block md:hidden p-4 space-y-4">
                {paginatedProducts.map((product) => {
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
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-muted text-foreground text-[10px] font-semibold border border-border">
                              {product.category}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                product.status === 'Active'
                                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
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
                          </div>
                          <h4 className="font-bold text-foreground line-clamp-1 text-sm">{product.title}</h4>
                          <p className="text-[10px] text-muted-foreground font-mono truncate">SKU: {product.sku}</p>
                        </div>
                      </div>

                      {/* Middle Row: Price, Stock Badge & Sizes */}
                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/60 text-xs">
                        <div>
                          <span className="text-[10px] text-muted-foreground block font-medium">Price</span>
                          <div className="font-bold text-foreground">
                            {product.salePrice ? (
                              <div className="flex items-baseline gap-1.5">
                                <span className="text-emerald-600 font-extrabold">${product.salePrice.toFixed(2)}</span>
                                <span className="text-[10px] text-muted-foreground line-through font-normal">
                                  ${product.regularPrice.toFixed(2)}
                                </span>
                              </div>
                            ) : (
                              <span>${product.regularPrice.toFixed(2)}</span>
                            )}
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] text-muted-foreground block font-medium">Stock</span>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${getStockBadge(
                              product.stockStatus
                            )}`}
                          >
                            {product.stockStatus} ({product.stockQuantity})
                          </span>
                        </div>
                      </div>

                      {/* Sizes Row */}
                      {product.sizes.length > 0 && (
                        <div className="flex items-center gap-1.5 text-xs pt-1">
                          <span className="text-[10px] text-muted-foreground font-medium shrink-0">Sizes:</span>
                          <div className="flex flex-wrap gap-1">
                            {product.sizes.map((sz) => (
                              <span
                                key={sz}
                                className="px-1.5 py-0.5 rounded bg-muted font-extrabold text-[10px] border border-border"
                              >
                                {sz}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Bottom Row: Actions */}
                      <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-border/60">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => navigate(`/products/${product.id}`)}
                          className="h-8 w-8 text-indigo-400 border-border hover:bg-indigo-500/10 cursor-pointer"
                          title="View"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => navigate(`/products/edit/${product.id}`)}
                          className="h-8 w-8 text-amber-400 border-border hover:bg-amber-500/10 cursor-pointer"
                          title="Edit"
                        >
                          <SquarePen className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setDeletingProduct(product)}
                          className="h-8 w-8 text-rose-500 border-border hover:bg-rose-500/10 cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Desktop Table View (lg screens and above) */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-muted/30 text-[11px] font-extrabold uppercase text-muted-foreground tracking-wider">
                      <th className="py-3.5 px-6">Product Details</th>
                      <th className="py-3.5 px-6">Category</th>
                      <th className="py-3.5 px-6">Price</th>
                      <th className="py-3.5 px-6">Stock Status</th>
                      <th className="py-3.5 px-6">Visibility</th>
                      <th className="py-3.5 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-xs">
                    {paginatedProducts.map((product) => {
                      return (
                        <tr key={product.id} className="hover:bg-muted/20 transition-colors">
                          {/* Product Details Column */}
                          <td className="py-4 px-6 font-medium">
                            <div className="flex items-center gap-3">
                              <img
                                src={product.thumbnailImage}
                                alt={product.name}
                                className="h-10 w-10 rounded-xl object-cover border border-border shrink-0"
                              />
                              <div className="flex flex-col min-w-0">
                                <span className="font-bold text-foreground text-xs truncate max-w-[200px]">
                                  {product.name}
                                </span>
                                <span className="text-[10px] text-muted-foreground font-mono">
                                  SKU: {product.sku}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Category Column */}
                          <td className="py-4 px-6 text-muted-foreground font-semibold text-xs">
                            {product.category}
                          </td>

                          {/* Price Column */}
                          <td className="py-4 px-6">
                            <div className="flex flex-col">
                              {product.salePrice ? (
                                <>
                                  <span className="font-extrabold text-emerald-600 text-xs font-mono">
                                    ${product.salePrice.toFixed(2)}
                                  </span>
                                  <span className="text-[10px] text-muted-foreground line-through font-mono">
                                    ${product.regularPrice.toFixed(2)}
                                  </span>
                                </>
                              ) : (
                                <span className="font-extrabold text-foreground text-xs font-mono">
                                  ${product.regularPrice.toFixed(2)}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Stock Status Column */}
                          <td className="py-4 px-6">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStockBadge(
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
                                size="icon"
                                onClick={() => navigate(`/products/${product.id}`)}
                                title="View"
                                className="h-8 w-8 text-indigo-400 border-border hover:bg-indigo-500/10 cursor-pointer"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => navigate(`/products/edit/${product.id}`)}
                                title="Edit"
                                className="h-8 w-8 text-amber-400 border-border hover:bg-amber-500/10 cursor-pointer"
                              >
                                <SquarePen className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setDeletingProduct(product)}
                                title="Delete"
                                className="h-8 w-8 text-rose-500 border-border hover:bg-rose-500/10 cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Pagination Footer */}
          {filteredProducts.length > 0 && (
            <div className="p-4 border-t border-border flex items-center justify-between text-xs">
              <span>
                Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredProducts.length)} to{' '}
                {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} products
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  className="h-8 text-xs rounded-lg px-3 cursor-pointer font-bold"
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
                  className="h-8 text-xs rounded-lg px-3 cursor-pointer font-bold"
                >
                  Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>
            </div>
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
