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
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { warningHandler } from "@/shared/_helper/responseHelper";
import type { AppDispatch, RootState } from "@/store/store";
import {
  addSubCategory,
  deleteSubCategory,
  getAllSubCategories,
  toogleModal,
  updateSubCategory,
  type SubCategoryItem,
} from "@/store/subCategorySlice";
import {
  Calendar,
  FolderTree,
  LinkIcon,
  Plus,
  Search,
  SquarePen,
  Trash2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useDispatch, useSelector } from "react-redux";
import slugify from "slugify";

// Generate slug using slugify package
const generateSlug = (text: string): string => {
  return slugify(text, {
    lower: true,
    strict: true,
    trim: true,
  });
};

const SubCategories = () => {
  const subCategoryVar = useSelector((state: RootState) => state.subCategory);
  const categoryVar = useSelector((state: RootState) => state.category);
  const dispatch = useDispatch<AppDispatch>();

  // Modal State
  const [editingSubCategory, setEditingSubCategory] =
    useState<SubCategoryItem | null>(null);

  // Form state
  const [formData, setFormData] = useState<SubCategoryItem>({
    name: "",
    slug: "",
    category: "",
  });

  const [formVar, setFormVar] = useState({
    keyword: "",
    limit: 10,
    offset: 0,
    status: "",
    categoryId: "",
  });

  const [hasMore, setHasMore] = useState(false);

  // Ref
  const searchTimeoutRef = useRef<any>(null);

  // Handle input change
  const handleInputChange = (name: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // open modal for add
  const handleOpenAddModal = () => {
    setEditingSubCategory(null);
    setFormData({
      name: "",
      slug: "",
      category: "",
    });
    dispatch(toogleModal(true));
  };

  // open modal for edit
  const handleOpenEditModal = (subCategory) => {
    setEditingSubCategory(subCategory);
    setFormData({
      name: subCategory.name,
      slug: subCategory.slug,
      category: subCategory.category._id,
    });
    dispatch(toogleModal(true));
  };

  // Delete Handler
  const handleDelete = (id: string) => {
    dispatch(deleteSubCategory(id));
  };

  const fetchMoreSubCategories = async () => {
    if (
      subCategoryVar.status === "loading" ||
      subCategoryVar.subCategories.length === subCategoryVar.total
    ) {
      return;
    }

    const newOffset = formVar.offset + formVar.limit;

    await dispatch(
      getAllSubCategories(
        formVar.keyword,
        formVar.limit,
        newOffset,
        formVar.status,
        formVar.categoryId,
      ),
    );

    setFormVar((prev) => ({
      ...prev,
      offset: newOffset,
    }));

    if (newOffset + formVar.limit >= subCategoryVar.total) {
      setHasMore(false);
    }
  };

  // Update status
  const updateStatus = (id: string, status: string) => {
    dispatch(
      updateSubCategory(id, {
        status: status,
      }),
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
        getAllSubCategories(
          searchTerm,
          formVar.limit,
          0,
          formVar.status === "all" ? "" : formVar.status,
          formVar.categoryId,
        ),
      );
    }, 500);
  };

  // Handle status change
  const handleStatusChange = (status: string) => {
    setFormVar((prev) => ({
      ...prev,
      status: status,
      offset: 0,
    }));
    dispatch(
      getAllSubCategories(
        formVar.keyword,
        formVar.limit,
        0,
        status === "all" ? "" : status,
        formVar.categoryId,
      ),
    );
  };

  // Handle category change
  const handleCategoryChange = (categoryId: string) => {
    setFormVar((prev) => ({
      ...prev,
      categoryId: categoryId,
      offset: 0,
    }));
    dispatch(
      getAllSubCategories(
        formVar.keyword,
        formVar.limit,
        0,
        formVar.status,
        categoryId === "all" ? "" : categoryId,
      ),
    );
  };

  // Handle save sub category
  const handleSaveSubCategory = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      warningHandler("Please enter sub category name");
      return;
    }
    if (!formData.category) {
      warningHandler("Please enter select category");
      return;
    }
    if (!formData.slug) {
      warningHandler("Please enter slug");
      return;
    }

    if (editingSubCategory) {
      dispatch(
        updateSubCategory(editingSubCategory._id, {
          name: formData.name.trim(),
          slug: formData.slug,
          category: formData.category,
        }),
      );
    } else {
      dispatch(
        addSubCategory({
          name: formData.name.trim(),
          slug: formData.slug,
          category: formData.category,
        }),
      );
    }
  };

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      slug: generateSlug(formData.name),
    }));
  }, [formData.name]);

  useEffect(() => {
    if (subCategoryVar.subCategories.length === 0) {
      dispatch(
        getAllSubCategories(
          formVar.keyword,
          formVar.limit,
          formVar.offset,
          formVar.status,
          formVar.categoryId,
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
              Sub Categories
            </h1>
          </div>
          <p className="text-xs text-muted-foreground sm:pl-10">
            Manage clothing sub categories for your kids fashion store.
          </p>
        </div>

        {/* Add Category Button */}
        <Button
          onClick={handleOpenAddModal}
          className="rounded-full font-semibold text-xs px-5 py-2.5 gap-2 shadow-md shrink-0 cursor-pointer transition-all"
        >
          <Plus className="h-4 w-4" /> Add Sub Category
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
        {/* Filter category */}
        <div className="flex items-center gap-2 shrink-0">
          <select
            value={formVar.categoryId}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="h-10 px-3.5 rounded-xl border border-input bg-background text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-ring text-foreground cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categoryVar.categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Filter status */}
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

      {/* Sub categories content area */}
      <Card className="rounded-2xl border-border overflow-hidden shadow-xs">
        <CardContent className="p-0">
          {subCategoryVar.subCategories.length === 0 ? (
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
              dataLength={subCategoryVar.subCategories.length}
              next={fetchMoreSubCategories}
              hasMore={hasMore}
              loader={
                <div className="py-4 text-center text-xs text-muted-foreground font-medium">
                  Loading more categories...
                </div>
              }
              endMessage={
                <div className="py-4 text-center text-xs text-muted-foreground font-medium">
                  Showing all {subCategoryVar.subCategories.length} categories
                </div>
              }
            >
              {/* Mobile & Tablet card layout  */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 xl:hidden">
                {subCategoryVar.subCategories.map((subCat) => (
                  <div
                    key={subCat._id}
                    className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs hover:shadow-md hover:border-primary/20 transition-all flex flex-col"
                  >
                    {/* Card Body */}
                    <div className="p-4 flex flex-col gap-3 flex-1">
                      {/* Name & Slug */}
                      <div className="space-y-0.5">
                        <h4 className="text-sm font-bold text-foreground leading-tight line-clamp-1">
                          {subCat.name}
                        </h4>
                        <p className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
                          <LinkIcon className="h-3 w-3 shrink-0" />/
                          {subCat.slug}
                        </p>
                      </div>

                      {/* Status Switch */}
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={subCat.status === "active"}
                          onCheckedChange={(checked) =>
                            updateStatus(
                              subCat._id,
                              checked ? "active" : "inactive",
                            )
                          }
                        />
                        <span
                          className={`text-[11px] font-semibold capitalize ${
                            subCat.status === "active"
                              ? "text-emerald-500"
                              : "text-muted-foreground"
                          }`}
                        >
                          {subCat.status}
                        </span>
                      </div>

                      {/* Footer: date + actions */}
                      <div className="pt-2 border-t border-border flex items-center justify-between mt-auto">
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(subCat.createdAt).toDateString()}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleOpenEditModal(subCat)}
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
                                  onClick={() => handleDelete(subCat._id)}
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
                      <TableHead>Name</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subCategoryVar.subCategories.map((subCat) => (
                      <TableRow key={subCat._id}>
                        <TableCell>{subCat.name}</TableCell>
                        <TableCell>{subCat.slug}</TableCell>
                        <TableCell>{subCat.category.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={subCat.status === "active"}
                              onCheckedChange={(checked) => {
                                updateStatus(
                                  subCat._id,
                                  checked ? "active" : "inactive",
                                );
                              }}
                            />
                            <span
                              className={`text-[11px] font-semibold capitalize ${
                                subCat.status === "active"
                                  ? "text-emerald-500"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {subCat.status}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(subCat.createdAt).toDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            onClick={() => handleOpenEditModal(subCat)}
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
                                  onClick={() => handleDelete(subCat._id)}
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
        open={subCategoryVar.isModalOpen}
        onOpenChange={(open) => dispatch(toogleModal(open))}
      >
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto rounded-2xl">
          <form onSubmit={handleSaveSubCategory}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
                <FolderTree className="h-5 w-5 text-foreground" />
                {editingSubCategory
                  ? "Edit Sub Category"
                  : "Add New Sub Category"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Enter sub category title, URL slug, upload cover image, and
                status.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Sub Category Name & Status Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Sub Category Name{" "}
                    <span className="text-destructive">*</span>
                  </label>
                  <Input
                    placeholder="e.g., Party Wear, Boys Collection"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="h-10 text-xs font-semibold text-foreground bg-background"
                    required
                  />
                </div>
              </div>

              {/* Sub Category Slug Input (Auto-generated using slugify) */}
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

              {/* Select Category  */}
              <div className="space-y-1.5">
                <select
                  value={formData.category}
                  onChange={(e) =>
                    handleInputChange("category", e.target.value)
                  }
                  className="h-10 px-3.5 rounded-xl border border-input bg-background text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-ring text-foreground cursor-pointer"
                >
                  <option value="">Select Category</option>
                  {categoryVar.categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
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
                {editingSubCategory
                  ? "Update Sub Category"
                  : "Save Sub Category"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubCategories;
