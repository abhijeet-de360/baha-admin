import { useState } from 'react'
import slugify from 'slugify'
import {
  FolderTree, Plus, Search, Edit2, Trash2, CheckCircle2, AlertTriangle, ChevronLeft, ChevronRight,
  Upload, Image as ImageIcon, X, Filter, Sparkles, Layers, Calendar, Tag, Link as LinkIcon
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'

export interface Category {
  id: string
  name: string
  slug: string
  image: string
  description: string
  status: 'Active' | 'Inactive'
  createdAt: string
  productCount: number
}

// Generate slug using slugify package
const generateSlug = (text: string): string => {
  return slugify(text, {
    lower: true,
    strict: true,
    trim: true,
  })
}

const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    name: 'Boys Collection',
    slug: 'boys-collection',
    image: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=500&auto=format&fit=crop&q=80',
    description: 'Trendy t-shirts, shirts, shorts and denim for young boys.',
    status: 'Active',
    createdAt: '2026-01-10',
    productCount: 42,
  },
  {
    id: 'cat-2',
    name: 'Girls Collection',
    slug: 'girls-collection',
    image: 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=500&auto=format&fit=crop&q=80',
    description: 'Adorable dresses, skirts, tops, and sets for young girls.',
    status: 'Active',
    createdAt: '2026-01-10',
    productCount: 58,
  },
  {
    id: 'cat-3',
    name: 'Baby & Toddlers',
    slug: 'baby-toddlers',
    image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=500&auto=format&fit=crop&q=80',
    description: 'Soft organic cotton onesies, rompers, and bibs for infants.',
    status: 'Active',
    createdAt: '2026-01-12',
    productCount: 35,
  },
  {
    id: 'cat-4',
    name: 'Newborn Essentials',
    slug: 'newborn-essentials',
    image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=500&auto=format&fit=crop&q=80',
    description: 'Ultra-soft newborn clothing sets, mittens, and swaddles.',
    status: 'Active',
    createdAt: '2026-01-15',
    productCount: 24,
  },
  {
    id: 'cat-5',
    name: 'Party & Festive Wear',
    slug: 'party-festive-wear',
    image: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=500&auto=format&fit=crop&q=80',
    description: 'Elegant tuxedos, suits, ethnic wear, and party gowns.',
    status: 'Active',
    createdAt: '2026-01-20',
    productCount: 30,
  },
  {
    id: 'cat-6',
    name: 'Winter & Outerwear',
    slug: 'winter-outerwear',
    image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=500&auto=format&fit=crop&q=80',
    description: 'Cozy jackets, hoodies, sweaters, and knitted beanies.',
    status: 'Active',
    createdAt: '2026-02-01',
    productCount: 19,
  },
  {
    id: 'cat-7',
    name: 'Summer Shorts & Tees',
    slug: 'summer-shorts-tees',
    image: 'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=500&auto=format&fit=crop&q=80',
    description: 'Lightweight breathable cotton clothing for hot summer days.',
    status: 'Active',
    createdAt: '2026-02-10',
    productCount: 28,
  },
  {
    id: 'cat-8',
    name: 'Sleepwear & Pajamas',
    slug: 'sleepwear-pajamas',
    image: 'https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?w=500&auto=format&fit=crop&q=80',
    description: 'Comfy cotton night suits, pajamas, and sleep sacks.',
    status: 'Inactive',
    createdAt: '2026-02-15',
    productCount: 15,
  },
]

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All')

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  // Form State
  const [formName, setFormName] = useState('')
  const [formSlug, setFormSlug] = useState('')
  const [isSlugManuallyModified, setIsSlugManuallyModified] = useState(false)
  const [formImage, setFormImage] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formStatus, setFormStatus] = useState<'Active' | 'Inactive' | ''>('')
  const [formError, setFormError] = useState<string | null>(null)

  // Delete State
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null)

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showNotification = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Handle category name change and auto-generate slug
  const handleNameChange = (val: string) => {
    setFormName(val)
    if (!isSlugManuallyModified) {
      setFormSlug(generateSlug(val))
    }
  }

  // Handle manual slug edit using slugify
  const handleSlugChange = (val: string) => {
    setFormSlug(generateSlug(val))
    setIsSlugManuallyModified(true)
  }

  // Handle Base64 Image Upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setFormImage(reader.result)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  // Open Modal for Add
  const handleOpenAddModal = () => {
    setEditingCategory(null)
    setFormName('')
    setFormSlug('')
    setIsSlugManuallyModified(false)
    setFormImage('')
    setFormDescription('')
    setFormStatus('')
    setFormError(null)
    setIsModalOpen(true)
  }

  // Open Modal for Edit
  const handleOpenEditModal = (cat: Category) => {
    setEditingCategory(cat)
    setFormName(cat.name)
    setFormSlug(cat.slug || generateSlug(cat.name))
    setIsSlugManuallyModified(true)
    setFormImage(cat.image)
    setFormDescription(cat.description)
    setFormStatus(cat.status)
    setFormError(null)
    setIsModalOpen(true)
  }

  // Save (Create / Update)
  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!formName.trim()) {
      setFormError('Please enter a category name.')
      return
    }

    const finalSlug = formSlug.trim() ? generateSlug(formSlug) : generateSlug(formName)
    const selectedStatus: 'Active' | 'Inactive' = (formStatus as 'Active' | 'Inactive') || 'Active'
    const defaultImage =
      formImage || 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=500&auto=format&fit=crop&q=80'
    const todayStr = new Date().toISOString().split('T')[0]

    if (editingCategory) {
      setCategories((prev) =>
        prev.map((item) =>
          item.id === editingCategory.id
            ? {
              ...item,
              name: formName.trim(),
              slug: finalSlug,
              image: defaultImage,
              description: formDescription.trim(),
              status: selectedStatus,
            }
            : item
        )
      )
      showNotification(`Category "${formName.trim()}" updated successfully!`)
    } else {
      const newCat: Category = {
        id: `cat-${Date.now()}`,
        name: formName.trim(),
        slug: finalSlug,
        image: defaultImage,
        description: formDescription.trim(),
        status: selectedStatus,
        createdAt: todayStr,
        productCount: 0,
      }
      setCategories((prev) => [newCat, ...prev])
      showNotification(`Category "${formName.trim()}" created successfully!`)
    }

    setIsModalOpen(false)
  }

  // Delete Handler
  const handleConfirmDelete = () => {
    if (!deletingCategory) return
    setCategories((prev) => prev.filter((item) => item.id !== deletingCategory.id))
    showNotification(`Category "${deletingCategory.name}" deleted successfully!`)
    setDeletingCategory(null)
  }

  // Filtered Categories List
  const filteredCategories = categories.filter((cat) => {
    const matchesSearch =
      cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'All' || cat.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Pagination Logic
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage) || 1
  const paginatedCategories = filteredCategories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <div className="space-y-6 md:space-y-8 w-full font-sans pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary text-primary-foreground shadow-xs">
              <FolderTree className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Categories
            </h1>
          </div>
          <p className="text-xs text-muted-foreground sm:pl-10">
            Manage clothing categories for your kids fashion store.
          </p>
        </div>

        {/* Add Category Button */}
        <Button
          onClick={handleOpenAddModal}
          className="rounded-full font-semibold text-xs px-5 py-2.5 gap-2 shadow-md shrink-0 cursor-pointer transition-all"
        >
          <Plus className="h-4 w-4" /> Add Category
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card p-4 rounded-2xl border border-border flex items-center gap-4 shadow-xs">
          <div className="p-3 rounded-xl bg-muted text-foreground">
            <FolderTree className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Total Categories</p>
            <p className="text-xl font-extrabold text-foreground">{categories.length}</p>
          </div>
        </div>

        <div className="bg-card p-4 rounded-2xl border border-border flex items-center gap-4 shadow-xs">
          <div className="p-3 rounded-xl bg-muted text-foreground">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Active Categories</p>
            <p className="text-xl font-extrabold text-foreground">
              {categories.filter((c) => c.status === 'Active').length}
            </p>
          </div>
        </div>

        <div className="bg-card p-4 rounded-2xl border border-border flex items-center gap-4 shadow-xs">
          <div className="p-3 rounded-xl bg-muted text-foreground">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Inactive Categories</p>
            <p className="text-xl font-extrabold text-foreground">
              {categories.filter((c) => c.status === 'Inactive').length}
            </p>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-card p-4 rounded-2xl border border-border shadow-xs">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search category name or description..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            className="pl-10 h-10 bg-background text-xs placeholder:text-muted-foreground/40"
          />
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[11px] font-bold uppercase tracking-wider mr-1 flex items-center gap-1 text-muted-foreground">
            <Filter className="h-3 w-3" /> Status:
          </span>
          {(['All', 'Active', 'Inactive'] as const).map((st) => (
            <button
              key={st}
              onClick={() => {
                setStatusFilter(st)
                setCurrentPage(1)
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${statusFilter === st
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Categories Content Area */}
      <Card className="rounded-2xl border-border overflow-hidden shadow-xs">
        <CardContent className="p-0">
          {paginatedCategories.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="p-3.5 rounded-full bg-muted text-muted-foreground w-fit mx-auto">
                <FolderTree className="h-8 w-8" />
              </div>
              <h3 className="text-sm font-bold text-foreground">No categories found</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {searchQuery || statusFilter !== 'All'
                  ? 'Try adjusting your search criteria or status filter.'
                  : 'Get started by adding your first kids clothing category.'}
              </p>
              {!searchQuery && statusFilter === 'All' && (
                <Button
                  onClick={handleOpenAddModal}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs rounded-xl px-4 py-2 mt-2 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Category
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Responsive Grid View for All Screens */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 p-5">
                {paginatedCategories.map((cat) => (
                  <div
                    key={cat.id}
                    className="group relative rounded-2xl border border-border bg-card overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                  >
                    {/* Category Image Header */}
                    <div className="relative h-44 w-full overflow-hidden bg-muted">
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent" />

                      {/* Status Badge Overlay */}
                      <div className="absolute top-3 right-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold backdrop-blur-md ${cat.status === 'Active'
                            ? 'bg-primary/90 text-primary-foreground shadow-xs'
                            : 'bg-muted/90 text-muted-foreground'
                            }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${cat.status === 'Active' ? 'bg-primary-foreground' : 'bg-muted-foreground'
                              }`}
                          />
                          {cat.status}
                        </span>
                      </div>

                      {/* Category Title & Product Count Overlay */}
                      <div className="absolute bottom-3 left-3 right-3 space-y-1 text-foreground">
                        <h3 className="font-extrabold text-base leading-tight truncate">{cat.name}</h3>
                        <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground">
                          <span className="font-mono text-[10px] bg-background/60 backdrop-blur-md text-foreground px-2 py-0.5 rounded font-semibold truncate max-w-[150px]">
                            /{cat.slug}
                          </span>
                          <span className="flex items-center gap-1">
                            <Tag className="h-3 w-3 text-muted-foreground" /> {cat.productCount} Products
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Category Content & Actions Body */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {cat.description || 'No description provided for this category.'}
                      </p>

                      <div className="pt-3 border-t border-border flex items-center justify-between">
                        <div className="flex items-center gap-1 text-[11px] font-mono text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {cat.createdAt}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenEditModal(cat)}
                            className="h-8 w-8 p-0 rounded-xl border-border cursor-pointer hover:bg-muted hover:text-foreground"
                            title="Edit Category"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeletingCategory(cat)}
                            className="h-8 w-8 p-0 rounded-xl border-border text-destructive hover:bg-destructive/10 cursor-pointer"
                            title="Delete Category"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Pagination Footer */}
          {filteredCategories.length > 0 && (
            <div className="flex items-center justify-between px-5 py-3.5 border-t border-border bg-muted/20 text-xs">
              <p className="text-muted-foreground">
                Showing{' '}
                <span className="font-semibold text-foreground">
                  {(currentPage - 1) * itemsPerPage + 1}
                </span>{' '}
                to{' '}
                <span className="font-semibold text-foreground">
                  {Math.min(currentPage * itemsPerPage, filteredCategories.length)}
                </span>{' '}
                of <span className="font-semibold text-foreground">{filteredCategories.length}</span> categories
              </p>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  className="h-8 text-xs rounded-lg px-3 cursor-pointer"
                >
                  <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Prev
                </Button>
                <span className="text-xs font-semibold px-2">
                  Page {currentPage} of {totalPages}
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

      {/* Add / Edit Category Modal Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[550px] rounded-2xl">
          <form onSubmit={handleSaveCategory}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
                <FolderTree className="h-5 w-5 text-foreground" />
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Enter category title, URL slug, upload cover image, and status.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Form Validation Alert */}
              {formError && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs font-semibold">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Category Name & Status Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Category Name <span className="text-destructive">*</span>
                  </label>
                  <Input
                    placeholder="e.g., Party Wear, Boys Collection"
                    value={formName}
                    onChange={(e) => handleNameChange(e.target.value)}
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
                    onChange={(e) => setFormStatus(e.target.value as 'Active' | 'Inactive' | '')}
                    className="w-full h-10 px-3 rounded-xl border border-input bg-background text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-ring text-foreground"
                    required
                  >
                    <option value="" disabled>
                      Select Status
                    </option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Category Slug Input (Auto-generated using slugify) */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 text-muted-foreground">
                  <LinkIcon className="h-3.5 w-3.5" /> URL Slug <span className="text-destructive">*</span>
                </label>
                <Input
                  placeholder="e.g., party-wear"
                  value={formSlug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  className="h-10 text-xs font-mono font-semibold placeholder:text-muted-foreground/40 text-foreground bg-background"
                  required
                />
              </div>

              {/* Category Cover Image Upload Section */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 text-muted-foreground">
                  <ImageIcon className="h-3.5 w-3.5 text-foreground" /> Category Cover Picture
                </label>

                {formImage ? (
                  <div className="relative h-44 w-full rounded-xl overflow-hidden border border-border bg-muted group shadow-xs">
                    <img src={formImage} alt="Cover Preview" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <label className="bg-card text-card-foreground hover:bg-muted font-semibold text-xs px-3 py-1.5 rounded-lg cursor-pointer flex items-center gap-1.5 shadow-sm border border-border">
                        <Upload className="h-3.5 w-3.5" /> Upload Different Picture
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                      </label>
                      <button
                        type="button"
                        onClick={() => setFormImage('')}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-semibold text-xs px-3 py-1.5 rounded-lg cursor-pointer flex items-center gap-1 shadow-sm"
                      >
                        <X className="h-3.5 w-3.5" /> Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-border hover:border-muted-foreground/50 rounded-xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer bg-muted/20 hover:bg-muted/40 transition-all text-center">
                    <div className="p-3 rounded-full bg-muted text-muted-foreground">
                      <Upload className="h-5 w-5" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-foreground">Click or drag image to upload</p>
                      <p className="text-[10px] text-muted-foreground">PNG, JPG, WEBP, GIF up to 10MB</p>
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                )}

              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Description <span className="font-normal">(Optional)</span>
                </label>
                <textarea
                  placeholder="Short overview describing this category..."
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
                {editingCategory ? 'Update Category' : 'Save Category'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={Boolean(deletingCategory)} onOpenChange={(open) => !open && setDeletingCategory(null)}>
        {deletingCategory && (
          <DialogContent className="sm:max-w-[420px] rounded-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base font-bold text-destructive">
                <AlertTriangle className="h-5 w-5" /> Delete Category
              </DialogTitle>
              <DialogDescription className="text-xs pt-1 text-muted-foreground">
                Are you sure you want to delete this category? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>

            <div className="p-4 rounded-xl border border-border my-2 flex items-center gap-3">
              <img
                src={deletingCategory.image}
                alt={deletingCategory.name}
                className="h-12 w-12 rounded-lg object-cover border border-border shrink-0"
              />
              <div className="overflow-hidden">
                <p className="text-xs font-extrabold text-foreground truncate">{deletingCategory.name}</p>
                <p className="text-[11px] text-muted-foreground truncate">{deletingCategory.productCount} linked products</p>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeletingCategory(null)}
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
