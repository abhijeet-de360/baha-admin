import { useState, useEffect } from "react";
import {
  MessageSquareQuote,
  Plus,
  SquarePen,
  Trash2,
  Star,
  Quote,
  Upload,
  X,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
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
  addTestimonial,
  deleteTestimonial,
  getAllTestimonials,
  toggleModal,
  updateTestimonial,
} from "@/store/testimonialSlice";
import { warningHandler } from "@/shared/_helper/responseHelper";

const INITIAL_FORM_DATA = {
  customerName: "",
  customerRole: "Verified Customer",
  image: null,
  review: "",
  rating: 5,
};

export default function Testimonials() {
  const testimonialVar = useSelector((state: RootState) => state.testimonial);
  const dispatch = useDispatch<AppDispatch>();

  // Modal State
  const [editingTestimonial, setEditingTestimonial] = useState(null);

  // Form Fields
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);

  // Delete Dialog State
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Handle input change
  const handleInputChange = (name: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle Base64 Image Upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormData((prev: any) => ({
      ...prev,
      image: file,
    }));
  };

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingTestimonial(null);
    setFormData(INITIAL_FORM_DATA);
    dispatch(toggleModal(true));
  };

  // Open Edit Modal
  const handleOpenEditModal = (item) => {
    setEditingTestimonial(item);
    setFormData({
      customerName: item.customerName,
      customerRole: item.customerRole,
      image: item.image,
      review: item.review,
      rating: item.rating,
    });
    dispatch(toggleModal(true));
  };

  // Save Testimonial
  const handleSaveTestimonial = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.customerName.trim() ||
      !formData.customerRole.trim() ||
      !formData.review.trim() ||
      !formData.rating
    ) {
      warningHandler("Please fill all the required fields.");
      return;
    }

    const data = new FormData();
    data.append("customerName", formData.customerName.trim());
    data.append("customerRole", formData.customerRole.trim());
    data.append("review", formData.review.trim());
    data.append("rating", String(formData.rating));
    if (formData.image instanceof File) {
      data.append("image", formData.image);
    }

    if (editingTestimonial) {
      dispatch(updateTestimonial(editingTestimonial._id, data));
    } else {
      dispatch(addTestimonial(data));
    }
  };

  // Confirm Delete
  const handleDelete = (id: string) => {
    dispatch(deleteTestimonial(id));
  };

  // Toggle Status
  const handleToggleStatus = (id: string, checked: boolean) => {
    const formData = new FormData();
    formData.append("status", checked ? "active" : "inactive");
    dispatch(updateTestimonial(id, formData));
  };

  useEffect(() => {
    dispatch(getAllTestimonials());
  }, []);

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
            Manage customer feedback, reviews, and ratings for your kids
            clothing store.
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

      {/* Testimonials Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonialVar.testimonials.length === 0 ? (
          <div className="col-span-full">
            <Card className="rounded-2xl border-border p-12 text-center">
              <MessageSquareQuote className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
              <p className="text-sm font-semibold text-foreground">
                No Testimonials Found
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Try adjusting your search query or add a new customer
                testimonial.
              </p>
            </Card>
          </div>
        ) : (
          testimonialVar?.testimonials?.map((t) => (
            <Card
              key={t._id}
              className="rounded-2xl border-border shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group bg-card p-5 relative"
            >
              <div className="space-y-4">
                {/* Header: User Avatar, Info & Status */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={t.image}
                      alt={t.customerName}
                      className="h-12 w-12 rounded-full object-cover border border-border shrink-0 bg-muted"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-foreground leading-snug">
                        {t.customerName}
                      </h3>
                      <p className="text-[11px] text-muted-foreground">
                        {t.customerRole}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={t.status?.toLowerCase() === "active"}
                      onCheckedChange={(checked) =>
                        handleToggleStatus(t._id, checked)
                      }
                    />
                    <span
                      className={`text-[11px] font-semibold capitalize ${
                        t.status?.toLowerCase() === "active"
                          ? "text-emerald-500"
                          : "text-muted-foreground"
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                </div>

                {/* Rating Stars */}
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= t.rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  ))}
                </div>

                {/* Review Quote Content */}
                <div className="relative pt-1">
                  <Quote className="h-5 w-5 text-muted-foreground/30 absolute -top-1 -left-1 rotate-180" />
                  <p className="text-xs text-foreground/90 leading-relaxed italic pl-5">
                    "{t.review}"
                  </p>
                </div>
              </div>

              {/* Card Footer: Date & Actions */}
              <div className="pt-4 mt-4 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-mono text-[11px]">
                  {new Date(t.createdAt).toDateString()}
                </span>

                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleOpenEditModal(t)}
                    className="h-8 w-8 text-amber-400 border-border hover:bg-amber-500/10 cursor-pointer"
                    title="Edit"
                  >
                    <SquarePen className="h-3.5 w-3.5" />
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 text-rose-500 border-border hover:bg-rose-500/10 cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </AlertDialogTrigger>

                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Delete this Testimonial?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          delete this Testimonial.
                        </AlertDialogDescription>
                      </AlertDialogHeader>

                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-600 hover:bg-red-700"
                          onClick={() => handleDelete(t._id)}
                        >
                          Yes, delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Add / Edit Testimonial Dialog Modal */}
      <Dialog
        open={testimonialVar.isModalOpen}
        onOpenChange={(open) => dispatch(toggleModal(open))}
      >
        <DialogContent className="sm:max-w-[500px] rounded-2xl">
          <form onSubmit={handleSaveTestimonial}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base text-foreground font-bold">
                <MessageSquareQuote className="h-5 w-5 text-foreground" />
                {editingTestimonial
                  ? "Edit Testimonial"
                  : "Add New Testimonial"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Enter customer review, role, rating score, and optional profile
                photo.
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
                    value={formData.customerName}
                    onChange={(e) =>
                      handleInputChange("customerName", e.target.value)
                    }
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
                    value={formData.customerRole}
                    onChange={(e) =>
                      handleInputChange("customerRole", e.target.value)
                    }
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
                        onClick={() =>
                          handleInputChange("rating", star.toString())
                        }
                        className="cursor-pointer p-0.5 transition-transform hover:scale-110"
                      >
                        <Star
                          className={`h-6 w-6 ${
                            star <= formData.rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-muted-foreground/30"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Customer Image Upload */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <ImageIcon className="h-3.5 w-3.5 text-foreground" /> Customer
                  Photo / Avatar
                </label>

                {formData.image ? (
                  <div className="flex items-center gap-4 p-3 bg-muted/30 border border-border rounded-2xl">
                    <div className="relative h-24 w-24 shrink-0 rounded-2xl overflow-hidden border border-border bg-muted shadow-xs aspect-square">
                      <img
                        src={
                          typeof formData.image === "string"
                            ? formData.image
                            : URL.createObjectURL(formData.image)
                        }
                        alt="Customer Avatar Preview"
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="flex flex-col gap-2 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <label className="bg-card hover:bg-muted text-card-foreground font-semibold text-xs px-3 py-1.5 rounded-lg cursor-pointer flex items-center gap-1.5 shadow-xs border border-border transition-colors">
                          <Upload className="h-3.5 w-3.5" /> Change Photo
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageUpload}
                          />
                        </label>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            setFormData((prev) => ({ ...prev, image: "" }))
                          }
                          className="h-8 text-xs px-2.5 cursor-pointer gap-1"
                        >
                          <X className="h-3.5 w-3.5" /> Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-border hover:border-muted-foreground/50 rounded-2xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer bg-muted/20 hover:bg-muted/40 transition-all text-center">
                    <div className="p-3 rounded-full bg-muted text-muted-foreground">
                      <Upload className="h-5 w-5" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-foreground">
                        Click or drag image to upload
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Square 1:1 ratio recommended (PNG, JPG, WEBP up to 10MB)
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                )}
              </div>

              {/* Review Content */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Testimonial Review Content{" "}
                  <span className="text-destructive">*</span>
                </label>
                <textarea
                  placeholder="Write customer feedback text..."
                  value={formData.review}
                  onChange={(e) => handleInputChange("review", e.target.value)}
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
                onClick={() => dispatch(toggleModal(false))}
                className="rounded-full text-xs cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={testimonialVar.status === "loading"}
                className="rounded-full font-semibold text-xs px-5 cursor-pointer"
              >
                {testimonialVar.status === "loading"
                  ? "Saving..."
                  : editingTestimonial
                    ? "Update Testimonial"
                    : "Save Testimonial"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
