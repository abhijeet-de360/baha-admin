import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Package,
  Upload,
  Image as ImageIcon,
  X,
  AlertTriangle,
  Link as LinkIcon,
  DollarSign,
  Shirt,
  Info,
  Check,
  Save,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  type Product,
  CATEGORIES_LIST,
  SIZES_LIST,
  generateSlug,
  getStoredProducts,
  saveStoredProducts,
} from '@/data/mockProducts'
import { getStoredColors, type ProductColor } from '@/data/mockColors'

export default function AddEditProduct() {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const isEditing = Boolean(id)

  // Active Tab state
  const [activeTab, setActiveTab] = useState('general')

  // Form State
  const [formTitle, setFormTitle] = useState('')
  const [formSlug, setFormSlug] = useState('')
  const [isSlugManuallyModified, setIsSlugManuallyModified] = useState(false)
  const [formDescription, setFormDescription] = useState('')
  const [formCategory, setFormCategory] = useState('')
  const [formRegularPrice, setFormRegularPrice] = useState('')
  const [formSalePrice, setFormSalePrice] = useState('')
  const [formSku, setFormSku] = useState('')
  const [formStockQuantity, setFormStockQuantity] = useState('')
  const [formLowStockThreshold, setFormLowStockThreshold] = useState('10')
  const [formSizes, setFormSizes] = useState<string[]>([])
  const [formImages, setFormImages] = useState<string[]>([])
  const [formPrimaryImageIndex, setFormPrimaryImageIndex] = useState(0)
  const [formStatus, setFormStatus] = useState<'Active' | 'Inactive'>('Active')

  // Created Colors state from Color Management
  const [availableColors, setAvailableColors] = useState<ProductColor[]>([])
  const [formColors, setFormColors] = useState<string[]>([])

  // Load colors from Color Management
  useEffect(() => {
    const loaded = getStoredColors().filter((c) => c.status === 'Active')
    setAvailableColors(loaded)
  }, [])

  // Toggle multiple color selection
  const toggleColor = (hexCode: string) => {
    setFormColors((prev) =>
      prev.includes(hexCode) ? prev.filter((c) => c !== hexCode) : [...prev, hexCode]
    )
  }

  // Specs
  const [formColor, setFormColor] = useState('')
  const [formFabric, setFormFabric] = useState('')
  const [formTagInput, setFormTagInput] = useState('')
  const [formTags, setFormTags] = useState<string[]>([])

  const [formError, setFormError] = useState<string | null>(null)

  // Load existing product if editing
  useEffect(() => {
    if (isEditing && id) {
      const products = getStoredProducts()
      const existing = products.find((p) => p.id === id)
      if (existing) {
        setFormTitle(existing.title)
        setFormSlug(existing.slug || generateSlug(existing.title))
        setIsSlugManuallyModified(true)
        setFormDescription(existing.description)
        setFormCategory(existing.category)
        setFormRegularPrice(existing.regularPrice.toString())
        setFormSalePrice(existing.salePrice ? existing.salePrice.toString() : '')
        setFormSku(existing.sku)
        setFormStockQuantity(existing.stockQuantity.toString())
        setFormLowStockThreshold(existing.lowStockThreshold.toString())
        setFormSizes(existing.sizes || [])
        setFormImages(existing.images || [])
        setFormPrimaryImageIndex(existing.primaryImageIndex || 0)
        setFormStatus(existing.status)
        setFormColor(existing.color || '')
        setFormColors(existing.colors || [])
        setFormFabric(existing.fabric || '')
        setFormTags(existing.tags || [])
      } else {
        navigate('/products')
      }
    } else {
      setFormSku(`SKU-${Math.floor(1000 + Math.random() * 9000)}`)
    }
  }, [id, isEditing, navigate])

  // Handle title change & auto slug
  const handleTitleChange = (val: string) => {
    setFormTitle(val)
    if (!isSlugManuallyModified) {
      setFormSlug(generateSlug(val))
    }
  }

  // Handle slug change
  const handleSlugChange = (val: string) => {
    setFormSlug(generateSlug(val))
    setIsSlugManuallyModified(true)
  }

  // Handle multiple image uploads
  const handleImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const fileList = Array.from(files)
      fileList.forEach((file) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            setFormImages((prev) => [...prev, reader.result as string])
          }
        }
        reader.readAsDataURL(file)
      })
    }
  }

  // Toggle Size selection
  const toggleSize = (size: string) => {
    setFormSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    )
  }

  // Add tag
  const handleAddTag = () => {
    if (formTagInput.trim() && !formTags.includes(formTagInput.trim().toLowerCase())) {
      setFormTags((prev) => [...prev, formTagInput.trim().toLowerCase()])
      setFormTagInput('')
    }
  }

  // Remove tag
  const handleRemoveTag = (tagToRemove: string) => {
    setFormTags((prev) => prev.filter((t) => t !== tagToRemove))
  }

  // Save product handler
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formTitle.trim()) {
      setFormError('Please enter a product title.')
      setActiveTab('general')
      return
    }
    if (!formCategory) {
      setFormError('Please select a category.')
      setActiveTab('general')
      return
    }
    if (!formRegularPrice || isNaN(Number(formRegularPrice))) {
      setFormError('Please enter a valid regular price.')
      setActiveTab('pricing')
      return
    }
    if (!formStockQuantity || isNaN(Number(formStockQuantity))) {
      setFormError('Please enter a valid stock quantity.')
      setActiveTab('pricing')
      return
    }
    if (formImages.length === 0) {
      setFormError('Please upload at least 1 product image.')
      setActiveTab('media')
      return
    }

    const regPrice = parseFloat(formRegularPrice)
    const saleP = formSalePrice ? parseFloat(formSalePrice) : undefined
    const stockQty = parseInt(formStockQuantity, 10)
    const lowStock = parseInt(formLowStockThreshold || '10', 10)

    let stockStatus: 'In Stock' | 'Low Stock' | 'Out of Stock' = 'In Stock'
    if (stockQty === 0) {
      stockStatus = 'Out of Stock'
    } else if (stockQty <= lowStock) {
      stockStatus = 'Low Stock'
    }

    const existingProducts = getStoredProducts()

    if (isEditing && id) {
      const updatedProducts = existingProducts.map((p) =>
        p.id === id
          ? {
              ...p,
              title: formTitle.trim(),
              slug: formSlug.trim() || generateSlug(formTitle),
              category: formCategory,
              description: formDescription,
              regularPrice: regPrice,
              salePrice: saleP,
              sku: formSku || p.sku,
              stockQuantity: stockQty,
              lowStockThreshold: lowStock,
              stockStatus,
              sizes: formSizes,
              images: formImages,
              primaryImageIndex: formPrimaryImageIndex,
              status: formStatus,
              color: formColor.trim() || undefined,
              colors: formColors,
              fabric: formFabric.trim() || undefined,
              tags: formTags,
            }
          : p
      )
      saveStoredProducts(updatedProducts)
    } else {
      const newProd: Product = {
        id: `prod-${Date.now()}`,
        title: formTitle.trim(),
        slug: formSlug.trim() || generateSlug(formTitle),
        category: formCategory,
        description: formDescription,
        regularPrice: regPrice,
        salePrice: saleP,
        sku: formSku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
        stockQuantity: stockQty,
        lowStockThreshold: lowStock,
        stockStatus,
        sizes: formSizes,
        images: formImages,
        primaryImageIndex: formPrimaryImageIndex,
        status: formStatus || 'Active',
        createdAt: new Date().toISOString().split('T')[0],
        color: formColor.trim() || undefined,
        colors: formColors,
        fabric: formFabric.trim() || undefined,
        tags: formTags,
      }
      saveStoredProducts([newProd, ...existingProducts])
    }

    navigate('/products')
  }

  const TABS_ORDER = ['general', 'pricing', 'media', 'sizes']

  return (
    <div className="space-y-4 w-full mx-auto pb-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/40 p-4 rounded-2xl border border-border">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/products')}
            className="p-2 rounded-xl bg-background border border-border hover:bg-muted transition-colors cursor-pointer text-foreground"
            title="Back to Products"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-foreground" />
              <h1 className="text-xl font-bold text-foreground">
                {isEditing ? `Edit Product: ${formTitle || 'Untitled'}` : 'Add New Kids Product'}
              </h1>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Fill product information easily without scrolling.
            </p>
          </div>
        </div>

        {/* Top Right Header Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Status selector directly in header */}
          <select
            value={formStatus}
            onChange={(e) => setFormStatus(e.target.value as any)}
            className="h-9 px-3 rounded-xl border border-input bg-background text-foreground text-xs font-semibold focus:outline-none cursor-pointer"
          >
            <option value="Active">Status: Active</option>
            <option value="Inactive">Status: Inactive</option>
          </select>

          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/products')}
            className="rounded-xl text-xs cursor-pointer h-9 px-3"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSaveProduct}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl text-xs cursor-pointer h-9 px-5 gap-1.5 shadow-md"
          >
            <Save className="h-3.5 w-3.5" />
            {isEditing ? 'Update Product' : 'Save Product'}
          </Button>
        </div>
      </div>

      {/* Validation Alert Banner */}
      {formError && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs font-semibold">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {/* Main Single-Card Compact Tabbed Form */}
      <Card className="rounded-2xl border border-border shadow-xs bg-card overflow-hidden">
        <form onSubmit={handleSaveProduct}>
          <CardContent className="p-5">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              {/* Tab navigation pills */}
              <TabsList className="grid grid-cols-4 w-full h-11 bg-card border border-border p-1 rounded-xl mb-5 shadow-inner">
                <TabsTrigger
                  value="general"
                  className="text-xs font-bold gap-1.5 rounded-lg cursor-pointer data-[state=active]:bg-muted data-[state=active]:text-foreground data-[state=active]:shadow-xs text-muted-foreground hover:text-foreground transition-all"
                >
                  <Info className="h-3.5 w-3.5 text-foreground" />
                  <span>1. General</span>
                </TabsTrigger>
                <TabsTrigger
                  value="pricing"
                  className="text-xs font-bold gap-1.5 rounded-lg cursor-pointer data-[state=active]:bg-muted data-[state=active]:text-foreground data-[state=active]:shadow-xs text-muted-foreground hover:text-foreground transition-all"
                >
                  <DollarSign className="h-3.5 w-3.5 text-foreground" />
                  <span>2. Pricing & Stock</span>
                </TabsTrigger>
                <TabsTrigger
                  value="media"
                  className="text-xs font-bold gap-1.5 rounded-lg cursor-pointer data-[state=active]:bg-muted data-[state=active]:text-foreground data-[state=active]:shadow-xs text-muted-foreground hover:text-foreground transition-all"
                >
                  <ImageIcon className="h-3.5 w-3.5 text-foreground" />
                  <span>3. Media ({formImages.length})</span>
                </TabsTrigger>
                <TabsTrigger
                  value="sizes"
                  className="text-xs font-bold gap-1.5 rounded-lg cursor-pointer data-[state=active]:bg-muted data-[state=active]:text-foreground data-[state=active]:shadow-xs text-muted-foreground hover:text-foreground transition-all"
                >
                  <Shirt className="h-3.5 w-3.5 text-foreground" />
                  <span>4. Sizes & Specs</span>
                </TabsTrigger>
              </TabsList>

              {/* TAB 1: GENERAL INFO */}
              <TabsContent value="general" className="mt-0 space-y-4 focus-visible:outline-none min-h-[310px]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Product Title */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      Product Title <span className="text-destructive">*</span>
                    </label>
                    <Input
                      placeholder="e.g., Dino Explorer Graphic Tee & Shorts Set"
                      value={formTitle}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      className="h-10 text-xs font-semibold placeholder:text-muted-foreground/40 text-foreground bg-background"
                      required
                    />
                  </div>

                  {/* Category */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      Category <span className="text-destructive">*</span>
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-input bg-background text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-ring text-foreground"
                      required
                    >
                      <option value="" disabled>
                        Select Category
                      </option>
                      {CATEGORIES_LIST.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* URL Slug */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <LinkIcon className="h-3.5 w-3.5" /> URL Slug <span className="text-destructive">*</span>
                    </label>
                    <Input
                      placeholder="e.g., dino-explorer-graphic-tee-shorts-set"
                      value={formSlug}
                      onChange={(e) => handleSlugChange(e.target.value)}
                      className="h-10 text-xs font-mono font-semibold placeholder:text-muted-foreground/40 text-foreground bg-background"
                      required
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    Product Description
                  </label>
                  <textarea
                    placeholder="Write detailed product description, fabric feel, fitting instructions..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    rows={4}
                    className="w-full p-3 rounded-xl border border-input bg-background text-xs font-medium focus:outline-none focus:ring-1 focus:ring-ring resize-none placeholder:text-muted-foreground/40 text-foreground"
                  />
                </div>
              </TabsContent>

              {/* TAB 2: PRICING & INVENTORY */}
              <TabsContent value="pricing" className="mt-0 space-y-4 focus-visible:outline-none min-h-[310px]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Regular Price */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      Regular Price ($) <span className="text-destructive">*</span>
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 34.99"
                      value={formRegularPrice}
                      onChange={(e) => setFormRegularPrice(e.target.value)}
                      className="h-10 text-xs font-semibold placeholder:text-muted-foreground/40 text-foreground bg-background"
                      required
                    />
                  </div>

                  {/* Sale Price */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      Sale Price ($) <span className="text-muted-foreground font-normal">(Optional)</span>
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 27.99"
                      value={formSalePrice}
                      onChange={(e) => setFormSalePrice(e.target.value)}
                      className="h-10 text-xs font-semibold placeholder:text-muted-foreground/40 text-foreground bg-background"
                    />
                  </div>

                  {/* SKU Code */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      SKU Code
                    </label>
                    <Input
                      placeholder="e.g. DRS-GRL-001"
                      value={formSku}
                      onChange={(e) => setFormSku(e.target.value)}
                      className="h-10 text-xs font-mono font-semibold placeholder:text-muted-foreground/40 text-foreground bg-background"
                    />
                  </div>

                  {/* Stock Quantity */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      Stock Quantity <span className="text-destructive">*</span>
                    </label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="e.g. 45"
                      value={formStockQuantity}
                      onChange={(e) => setFormStockQuantity(e.target.value)}
                      className="h-10 text-xs font-semibold placeholder:text-muted-foreground/40 text-foreground bg-background"
                      required
                    />
                  </div>

                  {/* Low Stock Alert Threshold */}
                  <div className="space-y-1.5 sm:col-span-2 pt-2 border-t border-border">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      Low Stock Alert Threshold
                    </label>
                    <Input
                      type="number"
                      min="1"
                      placeholder="Default: 10"
                      value={formLowStockThreshold}
                      onChange={(e) => setFormLowStockThreshold(e.target.value)}
                      className="h-10 text-xs font-semibold placeholder:text-muted-foreground/40 max-w-sm text-foreground bg-background"
                    />
                    <p className="text-[10px] text-muted-foreground">
                      Triggers 'Low Stock' badge status when available inventory reaches or drops below this count.
                    </p>
                  </div>
                </div>
              </TabsContent>

              {/* TAB 3: MEDIA (IMAGES) */}
              <TabsContent value="media" className="mt-0 space-y-4 focus-visible:outline-none min-h-[310px]">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    Upload Product Images <span className="text-muted-foreground font-normal">(Multi-select supported)</span>
                  </label>
                </div>

                {/* Upload & Previews Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {formImages.map((img, idx) => (
                    <div
                      key={idx}
                      className={`relative h-36 rounded-2xl overflow-hidden border-2 bg-muted group shadow-xs ${
                        formPrimaryImageIndex === idx ? 'border-primary ring-2 ring-primary/20' : 'border-border'
                      }`}
                    >
                      <img src={img} alt={`Preview ${idx}`} className="h-full w-full object-cover" />

                      {/* Primary badge */}
                      {formPrimaryImageIndex === idx && (
                        <span className="absolute top-2 left-2 bg-primary text-primary-foreground text-[9px] font-extrabold px-2 py-0.5 rounded shadow-xs">
                          Primary
                        </span>
                      )}

                      <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                        {formPrimaryImageIndex !== idx && (
                          <button
                            type="button"
                            onClick={() => setFormPrimaryImageIndex(idx)}
                            className="bg-card text-card-foreground hover:bg-muted font-semibold text-[10px] px-2.5 py-1 rounded-lg cursor-pointer border border-border"
                          >
                            Set Primary
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setFormImages((prev) => prev.filter((_, i) => i !== idx))
                            if (formPrimaryImageIndex >= formImages.length - 1) {
                              setFormPrimaryImageIndex(0)
                            }
                          }}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-semibold text-[10px] px-2.5 py-1 rounded-lg cursor-pointer flex items-center gap-0.5"
                        >
                          <X className="h-3 w-3" /> Remove
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Dropzone Card */}
                  <label className="border-2 border-dashed border-border hover:border-muted-foreground/50 rounded-2xl h-36 flex flex-col items-center justify-center gap-1.5 cursor-pointer bg-muted/20 hover:bg-muted/40 transition-all text-center p-3">
                    <Upload className="h-7 w-7 text-muted-foreground" />
                    <span className="text-xs font-bold text-foreground">Upload Images</span>
                    <span className="text-[10px] text-muted-foreground">PNG, JPG up to 10MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImagesUpload}
                    />
                  </label>
                </div>
              </TabsContent>

              {/* TAB 4: SIZES & SPECS */}
              <TabsContent value="sizes" className="mt-0 space-y-4 focus-visible:outline-none min-h-[310px]">
                {/* Available Sizes Badges */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                    Available Kids Sizes
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {SIZES_LIST.map((sz) => {
                      const isSelected = formSizes.includes(sz)
                      return (
                        <button
                          type="button"
                          key={sz}
                          onClick={() => toggleSize(sz)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                            isSelected
                              ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                              : 'bg-background text-foreground border-border hover:bg-muted'
                          }`}
                        >
                          {isSelected && <Check className="h-3.5 w-3.5 text-primary-foreground" />}
                          {sz}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Available Created Colors Multi-Selection */}
                <div className="space-y-2 pt-2 border-t border-border">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                    Product Colors <span className="text-muted-foreground font-normal">(Select multiple colors created in Color Management)</span>
                  </label>
                  {availableColors.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">
                      No active colors created yet in Color Management.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {availableColors.map((col) => {
                        const isSelected = formColors.includes(col.hexCode) || formColors.includes(col.name)
                        return (
                          <button
                            type="button"
                            key={col.id}
                            onClick={() => toggleColor(col.hexCode)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border ${
                              isSelected
                                ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                                : 'bg-background text-foreground border-border hover:bg-muted'
                            }`}
                          >
                            <span
                              className="h-3.5 w-3.5 rounded-full border border-background shadow-2xs shrink-0"
                              style={{ backgroundColor: col.hexCode }}
                            />
                            <span>{col.name}</span>
                            <span className="font-mono text-[10px] opacity-75">{col.hexCode}</span>
                            {isSelected && <Check className="h-3.5 w-3.5 text-primary-foreground ml-0.5" />}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border">
                  {/* Color */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Color</label>
                    <Input
                      placeholder="e.g. Yellow Floral"
                      value={formColor}
                      onChange={(e) => setFormColor(e.target.value)}
                      className="h-10 text-xs font-medium placeholder:text-muted-foreground/40 text-foreground bg-background"
                    />
                  </div>

                  {/* Fabric */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Fabric / Material</label>
                    <Input
                      placeholder="e.g. 100% Organic Cotton"
                      value={formFabric}
                      onChange={(e) => setFormFabric(e.target.value)}
                      className="h-10 text-xs font-medium placeholder:text-muted-foreground/40 text-foreground bg-background"
                    />
                  </div>
                </div>

                {/* Product Tags */}
                <div className="space-y-1.5 pt-2 border-t border-border">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Product Tags</label>
                  <div className="flex gap-2 max-w-md">
                    <Input
                      placeholder="Type tag and press Add..."
                      value={formTagInput}
                      onChange={(e) => setFormTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddTag()
                        }
                      }}
                      className="h-9 text-xs font-medium placeholder:text-muted-foreground/40 flex-1 text-foreground bg-background"
                    />
                    <Button
                      type="button"
                      onClick={handleAddTag}
                      className="h-9 bg-primary text-primary-foreground text-xs px-4 rounded-xl cursor-pointer hover:bg-primary/90"
                    >
                      Add
                    </Button>
                  </div>

                  {formTags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1.5">
                      {formTags.map((tg) => (
                        <span
                          key={tg}
                          className="inline-flex items-center gap-1 bg-muted text-foreground text-[11px] font-bold px-2.5 py-1 rounded-xl border border-border"
                        >
                          #{tg}
                          <X
                            className="h-3 w-3 cursor-pointer hover:text-destructive"
                            onClick={() => handleRemoveTag(tg)}
                          />
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            {/* Bottom Footer Action Bar inside Card */}
            <div className="flex items-center justify-between border-t border-border pt-4 mt-6">
              <div className="flex items-center gap-2">
                {activeTab !== 'general' && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const idx = TABS_ORDER.indexOf(activeTab)
                      if (idx > 0) setActiveTab(TABS_ORDER[idx - 1])
                    }}
                    className="h-9 text-xs rounded-xl cursor-pointer"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" /> Previous Step
                  </Button>
                )}
                {activeTab !== 'sizes' && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const idx = TABS_ORDER.indexOf(activeTab)
                      if (idx < TABS_ORDER.length - 1) setActiveTab(TABS_ORDER[idx + 1])
                    }}
                    className="h-9 text-xs rounded-xl cursor-pointer"
                  >
                    Next Step <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/products')}
                  className="h-9 rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="h-9 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-xl px-5 cursor-pointer gap-1.5 shadow-sm"
                >
                  <Save className="h-3.5 w-3.5" />
                  {isEditing ? 'Update Product' : 'Save Product'}
                </Button>
              </div>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  )
}
