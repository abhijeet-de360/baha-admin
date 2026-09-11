import { useState, useEffect } from 'react'
import {
  MessageSquareQuote,
  Plus,
  Search,
  Pencil,
  Trash2,
  CheckCircle2,
  Star,
  Quote,
  Upload,
  X,
  Image as ImageIcon,
  Sparkles,
  ThumbsUp
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'

export interface Testimonial {
  id: string
  customerName: string
  customerRole: string
  avatar: string
  content: string
  rating: number
  status: 'Active' | 'Inactive'
  createdAt: string
}

const STORAGE_KEY = 'baha_testimonials_list'

const INITIAL_TESTIMONIALS: Testimonial[] = [
  {
    id: 'testi-1',
    customerName: 'Ananya Sharma',
    customerRole: 'Mother of 2',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
    content: 'The organic cotton fabric is amazingly soft! My toddler has super sensitive skin and Baha clothes caused zero irritation. Highly recommended!',
    rating: 5,
    status: 'Active',
    createdAt: '2026-02-14',
  },
  {
    id: 'testi-2',
    customerName: 'Rahul Verma',
    customerRole: 'Verified Buyer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    content: 'Fast delivery and premium packaging! The festive tuxedo set fit my 5-year-old son perfectly for his birthday party.',
    rating: 5,
    status: 'Active',
    createdAt: '2026-02-20',
  },
  {
    id: 'testi-3',
    customerName: 'Pooja Patel',
    customerRole: 'Mom & Fashion Blogger',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    content: 'Super cute designs and brilliant stitching quality. The colors stay vibrant even after multiple washes.',
    rating: 4,
    status: 'Active',
    createdAt: '2026-03-01',
  },
]

export const getStoredTestimonials = (): Testimonial[] => {
  const data = localStorage.getItem(STORAGE_KEY)
  if (data) {
    try {
      return JSON.parse(data)
    } catch (e) {
      console.error('Failed to parse stored testimonials', e)
    }
  }
  return INITIAL_TESTIMONIALS
}

export const saveStoredTestimonials = (items: Testimonial[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(getStoredTestimonials)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All')

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Testimonial | null>(null)

  // Form Fields
  const [formName, setFormName] = useState('')
  const [formRole, setFormRole] = useState('')
  const [formAvatar, setFormAvatar] = useState('')
  const [formContent, setFormContent] = useState('')
  const [formRating, setFormRating] = useState(5)
  const [formStatus, setFormStatus] = useState<'Active' | 'Inactive'>('Active')

  // Delete Dialog State
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  useEffect(() => {
    saveStoredTestimonials(testimonials)
  }, [testimonials])

  const showNotification = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Handle Avatar Upload
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setFormAvatar(reader.result)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingItem(null)
    setFormName('')
    setFormRole('Verified Buyer')
    setFormAvatar('')
    setFormContent('')
    setFormRating(5)
    setFormStatus('Active')
    setIsModalOpen(true)
  }

  // Open Edit Modal
  const handleOpenEditModal = (item: Testimonial) => {
    setEditingItem(item)
    setFormName(item.customerName)
    setFormRole(item.customerRole)
    setFormAvatar(item.avatar)
    setFormContent(item.content)
    setFormRating(item.rating)
    setFormStatus(item.status)
    setIsModalOpen(true)
  }

  // Save Testimonial
  const handleSaveTestimonial = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName.trim() || !formContent.trim()) return

    const defaultAvatar = formAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(formName.trim())}`
    const todayStr = new Date().toISOString().split('T')[0]

    if (editingItem) {
      setTestimonials((prev) =>
        prev.map((t) =>
          t.id === editingItem.id
            ? {
                ...t,
                customerName: formName.trim(),
                customerRole: formRole.trim() || 'Customer',
                avatar: defaultAvatar,
                content: formContent.trim(),
                rating: formRating,
                status: formStatus,
              }
            : t
        )
      )
      showNotification(`Testimonial by "${formName.trim()}" updated successfully!`)
    } else {
      const newItem: Testimonial = {
        id: `testi-${Date.now()}`,
        customerName: formName.trim(),
        customerRole: formRole.trim() || 'Verified Buyer',
        avatar: defaultAvatar,
        content: formContent.trim(),
        rating: formRating,
        status: formStatus,
        createdAt: todayStr,
      }
      setTestimonials((prev) => [newItem, ...prev])
      showNotification(`Testimonial by "${formName.trim()}" added successfully!`)
    }

    setIsModalOpen(false)
  }

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (!deletingId) return
    setTestimonials((prev) => prev.filter((t) => t.id !== deletingId))
    setDeletingId(null)
    showNotification('Testimonial deleted successfully!')
  }

  // Filtered List
  const filteredTestimonials = testimonials.filter((t) => {
    const matchesSearch =
      t.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.customerRole.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.content.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6 md:space-y-8 w-full font-sans pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary text-primary-foreground shadow-xs">
              <MessageSquareQuote className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Testimonials
            </h1>
          </div>
          <p className="text-xs text-muted-foreground sm:pl-10">
            Manage customer feedback, reviews, and ratings for your kids clothing store.
          </p>
        </div>

        {/* Add Testimonial Button */}
        <Button
          onClick={handleOpenAddModal}
          className="rounded-full font-semibold text-xs px-5 py-2.5 gap-2 shadow-md shrink-0 cursor-pointer transition-all"
        >
          <Plus className="h-4 w-4" /> Add Testimonial
        </Button>
      </div>

      {/* Success Notification Toast */}
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
            <MessageSquareQuote className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Total Reviews</p>
            <p className="text-xl font-extrabold text-foreground">{testimonials.length}</p>
          </div>
        </div>

        <div className="bg-card p-4 rounded-2xl border border-border flex items-center gap-4 shadow-xs">
          <div className="p-3 rounded-xl bg-muted text-foreground">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Active Reviews</p>
            <p className="text-xl font-extrabold text-foreground">
              {testimonials.filter((t) => t.status === 'Active').length}
            </p>
          </div>
        </div>

        <div className="bg-card p-4 rounded-2xl border border-border flex items-center gap-4 shadow-xs">
          <div className="p-3 rounded-xl bg-muted text-foreground">
            <ThumbsUp className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">5-Star Ratings</p>
            <p className="text-xl font-extrabold text-foreground">
              {testimonials.filter((t) => t.rating === 5).length}
            </p>
          </div>
        </div>
      </div>

      {/* Search & Status Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-card p-4 rounded-2xl border border-border shadow-xs">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search customer name, role, or testimonial review text..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 bg-background text-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {(['All', 'Active', 'Inactive'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Testimonials Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTestimonials.length === 0 ? (
          <div className="col-span-full">
            <Card className="rounded-2xl border-border p-12 text-center">
              <MessageSquareQuote className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
              <p className="text-sm font-semibold text-foreground">No Testimonials Found</p>
              <p className="text-xs text-muted-foreground mt-1">
                Try adjusting your search query or add a new customer testimonial.
              </p>
            </Card>
          </div>
        ) : (
          filteredTestimonials.map((t) => (
            <Card
              key={t.id}
              className="rounded-2xl border-border shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group bg-card p-5 relative"
            >
              <div className="space-y-4">
                {/* Header: User Avatar, Info & Status */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={t.avatar}
                      alt={t.customerName}
                      className="h-12 w-12 rounded-full object-cover border border-border shrink-0 bg-muted"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-foreground leading-snug">{t.customerName}</h3>
                      <p className="text-[11px] text-muted-foreground">{t.customerRole}</p>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                      t.status === 'Active'
                        ? 'bg-primary/10 text-primary border-primary/20'
                        : 'bg-muted text-muted-foreground border-border'
                    }`}
                  >
                    {t.status}
                  </span>
                </div>

                {/* Rating Stars */}
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= t.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'
                      }`}
                    />
                  ))}
                </div>

                {/* Review Quote Content */}
                <div className="relative pt-1">
                  <Quote className="h-5 w-5 text-muted-foreground/30 absolute -top-1 -left-1 rotate-180" />
                  <p className="text-xs text-foreground/90 leading-relaxed italic pl-5">
                    "{t.content}"
                  </p>
                </div>
              </div>

              {/* Card Footer: Date & Actions */}
              <div className="pt-4 mt-4 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-mono text-[11px]">{t.createdAt}</span>

                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenEditModal(t)}
                    className="h-8 w-8 p-0 rounded-xl border-border cursor-pointer hover:bg-muted hover:text-foreground"
                    title="Edit Testimonial"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeletingId(t.id)}
                    className="h-8 w-8 p-0 rounded-xl border-border text-destructive hover:bg-destructive/10 cursor-pointer"
                    title="Delete Testimonial"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Add / Edit Testimonial Dialog Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-2xl">
          <form onSubmit={handleSaveTestimonial}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base text-foreground font-bold">
                <MessageSquareQuote className="h-5 w-5 text-foreground" />
                {editingItem ? 'Edit Testimonial' : 'Add New Testimonial'}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Enter customer review, role, rating score, and optional profile photo.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Customer Name & Role Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    Customer Name <span className="text-destructive">*</span>
                  </label>
                  <Input
                    placeholder="e.g., Ananya Sharma"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="h-10 text-xs font-semibold text-foreground bg-background"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    Customer Role / Title
                  </label>
                  <Input
                    placeholder="e.g., Mother of 2, Verified Buyer"
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    className="h-10 text-xs font-semibold text-foreground bg-background"
                  />
                </div>
              </div>

              {/* Rating & Status Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    Star Rating Score
                  </label>
                  <div className="flex items-center gap-1.5 pt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setFormRating(star)}
                        className="cursor-pointer p-0.5 transition-transform hover:scale-110"
                      >
                        <Star
                          className={`h-6 w-6 ${
                            star <= formRating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    Status <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as 'Active' | 'Inactive')}
                    className="w-full h-10 px-3 rounded-xl border border-input bg-background text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    required
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Customer Avatar Upload */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <ImageIcon className="h-3.5 w-3.5 text-foreground" /> Customer Photo / Avatar
                </label>

                {formAvatar ? (
                  <div className="relative h-24 w-24 rounded-full overflow-hidden border border-border bg-muted group shadow-xs mx-auto">
                    <img src={formAvatar} alt="Avatar Preview" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => setFormAvatar('')}
                        className="bg-destructive text-destructive-foreground p-1.5 rounded-full cursor-pointer"
                        title="Remove Avatar"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-border hover:border-muted-foreground/50 rounded-xl p-4 flex flex-col items-center justify-center gap-1 cursor-pointer bg-muted/20 hover:bg-muted/40 transition-all text-center">
                    <Upload className="h-5 w-5 text-muted-foreground" />
                    <span className="text-xs font-bold text-foreground">Click to upload photo</span>
                    <span className="text-[10px] text-muted-foreground">PNG, JPG up to 5MB</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                  </label>
                )}
              </div>

              {/* Review Content */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Testimonial Review Content <span className="text-destructive">*</span>
                </label>
                <textarea
                  placeholder="Write customer feedback text..."
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  rows={4}
                  className="w-full p-3 rounded-xl border border-input bg-background text-xs font-medium focus:outline-none focus:ring-1 focus:ring-ring resize-y text-foreground placeholder:text-muted-foreground/40"
                  required
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="rounded-full text-xs cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-full font-semibold text-xs px-5 cursor-pointer"
              >
                {editingItem ? 'Update Testimonial' : 'Save Testimonial'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={Boolean(deletingId)} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base text-foreground font-bold">Delete Testimonial</AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              Are you sure you want to delete this customer testimonial? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full text-xs cursor-pointer">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-full text-xs font-semibold cursor-pointer"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
