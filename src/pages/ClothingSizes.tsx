import { useState, useEffect, useRef } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import {
  Ruler,
  Plus,
  Search,
  SquarePen,
  Trash2,
  Info,
  Calendar,
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
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import {
  addSize,
  deleteSize,
  getAllSize,
  toogleAddModal,
  updateSize,
  type SIZE,
} from "@/store/sizeSlice";
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
import { warningHandler } from "@/shared/_helper/responseHelper";

export default function ClothingSizes() {
  const {
    isAddModalOpen,
    sizes = [],
    total = 0,
    status,
  } = useSelector((state: RootState) => state.size);
  const dispatch = useDispatch<AppDispatch>();

  // Ref
  const searchTimeoutRef = useRef<any>(null);

  // Modal State
  const [editingSize, setEditingSize] = useState<SIZE | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    minAge: "",
    maxAge: "",
    ageUnit: "year",
    description: "",
    status: "active",
  });

  const [formVar, setFormVar] = useState({
    keyword: "",
    limit: 10,
    offset: 0,
    status: "",
  });

  const [hasMore, setHasMore] = useState(true);

  // Open Modal for Add
  const handleOpenAddModal = () => {
    setEditingSize(null);
    setFormData({
      name: "",
      minAge: "",
      maxAge: "",
      ageUnit: "year",
      description: "",
      status: "active",
    });
    dispatch(toogleAddModal(true));
  };

  // Open Modal for Edit
  const handleOpenEditModal = (size: SIZE) => {
    setEditingSize(size);
    setFormData({
      name: size.name,
      minAge: size.minAge.toString(),
      maxAge: size.maxAge.toString(),
      ageUnit: size.ageUnit,
      description: size.description || "",
      status: size.status,
    });
    dispatch(toogleAddModal(true));
  };

  // Format age for display
  const formatAgeRange = (min: number, max: number, ageUnit: string) => {
    if (min === max) return `${min} ${ageUnit}`;
    return `${min} – ${max} ${ageUnit}`;
  };

  // Handle input change
  const handleInputChange = (name: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Save (Create / Edit)
  const handleSaveSize = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      warningHandler("Please enter a size name.");
      return;
    }

    const minNum = parseFloat(formData.minAge);
    const maxNum = parseFloat(formData.maxAge);

    if (isNaN(minNum) || minNum < 0) {
      warningHandler("Minimum age must be a valid number (0 or greater).");
      return;
    }

    if (isNaN(maxNum) || maxNum < 0) {
      warningHandler("Maximum age must be a valid number (0 or greater).");
      return;
    }

    if (maxNum < minNum) {
      warningHandler("Maximum age cannot be lower than Minimum age.");
      return;
    }

    const selectedStatus: SIZE["status"] = formData.status || "active";

    if (editingSize) {
      // Update
      const res = await dispatch(
        updateSize(editingSize._id, {
          name: formData.name.trim(),
          minAge: minNum,
          maxAge: maxNum,
          ageUnit: formData.ageUnit,
          description: formData.description.trim(),
          status: selectedStatus,
        }),
      );
      if (res) {
        setEditingSize(null);
      }
    } else {
      // Add
      await dispatch(
        addSize({
          name: formData.name.trim(),
          minAge: minNum,
          maxAge: maxNum,
          ageUnit: formData.ageUnit,
          description: formData.description.trim(),
          status: selectedStatus,
        }),
      );
    }
  };

  const handleDelete = (id: string) => {
    dispatch(deleteSize(id));
  };

  // Infinite Scroll fetch more
  const fetchMoreSizes = async () => {
    if (status === "loading" || sizes.length >= total) return;

    const newOffset = formVar.offset + formVar.limit;

    await dispatch(
      getAllSize(formVar.keyword, formVar.limit, newOffset, formVar.status),
    );

    setFormVar((prev) => ({
      ...prev,
      offset: newOffset,
    }));

    if (newOffset + formVar.limit >= total) {
      setHasMore(false);
    }
  };

  useEffect(() => {
    if (sizes.length >= total && total > 0) {
      setHasMore(false);
    } else {
      setHasMore(true);
    }
  }, [sizes.length, total]);

  // Handle search sizes
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
        getAllSize(searchTerm, formVar.limit, formVar.offset, formVar.status),
      );
    }, 500);
  };

  useEffect(() => {
    if (sizes.length <= 0) {
      dispatch(
        getAllSize(
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
              <Ruler className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Clothing Sizes
            </h1>
          </div>
          <p className="text-xs text-muted-foreground sm:pl-10">
            Manage kids clothing sizes based on age groups in years.
          </p>
        </div>

        {/* Add Size Button */}
        <Button
          onClick={handleOpenAddModal}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs px-4 py-2.5 rounded-xl gap-2 shadow-md shrink-0 cursor-pointer transition-all"
        >
          <Plus className="h-4 w-4" /> Add Size
        </Button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-card p-4 rounded-2xl border border-border shadow-xs">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search size name, age range, description..."
            value={formVar.keyword}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 h-10 bg-background text-xs placeholder:text-muted-foreground/40"
          />
        </div>
      </div>

      {/* Main Sizes Table Card */}
      <Card className="rounded-2xl border-border overflow-hidden shadow-xs">
        <CardContent className="p-0">
          {sizes.length === 0 && status !== "loading" ? (
            <div className="p-12 text-center space-y-3">
              <div className="p-3.5 rounded-full bg-muted text-muted-foreground w-fit mx-auto">
                <Ruler className="h-8 w-8" />
              </div>
              <h3 className="text-sm font-bold text-foreground">
                No sizes found
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {formVar.keyword
                  ? "Try adjusting your search criteria."
                  : "Get started by creating your first clothing size specification."}
              </p>
              {!formVar.keyword && (
                <Button
                  onClick={handleOpenAddModal}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs rounded-xl px-4 py-2 mt-2"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Size
                </Button>
              )}
            </div>
          ) : (
            <InfiniteScroll
              dataLength={sizes.length}
              next={fetchMoreSizes}
              hasMore={hasMore}
              loader={
                <div className="py-6 text-center text-xs text-muted-foreground font-semibold flex items-center justify-center gap-2">
                  <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  Loading more sizes...
                </div>
              }
              endMessage={
                sizes.length > 0 && (
                  <div className="py-6 text-center text-xs text-muted-foreground font-medium border-t border-border/50">
                    Showing all {sizes.length} of {total} sizes
                  </div>
                )
              }
            >
              {/* Mobile & Tablet Card Layout (< lg screens) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 xl:hidden">
                {sizes.map((size) => (
                  <div
                    key={size._id}
                    className="p-4 rounded-xl border border-border bg-card hover:border-border/80 transition-all shadow-xs flex flex-col justify-between space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center font-extrabold text-foreground text-xs border border-border/60">
                          {size.name}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-foreground">
                            {formatAgeRange(
                              size.minAge,
                              size.maxAge,
                              size.ageUnit,
                            )}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          size.status === "Active"
                            ? "bg-emerald-500/15 text-emerald-600"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            size.status === "Active"
                              ? "bg-emerald-500"
                              : "bg-muted-foreground"
                          }`}
                        />
                        {size.status}
                      </span>
                    </div>

                    {size.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 bg-muted/30 p-2 rounded-lg">
                        {size.description}
                      </p>
                    )}

                    <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {size.createdAt}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleOpenEditModal(size)}
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
                                Delete this Size?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will
                                permanently delete this Size.
                              </AlertDialogDescription>
                            </AlertDialogHeader>

                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-600 hover:bg-red-700"
                                onClick={() => handleDelete(size?._id)}
                              >
                                Yes, delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View (lg+ screens) */}
              <div className="hidden xl:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-muted/40 text-[11px] font-bold uppercase tracking-wider">
                      <th className="py-3.5 px-5">Size Name</th>
                      <th className="py-3.5 px-4">Age Range</th>
                      <th className="py-3.5 px-4">Min Age</th>
                      <th className="py-3.5 px-4">Max Age</th>
                      <th className="py-3.5 px-4">Description</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Created Date</th>
                      <th className="py-3.5 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-xs">
                    {sizes.map((size) => (
                      <tr
                        key={size._id}
                        className="hover:bg-muted/30 transition-colors group"
                      >
                        {/* Size Name */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-2.5">
                            <span className="font-bold text-muted-foreground">
                              {size.name}
                            </span>
                          </div>
                        </td>

                        {/* Age Range */}
                        <td className="py-4 px-4 font-semibold text-muted-foreground">
                          {formatAgeRange(
                            size.minAge,
                            size.maxAge,
                            size.ageUnit,
                          )}
                        </td>

                        {/* Min Age */}
                        <td className="py-4 px-4 font-medium text-muted-foreground">
                          {size.minAge} {size.ageUnit}
                        </td>

                        {/* Max Age */}
                        <td className="py-4 px-4 font-medium text-muted-foreground">
                          {size.maxAge} {size.ageUnit}
                        </td>

                        {/* Description */}
                        <td className="py-4 px-4 text-muted-foreground max-w-xs truncate">
                          {size.description || "—"}
                        </td>

                        {/* Status */}
                        <td className="py-4 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                              size.status === "Active"
                                ? "bg-emerald-500/15 text-emerald-600"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                size.status === "Active"
                                  ? "bg-emerald-500"
                                  : "bg-muted-foreground"
                              }`}
                            />
                            {size.status}
                          </span>
                        </td>

                        {/* Created Date */}
                        <td className="py-4 px-4 text-muted-foreground font-mono text-[11px]">
                          {size.createdAt}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleOpenEditModal(size)}
                              title="Edit"
                              className="h-8 w-8 text-amber-400 border-border hover:bg-amber-500/10 cursor-pointer"
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
                                    Delete this Size?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will
                                    permanently delete this Size.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>

                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-red-600 hover:bg-red-700"
                                    onClick={() => handleDelete(size?._id)}
                                  >
                                    Yes, delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </InfiniteScroll>
          )}
        </CardContent>
      </Card>

      {/* Add / Edit Size Modal Dialog */}
      <Dialog
        open={isAddModalOpen}
        onOpenChange={(open) => {
          dispatch(toogleAddModal(open));
          setEditingSize(null);
        }}
      >
        <DialogContent className="sm:max-w-[480px] rounded-2xl">
          <form onSubmit={handleSaveSize}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base font-bold">
                <Ruler className="h-5 w-5 text-foreground" />
                {editingSize ? "Edit Clothing Size" : "Add New Clothing Size"}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Enter size name, minimum/maximum age ranges, and status.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Size Name */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Size Name <span className="text-destructive">*</span>
                </label>
                <Input
                  placeholder="e.g., 2-3 Years, 4-5 YRS, Newborn"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="h-10 text-xs font-semibold text-foreground bg-background"
                  required
                />
              </div>

              {/* Age Range & Unit Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    Min Age <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="e.g., 2"
                    value={formData.minAge}
                    onChange={(e) =>
                      handleInputChange("minAge", e.target.value)
                    }
                    className="h-10 text-xs font-semibold text-foreground bg-background"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    Max Age <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="e.g., 3"
                    value={formData.maxAge}
                    onChange={(e) =>
                      handleInputChange("maxAge", e.target.value)
                    }
                    className="h-10 text-xs font-semibold text-foreground bg-background"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    Age Unit <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={formData.ageUnit}
                    onChange={(e) =>
                      handleInputChange("ageUnit", e.target.value)
                    }
                    className="w-full h-10 px-3 rounded-xl border border-input bg-background text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-ring text-foreground cursor-pointer"
                    required
                  >
                    <option value="month">Month</option>
                    <option value="year">Year</option>
                  </select>
                </div>
              </div>

              {/* Status Select */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Status <span className="text-destructive">*</span>
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange("status", e.target.value)}
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

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Description{" "}
                  <span className="text-muted-foreground font-normal">
                    (Optional)
                  </span>
                </label>
                <textarea
                  placeholder="Optional details e.g., Toddlers aged 3 to 4 years..."
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  rows={3}
                  className="w-full p-3 rounded-xl border border-input bg-background text-xs font-medium focus:outline-none focus:ring-1 focus:ring-ring resize-y"
                />
              </div>

              <div className="p-3 rounded-xl bg-muted/40 border border-border flex items-start gap-2 text-[11px] text-muted-foreground">
                <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p>
                  Sizes will be automatically displayed to customers on product
                  detail pages when filtering by age group.
                </p>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => dispatch(toogleAddModal(false))}
                className="rounded-xl text-xs cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={status === "loading"}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs rounded-xl px-5 cursor-pointer disabled:opacity-50"
              >
                {status === "loading"
                  ? "Saving..."
                  : editingSize
                    ? "Update Size"
                    : "Save Size"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
