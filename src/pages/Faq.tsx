import { useEffect, useMemo, useState } from "react";
import {
  HelpCircle,
  Plus,
  Search,
  SquarePen,
  Trash2,
  CheckCircle2,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import { addFaqThunk, deleteFaqThunk, getAllFaqThunk, updateFaqThunk, type FAQ } from "@/store/faqSlice";

const STATUS = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

export default function FaqPage() {
  const { faqs, error, total } = useSelector((state: RootState) => state.faq);
  const dispatch = useDispatch<AppDispatch>();
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [formQuestion, setFormQuestion] = useState("");
  const [formAnswer, setFormAnswer] = useState("");
  const [formStatus, setFormStatus] = useState<"active" | "inactive">("active");
  const [formOrder, setFormOrder] = useState(0);

  // Delete Alert State
  const [deletingFaqId, setDeletingFaqId] = useState<string | null>(null);

  // Open modal for Adding new FAQ
  const handleOpenAddModal = () => {
    setEditingFaq(null);
    setFormQuestion("");
    setFormAnswer("");
    setFormStatus("active");
    setFormOrder(0);
    setIsModalOpen(true);
  };

  // Open modal for Editing existing FAQ
  const handleOpenEditModal = (faq: FAQ) => {
    setEditingFaq(faq);
    setFormQuestion(faq.question);
    setFormAnswer(faq.answer);
    setFormStatus(faq.status);
    setFormOrder(faq.order);
    setIsModalOpen(true);
  };

  // Save (Create or Update)
  const handleSaveFaq = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formQuestion.trim() || !formAnswer.trim()) return;

    if (editingFaq) {
      // Update
      const body: Record<string, string | number> = {};
      if (formStatus !== editingFaq.status) body.status = formStatus;
      if (formQuestion !== editingFaq.question) body.question = formQuestion;
      if (formAnswer !== editingFaq.answer) body.answer = formAnswer;
      if (formOrder !== editingFaq.order) body.order = formOrder;

      dispatch(
        updateFaqThunk(
          editingFaq._id,
          body,
          () => {
            setIsModalOpen(false);
            setEditingFaq(null);
          },
        ),
      );
    } else {
      // Create
      dispatch(
        addFaqThunk(
          { question: formQuestion, answer: formAnswer, status: formStatus, order: formOrder },
          () => {
            setIsModalOpen(false);
          },
        ),
      );
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    const res = await dispatch(deleteFaqThunk(deletingFaqId as string))
    console.log("res ==> ", res)
    if (res) {
      setDeletingFaqId(null);
    }
  };

  // Filtered FAQs
  const filteredFaqs = useMemo(() => {
    return faqs.filter((item) => {
      const matchesSearch =
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [searchQuery, faqs]);

  useEffect(() => {
    const controller = new AbortController();
    dispatch(getAllFaqThunk(controller.signal));

    return () => {
      controller.abort();
    };
  }, [dispatch]);

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
            Add, update, or remove frequently asked questions shown to
            customers.
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
      </div>

      {/* FAQ List Cards */}
      <div className="space-y-4">
        {filteredFaqs.length === 0 ? (
          <Card className="rounded-2xl border-border p-12 text-center">
            <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
            <p className="text-sm font-semibold text-foreground">
              No FAQs Found
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Try adjusting your search query or add a new question.
            </p>
          </Card>
        ) : (
          filteredFaqs.map((faq) => (
            <Card
              key={faq._id}
              className="rounded-2xl border-border shadow-xs hover:border-border/80 transition-all group"
            >
              <CardContent className="p-5 md:p-6 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <span className="inline-block px-2.5 py-0.5 rounded-md bg-muted text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
                      {faq.status}
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
                      onClick={() => setDeletingFaqId(faq._id)}
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
                {editingFaq ? "Edit FAQ Item" : "Add New FAQ Item"}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Fill in the details below to publish an answer to your
                customers' questions.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Status Select */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) =>
                      setFormStatus(e.target.value as "active" | "inactive")
                    }
                    className="w-full h-10 px-3 rounded-xl border border-input bg-background text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
                  >
                    {STATUS.map((stat) => (
                      <option key={stat.value} value={stat.value}>
                        {stat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Order Input */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    Order
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g., 0"
                    value={formOrder}
                    onChange={(e) => setFormOrder(Number(e.target.value))}
                    className="h-10 text-xs font-medium"
                    min={0}
                  />
                </div>
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
                {editingFaq ? "Update FAQ" : "Create FAQ"}
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
            <AlertDialogTitle className="text-base text-foreground">
              Confirm Deletion
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              Are you sure you want to delete this FAQ question? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full text-xs cursor-pointer">
              Cancel
            </AlertDialogCancel>
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
  );
}
