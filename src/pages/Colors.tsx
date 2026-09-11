import { useState, useMemo, useEffect } from 'react'
import {
  Palette,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Sparkles,
  Layers,
  LayoutGrid,
  List as ListIcon,
  RefreshCw,
  Hash,
} from 'lucide-react'
import Wheel from '@uiw/react-color-wheel'
import Sketch from '@uiw/react-color-sketch'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
  type ProductColor,
  getStoredColors,
  saveStoredColors,
} from '@/data/mockColors'

// Preset popular kids clothing colors
const PRESET_SWATCHES = [
  '#FF3B30', '#FF9500', '#FFCC00', '#34C759', '#007AFF', '#5856D6',
  '#AF52DE', '#FF2D55', '#38BDF8', '#F472B6', '#A7F3D0', '#FEF08A',
  '#1E293B', '#64748B', '#F8FAFC', '#78350F'
]

export default function Colors() {
  const [colors, setColors] = useState<ProductColor[]>([])

  useEffect(() => {
    setColors(getStoredColors())
  }, [])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table')

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingColor, setEditingColor] = useState<ProductColor | null>(null)
  const [deletingColor, setDeletingColor] = useState<ProductColor | null>(null)

  // Form State
  const [formName, setFormName] = useState('')
  const [formHex, setFormHex] = useState('#38BDF8')
  const [formStatus, setFormStatus] = useState<'Active' | 'Inactive'>('Active')
  const [formError, setFormError] = useState<string | null>(null)

  // UI state
  const [copiedHex, setCopiedHex] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [pickerMode, setPickerMode] = useState<'wheel' | 'sketch'>('wheel')

  const showNotification = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Filter & Search Logic
  const filteredColors = useMemo(() => {
    return colors.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.hexCode.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'All' || c.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [colors, searchQuery, statusFilter])

  // Pagination Logic
  const totalPages = Math.ceil(filteredColors.length / itemsPerPage) || 1
  const paginatedColors = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredColors.slice(start, start + itemsPerPage)
  }, [filteredColors, currentPage])

  // Hex Validation helper
  const isValidHex = (hex: string): boolean => {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/i.test(hex)
  }

  // Handle Hex Input change with auto # prefix
  const handleHexInputChange = (val: string) => {
    let formatted = val.trim()
    if (formatted && !formatted.startsWith('#')) {
      formatted = '#' + formatted
    }
    setFormHex(formatted)

    if (isValidHex(formatted)) {
      setFormError(null)
    }
  }

  // Open Modal for Add
  const handleOpenAddModal = () => {
    setEditingColor(null)
    setFormName('')
    setFormHex('#38BDF8')
    setFormStatus('Active')
    setFormError(null)
    setIsModalOpen(true)
  }

  // Open Modal for Edit
  const handleOpenEditModal = (color: ProductColor) => {
    setEditingColor(color)
    setFormName(color.name)
    setFormHex(color.hexCode)
    setFormStatus(color.status)
    setFormError(null)
    setIsModalOpen(true)
  }

  // Save / Update Color
  const handleSaveColor = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formName.trim()) {
      setFormError('Please enter a color name.')
      return
    }

    if (!isValidHex(formHex)) {
      setFormError('Please enter a valid HEX code (e.g. #FF5733 or #FFF).')
      return
    }

    // Check duplicate hex code (excluding current editing color)
    const duplicate = colors.find(
      (c) => c.hexCode.toUpperCase() === formHex.toUpperCase() && c.id !== editingColor?.id
    )
    if (duplicate) {
      setFormError(`Color with HEX code ${formHex.toUpperCase()} already exists (${duplicate.name}).`)
      return
    }

    const cleanHex = formHex.toUpperCase()

    if (editingColor) {
      // Update
      const updated = colors.map((c) =>
        c.id === editingColor.id
          ? { ...c, name: formName.trim(), hexCode: cleanHex, status: formStatus }
          : c
      )
      setColors(updated)
      saveStoredColors(updated)
      showNotification(`Color "${formName.trim()}" updated successfully!`)
    } else {
      // Create
      const newColorItem: ProductColor = {
        id: `col-${Date.now()}`,
        name: formName.trim(),
        hexCode: cleanHex,
        status: formStatus,
        createdAt: new Date().toISOString().split('T')[0],
      }
      const updated = [newColorItem, ...colors]
      setColors(updated)
      saveStoredColors(updated)
      showNotification(`Color "${formName.trim()}" added successfully!`)
    }

    setIsModalOpen(false)
  }

  // Delete Color
  const handleConfirmDelete = () => {
    if (deletingColor) {
      const updated = colors.filter((c) => c.id !== deletingColor.id)
      setColors(updated)
      saveStoredColors(updated)
      showNotification(`Color "${deletingColor.name}" deleted successfully.`)
      setDeletingColor(null)
    }
  }

  // Copy HEX to clipboard
  const handleCopyHex = (hex: string) => {
    navigator.clipboard.writeText(hex)
    setCopiedHex(hex)
    showNotification(`HEX code ${hex} copied to clipboard!`)
    setTimeout(() => setCopiedHex(null), 2000)
  }

  // Calculate Contrast Color for badge/text
  const getContrastTextColor = (hex: string) => {
    if (!isValidHex(hex)) return '#ffffff'
    const c = hex.replace('#', '')
    const fullHex = c.length === 3 ? c.split('').map((x) => x + x).join('') : c
    const r = parseInt(fullHex.substring(0, 2), 16)
    const g = parseInt(fullHex.substring(2, 4), 16)
    const b = parseInt(fullHex.substring(4, 6), 16)
    const yiq = (r * 299 + g * 587 + b * 114) / 1000
    return yiq >= 128 ? '#0f172a' : '#ffffff'
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification Banner */}
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
              <Palette className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Colors</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Manage product colors and HEX swatches available for your kids clothing products.
          </p>
        </div>

        <Button
          onClick={handleOpenAddModal}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-2xl px-5 py-2.5 shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center gap-2 shrink-0 text-xs"
        >
          <Plus className="h-4 w-4" /> Add Color
        </Button>
      </div>

      {/* Stats Quick Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="rounded-2xl border border-border shadow-xs bg-card/60">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Colors</p>
              <h3 className="text-2xl font-extrabold text-foreground mt-0.5">{colors.length}</h3>
            </div>
            <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-600">
              <Layers className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border shadow-xs bg-card/60">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Active Swatches</p>
              <h3 className="text-2xl font-extrabold text-emerald-600 mt-0.5">
                {colors.filter((c) => c.status === 'Active').length}
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
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Palette Preview</p>
              <div className="flex items-center -space-x-1.5 mt-1.5 overflow-hidden">
                {colors.slice(0, 6).map((c) => (
                  <div
                    key={c.id}
                    className="h-6 w-6 rounded-full border-2 border-background shadow-xs shrink-0"
                    style={{ backgroundColor: c.hexCode }}
                    title={`${c.name} (${c.hexCode})`}
                  />
                ))}
                {colors.length > 6 && (
                  <span className="h-6 w-6 rounded-full bg-slate-100 border-2 border-background flex items-center justify-center text-[9px] font-bold text-slate-600 shrink-0">
                    +{colors.length - 6}
                  </span>
                )}
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-pink-500/10 text-pink-600">
              <Sparkles className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main List Container */}
      <Card className="rounded-3xl border border-border shadow-xs overflow-hidden bg-card">
        {/* Controls Bar */}
        <div className="p-4 sm:p-6 border-b border-border space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search color name or #HEX code..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-10 h-10 text-xs rounded-xl border-border bg-background shadow-2xs font-semibold"
              />
            </div>

            {/* Filters and View Switcher */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Status Filter */}
              <div className="flex items-center gap-1 bg-muted p-1 rounded-xl">
                {(['All', 'Active', 'Inactive'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      setStatusFilter(st)
                      setCurrentPage(1)
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      statusFilter === st
                        ? 'bg-background text-foreground shadow-2xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-muted p-1 rounded-xl">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    viewMode === 'table' ? 'bg-background text-foreground shadow-2xs' : 'text-muted-foreground'
                  }`}
                  title="Table View"
                >
                  <ListIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    viewMode === 'grid' ? 'bg-background text-foreground shadow-2xs' : 'text-muted-foreground'
                  }`}
                  title="Grid View"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <CardContent className="p-0">
          {paginatedColors.length === 0 ? (
            /* Empty State */
            <div className="py-16 text-center space-y-3">
              <div className="p-4 rounded-full bg-muted inline-block text-muted-foreground">
                <Palette className="h-8 w-8" />
              </div>
              <h3 className="text-sm font-bold text-foreground">No colors found</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                No color matched your search "{searchQuery}". Try searching for another color name or add a new color.
              </p>
              <Button
                onClick={handleOpenAddModal}
                size="sm"
                className="bg-black text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Color
              </Button>
            </div>
          ) : viewMode === 'table' ? (
            /* Table View */
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border text-[11px] font-bold uppercase tracking-wider">
                    <th className="py-3.5 px-6">Color Swatch</th>
                    <th className="py-3.5 px-6">Color Name</th>
                    <th className="py-3.5 px-6">HEX Code</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6">Created Date</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-xs">
                  {paginatedColors.map((color) => {
                    const isCopied = copiedHex === color.hexCode
                    return (
                      <tr key={color.id} className="hover:bg-muted/30 transition-colors group">
                        {/* Swatch */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div
                              className="h-10 w-10 rounded-full border-2 border-white shadow-md ring-1 ring-border shrink-0 flex items-center justify-center transition-transform group-hover:scale-110"
                              style={{ backgroundColor: color.hexCode }}
                            />
                          </div>
                        </td>

                        {/* Name */}
                        <td className="py-4 px-6 font-bold text-foreground text-sm">
                          {color.name}
                        </td>

                        {/* HEX Code */}
                        <td className="py-4 px-6 font-mono font-semibold">
                          <div className="inline-flex items-center gap-1.5 bg-muted text-foreground px-2.5 py-1 rounded-lg border border-border">
                            <Hash className="h-3 w-3 text-muted-foreground" />
                            <span>{color.hexCode}</span>
                            <button
                              onClick={() => handleCopyHex(color.hexCode)}
                              className="ml-1 text-muted-foreground hover:text-foreground cursor-pointer"
                              title="Copy HEX Code"
                            >
                              {isCopied ? (
                                <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                              color.status === 'Active'
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                : 'bg-muted text-muted-foreground border-border'
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                color.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'
                              }`}
                            />
                            {color.status}
                          </span>
                        </td>

                        {/* Created Date */}
                        <td className="py-4 px-6 text-muted-foreground font-medium">
                          {color.createdAt}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenEditModal(color)}
                              className="h-8 w-8 p-0 rounded-xl hover:bg-muted hover:text-foreground border-border cursor-pointer"
                              title="Edit Color"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDeletingColor(color)}
                              className="h-8 w-8 p-0 rounded-xl border-border text-destructive hover:bg-destructive/10 cursor-pointer"
                              title="Delete Color"
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
          ) : (
            /* Grid View Cards */
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {paginatedColors.map((color) => {
                const isCopied = copiedHex === color.hexCode
                const contrastText = getContrastTextColor(color.hexCode)
                return (
                  <div
                    key={color.id}
                    className="p-4 rounded-2xl border border-border bg-card hover:border-slate-300 transition-all shadow-2xs space-y-3 group"
                  >
                    {/* Header color box preview */}
                    <div
                      className="h-24 rounded-xl shadow-inner relative flex flex-col justify-between p-3 transition-transform group-hover:scale-[1.02]"
                      style={{ backgroundColor: color.hexCode }}
                    >
                      <span
                        className="self-end text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full shadow-xs backdrop-blur-xs"
                        style={{
                          backgroundColor: color.status === 'Active' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(15, 23, 42, 0.3)',
                          color: contrastText,
                          border: `1px solid ${contrastText}30`,
                        }}
                      >
                        {color.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-foreground text-sm">{color.name}</h4>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="font-mono text-xs font-semibold text-muted-foreground">{color.hexCode}</span>
                          <button
                            onClick={() => handleCopyHex(color.hexCode)}
                            className="cursor-pointer text-muted-foreground hover:text-foreground"
                            title="Copy HEX"
                          >
                            {isCopied ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEditModal(color)}
                          className="h-8 w-8 p-0 rounded-xl border-border cursor-pointer hover:bg-muted hover:text-foreground"
                          title="Edit Color"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeletingColor(color)}
                          className="h-8 w-8 p-0 rounded-xl border-border text-destructive hover:bg-destructive/10 cursor-pointer"
                          title="Delete Color"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Pagination Footer */}
          {filteredColors.length > 0 && (
            <div className="p-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredColors.length)} to{' '}
                {Math.min(currentPage * itemsPerPage, filteredColors.length)} of {filteredColors.length} colors
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  className="h-8 text-xs rounded-lg px-3 cursor-pointer"
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
                  className="h-8 text-xs rounded-lg px-3 cursor-pointer"
                >
                  Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add / Edit Color Non-Scrolling Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-xl rounded-3xl p-6 overflow-hidden">
          <form onSubmit={handleSaveColor}>
            <DialogHeader className="pb-2">
              <DialogTitle className="flex items-center gap-2 text-base font-bold">
                <Palette className="h-5 w-5 text-primary" />
                {editingColor ? 'Edit Product Color' : 'Add New Product Color'}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Pick a color visually with the color picker or type a HEX code manually.
              </DialogDescription>
            </DialogHeader>

            {/* Error Banner */}
            {formError && (
              <div className="flex items-center gap-2 p-2.5 mb-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs font-semibold">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="space-y-4 py-2">
              {/* Top inputs: Color Name + Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Color Name */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    Color Name <span className="text-destructive">*</span>
                  </label>
                  <Input
                    placeholder="e.g. Coral Pink, Sky Blue"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="h-9 text-xs font-semibold placeholder:text-muted-foreground/40"
                    required
                  />
                </div>

                {/* Status */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    Status <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full h-9 px-3 rounded-xl border border-input bg-background text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-ring"
                    required
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Color Picker & Realtime Preview Split View */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-muted/40 p-4 rounded-2xl border border-border">
                {/* Visual Color Picker */}
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="flex items-center justify-between w-full pb-1">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Color Picker</span>
                    <button
                      type="button"
                      onClick={() => setPickerMode(pickerMode === 'wheel' ? 'sketch' : 'wheel')}
                      className="text-[10px] text-primary font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="h-3 w-3" /> Toggle Picker Mode
                    </button>
                  </div>

                  {pickerMode === 'wheel' ? (
                    <Wheel
                      color={isValidHex(formHex) ? formHex : '#38BDF8'}
                      onChange={(color) => {
                        setFormHex(color.hex.toUpperCase())
                        setFormError(null)
                      }}
                      width={150}
                      height={150}
                    />
                  ) : (
                    <Sketch
                      color={isValidHex(formHex) ? formHex : '#38BDF8'}
                      onChange={(color) => {
                        setFormHex(color.hex.toUpperCase())
                        setFormError(null)
                      }}
                      disableAlpha
                      style={{ boxShadow: 'none', borderRadius: '12px', border: '1px solid #e2e8f0', width: '100%' }}
                    />
                  )}
                </div>

                {/* Manual HEX Input & Swatch Preview */}
                <div className="flex flex-col justify-between space-y-3">
                  {/* HEX Input */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <Hash className="h-3 w-3" /> HEX Code <span className="text-destructive">*</span>
                    </label>
                    <Input
                      placeholder="#FF5733"
                      value={formHex}
                      onChange={(e) => handleHexInputChange(e.target.value)}
                      className="h-9 text-xs font-mono font-bold uppercase placeholder:text-muted-foreground/40"
                      maxLength={7}
                      required
                    />
                  </div>

                  {/* Realtime Color Preview Box */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                      Live Color Preview
                    </span>
                    <div
                      className="h-20 rounded-xl shadow-md border-2 border-background ring-1 ring-border flex flex-col justify-between p-2.5 transition-all"
                      style={{ backgroundColor: isValidHex(formHex) ? formHex : '#e2e8f0' }}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className="text-[10px] font-extrabold px-2 py-0.5 rounded-full"
                          style={{
                            color: getContrastTextColor(isValidHex(formHex) ? formHex : '#ffffff'),
                            backgroundColor: 'rgba(0,0,0,0.15)',
                          }}
                        >
                          {formName || 'Color Swatch'}
                        </span>
                        <span
                          className="text-[10px] font-mono font-bold"
                          style={{ color: getContrastTextColor(isValidHex(formHex) ? formHex : '#ffffff') }}
                        >
                          {formHex}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preset Palette Suggestions */}
              <div className="space-y-1.5 pt-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Quick Select Presets
                </label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_SWATCHES.map((hex) => (
                    <button
                      type="button"
                      key={hex}
                      onClick={() => handleHexInputChange(hex)}
                      className="h-6 w-6 rounded-full border border-border shadow-xs transition-all hover:scale-110 cursor-pointer"
                      style={{ backgroundColor: hex }}
                      title={hex}
                    />
                  ))}
                </div>
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
                {editingColor ? 'Update Color' : 'Save Color'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={Boolean(deletingColor)} onOpenChange={(open) => !open && setDeletingColor(null)}>
        <AlertDialogContent className="rounded-3xl max-w-md p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive font-bold">
              <AlertTriangle className="h-5 w-5" /> Delete Color Confirmation
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground space-y-3 pt-2">
              <span>Are you sure you want to delete this color? This action cannot be undone.</span>

              {deletingColor && (
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted border border-border mt-2">
                  <div
                    className="h-10 w-10 rounded-full border-2 border-background shadow-sm ring-1 ring-border shrink-0"
                    style={{ backgroundColor: deletingColor.hexCode }}
                  />
                  <div>
                    <p className="font-bold text-foreground text-sm">{deletingColor.name}</p>
                    <p className="font-mono text-xs text-muted-foreground">{deletingColor.hexCode}</p>
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 mt-4">
            <AlertDialogCancel className="rounded-full text-xs cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold text-xs rounded-full cursor-pointer"
            >
              Delete Color
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
