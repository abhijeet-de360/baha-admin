import { useState } from 'react'
import slugify from 'slugify'
import {
  BookOpen,
  Plus,
  Search,
  Pencil,
  Trash2,
  CheckCircle2,
  Calendar,
  User,
  Link as LinkIcon,
  Eye,
  Globe,
  Upload,
  X,
  Image as ImageIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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

export interface BlogPost {
  id: string
  title: string
  slug: string
  category: string
  author: string
  date: string
  status: 'Published' | 'Draft'
  coverImage: string
  excerpt: string
  content: string
  metaTitle?: string
  metaDescription?: string
}

// Generate slug using slugify package
const generateSlug = (text: string): string => {
  return slugify(text, {
    lower: true,
    strict: true,
    trim: true,
  })
}

const INITIAL_BLOGS: BlogPost[] = [
  {
    id: 'blog-1',
    title: 'Top 10 Kids Fashion Trends for Summer 2026',
    slug: generateSlug('Top 10 Kids Fashion Trends for Summer 2026'),
    category: 'Fashion Trends',
    author: 'Admin Team',
    date: 'Sep 08, 2026',
    status: 'Published',
    coverImage: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=600&auto=format&fit=crop&q=80',
    excerpt: 'Discover the latest breathable fabrics, vibrant pastel color palettes, and cozy loungewear styles for kids this summer season.',
    content: 'Summer is all about comfortable, lightweight, and vibrant apparel for young ones. In this article, we dive into organic cotton clothing, playful prints, and essential UV-protection swimwear for kids.',
    metaTitle: 'Top 10 Kids Fashion Trends for Summer 2026 | Baha Kids',
    metaDescription: 'Explore the newest summer clothing trends for toddlers and children. Organic fabrics, soft pastel tones, and breezy everyday outfits.',
  },
  {
    id: 'blog-2',
    title: 'How to Choose Safe and Organic Fabrics for Toddlers',
    slug: generateSlug('How to Choose Safe and Organic Fabrics for Toddlers'),
    category: 'Parenting & Care',
    author: 'Dr. Neha Kapoor',
    date: 'Aug 24, 2026',
    status: 'Published',
    coverImage: 'https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?w=600&auto=format&fit=crop&q=80',
    excerpt: 'A comprehensive guide on selecting non-toxic, hypoallergenic, and GOTS-certified organic cotton clothes for sensitive toddler skin.',
    content: 'When it comes to infants and toddlers, skin sensitivity is a top priority. Synthetic dyes and harsh treatments can cause irritation. Opt for GOTS-certified organic cotton and bamboo blends.',
    metaTitle: 'Guide to Safe Organic Fabrics for Toddler Skin | Baha',
    metaDescription: 'Learn how to identify GOTS-certified non-toxic organic cotton and hypoallergenic toddler wear to prevent skin allergies.',
  },
  {
    id: 'blog-3',
    title: 'Festival Fashion Guide: Traditional Wear Made Comfortable',
    slug: generateSlug('Festival Fashion Guide: Traditional Wear Made Comfortable'),
    category: 'Festive Wear',
    author: 'Admin Team',
    date: 'Aug 10, 2026',
    status: 'Draft',
    coverImage: 'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=600&auto=format&fit=crop&q=80',
    excerpt: 'Make festival dressing effortless for your little ones with soft cotton lining, elastic waistbands, and itchy-free embroidery.',
    content: 'Festive occasions demand gorgeous ethnic outfits like kurtas and lehengas. However, comfort should never be compromised. Learn how soft inner linings make all the difference.',
    metaTitle: 'Comfortable Traditional Ethnic Wear for Children',
    metaDescription: 'Tips for buying itch-free festive clothes for kids with soft inner linings and comfortable waistbands.',
  },
]

const CATEGORIES = ['Fashion Trends', 'Parenting & Care', 'Festive Wear', 'Store News', 'Guides']

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>(INITIAL_BLOGS)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'All' | 'Published' | 'Draft'>('All')

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null)

  // Form Fields
  const [formTitle, setFormTitle] = useState('')
  const [formSlug, setFormSlug] = useState('')
  const [isSlugManuallyModified, setIsSlugManuallyModified] = useState(false)
  const [formCategory, setFormCategory] = useState('Fashion Trends')
  const [formAuthor, setFormAuthor] = useState('Admin Team')
  const [formStatus, setFormStatus] = useState<'Published' | 'Draft' | ''>('')
  const [formCoverImage, setFormCoverImage] = useState('')
  const [formExcerpt, setFormExcerpt] = useState('')
  const [formContent, setFormContent] = useState('')

  // SEO Meta Fields
  const [formMetaTitle, setFormMetaTitle] = useState('')
  const [formMetaDescription, setFormMetaDescription] = useState('')
  const [isMetaTitleModified, setIsMetaTitleModified] = useState(false)
  const [isMetaDescModified, setIsMetaDescModified] = useState(false)

  // View Preview Modal
  const [viewingBlog, setViewingBlog] = useState<BlogPost | null>(null)

  // Delete Confirmation State
  const [deletingBlogId, setDeletingBlogId] = useState<string | null>(null)

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showNotification = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Handle Image File Upload (Base64 Reader)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setFormCoverImage(reader.result)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle title input change and auto-generate slug & default meta title
  const handleTitleChange = (val: string) => {
    setFormTitle(val)
    if (!isSlugManuallyModified) {
      setFormSlug(generateSlug(val))
    }
    if (!isMetaTitleModified) {
      setFormMetaTitle(val)
    }
  }

  // Handle manual slug edit using slugify
  const handleSlugChange = (val: string) => {
    setFormSlug(generateSlug(val))
    setIsSlugManuallyModified(true)
  }

  // Handle excerpt change & auto fill meta description if unedited
  const handleExcerptChange = (val: string) => {
    setFormExcerpt(val)
    if (!isMetaDescModified) {
      setFormMetaDescription(val)
    }
  }

  // Open Modal for Add (Clear all fields)
  const handleOpenAddModal = () => {
    setEditingBlog(null)
    setFormTitle('')
    setFormSlug('')
    setIsSlugManuallyModified(false)
    setFormCategory('')
    setFormAuthor('')
    setFormStatus('')
    setFormCoverImage('')
    setFormExcerpt('')
    setFormContent('')
    setFormMetaTitle('')
    setFormMetaDescription('')
    setIsMetaTitleModified(false)
    setIsMetaDescModified(false)
    setIsModalOpen(true)
  }

  // Open Modal for Edit
  const handleOpenEditModal = (blog: BlogPost) => {
    setEditingBlog(blog)
    setFormTitle(blog.title)
    setFormSlug(blog.slug || generateSlug(blog.title))
    setIsSlugManuallyModified(true)
    setFormCategory(blog.category)
    setFormAuthor(blog.author)
    setFormStatus(blog.status)
    setFormCoverImage(blog.coverImage)
    setFormExcerpt(blog.excerpt)
    setFormContent(blog.content)
    setFormMetaTitle(blog.metaTitle || blog.title)
    setFormMetaDescription(blog.metaDescription || blog.excerpt)
    setIsMetaTitleModified(Boolean(blog.metaTitle))
    setIsMetaDescModified(Boolean(blog.metaDescription))
    setIsModalOpen(true)
  }

  // Save (Create / Update)
  const handleSaveBlog = (e: React.FormEvent) => {
    e.preventDefault()

    const selectedCategory = formCategory || CATEGORIES[0] || 'Fashion Trends'
    const selectedStatus: 'Published' | 'Draft' = (formStatus as 'Published' | 'Draft') || 'Published'
    if (!formTitle.trim() || !formContent.trim()) return

    const finalSlug = formSlug.trim() ? generateSlug(formSlug) : generateSlug(formTitle)
    const finalMetaTitle = formMetaTitle.trim() || formTitle
    const finalMetaDesc = formMetaDescription.trim() || formExcerpt || formContent.slice(0, 150)

    const todayStr = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    })

    if (editingBlog) {
      setBlogs((prev) =>
        prev.map((item) =>
          item.id === editingBlog.id
            ? {
              ...item,
              title: formTitle,
              slug: finalSlug,
              category: selectedCategory,
              author: formAuthor.trim() || 'Admin Team',
              status: selectedStatus,
              coverImage: formCoverImage || 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=600&auto=format&fit=crop&q=80',
              excerpt: formExcerpt || formContent.slice(0, 120) + '...',
              content: formContent,
              metaTitle: finalMetaTitle,
              metaDescription: finalMetaDesc,
            }
            : item
        )
      )
      showNotification('Blog post updated successfully!')
    } else {
      const newBlog: BlogPost = {
        id: `blog-${Date.now()}`,
        title: formTitle,
        slug: finalSlug,
        category: selectedCategory,
        author: formAuthor.trim() || 'Admin Team',
        date: todayStr,
        status: selectedStatus,
        coverImage: formCoverImage || 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=600&auto=format&fit=crop&q=80',
        excerpt: formExcerpt || formContent.slice(0, 120) + '...',
        content: formContent,
        metaTitle: finalMetaTitle,
        metaDescription: finalMetaDesc,
      }
      setBlogs((prev) => [newBlog, ...prev])
      showNotification('New blog post created successfully!')
    }

    setIsModalOpen(false)
  }

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (!deletingBlogId) return
    setBlogs((prev) => prev.filter((item) => item.id !== deletingBlogId))
    setDeletingBlogId(null)
    showNotification('Blog post deleted successfully!')
  }

  // Filtered List
  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch =
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.author.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'All' || blog.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6 md:space-y-8 w-full font-sans pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary text-primary-foreground">
              <BookOpen className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Blog Management
            </h1>
          </div>
          <p className="text-xs text-muted-foreground sm:pl-10">
            Create, edit, and publish SEO-optimized articles for your store.
          </p>
        </div>

        {/* Create Blog Button */}
        <Button
          onClick={handleOpenAddModal}
          className="rounded-full font-semibold text-xs px-5 py-2.5 gap-2 shadow-md shrink-0 cursor-pointer transition-all"
        >
          <Plus className="h-4 w-4" /> Add New Blog Post
        </Button>
      </div>

      {/* Success Notification Toast */}
      {toastMessage && (
        <div className="flex items-center gap-2 bg-muted border border-border text-foreground text-xs px-4 py-3 rounded-xl shadow-xs animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-foreground" />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Search Bar & Status Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-card p-4 rounded-2xl border border-border shadow-xs">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search blog title, URL slug, category, or author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 bg-background text-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {(['All', 'Published', 'Draft'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
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

      {/* Blogs Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredBlogs.length === 0 ? (
          <div className="col-span-full">
            <Card className="rounded-2xl border-border p-12 text-center">
              <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
              <p className="text-sm font-semibold text-foreground">No Blog Posts Found</p>
              <p className="text-xs text-muted-foreground mt-1">
                Try clearing your search or add a new blog post.
              </p>
            </Card>
          </div>
        ) : (
          filteredBlogs.map((blog) => (
            <Card
              key={blog.id}
              className="rounded-2xl border-border shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group"
            >
              <div>
                {/* Cover Image Header */}
                <div className="relative h-44 w-full bg-muted overflow-hidden">
                  <img
                    src={blog.coverImage}
                    alt={blog.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Status Badge */}
                  <span
                    className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold shadow-xs ${blog.status === 'Published'
                        ? 'bg-primary/90 text-primary-foreground'
                        : 'bg-muted/90 text-muted-foreground border border-border'
                      }`}
                  >
                    {blog.status}
                  </span>

                  {/* Category Pill */}
                  <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-background/80 backdrop-blur-md text-foreground text-[10px] font-bold uppercase tracking-wider border border-border">
                    {blog.category}
                  </span>
                </div>

                {/* Article Info */}
                <CardContent className="p-5 space-y-2.5">
                  <h3 className="text-base font-bold text-foreground leading-snug line-clamp-2">
                    {blog.title}
                  </h3>

                  {/* Auto-Generated Slug Badge */}
                  <div className="flex items-center gap-1 text-[11px] font-mono text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-lg w-max max-w-full overflow-hidden truncate border border-border/50">
                    <LinkIcon className="h-3 w-3 shrink-0" />
                    <span className="truncate">/{blog.slug}</span>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed pt-1">
                    {blog.excerpt}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border/40">
                    <span className="flex items-center gap-1.5 font-medium">
                      <User className="h-3.5 w-3.5" /> {blog.author}
                    </span>
                    <span className="flex items-center gap-1.5 font-mono">
                      <Calendar className="h-3.5 w-3.5" /> {blog.date}
                    </span>
                  </div>
                </CardContent>
              </div>

              {/* Action Buttons */}
              <CardFooter className="px-5 py-3 border-t border-border/60 bg-muted/20 flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewingBlog(blog)}
                  className="h-8 gap-1.5 text-xs hover:text-foreground cursor-pointer p-0"
                >
                  <Eye className="h-3.5 w-3.5" /> Read Article & SEO
                </Button>

                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenEditModal(blog)}
                    className="h-8 w-8 hover:text-foreground hover:bg-muted rounded-xl cursor-pointer"
                    title="Edit Blog"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeletingBlogId(blog.id)}
                    className="h-8 w-8 p-0 border-border text-destructive hover:bg-destructive/10 rounded-xl cursor-pointer"
                    title="Delete Blog"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))
        )}
      </div>

      {/* Add / Edit Blog Modal Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-4xl rounded-2xl max-h-[92vh] overflow-y-auto">
          <form onSubmit={handleSaveBlog}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base text-foreground">
                <BookOpen className="h-5 w-5 text-foreground" />
                {editingBlog ? 'Edit Blog Post' : 'Create New Blog Post'}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Enter article title, URL slug, SEO metadata, category, author, and content below.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              {/* Left Column: Essential Info & Content */}
              <div className="space-y-4">
                {/* Title Input */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    Article Title
                  </label>
                  <Input
                    placeholder="e.g., Top 10 Kids Fashion Trends for Summer 2026"
                    value={formTitle}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="h-10 text-xs font-semibold placeholder:text-muted-foreground/40 text-foreground bg-background"
                    required
                  />
                </div>

                {/* Auto-Generated Slug Input */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <LinkIcon className="h-3.5 w-3.5" /> URL Slug
                  </label>
                  <Input
                    placeholder="top-10-kids-fashion-trends"
                    value={formSlug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    className="h-10 text-xs font-mono font-semibold placeholder:text-muted-foreground/40 text-foreground bg-background"
                    required
                  />
                </div>

                {/* Category & Status Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      Category
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
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      Publish Status
                    </label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as 'Published' | 'Draft' | '')}
                      className="w-full h-10 px-3 rounded-xl border border-input bg-background text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-ring text-foreground"
                      required
                    >
                      <option value="" disabled>
                        Select Status
                      </option>
                      <option value="Published">Published</option>
                      <option value="Draft">Draft</option>
                    </select>
                  </div>
                </div>

                {/* Excerpt */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    Short Excerpt / Summary
                  </label>
                  <textarea
                    placeholder="Brief 1-2 sentence overview shown in blog cards..."
                    value={formExcerpt}
                    onChange={(e) => handleExcerptChange(e.target.value)}
                    rows={2}
                    className="w-full p-3 rounded-xl border border-input bg-background text-xs font-medium focus:outline-none focus:ring-1 focus:ring-ring resize-y placeholder:text-muted-foreground/40 text-foreground"
                  />
                </div>

                {/* Body Content */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    Full Article Body Content
                  </label>
                  <textarea
                    placeholder="Write full article text here..."
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    rows={6}
                    className="w-full p-3 rounded-xl border border-input bg-background text-xs font-medium leading-relaxed focus:outline-none focus:ring-1 focus:ring-ring resize-y placeholder:text-muted-foreground/40 text-foreground"
                    required
                  />
                </div>
              </div>

              {/* Right Column: Image Upload & SEO Meta Tags */}
              <div className="space-y-4">
                {/* Cover Picture Upload Section */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <ImageIcon className="h-3.5 w-3.5 text-foreground" /> Blog Cover Picture
                  </label>

                  {formCoverImage ? (
                    <div className="relative h-36 w-full rounded-xl overflow-hidden border border-border bg-muted group shadow-xs">
                      <img src={formCoverImage} alt="Cover Preview" className="h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-background/80 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <label className="bg-card text-card-foreground hover:bg-muted font-semibold text-xs px-3 py-1.5 rounded-lg cursor-pointer flex items-center gap-1.5 shadow-sm border border-border">
                          <Upload className="h-3.5 w-3.5" /> Change
                          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                        </label>
                        <button
                          type="button"
                          onClick={() => setFormCoverImage('')}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-semibold text-xs px-3 py-1.5 rounded-lg cursor-pointer flex items-center gap-1 shadow-sm"
                        >
                          <X className="h-3.5 w-3.5" /> Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-border hover:border-muted-foreground/50 rounded-xl p-4 flex flex-col items-center justify-center gap-1.5 cursor-pointer bg-muted/20 hover:bg-muted/40 transition-all text-center">
                      <div className="p-2.5 rounded-full bg-muted text-muted-foreground">
                        <Upload className="h-4 w-4" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-foreground">Click to upload blog picture</p>
                        <p className="text-[10px] text-muted-foreground">PNG, JPG, WEBP up to 10MB</p>
                      </div>
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                  )}

                </div>

                {/* SEO SETTINGS SECTION */}
                <div className="pt-2 border-t border-border space-y-3">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-foreground" />
                    <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                      SEO Meta Tags
                    </span>
                  </div>

                  {/* Meta Title */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                        Meta Title Tag
                      </label>
                      <span className="text-[10px] font-mono font-medium text-muted-foreground">
                        {formMetaTitle.length}/60 chars
                      </span>
                    </div>
                    <Input
                      placeholder="e.g., Top 10 Kids Fashion Trends for Summer 2026 | Baha"
                      value={formMetaTitle}
                      onChange={(e) => {
                        setFormMetaTitle(e.target.value)
                        setIsMetaTitleModified(true)
                      }}
                      className="h-10 text-xs font-medium placeholder:text-muted-foreground/40 text-foreground bg-background"
                    />
                  </div>

                  {/* Meta Description */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                        Meta Description Tag
                      </label>
                      <span className="text-[10px] font-mono font-medium text-muted-foreground">
                        {formMetaDescription.length}/160 chars
                      </span>
                    </div>
                    <textarea
                      placeholder="Write a concise meta description summarizing the blog for Google search results..."
                      value={formMetaDescription}
                      onChange={(e) => {
                        setFormMetaDescription(e.target.value)
                        setIsMetaDescModified(true)
                      }}
                      rows={3}
                      className="w-full p-3 rounded-xl border border-input bg-background text-xs font-medium focus:outline-none focus:ring-1 focus:ring-ring resize-y placeholder:text-muted-foreground/40 text-foreground"
                    />
                  </div>
                </div>
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
                Publish Post
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Read Preview Dialog Modal */}
      <Dialog open={Boolean(viewingBlog)} onOpenChange={(open) => !open && setViewingBlog(null)}>
        {viewingBlog && (
          <DialogContent className="sm:max-w-[650px] rounded-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-block px-2.5 py-1 rounded-md bg-muted text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
                  {viewingBlog.category}
                </span>
                <span className="text-[11px] font-mono text-foreground bg-muted px-2.5 py-0.5 rounded font-semibold border border-border">
                  /blog/{viewingBlog.slug}
                </span>
              </div>
              <DialogTitle className="text-xl font-bold leading-snug pt-1 text-foreground">{viewingBlog.title}</DialogTitle>
              <DialogDescription className="text-xs flex items-center gap-4 pt-1 text-muted-foreground">
                <span>By {viewingBlog.author}</span>
                <span>•</span>
                <span>{viewingBlog.date}</span>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="h-56 w-full rounded-xl overflow-hidden bg-muted">
                <img src={viewingBlog.coverImage} alt={viewingBlog.title} className="h-full w-full object-cover" />
              </div>

              {/* SEO Meta Box Preview */}
              <div className="p-3.5 rounded-xl bg-card border border-border text-card-foreground space-y-1.5 text-xs font-sans shadow-md">
                <div className="flex items-center gap-2 text-foreground font-bold text-[10px] uppercase tracking-wider">
                  <Globe className="h-3.5 w-3.5" /> Google Search Result Preview
                </div>
                <p className="font-semibold text-foreground text-sm truncate">
                  {viewingBlog.metaTitle || viewingBlog.title}
                </p>
                <p className="text-[11px] text-muted-foreground font-mono">
                  https://baha.io/blog/{viewingBlog.slug}
                </p>
                <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                  {viewingBlog.metaDescription || viewingBlog.excerpt}
                </p>
              </div>

              <p className="text-xs text-muted-foreground italic bg-muted/30 p-3 rounded-xl border border-border/50">
                "{viewingBlog.excerpt}"
              </p>

              <div className="text-sm leading-relaxed text-foreground space-y-3 pt-2 font-serif">
                {viewingBlog.content}
              </div>
            </div>

            <DialogFooter>
              <Button onClick={() => setViewingBlog(null)} className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl text-xs cursor-pointer">
                Close Preview
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog
        open={Boolean(deletingBlogId)}
        onOpenChange={(open) => !open && setDeletingBlogId(null)}
      >
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base text-foreground">Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              Are you sure you want to delete this blog post? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl text-xs cursor-pointer">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-xl text-xs font-semibold cursor-pointer"
            >
              Delete Article
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

