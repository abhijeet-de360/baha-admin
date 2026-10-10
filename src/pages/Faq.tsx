import { useEffect, useState } from "react";
import {
  HelpCircle,
  Plus,
  SquarePen,
  Trash2,
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import {
  addFaq,
  deleteFaq,
  getAllFaq,
  toogleModal,
  updateFaq,
  type FAQ,
} from "@/store/faqSlice";

const STATUS = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

export default function FaqPage() {
  const { faqs, isModalOpen } = useSelector((state: RootState) => state.faq);
  const dispatch = useDispatch<AppDispatch>();

  // Modal State
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);

  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    status: "active",
    order: 0,
  });

  // Open modal for Adding new FAQ
  const handleOpenAddModal = () => {
    setEditingFaq(null);
    setFormData({
      question: "",
      answer: "",
      status: "active",
      order: 0,
    });
    dispatch(toogleModal(true));
  };

  // Open modal for Editing existing FAQ
  const handleOpenEditModal = (faq: FAQ) => {
    setEditingFaq(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      status: faq.status,
      order: faq.order,
    });
    dispatch(toogleModal(true));
  };

  // Save (Create or Update)
  const handleSaveFaq = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.question.trim() || !formData.answer.trim()) return;

    if (editingFaq) {
      // Update
      const body: Record<string, string | number> = {};
      if (formData.status !== editingFaq.status) body.status = formData.status;
      if (formData.question !== editingFaq.question)
        body.question = formData.question;
      if (formData.answer !== editingFaq.answer) body.answer = formData.answer;
      if (formData.order !== editingFaq.order) body.order = formData.order;

      dispatch(updateFaq(editingFaq._id, body));
    } else {
      // Create
      dispatch(
        addFaq({
          question: formData.question,
          answer: formData.answer,
          status: formData.status,
          order: formData.order,
        }),
      );
    }
  };

  // Delete FAQ
  const handleDelete = (id: string) => {
    dispatch(deleteFaq(id));
  };

  // Handle input change
  const handleInputChange = (name: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (faqs.length <= 0) {
      dispatch(getAllFaq());
    }
  }, []);

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

      {/* FAQ List Cards */}
      <div className="space-y-4">
        {faqs.length === 0 ? (
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
          faqs.map((faq) => (
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
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>

                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete this FAQ?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete this FAQ.
                          </AlertDialogDescription>
                        </AlertDialogHeader>

                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700"
                            onClick={() => handleDelete(faq?._id)}
                          >
                            Yes, delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
      <Dialog
        open={isModalOpen}
        onOpenChange={(open) => dispatch(toogleModal(open))}
      >
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
                    value={formData.status}
                    onChange={(e) =>
                      handleInputChange("status", e.target.value)
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
                    value={formData.order}
                    onChange={(e) => handleInputChange("order", e.target.value)}
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
                  value={formData.question}
                  onChange={(e) =>
                    handleInputChange("question", e.target.value)
                  }
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
                  value={formData.answer}
                  onChange={(e) => handleInputChange("answer", e.target.value)}
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
                onClick={() => dispatch(toogleModal(false))}
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
    </div>
  );
}
