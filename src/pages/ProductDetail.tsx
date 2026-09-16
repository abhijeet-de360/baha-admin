import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Package, Edit2, Trash2, CheckCircle2, AlertTriangle, Ruler, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
  getStoredProducts,
  saveStoredProducts,
} from '@/data/mockProducts'

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [products, setProducts] = useState<Product[]>(getStoredProducts)
  const [product, setProduct] = useState<Product | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  useEffect(() => {
    const stored = getStoredProducts()
    setProducts(stored)
    const found = stored.find((p) => p.id === id || p.slug === id)
    if (found) {
      setProduct(found)
      setSelectedImageIndex(found.primaryImageIndex || 0)
    }
  }, [id])
 

  const handleConfirmDelete = () => {
    if (deletingProduct) {
      const updated = products.filter((p) => p.id !== deletingProduct.id)
      setProducts(updated)
      saveStoredProducts(updated)
      setDeletingProduct(null)
      navigate('/products')
    }
  }

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

  if (!product) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center space-y-4">
        <div className="p-4 rounded-full bg-muted inline-block text-muted-foreground">
          <Package className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold">Product Not Found</h2>
        <p className="text-xs text-muted-foreground">
          No product matching identifier "{id}" was found in your catalog.
        </p>
        <Button onClick={() => navigate('/products')} className="gap-2 text-xs">
          <ArrowLeft className="h-4 w-4" /> Back to Products
        </Button>
      </div>
    )
  }

  const discountPercent = product.salePrice
    ? Math.round(((product.regularPrice - product.salePrice) / product.regularPrice) * 100)
    : 0

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-[1400px] mx-auto pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 bg-popover text-popover-foreground text-xs font-semibold px-4 py-3 rounded-2xl shadow-2xl border border-border animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/products')}
            className="h-10 w-10 rounded-2xl border-border hover:bg-muted cursor-pointer shrink-0"
            title="Back to Products"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {product.title}
              </h1>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
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
            <p className="text-xs text-muted-foreground font-mono mt-0.5">
              SKU: {product.sku} &bull; Category: <span className="font-semibold text-foreground">{product.category}</span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setDeletingProduct(product)}
            className="gap-2 text-xs font-semibold border-border text-rose-500 hover:bg-rose-500/10 cursor-pointer"
          >
            <Trash2 className="h-4 w-4" /> Delete Item
          </Button>

          <Button
            onClick={() => navigate(`/products/edit/${product.id}`)}
            className="gap-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md cursor-pointer"
          >
            <Edit2 className="h-4 w-4" /> Edit Product
          </Button>
        </div>
      </div>

      {/* Main Grid: Gallery & Pricing Specs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Image Gallery (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="rounded-3xl border border-border bg-card shadow-xs overflow-hidden">
            <CardContent className="p-4 space-y-4">
              {/* Main Feature Display */}
              <div className="relative h-80 sm:h-96 w-full rounded-2xl overflow-hidden border border-border/60 bg-muted/30">
                <img
                  src={product.images[selectedImageIndex] || product.images[0]}
                  alt={product.title}
                  className="h-full w-full object-cover transition-all duration-300"
                />
                {discountPercent > 0 && (
                  <span className="absolute top-4 right-4 bg-rose-500 text-white font-extrabold text-xs px-3 py-1 rounded-full shadow-md">
                    -{discountPercent}% OFF
                  </span>
                )}
              </div>

              {/* Thumbnails Row */}
              {product.images.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`h-20 w-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                        selectedImageIndex === idx
                          ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-md scale-105'
                          : 'border-border opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`Thumb ${idx + 1}`} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Description & Specifications Card */}
          <Card className="rounded-3xl border border-border bg-card shadow-xs">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
                <FileText className="h-4 w-4 text-indigo-500" /> Product Overview & Details
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed bg-muted/20 p-4 rounded-2xl border border-border/40">
                {product.description || 'No detailed product description available for this item.'}
              </p>

              {/* Specifications List */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 text-xs">
                {product.fabric && (
                  <div className="p-3 rounded-xl bg-background border border-border">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Fabric</span>
                    <span className="font-semibold text-foreground mt-0.5 block">{product.fabric}</span>
                  </div>
                )}
                {product.color && (
                  <div className="p-3 rounded-xl bg-background border border-border">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Primary Color</span>
                    <span className="font-semibold text-foreground mt-0.5 block">{product.color}</span>
                  </div>
                )}
                <div className="p-3 rounded-xl bg-background border border-border">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Category</span>
                  <span className="font-semibold text-foreground mt-0.5 block">{product.category}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Pricing, Inventory & Sizes (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Pricing & Stock Card */}
          <Card className="rounded-3xl border border-border bg-card shadow-xs">
            <CardContent className="p-6 space-y-6">
              {/* Pricing Display */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Price Info
                </span>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-extrabold text-foreground">
                    ${(product.salePrice || product.regularPrice).toFixed(2)}
                  </span>
                  {product.salePrice && (
                    <span className="text-base text-muted-foreground line-through font-medium">
                      ${product.regularPrice.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>

              {/* Stock Status Box */}
              <div className="p-4 rounded-2xl bg-muted/30 border border-border flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                    Inventory Level
                  </span>
                  <span className="text-sm font-bold text-foreground mt-0.5 block">
                    {product.stockQuantity} units available
                  </span>
                </div>
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold border ${getStockBadge(
                    product.stockStatus
                  )}`}
                >
                  {product.stockStatus}
                </span>
              </div>

              {/* Available Sizes Section */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Ruler className="h-4 w-4 text-indigo-500" /> Available Sizes
                </span>
                <div className="flex flex-wrap gap-2 pt-1">
                  {product.sizes.map((sz) => (
                    <span
                      key={sz}
                      className="px-3 py-1.5 rounded-xl bg-background border border-border font-bold text-xs text-foreground shadow-2xs"
                    >
                      {sz}
                    </span>
                  ))}
                </div>
              </div>

              {/* Product Metadata */}
              <div className="border-t border-border pt-4 space-y-2 text-xs text-muted-foreground font-mono">
                <div className="flex justify-between">
                  <span>Product ID:</span>
                  <span className="font-semibold text-foreground">{product.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>SKU Code:</span>
                  <span className="font-semibold text-foreground">{product.sku}</span>
                </div>
                <div className="flex justify-between">
                  <span>URL Slug:</span>
                  <span className="font-semibold text-foreground truncate max-w-[180px]">{product.slug}</span>
                </div>
                <div className="flex justify-between">
                  <span>Created Date:</span>
                  <span className="font-semibold text-foreground">
                    {new Date(product.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={!!deletingProduct} onOpenChange={(open) => !open && setDeletingProduct(null)}>
        <AlertDialogContent className="bg-card border-border rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-rose-500" /> Confirm Product Deletion
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              Are you sure you want to delete <span className="font-bold text-foreground">"{deletingProduct?.title}"</span>? This action will permanently remove it from your store catalog.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              Delete Product
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
