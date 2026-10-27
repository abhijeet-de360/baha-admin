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
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { warningHandler } from "@/shared/_helper/responseHelper";
import { getAllCategories } from "@/store/categorySlice";
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
import { formatDataString, generateSlug } from "@/lib/utils";

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
    status: "active",
  });

  const [formVar, setFormVar] = useState({
    keyword: "",
    limit: 10,
    offset: 0,
    status: "all",
    categoryId: "all",
  });

  const [hasMore, setHasMore] = useState(true);

  // Ref
  const searchTimeoutRef = useRef<any>(null);

  // Handle input change
  const handleInputChange = (name: keyof typeof formData, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Open modal for add
  const handleOpenAddModal = () => {
    setEditingSubCategory(null);
    setFormData({
      name: "",
      slug: "",
      category: "",
      status: "active",
    });
    dispatch(toogleModal(true));
  };

  // Open modal for edit
  const handleOpenEditModal = (subCategory: SubCategoryItem) => {
    setEditingSubCategory(subCategory);
    setFormData({
      name: subCategory.name,
      slug: subCategory.slug,
      category:
        typeof subCategory.category === "object"
          ? subCategory.category?._id
          : subCategory.category,
      status: subCategory.status || "active",
    });
    dispatch(toogleModal(true));
  };

  // Delete Handler
  const handleDelete = (id: string) => {
    dispatch(deleteSubCategory(id));
  };

  // Infinite Scroll fetch more
  const fetchMoreSubCategories = () => {
    if (
      subCategoryVar.status === "loading" ||
      subCategoryVar.subCategories.length >= subCategoryVar.total
    ) {
      return;
    }

    const newOffset = formVar.offset + formVar.limit;

    dispatch(
      getAllSubCategories(
        formVar.keyword,
        formVar.limit,
        newOffset,
        formVar.status === "all" ? "" : formVar.status,
        formVar.categoryId === "all" ? "" : formVar.categoryId,
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

  useEffect(() => {
    if (
      subCategoryVar.subCategories.length >= subCategoryVar.total &&
      subCategoryVar.total > 0
    ) {
      setHasMore(false);
    } else {
      setHasMore(true);
    }
  }, [subCategoryVar.subCategories.length, subCategoryVar.total]);

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
          formVar.categoryId === "all" ? "" : formVar.categoryId,
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
        formVar.categoryId === "all" ? "" : formVar.categoryId,
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
        formVar.status === "all" ? "" : formVar.status,
        categoryId === "all" ? "" : categoryId,
      ),
    );
  };

  // Handle save sub category
  const handleSaveSubCategory = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      warningHandler("Please enter sub category name");
      return;
    }
    if (!formData.category) {
      warningHandler("Please select category");
      return;
    }
    if (!formData.slug) {
      warningHandler("Please enter slug");
      return;
    }

    if (editingSubCategory) {
      dispatch(
        updateSubCategory(editingSubCategory._id!, {
          name: formData.name.trim(),
          slug: formData.slug,
          category: formData.category,
          status: formData.status,
        }),
      );
    } else {
      dispatch(
        addSubCategory({
          name: formData.name.trim(),
          slug: formData.slug,
          category: formData.category,
          status: formData.status,
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
    dispatch(getAllCategories("", 0, 0, ""));
    dispatch(
      getAllSubCategories(
        formVar.keyword,
        formVar.limit,
        formVar.offset,
        formVar.status === "all" ? "" : formVar.status,
        formVar.categoryId === "all" ? "" : formVar.categoryId,
      ),
    );
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

      {/* Sub Categories Content Area */}
      <Card className="rounded-3xl border border-border shadow-xs overflow-hidden bg-card">
        {/* Search & Filter Toolbar */}
        <div className="p-4 sm:p-6 border-b border-border space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search sub category name or slug..."
                value={formVar.keyword}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 h-10 bg-background text-xs placeholder:text-muted-foreground/40 font-semibold rounded-xl border-border shadow-2xs"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Category Filter */}
              <select
                value={formVar.categoryId}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="h-10 px-3.5 rounded-xl border border-input bg-background text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-ring text-foreground cursor-pointer shadow-2xs"
              >
                <option value="all">All Categories</option>
                {categoryVar.categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={formVar.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="h-10 px-3.5 rounded-xl border border-input bg-background text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-ring text-foreground cursor-pointer shadow-2xs"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        <CardContent className="p-0">
          {subCategoryVar.status !== "loading" && subCategoryVar.subCategories.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="p-3.5 rounded-full bg-muted text-muted-foreground w-fit mx-auto">
                <FolderTree className="h-8 w-8" />
              </div>
              <h3 className="text-sm font-bold text-foreground">
                No sub categories found
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {formVar.keyword ||
                formVar.status !== "all" ||
                formVar.categoryId !== "all"
                  ? "Try adjusting your search criteria or filter."
                  : "Get started by adding your first clothing sub category."}
              </p>
              {!formVar.keyword &&
                formVar.status === "all" &&
                formVar.categoryId === "all" && (
                  <Button
                    onClick={handleOpenAddModal}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs rounded-xl px-4 py-2 mt-2 cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add Sub Category
                  </Button>
                )}
            </div>
          ) : (
            <>
              {/* ========================================= */}
              {/* Mobile & Tablet */}
              {/* ========================================= */}
              <div
                id="subcategories-mobile-list"
                className="xl:hidden max-h-[600px] overflow-y-auto"
              >
                <InfiniteScroll
                  dataLength={subCategoryVar.subCategories.length}
                  next={fetchMoreSubCategories}
                  hasMore={hasMore}
                  loader={
                    <div className="py-4 text-center text-xs text-muted-foreground font-medium">
                      Loading more sub categories...
                    </div>
                  }
                  endMessage={
                    <div className="py-4 text-center text-xs text-muted-foreground font-medium">
                      Showing all {subCategoryVar.subCategories.length} of{" "}
                      {subCategoryVar.total} sub categories
                    </div>
                  }
                  scrollableTarget="subcategories-mobile-list"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
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

                          {/* Category Badge & Status */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="inline-block px-2 py-0.5 rounded bg-muted text-[11px] font-semibold text-foreground">
                              {typeof subCat.category === "object"
                                ? subCat.category?.name
                                : "—"}
                            </span>
                            <Badge
                              variant={
                                subCat.status === "active"
                                  ? "success"
                                  : "secondary"
                              }
                              className="uppercase"
                            >
                              {subCat.status}
                            </Badge>
                          </div>

                          {/* Footer: date + actions */}
                          <div className="pt-2 border-t border-border flex items-center justify-between mt-auto">
                            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDataString(
                                subCat.createdAt
                                  ? String(subCat.createdAt)
                                  : "",
                              )}
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
                                    variant="outline"
                                    size="icon"
                                    title="Delete"
                                    className="h-8 w-8 text-rose-500 border-border hover:bg-rose-500/10 cursor-pointer"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Delete this Sub Category?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. This will
                                      permanently delete this Sub Category.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-red-600 hover:bg-red-700"
                                      onClick={() => handleDelete(subCat._id!)}
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
              </div>

              {/* ========================================= */}
              {/* Desktop */}
              {/* ========================================= */}
              <div
                id="subcategories-desktop-list"
                className="hidden xl:block max-h-[600px] overflow-y-auto"
              >
                <InfiniteScroll
                  dataLength={subCategoryVar.subCategories.length}
                  next={fetchMoreSubCategories}
                  hasMore={hasMore}
                  loader={
                    <div className="py-4 text-center text-xs text-muted-foreground font-medium">
                      Loading more sub categories...
                    </div>
                  }
                  endMessage={
                    <div className="py-4 text-center text-xs text-muted-foreground font-medium">
                      Showing all {subCategoryVar.subCategories.length} of{" "}
                      {subCategoryVar.total} sub categories
                    </div>
                  }
                  scrollableTarget="subcategories-desktop-list"
                >
                  <Table className="w-full text-left border-collapse">
                    <TableHeader>
                      <TableRow className="border-b border-border bg-muted/50 text-muted-foreground uppercase font-semibold text-[10px] tracking-wider hover:bg-muted/50">
                        <TableHead className="py-3.5 px-6">Name</TableHead>
                        <TableHead className="py-3.5 px-6">Slug</TableHead>
                        <TableHead className="py-3.5 px-6">Category</TableHead>
                        <TableHead className="py-3.5 px-6">Status</TableHead>
                        <TableHead className="py-3.5 px-6">Created At</TableHead>
                        <TableHead className="py-3.5 px-6 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-border">
                      {subCategoryVar.subCategories.map((subCat) => (
                        <TableRow key={subCat._id} className="hover:bg-muted/30 transition-colors">
                          <TableCell className="py-4 px-6 font-semibold text-foreground">
                            {subCat.name}
                          </TableCell>
                          <TableCell className="py-4 px-6 font-mono text-muted-foreground">
                            {subCat.slug}
                          </TableCell>
                          <TableCell className="py-4 px-6">
                            <span className="inline-block px-2.5 py-1 rounded-md bg-muted text-xs font-semibold text-foreground">
                              {typeof subCat.category === "object"
                                ? subCat.category?.name
                                : "—"}
                            </span>
                          </TableCell>
                          <TableCell className="py-4 px-6">
                            <Badge
                              variant={
                                subCat.status === "active"
                                  ? "success"
                                  : "secondary"
                              }
                              className="uppercase"
                            >
                              {subCat.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-4 px-6 text-muted-foreground font-mono">
                            {formatDataString(
                              subCat.createdAt ? String(subCat.createdAt) : "",
                            )}
                          </TableCell>
                          <TableCell className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-1.5">
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
                                    variant="outline"
                                    size="icon"
                                    title="Delete"
                                    className="h-8 w-8 text-rose-500 border-border hover:bg-rose-500/10 cursor-pointer"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </AlertDialogTrigger>

                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Delete this Sub Category?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. This will
                                      permanently delete this Sub Category.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>

                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-red-600 hover:bg-red-700"
                                      onClick={() => handleDelete(subCat._id!)}
                                    >
                                      Yes, delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </InfiniteScroll>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Add / Edit Sub Category Modal Dialog */}
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
                Enter sub category title, URL slug, select primary category, and status.
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

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Status <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={formData.status || "active"}
                    onChange={(e) =>
                      handleInputChange("status", e.target.value)
                    }
                    className="h-10 w-full px-3.5 rounded-xl border border-input bg-background text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-ring text-foreground cursor-pointer"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
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
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Parent Category <span className="text-destructive">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    handleInputChange("category", e.target.value)
                  }
                  className="h-10 w-full px-3.5 rounded-xl border border-input bg-background text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-ring text-foreground cursor-pointer"
                  required
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
