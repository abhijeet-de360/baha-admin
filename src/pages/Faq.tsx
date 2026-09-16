import { useState } from 'react'
import { HelpCircle, Plus, Search, SquarePen, Trash2, CheckCircle2, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'

export interface FaqItem { id: string, question: string, answer: string, category: string }

const INITIAL_FAQS: FaqItem[] = [
  {
    id: 'faq-1',
    question: 'How long does shipping take?',
    answer: 'Standard shipping takes 3-5 business days depending on your location. Express shipping options are also available at checkout.',
    category: 'Shipping & Delivery',
  },
  {
    id: 'faq-2',
    question: 'What is your return policy?',
    answer: 'We offer a 7-day hassle-free return policy for unused items in their original packaging. You can initiate a return directly from your account page.',
    category: 'Returns & Refunds',
  },
  {
    id: 'faq-3',
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit/debit cards, UPI (Google Pay, PhonePe, Paytm), Net Banking, and Cash on Delivery (COD).',
    category: 'Payments & COD',
  },
  {
    id: 'faq-4',
    question: 'How can I track my order?',
    answer: 'Once your order is dispatched, you will receive an SMS and email notification containing your courier tracking link.',
    category: 'Orders & Tracking',
  },
]

const CATEGORIES = ['All', 'Shipping & Delivery', 'Returns & Refunds', 'Payments & COD', 'Orders & Tracking']

export default function FaqPage() {
  const [faqs, setFaqs] = useState<FaqItem[]>(INITIAL_FAQS)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingFaq, setEditingFaq] = useState<FaqItem | null>(null)
  const [formQuestion, setFormQuestion] = useState('')
  const [formAnswer, setFormAnswer] = useState('')
  const [formCategory, setFormCategory] = useState('Shipping & Delivery')

  // Delete Alert State
  const [deletingFaqId, setDeletingFaqId] = useState<string | null>(null)

  // Success Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showNotification = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Open modal for Adding new FAQ
  const handleOpenAddModal = () => {
    setEditingFaq(null)
    setFormQuestion('')
    setFormAnswer('')
    setFormCategory('Shipping & Delivery')
    setIsModalOpen(true)
  }

  // Open modal for Editing existing FAQ
  const handleOpenEditModal = (faq: FaqItem) => {
    setEditingFaq(faq)
    setFormQuestion(faq.question)
    setFormAnswer(faq.answer)
    setFormCategory(faq.category)
    setIsModalOpen(true)
  }

  // Save (Create or Update)
  const handleSaveFaq = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formQuestion.trim() || !formAnswer.trim()) return

    if (editingFaq) {
      // Update
      setFaqs((prev) =>
        prev.map((item) =>
          item.id === editingFaq.id
            ? { ...item, question: formQuestion, answer: formAnswer, category: formCategory }
            : item
        )
      )
      showNotification('FAQ updated successfully!')
    } else {
      // Create
      const newFaq: FaqItem = {
        id: `faq-${Date.now()}`,
        question: formQuestion,
        answer: formAnswer,
        category: formCategory,
      }
      setFaqs((prev) => [newFaq, ...prev])
      showNotification('New FAQ added successfully!')
    }

    setIsModalOpen(false)
  }

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (!deletingFaqId) return
    setFaqs((prev) => prev.filter((item) => item.id !== deletingFaqId))
    setDeletingFaqId(null)
    showNotification('FAQ deleted successfully!')
  }

  // Filtered FAQs
  const filteredFaqs = faqs.filter((item) => {
    const matchesSearch =
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6 md:space-y-8 w-full font-sans pb-16">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary text-primary-foreground">
              <HelpCircle className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              FAQ Management
            </h1>
          </div>
          <p className="text-xs text-muted-foreground sm:pl-10">
            Add, update, or remove frequently asked questions shown to customers.
          </p>
        </div>

        {/* Action Button */}
        <Button
          onClick={handleOpenAddModal}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs px-4 py-2.5 rounded-xl gap-2 shadow-md shrink-0 cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Add New FAQ
        </Button>
      </div>

      {/* Success Notification Toast */}
      {toastMessage && (
        <div className="flex items-center gap-2 bg-muted border border-border text-foreground text-xs px-4 py-3 rounded-xl shadow-xs animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-card p-4 rounded-2xl border border-border shadow-xs">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search questions or answers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 bg-background text-xs"
          />
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* FAQ List Cards */}
      <div className="space-y-4">
        {filteredFaqs.length === 0 ? (
          <Card className="rounded-2xl border-border p-12 text-center">
            <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
            <p className="text-sm font-semibold text-foreground">No FAQs Found</p>
            <p className="text-xs text-muted-foreground mt-1">
              Try adjusting your search query or add a new question.
            </p>
          </Card>
        ) : (
          filteredFaqs.map((faq) => (
            <Card
              key={faq.id}
              className="rounded-2xl border-border shadow-xs hover:border-border/80 transition-all group"
            >
              <CardContent className="p-5 md:p-6 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <span className="inline-block px-2.5 py-0.5 rounded-md bg-muted text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
                      {faq.category}
                    </span>
                    <h3 className="text-sm font-bold text-foreground leading-snug">
                      {faq.question}
                    </h3>
                  </div>

                  {/* Actions: Edit & Delete */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleOpenEditModal(faq)}
                      className="h-8 w-8 text-amber-400 border-border hover:bg-amber-500/10 cursor-pointer"
                      title="Edit"
                    >
                      <SquarePen className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setDeletingFaqId(faq.id)}
                      className="h-8 w-8 text-rose-500 border-border hover:bg-rose-500/10 cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed pt-1 border-t border-border/40">
                  {faq.answer}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add / Edit FAQ Modal Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-2xl">
          <form onSubmit={handleSaveFaq}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base">
                <HelpCircle className="h-5 w-5 text-foreground" />
                {editingFaq ? 'Edit FAQ Item' : 'Add New FAQ Item'}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Fill in the details below to publish an answer to your customers' questions.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Category Select */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Category
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-input bg-background text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Question Input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Question
                </label>
                <Input
                  placeholder="e.g., What is your delivery timeline?"
                  value={formQuestion}
                  onChange={(e) => setFormQuestion(e.target.value)}
                  className="h-10 text-xs font-medium"
                  required
                />
              </div>

              {/* Answer Textarea */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Answer
                </label>
                <textarea
                  placeholder="Type a clear, detailed answer..."
                  value={formAnswer}
                  onChange={(e) => setFormAnswer(e.target.value)}
                  rows={4}
                  className="w-full p-3 rounded-xl border border-input bg-background text-xs font-medium leading-relaxed focus:outline-none focus:ring-1 focus:ring-ring resize-y"
                  required
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="rounded-full text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-full font-semibold text-xs px-5"
              >
                {editingFaq ? 'Update FAQ' : 'Create FAQ'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog
        open={Boolean(deletingFaqId)}
        onOpenChange={(open) => !open && setDeletingFaqId(null)}
      >
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base text-foreground">Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              Are you sure you want to delete this FAQ question? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full text-xs cursor-pointer">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-full text-xs font-semibold cursor-pointer"
            >
              Delete Question
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}