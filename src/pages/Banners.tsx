import React, { useState } from 'react'
import {
  Image,
  Plus,
  Search,
  Sliders,
  SquarePen,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  Layers,
  Calendar,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
  type Banner,
  type BannerStatus,
  INITIAL_BANNERS,
} from '@/data/mockBanners'

export default function Banners() {
  const [banners, setBanners] = useState<Banner[]>(INITIAL_BANNERS)
  const [search, setSearch] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('All')

  // Modals state
  const [isAddEditOpen, setIsAddEditOpen] = useState(false)
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)
  const [previewBanner, setPreviewBanner] = useState<Banner | null>(null)
  const [deletingBanner, setDeletingBanner] = useState<Banner | null>(null)

  // Form state
  const [formData, setFormData] = useState<{
    title: string
    subtitle: string
    buttonText: string
    buttonLink: string
    imageUrl: string
    mobileImageUrl: string
    status: BannerStatus
    order: number
    startDate: string
    endDate: string
  }>({
    title: '',
    subtitle: '',
    buttonText: '',
    buttonLink: '',
    imageUrl: '',
    mobileImageUrl: '',
    status: 'Active',
    order: 1,
    startDate: '',
    endDate: '',
  })

  const updateBannersState = (newBanners: Banner[]) => {
    setBanners(newBanners)
  }

  // Filter hero sliders
  const filteredBanners = banners
    .filter((b) => {
      const matchesSearch =
        b.title.toLowerCase().includes(search.toLowerCase()) ||
        b.subtitle.toLowerCase().includes(search.toLowerCase()) ||
        b.id.toLowerCase().includes(search.toLowerCase())

      const matchesStatus = selectedStatus === 'All' || b.status === selectedStatus

      return matchesSearch && matchesStatus
    })
    .sort((a, b) => a.order - b.order)

  // Open Add modal
  const handleOpenAdd = () => {
    setEditingBanner(null)
    const nextOrder = banners.length + 1
    setFormData({
      title: '',
      subtitle: '',
      buttonText: 'Shop Now',
      buttonLink: '/shop',
      imageUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1200&auto=format&fit=crop&q=80',
      mobileImageUrl: '',
      status: 'Active',
      order: nextOrder,
      startDate: '',
      endDate: '',
    })
    setIsAddEditOpen(true)
  }

  // Open Edit modal
  const handleOpenEdit = (banner: Banner) => {
    setEditingBanner(banner)
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle,
      buttonText: banner.buttonText,
      buttonLink: banner.buttonLink,
      imageUrl: banner.imageUrl,
      mobileImageUrl: banner.mobileImageUrl || '',
      status: banner.status,
      order: banner.order,
      startDate: banner.startDate || '',
      endDate: banner.endDate || '',
    })
    setIsAddEditOpen(true)
  }

  // Save Add/Edit
  const handleSaveBanner = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.imageUrl) return

    if (editingBanner) {
      const updated = banners.map((b) =>
        b.id === editingBanner.id
          ? {
            ...b,
            ...formData,
            type: 'Hero Slider' as const,
          }
          : b
      )
      updateBannersState(updated)
    } else {
      const newBanner: Banner = {
        id: `SLD-${Date.now().toString().slice(-4)}`,
        ...formData,
        type: 'Hero Slider' as const,
        createdAt: new Date().toISOString(),
      }
      updateBannersState([...banners, newBanner])
    }

    setIsAddEditOpen(false)
  }

  // Toggle Status
  const handleToggleStatus = (id: string) => {
    const updated = banners.map((b) => {
      if (b.id === id) {
        const nextStatus: BannerStatus = b.status === 'Active' ? 'Inactive' : 'Active'
        return { ...b, status: nextStatus }
      }
      return b
    })
    updateBannersState(updated)
  }

  // Delete slider
  const handleDeleteConfirm = () => {
    if (!deletingBanner) return
    const updated = banners
      .filter((b) => b.id !== deletingBanner.id)
      .map((b, idx) => ({ ...b, order: idx + 1 }))
    updateBannersState(updated)
    setDeletingBanner(null)
  }

  // Stats calculation
  const totalBanners = banners.length
  const activeCount = banners.filter((b) => b.status === 'Active').length
  const scheduledCount = banners.filter((b) => b.status === 'Scheduled').length
  const inactiveCount = banners.filter((b) => b.status === 'Inactive').length

  const getStatusBadge = (status: BannerStatus) => {
    switch (status) {
      case 'Active':
        return (
          <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 border-emerald-500/30 gap-1">
            <CheckCircle2 className="w-3 h-3" /> Active
          </Badge>
        )
      case 'Inactive':
        return (
          <Badge className="bg-slate-500/15 text-slate-600 dark:text-slate-400 hover:bg-slate-500/25 border-slate-500/30 gap-1">
            <AlertCircle className="w-3 h-3" /> Inactive
          </Badge>
        )
      case 'Scheduled':
        return (
          <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 hover:bg-amber-500/25 border-amber-500/30 gap-1">
            <Clock className="w-3 h-3" /> Scheduled
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-4 max-w-full mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Sliders className="w-6 h-6 text-amber-500" />
            Home Hero Sliders
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage main storefront homepage hero carousel slides, sequence order, and promotional CTAs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleOpenAdd} className="text-white gap-2">
            <Plus className="w-4 h-4" /> Add Hero Slide
          </Button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total Hero Slides</p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">{totalBanners}</h3>
            </div>
            <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
              <Layers className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Active Live</p>
              <h3 className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">{activeCount}</h3>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Scheduled</p>
              <h3 className="text-2xl font-bold mt-1 text-amber-600 dark:text-amber-400">{scheduledCount}</h3>
            </div>
            <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Inactive</p>
              <h3 className="text-2xl font-bold mt-1 text-slate-600 dark:text-slate-400">{inactiveCount}</h3>
            </div>
            <div className="p-3 bg-slate-500/10 text-slate-500 rounded-xl">
              <Image className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="bg-card border-border">
        <CardContent className="p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search hero slide title, subtitle or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-background"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 text-sm rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Mobile Card View */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:hidden gap-4">
        {filteredBanners.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground bg-card border border-border rounded-lg p-6">
            No hero slides found matching your search.
          </div>
        ) : (
          filteredBanners.map((banner) => (
            <Card key={banner.id} className="overflow-hidden border-border bg-card flex flex-col justify-between">
              <div>
                {/* Image Header */}
                <div className="relative h-44 w-full bg-slate-900 overflow-hidden group">
                  <img
                    src={banner.imageUrl}
                    alt={banner.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2 flex items-center gap-1.5">
                    {getStatusBadge(banner.status)}
                  </div>
                  <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-black/60 backdrop-blur-sm text-[11px] text-white font-medium">
                    Slide Position: #{banner.order}
                  </div>
                </div>

                {/* Body */}
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-mono text-amber-500">{banner.id}</span>
                    {banner.startDate && (
                      <span className="flex items-center gap-1 text-[11px]">
                        <Calendar className="w-3 h-3" /> {banner.startDate} to {banner.endDate || 'Ongoing'}
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-foreground text-base line-clamp-1">{banner.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">{banner.subtitle}</p>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-3 bg-muted/40 border-t border-border flex items-center justify-end gap-2">
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs text-indigo-400 border-border hover:bg-indigo-500/10 cursor-pointer"
                    onClick={() => setPreviewBanner(banner)}
                  >
                    <Eye className="h-3.5 w-3.5" /> Preview
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 text-amber-400 border-border hover:bg-amber-500/10 cursor-pointer"
                    onClick={() => handleOpenEdit(banner)}
                    title="Edit"
                  >
                    <SquarePen className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 text-rose-500 border-border hover:bg-rose-500/10 cursor-pointer"
                    onClick={() => setDeletingBanner(banner)}
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <Card className="hidden xl:block bg-card border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-muted-foreground text-xs uppercase tracking-wider">
                <th className="py-3.5 px-4 font-semibold w-16 text-center">Slide #</th>
                <th className="py-3.5 px-4 font-semibold w-32">Slide Image</th>
                <th className="py-3.5 px-4 font-semibold">Title & Subtitle</th>
                <th className="py-3.5 px-4 font-semibold">Button CTA</th>
                <th className="py-3.5 px-4 font-semibold">Schedule</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredBanners.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-muted-foreground">
                    No hero slides found.
                  </td>
                </tr>
              ) : (
                filteredBanners.map((banner) => (
                  <tr key={banner.id} className="hover:bg-muted/30 transition-colors">
                    {/* Sequence Controls */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="font-bold text-xs text-foreground bg-muted px-1.5 py-0.5 rounded">
                          #{banner.order}
                        </span>
                      </div>
                    </td>

                    {/* Image Thumbnail */}
                    <td className="py-3 px-4">
                      <div
                        className="relative w-24 h-14 rounded-md overflow-hidden bg-slate-900 border border-border group cursor-pointer"
                        onClick={() => setPreviewBanner(banner)}
                      >
                        <img
                          src={banner.imageUrl}
                          alt={banner.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Eye className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    </td>

                    {/* Title & Details */}
                    <td className="py-3 px-4 max-w-sm">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[11px] font-mono font-medium text-amber-500">{banner.id}</span>
                      </div>
                      <h4 className="font-semibold text-foreground text-sm line-clamp-1">{banner.title}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-1">{banner.subtitle}</p>
                    </td>

                    {/* CTA */}
                    <td className="py-3 px-4">
                      <div className="text-xs font-medium text-foreground">{banner.buttonText}</div>
                      <div className="text-[11px] text-muted-foreground flex items-center gap-0.5 font-mono truncate max-w-[140px]">
                        <ExternalLink className="w-2.5 h-2.5 shrink-0" /> {banner.buttonLink}
                      </div>
                    </td>

                    {/* Schedule */}
                    <td className="py-3 px-4 text-xs text-muted-foreground">
                      {banner.startDate ? (
                        <div>
                          <div>{banner.startDate}</div>
                          <div className="text-[11px] text-muted-foreground/70">to {banner.endDate || 'Forever'}</div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground/60 italic">Always Active</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleStatus(banner.id)}
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                        title="Click to toggle status"
                      >
                        {getStatusBadge(banner.status)}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setPreviewBanner(banner)}
                          title="View"
                          className="h-8 w-8 text-indigo-400 border-border hover:bg-indigo-500/10 cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleOpenEdit(banner)}
                          title="Edit"
                          className="h-8 w-8 text-amber-400 border-border hover:bg-amber-500/10 cursor-pointer"
                        >
                          <SquarePen className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setDeletingBanner(banner)}
                          title="Delete"
                          className="h-8 w-8 text-rose-500 border-border hover:bg-rose-500/10 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add / Edit Hero Slide Dialog */}
      <Dialog open={isAddEditOpen} onOpenChange={setIsAddEditOpen}>
        <DialogContent className="sm:max-w-2xl bg-card border-border max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
              <Sliders className="w-5 h-5 text-amber-500" />
              {editingBanner ? 'Edit Hero Slide' : 'Create New Hero Slide'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveBanner} className="space-y-4 py-2">
            {/* Title & Subtitle */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-muted-foreground">Hero Slide Title *</label>
              <Input
                placeholder="e.g. Spring Organic Collection 2026"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-muted-foreground">Subtitle / Tagline</label>
              <Input
                placeholder="e.g. Ultra-soft 100% GOTS certified organic cotton for newborns & toddlers..."
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              />
            </div>

            {/* Image URLs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-muted-foreground">Desktop Image URL *</label>
                <Input
                  placeholder="https://images.unsplash.com/..."
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-muted-foreground">Mobile Image URL (Optional)</label>
                <Input
                  placeholder="https://images.unsplash.com/... (optional mobile crop)"
                  value={formData.mobileImageUrl}
                  onChange={(e) => setFormData({ ...formData, mobileImageUrl: e.target.value })}
                />
              </div>
            </div>

            {/* Image Live Thumbnail Preview */}
            {formData.imageUrl && (
              <div className="relative h-36 w-full rounded-lg overflow-hidden border border-border bg-slate-900">
                <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent p-4 flex flex-col justify-end">
                  <Badge className="w-fit mb-1 bg-amber-500 text-white">Hero Slide Preview</Badge>
                  <h4 className="text-white text-base font-bold">{formData.title || 'Slide Title'}</h4>
                  <p className="text-white/80 text-xs">{formData.subtitle || 'Slide subtitle...'}</p>
                </div>
              </div>
            )}

            {/* CTA Button Text & Link */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-muted-foreground">Button Label</label>
                <Input
                  placeholder="Shop New Arrivals"
                  value={formData.buttonText}
                  onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-muted-foreground">Button Link Target</label>
                <Input
                  placeholder="/categories/organic-cotton"
                  value={formData.buttonLink}
                  onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                />
              </div>
            </div>

            {/* Status & Sequence */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-muted-foreground">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as BannerStatus })}
                  className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background text-foreground"
                >
                  <option value="Active">Active</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-muted-foreground">Slide Sequence Order</label>
                <Input
                  type="number"
                  min="1"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
                />
              </div>
            </div>

            {/* Schedule Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-muted-foreground">Start Date (Optional)</label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-muted-foreground">End Date (Optional)</label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter className="pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={() => setIsAddEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-amber-500 hover:bg-amber-600 text-white">
                {editingBanner ? 'Save Changes' : 'Create Slide'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Preview Live Hero Slide Modal */}
      {previewBanner && (
        <Dialog open={!!previewBanner} onOpenChange={() => setPreviewBanner(null)}>
          <DialogContent className="sm:max-w-3xl bg-slate-950 text-white border-slate-800 p-0 overflow-hidden">
            <div className="relative h-80 sm:h-96 w-full flex items-center justify-center overflow-hidden">
              <img
                src={previewBanner.imageUrl}
                alt={previewBanner.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent p-6 sm:p-10 flex flex-col justify-center max-w-xl">
                <Badge className="w-fit mb-3 bg-amber-500 text-white hover:bg-amber-600">
                  Hero Slide #{previewBanner.order}
                </Badge>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight mb-2">
                  {previewBanner.title}
                </h2>
                <p className="text-sm sm:text-base text-gray-200 mb-6 line-clamp-2">
                  {previewBanner.subtitle}
                </p>
                <div>
                  <Button className="bg-white text-black hover:bg-gray-100 font-bold px-6 py-2.5 rounded-full shadow-lg">
                    {previewBanner.buttonText} →
                  </Button>
                </div>
              </div>
            </div>
            <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-gray-400">
              <div className="flex items-center gap-3">
                <span>Slide ID: <strong className="text-white font-mono">{previewBanner.id}</strong></span>
                <span>Status: <strong className="text-amber-400">{previewBanner.status}</strong></span>
              </div>
              <Button size="sm" variant="ghost" className="text-white hover:bg-slate-800" onClick={() => setPreviewBanner(null)}>
                Close Preview
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Alert */}
      <AlertDialog open={!!deletingBanner} onOpenChange={() => setDeletingBanner(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Delete Hero Slide?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-semibold text-foreground">"{deletingBanner?.title}"</span>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-rose-600 hover:bg-rose-700 text-white">
              Delete Slide
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
