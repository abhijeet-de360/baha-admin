import { useState, useMemo, useEffect } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import {
  Users,
  DollarSign,
  Search,
  Eye,
  SquarePen,
  Trash2,
  Download,
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  Sparkles,
  ShieldAlert,
  ArrowUpDown,
  UserPlus
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
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
  type Customer,
  getStoredCustomers,
  saveStoredCustomers,
} from '@/data/mockCustomers'
import { getStoredOrders } from '@/data/mockOrders'

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>(getStoredCustomers)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'highest_spent' | 'most_orders' | 'newest' | 'oldest' | 'name_asc'>('highest_spent')

  // Infinite Scroll State
  const [visibleCount, setVisibleCount] = useState(10)

  // Reset batch count when filter/search changes
  useEffect(() => {
    setVisibleCount(10)
  }, [searchQuery, sortBy])

  // Feedback Notification State
  const [notification, setNotification] = useState<string | null>(null)

  const showToast = (message: string) => {
    setNotification(message)
    setTimeout(() => {
      setNotification(null)
    }, 3500)
  }

  // Modals state
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null)

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    avatar: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
  })

  // Handle Save Customer (Create or Edit)
  const handleOpenFormModal = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer)
      setFormData({
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        avatar: customer.avatar || '',
        street: customer.address.street,
        city: customer.address.city,
        state: customer.address.state,
        zipCode: customer.address.zipCode,
        country: customer.address.country,
      })
    } else {
      setEditingCustomer(null)
      setFormData({
        name: '',
        email: '',
        phone: '',
        avatar: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'United States',
      })
    }
    setIsFormModalOpen(true)
  }

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim() || !formData.email.trim()) {
      showToast('Name and Email are required.')
      return
    }

    if (editingCustomer) {
      // Update existing
      const updatedList = customers.map((c) =>
        c.id === editingCustomer.id
          ? {
              ...c,
              name: formData.name.trim(),
              email: formData.email.trim(),
              phone: formData.phone.trim(),
              avatar: formData.avatar.trim() || undefined,
              address: {
                street: formData.street.trim(),
                city: formData.city.trim(),
                state: formData.state.trim(),
                zipCode: formData.zipCode.trim(),
                country: formData.country.trim(),
              },
            }
          : c
      )
      setCustomers(updatedList)
      saveStoredCustomers(updatedList)
      showToast(`Updated customer "${formData.name}" successfully.`)
    } else {
      // Create new customer
      const newCustomer: Customer = {
        id: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        avatar: formData.avatar.trim() || undefined,
        status: 'Active',
        group: 'Regular',
        totalOrders: 0,
        totalSpent: 0,
        lastOrderDate: new Date().toISOString(),
        address: {
          street: formData.street.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          zipCode: formData.zipCode.trim(),
          country: formData.country.trim(),
        },
        createdAt: new Date().toISOString(),
      }
      const updatedList = [newCustomer, ...customers]
      setCustomers(updatedList)
      saveStoredCustomers(updatedList)
      showToast(`Added new customer "${newCustomer.name}" successfully.`)
    }

    setIsFormModalOpen(false)
  }

  // Handle Delete Customer
  const handleDeleteConfirm = () => {
    if (!deleteTarget) return
    const updatedList = customers.filter((c) => c.id !== deleteTarget.id)
    setCustomers(updatedList)
    saveStoredCustomers(updatedList)
    showToast(`Customer "${deleteTarget.name}" deleted.`)
    setDeleteTarget(null)
  }

  // Handle Open Detail Modal
  const handleOpenDetailModal = (customer: Customer) => {
    setSelectedCustomer(customer)
    setIsDetailModalOpen(true)
  }

  // Calculated Stats
  const stats = useMemo(() => {
    const total = customers.length
    const totalOrdersSum = customers.reduce((sum, c) => sum + c.totalOrders, 0)
    const totalSpentSum = customers.reduce((sum, c) => sum + c.totalSpent, 0)
    const avgSpent = total > 0 ? totalSpentSum / total : 0

    return { total, totalOrdersSum, totalSpentSum, avgSpent }
  }, [customers])

  // Filter & Search Logic
  const filteredCustomers = useMemo(() => {
    return customers
      .filter((customer) => {
        return (
          customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          customer.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
          customer.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          customer.address.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
          customer.address.state.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })
      .sort((a, b) => {
        if (sortBy === 'highest_spent') return b.totalSpent - a.totalSpent
        if (sortBy === 'most_orders') return b.totalOrders - a.totalOrders
        if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        if (sortBy === 'name_asc') return a.name.localeCompare(b.name)
        return 0
      })
  }, [customers, searchQuery, sortBy])

  // Displayed items slice for InfiniteScroll
  const displayedCustomers = useMemo(() => {
    return filteredCustomers.slice(0, visibleCount)
  }, [filteredCustomers, visibleCount])

  const fetchMoreCustomers = () => {
    if (visibleCount < filteredCustomers.length) {
      setVisibleCount((prev) => prev + 10)
    }
  }

  // Related Orders for Selected Customer
  const customerOrders = useMemo(() => {
    if (!selectedCustomer) return []
    const allOrders = getStoredOrders()
    return allOrders.filter(
      (ord) =>
        ord.customer.email.toLowerCase() === selectedCustomer.email.toLowerCase() ||
        ord.customer.name.toLowerCase() === selectedCustomer.name.toLowerCase()
    )
  }, [selectedCustomer])

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Total Orders', 'Total Spent ($)', 'City', 'State', 'Joined Date']
    const csvRows = [
      headers.join(','),
      ...filteredCustomers.map((c) =>
        [
          `"${c.id}"`,
          `"${c.name}"`,
          `"${c.email}"`,
          `"${c.phone}"`,
          c.totalOrders,
          c.totalSpent.toFixed(2),
          `"${c.address.city}"`,
          `"${c.address.state}"`,
          `"${new Date(c.createdAt).toLocaleDateString()}"`,
        ].join(',')
      ),
    ]

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `baha_customers_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showToast('Exported customer list as CSV.')
  }

  // Avatar Initials Helper
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="space-y-4 max-w-full mx-auto">
      {/* Toast Notification Banner */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 bg-primary text-primary-foreground px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-in slide-in-from-top-5 duration-300">
          <Sparkles className="h-4 w-4 text-amber-300 animate-pulse" />
          <span className="text-sm font-medium">{notification}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Users className="h-7 w-7 text-indigo-500" />
            Customers Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage customer accounts, track purchase metrics, and review customer order history.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleExportCSV}
            className="gap-2 text-sm font-medium border-border hover:bg-accent cursor-pointer"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>

          <Button
            onClick={() => handleOpenFormModal()}
            className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md cursor-pointer"
          >
            <UserPlus className="h-4 w-4" /> 
            Add Customer
          </Button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-card/80 border-border/60 shadow-sm backdrop-blur-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Customers</p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">{stats.total}</h3>
              <p className="text-xs text-emerald-500 font-medium mt-1 flex items-center gap-1">
                +12.5% <span className="text-muted-foreground font-normal">from last month</span>
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
              <Users className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/80 border-border/60 shadow-sm backdrop-blur-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Orders Placed</p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">{stats.totalOrdersSum}</h3>
              <p className="text-xs text-muted-foreground mt-1">Across all customer accounts</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <ShoppingBag className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/80 border-border/60 shadow-sm backdrop-blur-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Customer Revenue</p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">${stats.totalSpentSum.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Avg. ${stats.avgSpent.toFixed(2)} / customer
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center shrink-0">
              <DollarSign className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter & Search Toolbar */}
      <Card className="bg-card border-border shadow-xs">
        <CardContent className="p-4 md:p-5 space-y-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers by name, email, phone, city, or ID..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                }}
                className="pl-9 bg-background border-border"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Dropdown Filters */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Sort By Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                  <ArrowUpDown className="h-3.5 w-3.5" /> Sort:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="h-9 rounded-md border border-border bg-background px-3 py-1 text-sm font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                >
                  <option value="highest_spent">Highest Total Spent</option>
                  <option value="most_orders">Most Orders Placed</option>
                  <option value="newest">Recently Joined</option>
                  <option value="oldest">Earliest Joined</option>
                  <option value="name_asc">Name (A - Z)</option>
                </select>
              </div>

              {/* Reset Filters button if active */}
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('')
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground h-9"
                >
                  Reset
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customers List Container */}
      <Card className="bg-card border-border shadow-xs overflow-hidden">
        {displayedCustomers.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <div className="flex flex-col items-center justify-center gap-2">
              <Users className="h-10 w-10 text-muted-foreground/40" />
              <p className="font-medium text-base text-foreground">No customers found</p>
              <p className="text-xs max-w-sm text-muted-foreground">
                Try adjusting your search query to find the customer you are looking for.
              </p>
            </div>
          </div>
        ) : (
          <InfiniteScroll
            dataLength={displayedCustomers.length}
            next={fetchMoreCustomers}
            hasMore={visibleCount < filteredCustomers.length}
            loader={
              <div className="py-4 text-center text-xs text-muted-foreground font-medium">
                Loading more customers...
              </div>
            }
            endMessage={
              <div className="py-4 text-center text-xs text-muted-foreground font-medium">
                Showing all {filteredCustomers.length} customers
              </div>
            }
          >
            {/* Mobile & Tablet Card View (screens smaller than lg) */}
            <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
              {displayedCustomers.map((customer) => (
                <Card
                  key={customer.id}
                  className="rounded-2xl border border-border/70 bg-card/60 shadow-xs hover:border-indigo-500/40 transition-all p-4 space-y-3"
                >
                  {/* Customer Header: Avatar & Name */}
                  <div className="flex items-center gap-3 border-b border-border/50 pb-3">
                    <Avatar className="h-11 w-11 border border-border shadow-xs shrink-0">
                      {customer.avatar && <AvatarImage src={customer.avatar} alt={customer.name} />}
                      <AvatarFallback className="bg-indigo-500/10 text-indigo-500 font-bold">
                        {getInitials(customer.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <h4 className="font-bold text-foreground text-sm truncate">{customer.name}</h4>
                      <p className="text-[11px] text-muted-foreground font-mono">{customer.id}</p>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2 text-foreground">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="truncate">{customer.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-3.5 w-3.5 shrink-0" />
                      <span>{customer.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground pt-0.5">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <span className="truncate">{customer.address.city}, {customer.address.state}</span>
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="flex items-center justify-between bg-muted/30 p-2.5 rounded-xl border border-border/40 text-xs">
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Orders</span>
                      <div className="inline-flex items-center gap-1 font-bold text-foreground mt-0.5">
                        <ShoppingBag className="h-3 w-3 text-indigo-400" />
                        {customer.totalOrders}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Total Spent</span>
                      <span className="font-extrabold text-foreground text-sm">
                        ${customer.totalSpent.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-border/40">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleOpenDetailModal(customer)}
                      className="h-8 w-8 text-indigo-400 border-border hover:bg-indigo-500/10 cursor-pointer"
                      title="View Customer Profile"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleOpenFormModal(customer)}
                      className="h-8 w-8 text-amber-400 border-border hover:bg-amber-500/10 cursor-pointer"
                      title="Edit"
                    >
                      <SquarePen className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setDeleteTarget(customer)}
                      className="h-8 w-8 text-rose-500 border-border hover:bg-rose-500/10 cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Desktop Table View (screens lg and larger) */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30 text-[11px] uppercase font-bold text-muted-foreground tracking-wider">
                    <th className="py-3 px-4">Customer Details</th>
                    <th className="py-3 px-4">Contact Info</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4 text-center">Orders</th>
                    <th className="py-3 px-4 text-right">Total Spent</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {displayedCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-muted/20 transition-colors">
                      {/* Customer Details */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border border-border shadow-xs shrink-0">
                            {customer.avatar && <AvatarImage src={customer.avatar} alt={customer.name} />}
                            <AvatarFallback className="bg-indigo-500/10 text-indigo-500 font-bold">
                              {getInitials(customer.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <h4 className="font-bold text-foreground text-sm truncate">{customer.name}</h4>
                            <p className="text-[11px] text-muted-foreground font-mono">{customer.id}</p>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="py-4 px-4 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-foreground">
                          <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span className="truncate max-w-[180px]">{customer.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Phone className="h-3.5 w-3.5 shrink-0" />
                          <span>{customer.phone}</span>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-4 px-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1 text-foreground font-medium">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span>{customer.address.city}, {customer.address.state}</span>
                        </div>
                        <span className="text-[11px] text-muted-foreground pl-5">{customer.address.country}</span>
                      </td>

                      {/* Orders Count */}
                      <td className="py-4 px-4 text-center font-semibold text-foreground">
                        <div className="inline-flex items-center gap-1 bg-muted/60 px-2.5 py-1 rounded-full text-xs">
                          <ShoppingBag className="h-3 w-3 text-indigo-400" />
                          {customer.totalOrders}
                        </div>
                      </td>

                      {/* Total Spent */}
                      <td className="py-4 px-4 text-right">
                        <span className="font-bold text-foreground text-sm">
                          ${customer.totalSpent.toFixed(2)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleOpenDetailModal(customer)}
                            title="View Customer Profile"
                            className="h-8 w-8 text-indigo-400 border-border hover:bg-indigo-500/10 cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleOpenFormModal(customer)}
                            title="Edit"
                            className="h-8 w-8 text-amber-400 border-border hover:bg-amber-500/10 cursor-pointer"
                          >
                            <SquarePen className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setDeleteTarget(customer)}
                            title="Delete"
                            className="h-8 w-8 text-rose-500 border-border hover:bg-rose-500/10 cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </InfiniteScroll>
        )}
      </Card>

      {/* Customer Detail Drawer / Modal */}
      {selectedCustomer && (
        <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border p-6">
            <DialogHeader className="border-b border-border pb-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-14 w-14 border-2 border-indigo-500/30 shadow-md">
                    {selectedCustomer.avatar && <AvatarImage src={selectedCustomer.avatar} alt={selectedCustomer.name} />}
                    <AvatarFallback className="bg-indigo-500/20 text-indigo-500 font-bold text-lg">
                      {getInitials(selectedCustomer.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                      {selectedCustomer.name}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground font-mono mt-0.5">
                      {selectedCustomer.id} &bull; Member since{' '}
                      {new Date(selectedCustomer.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </DialogDescription>
                  </div>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-6 pt-4">
              {/* Highlights Metric Strip */}
              <div className="grid grid-cols-2 gap-3 bg-muted/40 p-4 rounded-xl border border-border">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Total Spent</p>
                  <p className="text-lg font-bold text-indigo-400 mt-0.5">${selectedCustomer.totalSpent.toFixed(2)}</p>
                </div>
                <div className="text-center border-l border-border">
                  <p className="text-xs text-muted-foreground">Total Orders</p>
                  <p className="text-lg font-bold text-foreground mt-0.5">{selectedCustomer.totalOrders}</p>
                </div>
              </div>

              {/* Contact & Shipping Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-background border border-border space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-indigo-400" /> Contact Information
                  </h4>
                  <div className="space-y-1 text-sm pt-1">
                    <p className="text-foreground font-medium flex items-center gap-2">
                      <span className="text-xs text-muted-foreground font-normal">Email:</span> {selectedCustomer.email}
                    </p>
                    <p className="text-foreground font-medium flex items-center gap-2">
                      <span className="text-xs text-muted-foreground font-normal">Phone:</span> {selectedCustomer.phone}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-background border border-border space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-indigo-400" /> Primary Address
                  </h4>
                  <div className="text-sm pt-1 space-y-0.5 text-muted-foreground">
                    <p className="text-foreground font-medium">{selectedCustomer.address.street}</p>
                    <p>
                      {selectedCustomer.address.city}, {selectedCustomer.address.state} {selectedCustomer.address.zipCode}
                    </p>
                    <p>{selectedCustomer.address.country}</p>
                  </div>
                </div>
              </div>

              {/* Order History */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-indigo-400" /> Order History ({customerOrders.length})
                </h4>

                {customerOrders.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic bg-muted/20 p-4 rounded-lg text-center">
                    No matching orders logged in the store system for this customer email.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {customerOrders.map((ord) => (
                      <div
                        key={ord.id}
                        className="p-3 rounded-lg border border-border bg-background flex items-center justify-between text-xs hover:border-indigo-500/40 transition-colors"
                      >
                        <div>
                          <p className="font-bold text-foreground font-mono">{ord.orderNumber}</p>
                          <p className="text-muted-foreground mt-0.5">
                            {new Date(ord.createdAt).toLocaleDateString()} &bull; {ord.items.length} items &bull;{' '}
                            <span className="text-emerald-400 font-medium">{ord.orderStatus}</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-foreground text-sm">${ord.totalAmount.toFixed(2)}</p>
                          <span className="text-[10px] font-medium text-muted-foreground block mt-0.5">
                            {ord.paymentStatus}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="border-t border-border pt-4 mt-6">
              <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Add / Edit Customer Form Modal */}
      <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto bg-card border-border p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              {editingCustomer ? <SquarePen className="h-5 w-5 text-indigo-400" /> : <UserPlus className="h-5 w-5 text-indigo-400" />}
              {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {editingCustomer
                ? 'Update customer details and contact preferences.'
                : 'Fill out the form below to register a new customer in the admin store.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveCustomer} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Full Name *</label>
                <Input
                  required
                  placeholder="e.g. Sarah Jenkins"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Email Address *</label>
                <Input
                  required
                  type="email"
                  placeholder="e.g. sarah@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Phone Number</label>
                <Input
                  placeholder="e.g. +1 (555) 234-5678"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Avatar Image URL</label>
                <Input
                  placeholder="https://..."
                  value={formData.avatar}
                  onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                />
              </div>
            </div>

            <div className="border-t border-border pt-3 space-y-3">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Address Details</h4>
              <div className="space-y-1.5">
                <label className="text-xs text-foreground">Street Address</label>
                <Input
                  placeholder="742 Evergreen Terrace"
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-foreground">City</label>
                  <Input
                    placeholder="Springfield"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-foreground">State</label>
                  <Input
                    placeholder="IL"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-foreground">Zip Code</label>
                  <Input
                    placeholder="62704"
                    value={formData.zipCode}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="border-t border-border pt-4 gap-2">
              <Button type="button" variant="outline" onClick={() => setIsFormModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                {editingCustomer ? 'Save Changes' : 'Create Customer'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-rose-500" /> Confirm Deletion
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              Are you sure you want to remove customer{' '}
              <span className="font-semibold text-foreground">"{deleteTarget?.name}"</span>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              Delete Customer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
