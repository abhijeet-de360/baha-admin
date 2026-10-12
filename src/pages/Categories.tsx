import { useState, useEffect, useMemo } from "react";
import slugify from "slugify";
import InfiniteScroll from "react-infinite-scroll-component";
import {
  FolderTree,
  Plus,
  Search,
  SquarePen,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Image as ImageIcon,
  X,
  Sparkles,
  Layers,
  Calendar,
  Tag,
  Link as LinkIcon,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
  getAllCategories,
  toogleModal,
  type CategoryItem,
} from "@/store/categorySlice";
import { warningHandler } from "@/shared/_helper/responseHelper";

// Generate slug using slugify package
const generateSlug = (text: string): string => {
  return slugify(text, {
    lower: true,
    strict: true,
    trim: true,
  });
};

export default function Categories() {
  const categoryVar = useSelector((state: RootState) => state.category);
  const dispatch = useDispatch<AppDispatch>();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(
    null,
  );

  // Form State
  const [formData, setFormData] = useState<CategoryItem>({
    name: "",
    slug: "",
    description: "",
    priority: 0,
    status: "active",
    image: "",
    metaTitle: "",
    metaDescription: "",
  });

  const [formVar, setFormVar] = useState({
    keyword: "",
    limit: 10,
    offset: 0,
    status: "",
  });

  const [hasMore, setHasMore] = useState(true);

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

  // Open Modal for Add
  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setFormData({
      name: "",
      slug: "",
      description: "",
      priority: 0,
      status: "active",
      image: "",
      metaTitle: "",
      metaDescription: "",
    });
    dispatch(toogleModal(true));
  };

  // Open Modal for Edit
  const handleOpenEditModal = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      priority: cat.priority || 0,
      status: cat.status,
      image: cat.image,
      metaTitle: cat.metaTitle,
      metaDescription: cat.metaDescription,
    });
    dispatch(toogleModal(true));
  };

  // Save (Create / Update)
  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      warningHandler("Please enter a category name.");
      return;
    }

    const finalSlug = formData.slug.trim()
      ? generateSlug(formData.slug)
      : generateSlug(formData.name);

    if (editingCategory) {
    } else {
    }

    dispatch(toogleModal(false));
  };

  // Delete Handler
  const handleDelete = (id: string) => {};

  const fetchMoreCategories = async () => {
    if (
      categoryVar.status === "loading" ||
      categoryVar.categories.length >= categoryVar.total
    )
      return;

    const newOffset = formVar.offset + formVar.limit;

    await dispatch(
      getAllCategories(
        formVar.keyword,
        formVar.limit,
        newOffset,
        formVar.status,
      ),
    );

    setFormVar((prev) => ({
      ...prev,
      offset: newOffset,
    }));

    if (newOffset + formVar.limit >= categoryVar.total) {
      setHasMore(false);
    }
  };

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      slug: generateSlug(formData.name),
    }));
  }, [formData.name]);

  useEffect(() => {
    if (categoryVar.categories.length <= 0) {
      dispatch(
        getAllCategories(
          formVar.keyword,
          formVar.limit,
          formVar.offset,
          formVar.status,
        ),
      );
    }
  }, []);

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

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-card p-4 rounded-2xl border border-border shadow-xs">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search category name or description..."
            value={formVar.keyword}
            onChange={(e) => {
              setFormVar((prev) => ({ ...prev, keyword: e.target.value }));
            }}
            className="pl-10 h-10 bg-background text-xs placeholder:text-muted-foreground/40"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <select
            value={formVar.status}
            onChange={(e) => {
              setFormVar((prev) => ({ ...prev, status: e.target.value }));
            }}
            className="h-10 px-3.5 rounded-xl border border-input bg-background text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-ring text-foreground cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Categories Content Area */}
      <Card className="rounded-2xl border-border overflow-hidden shadow-xs">
        <CardContent className="p-0">
          {categoryVar.categories.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="p-3.5 rounded-full bg-muted text-muted-foreground w-fit mx-auto">
                <FolderTree className="h-8 w-8" />
              </div>
              <h3 className="text-sm font-bold text-foreground">
                No categories found
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {formVar.keyword || formVar.status !== "all"
                  ? "Try adjusting your search criteria or status filter."
                  : "Get started by adding your first kids clothing category."}
              </p>
              {!formVar.keyword && formVar.status === "all" && (
                <Button
                  onClick={handleOpenAddModal}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs rounded-xl px-4 py-2 mt-2 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Category
                </Button>
              )}
            </div>
          ) : (
            <InfiniteScroll
              dataLength={categoryVar.categories.length}
              next={fetchMoreCategories}
              hasMore={hasMore}
              loader={
                <div className="py-4 text-center text-xs text-muted-foreground font-medium">
                  Loading more categories...
                </div>
              }
              endMessage={
                <div className="py-4 text-center text-xs text-muted-foreground font-medium">
                  Showing all {categoryVar.categories.length} categories
                </div>
              }
            >
              {/* Responsive Grid View for All Screens */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4 md:p-6">
                {categoryVar.categories.map((cat) => (
                  <div
                    key={cat._id}
                    className="group relative rounded-2xl border border-border bg-card overflow-hidden shadow-xs hover:shadow-md hover:border-primary/40 transition-all flex flex-col justify-between"
                  >
                    {/* Image Banner Container */}
                    <div className="relative h-40 w-full bg-muted overflow-hidden">
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

                      {/* Status Badge */}
                      <div className="absolute top-3 left-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border backdrop-blur-md shadow-xs ${
                            cat.status === "active"
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                              : "bg-black/40 text-muted-foreground border-white/10"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              cat.status === "active"
                                ? "bg-emerald-400"
                                : "bg-muted-foreground"
                            }`}
                          />
                          {cat.status}
                        </span>
                      </div>

                      {/* Products Count Badge */}
                      {/* <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-white border border-white/10">
                        <Tag className="h-3 w-3 text-amber-400" />
                        <span>{cat.productCount} Products</span>
                      </div> */}
                    </div>

                    {/* Content Section */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-1">
                        <h4 className="font-bold text-foreground text-base group-hover:text-primary transition-colors">
                          {cat.name}
                        </h4>
                        <p className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
                          <LinkIcon className="h-3 w-3 shrink-0" /> /{cat.slug}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed pt-1">
                          {cat.description}
                        </p>
                      </div>

                      {/* Footer Info & Actions */}
                      <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> {cat.createdAt}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleOpenEditModal(cat)}
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
                                <AlertDialogTitle>
                                  Delete this Category?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will
                                  permanently delete this Category.
                                </AlertDialogDescription>
                              </AlertDialogHeader>

                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-600 hover:bg-red-700"
                                  onClick={() => handleDelete(cat._id)}
                                >
                                  Yes, delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </InfiniteScroll>
          )}
        </CardContent>
      </Card>

      {/* Add / Edit Category Modal Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto rounded-2xl">
          <form onSubmit={handleSaveCategory}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
                <FolderTree className="h-5 w-5 text-foreground" />
                {editingCategory ? "Edit Category" : "Add New Category"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Enter category title, URL slug, upload cover image, and status.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Category Name & Status Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Category Name <span className="text-destructive">*</span>
                  </label>
                  <Input
                    placeholder="e.g., Party Wear, Boys Collection"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="h-10 text-xs font-semibold text-foreground bg-background"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Status <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      handleInputChange("status", e.target.value)
                    }
                    className="w-full h-10 px-3 rounded-xl border border-input bg-background text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-ring text-foreground"
                    required
                  >
                    <option value="" disabled>
                      Select Status
                    </option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Category Slug Input (Auto-generated using slugify) */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 text-muted-foreground">
                  <LinkIcon className="h-3.5 w-3.5" /> URL Slug{" "}
                  <span className="text-destructive">*</span>
                </label>
                <Input
                  placeholder="e.g., party-wear"
                  value={formData.slug}
                  onChange={(e) => handleInputChange("slug", e.target.value)}
                  className="h-10 text-xs font-mono font-semibold placeholder:text-muted-foreground/40 text-foreground bg-background"
                  required
                />
              </div>

              {/* Category Cover Image Upload Section */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 text-muted-foreground">
                  <ImageIcon className="h-3.5 w-3.5 text-foreground" /> Category
                  Cover Picture
                </label>

                {formData.image ? (
                  <div className="relative h-44 w-full rounded-xl overflow-hidden border border-border bg-muted group shadow-xs">
                    <img
                      src={
                        typeof formData.image === "string"
                          ? formData.image
                          : URL.createObjectURL(formData.image)
                      }
                      alt="Cover Preview"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <label className="bg-card text-card-foreground hover:bg-muted font-semibold text-xs px-3 py-1.5 rounded-lg cursor-pointer flex items-center gap-1.5 shadow-sm border border-border">
                        <Upload className="h-3.5 w-3.5" /> Upload Different
                        Picture
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, image: "" }))
                        }
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
                      <p className="text-xs font-bold text-foreground">
                        Click or drag image to upload
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        PNG, JPG, WEBP, GIF up to 10MB
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

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Description <span className="font-normal">(Optional)</span>
                </label>
                <textarea
                  placeholder="Short overview describing this category..."
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  rows={3}
                  className="w-full p-3 rounded-xl border border-input bg-background text-xs font-medium focus:outline-none focus:ring-1 focus:ring-ring resize-y text-foreground"
                />
              </div>

              {/* SEO SETTINGS SECTION */}
              <div className="pt-3 border-t border-border space-y-3">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-foreground" />
                  <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                    SEO Search Meta Tags
                  </span>
                </div>

                {/* Meta Title Tag */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      Meta Title Tag
                    </label>
                  </div>
                  <Input
                    placeholder="e.g., Boys Collection - Kids Fashion & Outfits | Baha"
                    value={formData.metaTitle}
                    onChange={(e) =>
                      handleInputChange("metaTitle", e.target.value)
                    }
                    className="h-10 text-xs font-medium placeholder:text-muted-foreground/40 text-foreground bg-background"
                  />
                </div>

                {/* Meta Description Tag */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      Meta Description Tag
                    </label>
                  </div>
                  <textarea
                    placeholder="Write a concise meta description summarizing the category for Google search results..."
                    value={formData.metaDescription}
                    onChange={(e) =>
                      handleInputChange("metaDescription", e.target.value)
                    }
                    rows={2}
                    className="w-full p-3 rounded-xl border border-input bg-background text-xs font-medium leading-relaxed focus:outline-none focus:ring-1 focus:ring-ring resize-y placeholder:text-muted-foreground/40 text-foreground"
                  />
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
                {editingCategory ? "Update Category" : "Save Category"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
