import { useState, useEffect, useRef } from "react";
import slugify from "slugify";
import InfiniteScroll from "react-infinite-scroll-component";
import {
  FolderTree,
  Plus,
  Search,
  SquarePen,
  Trash2,
  Upload,
  Image as ImageIcon,
  X,
  Calendar,
  Link as LinkIcon,
  Globe,
  Folder,
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
  addCategory,
  deleteCategory,
  getAllCategories,
  toogleModal,
  updateCategory,
  type CategoryItem,
} from "@/store/categorySlice";
import { warningHandler } from "@/shared/_helper/responseHelper";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";

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
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(
    null,
  );

  // Form State
  const [formData, setFormData] = useState<CategoryItem>({
    name: "",
    slug: "",
    priority: 0,
    image: "",
  });

  const [formVar, setFormVar] = useState({
    keyword: "",
    limit: 10,
    offset: 0,
    status: "",
  });

  const [hasMore, setHasMore] = useState(false);

  // Ref
  const searchTimeoutRef = useRef<any>(null);

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
      priority: 0,
      image: "",
    });
    dispatch(toogleModal(true));
  };

  // Open Modal for Edit
  const handleOpenEditModal = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      priority: cat.priority || 0,
      image: cat.image,
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

    const data = new FormData();
    data.append("name", formData.name.trim());
    data.append("slug", finalSlug);
    data.append("priority", formData.priority.toString());

    if (formData.image instanceof File) {
      data.append("image", formData.image);
    }

    if (editingCategory) {
      dispatch(updateCategory(editingCategory._id, data));
    } else {
      dispatch(addCategory(data));
    }
  };

  // Delete Handler
  const handleDelete = (id: string) => {
    dispatch(deleteCategory(id));
  };

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

  // Handle status change
  const handleStatusChange = (status: string) => {
    setFormVar((prev) => ({
      ...prev,
      status: status,
      offset: 0,
    }));
    dispatch(
      getAllCategories(
        formVar.keyword,
        formVar.limit,
        0,
        status === "all" ? "" : status,
      ),
    );
  };

  // Handle search
  const handleSearch = (searchTerm: string) => {
    setFormVar((prev) => ({
      ...prev,
      keyword: searchTerm,
      offset: 0,
    }));

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      dispatch(
        getAllCategories(
          searchTerm,
          formVar.limit,
          0,
          formVar.status === "all" ? "" : formVar.status,
        ),
      );
    }, 500);
  };

  // Update status
  const updateStatus = (id: string, status: string) => {
    const data = new FormData();
    data.append("status", status);
    dispatch(updateCategory(id, data));
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
              <Folder className="h-5 w-5" />
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
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 h-10 bg-background text-xs placeholder:text-muted-foreground/40"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <select
            value={formVar.status}
            onChange={(e) => handleStatusChange(e.target.value)}
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
              {/* Mobile & Tablet card layout  */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 xl:hidden">
                {categoryVar.categories.map((cat) => (
                  <div
                    key={cat._id}
                    className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs hover:shadow-md hover:border-primary/20 transition-all flex flex-col"
                  >
                    {/* Cover Image */}
                    <div className="relative h-36 w-full bg-muted overflow-hidden shrink-0">
                      <img
                        src={
                          typeof cat.image === "string"
                            ? cat.image
                            : URL.createObjectURL(cat.image)
                        }
                        alt={cat.name}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    </div>

                    {/* Card Body */}
                    <div className="p-4 flex flex-col gap-3 flex-1">
                      {/* Name & Slug */}
                      <div className="space-y-0.5">
                        <h4 className="text-sm font-bold text-foreground leading-tight line-clamp-1">
                          {cat.name}
                        </h4>
                        <p className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
                          <LinkIcon className="h-3 w-3 shrink-0" />/{cat.slug}
                        </p>
                      </div>

                      {/* Status Switch */}
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={cat.status === "active"}
                          onCheckedChange={(checked) =>
                            updateStatus(
                              cat._id,
                              checked ? "active" : "inactive",
                            )
                          }
                        />
                        <span
                          className={`text-[11px] font-semibold capitalize ${
                            cat.status === "active"
                              ? "text-emerald-500"
                              : "text-muted-foreground"
                          }`}
                        >
                          {cat.status}
                        </span>
                      </div>

                      {/* Footer: date + actions */}
                      <div className="pt-2 border-t border-border flex items-center justify-between mt-auto">
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(cat.createdAt).toDateString()}
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

              {/* Desktop table view  */}
              <div className="hidden xl:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Image</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categoryVar.categories.map((cat) => (
                      <TableRow key={cat._id}>
                        <TableCell>
                          <img
                            src={
                              typeof cat.image === "string"
                                ? cat.image
                                : URL.createObjectURL(cat.image)
                            }
                            alt={cat.name}
                            className="h-10 w-10 object-cover rounded"
                          />
                        </TableCell>
                        <TableCell>{cat.name}</TableCell>
                        <TableCell>{cat.slug}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={cat.status === "active"}
                              onCheckedChange={(checked) => {
                                updateStatus(
                                  cat._id,
                                  checked ? "active" : "inactive",
                                );
                              }}
                            />
                            <span
                              className={`text-[11px] font-semibold capitalize ${
                                cat.status === "active"
                                  ? "text-emerald-500"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {cat.status}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(cat.createdAt).toDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            onClick={() => handleOpenEditModal(cat)}
                            className="mr-2"
                          >
                            Edit
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive">Delete</Button>
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
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </InfiniteScroll>
          )}
        </CardContent>
      </Card>

      {/* Add / Edit Category Modal Dialog */}
      <Dialog
        open={categoryVar.isModalOpen}
        onOpenChange={(open) => dispatch(toogleModal(open))}
      >
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
                    Priority <span className="text-destructive">*</span>
                  </label>
                  <Input
                    placeholder="e.g., 1"
                    type="number"
                    value={formData.priority}
                    onChange={(e) =>
                      handleInputChange("priority", e.target.value)
                    }
                    className="h-10 text-xs font-semibold text-foreground bg-background"
                    required
                    onWheel={(e) => e.currentTarget.blur()}
                  />
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
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => dispatch(toogleModal(false))}
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
