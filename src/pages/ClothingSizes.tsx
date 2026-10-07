import { useState, useEffect, useMemo } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import {
  Ruler,
  Plus,
  Search,
  SquarePen,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Info,
  Calendar,
  Layers,
  Filter,
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
  addSizeThunk,
  deleteSizeThunk,
  getAllSizeThunk,
  updateSizeThunk,
  type SIZE,
} from "@/store/sizeSlice";

const PAGE_LIMIT = 10;

export default function ClothingSizes() {
  const {
    sizes = [],
    total = 0,
    status,
  } = useSelector((state: RootState) => state.size);
  const dispatch = useDispatch<AppDispatch>();

  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSize, setEditingSize] = useState<SIZE | null>(null);

  // Form State
  const [formName, setFormName] = useState("");
  const [formMinAge, setFormMinAge] = useState<string>("");
  const [formMaxAge, setFormMaxAge] = useState<string>("");
  const [formAgeUnit, setFormAgeUnit] = useState<SIZE["ageUnit"]>("year");
  const [formDescription, setFormDescription] = useState("");
  const [formStatus, setFormStatus] = useState<SIZE["status"]>("active");
  const [formError, setFormError] = useState<string | null>(null);

  // Delete State
  const [deletingSize, setDeletingSize] = useState<SIZE | null>(null);

  // Open Modal for Add
  const handleOpenAddModal = () => {
    setEditingSize(null);
    setFormName("");
    setFormMinAge("");
    setFormMaxAge("");
    setFormAgeUnit("year");
    setFormDescription("");
    setFormStatus("");
    setFormError(null);
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEditModal = (size: SIZE) => {
    setEditingSize(size);
    setFormName(size.name);
    setFormMinAge(size.minAge.toString());
    setFormMaxAge(size.maxAge.toString());
    setFormAgeUnit(size.ageUnit || "year");
    setFormDescription(size.description);
    setFormStatus(size.status);
    setFormError(null);
    setIsModalOpen(true);
  };

  // Format age for display
  const formatAgeRange = (min: number, max: number, ageUnit: string) => {
    if (min === max) return `${min} ${ageUnit}`;
    return `${min} – ${max} ${ageUnit}`;
  };

  // Save (Create / Edit)
  const handleSaveSize = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formName.trim()) {
      setFormError("Please enter a size name.");
      return;
    }

    const minNum = parseFloat(formMinAge);
    const maxNum = parseFloat(formMaxAge);

    if (isNaN(minNum) || minNum < 0) {
      setFormError("Minimum age must be a valid number (0 or greater).");
      return;
    }

    if (isNaN(maxNum) || maxNum < 0) {
      setFormError("Maximum age must be a valid number (0 or greater).");
      return;
    }

    if (maxNum < minNum) {
      setFormError("Maximum age cannot be lower than Minimum age.");
      return;
    }

    const selectedStatus: SIZE["status"] = formStatus || "active";

    if (editingSize) {
      // Update
      const res = await dispatch(
        updateSizeThunk(editingSize._id, {
          name: formName.trim(),
          minAge: minNum,
          maxAge: maxNum,
          ageUnit: formAgeUnit,
          description: formDescription.trim(),
          status: selectedStatus,
        }),
      );
      if (res) {
        setIsModalOpen(false);
        setEditingSize(null);
      }
    } else {
      // Add
      const res = await dispatch(
        addSizeThunk({
          name: formName.trim(),
          minAge: minNum,
          maxAge: maxNum,
          ageUnit: formAgeUnit,
          description: formDescription.trim(),
          status: selectedStatus,
        }),
      );
      if (res) {
        setIsModalOpen(false);
      }
    }
  };

  // Delete Handler
  const handleConfirmDelete = async () => {
    if (!deletingSize) return;
    const res = await dispatch(deleteSizeThunk(deletingSize._id));
    if (res) {
      setDeletingSize(null);
    }
  };

  // Infinite Scroll fetch more
  const fetchMoreSizes = () => {
    if (status === "loading" || sizes.length >= total) return;
    dispatch(
      getAllSizeThunk({
        query: searchQuery.trim(),
        offset: sizes.length,
        limit: PAGE_LIMIT,
      }),
    );
  };

  // Debounced initial fetch & search query
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      dispatch(
        getAllSizeThunk(
          {
            query: searchQuery.trim(),
            offset: 0,
            limit: PAGE_LIMIT,
          },
          controller.signal,
        ),
      );
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery, dispatch]);

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

      {/* Quick Stats Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card p-4 rounded-2xl border border-border flex items-center gap-4 shadow-xs">
          <div className="p-3 rounded-xl bg-muted text-foreground">
            <Ruler className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Total Sizes
            </p>
            <p className="text-xl font-extrabold text-foreground">{total}</p>
          </div>
        </div>

        <div className="bg-card p-4 rounded-2xl border border-border flex items-center gap-4 shadow-xs">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Active Sizes
            </p>
            <p className="text-xl font-extrabold text-foreground">
              {sizes.filter((s) => s.status?.toLowerCase() === "active").length}
            </p>
          </div>
        </div>

        <div className="bg-card p-4 rounded-2xl border border-border flex items-center gap-4 shadow-xs">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Inactive Sizes
            </p>
            <p className="text-xl font-extrabold text-foreground">
              {
                sizes.filter((s) => s.status?.toLowerCase() === "inactive")
                  .length
              }
            </p>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-card p-4 rounded-2xl border border-border shadow-xs">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search size name, age range, description..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
            }}
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
                {searchQuery
                  ? "Try adjusting your search criteria."
                  : "Get started by creating your first clothing size specification."}
              </p>
              {!searchQuery && (
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
              hasMore={sizes.length < total}
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
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setDeletingSize(size)}
                          className="h-8 w-8 text-rose-500 border-border hover:bg-rose-500/10 cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
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
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => setDeletingSize(size)}
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
        </CardContent>
      </Card>

      {/* Add / Edit Size Modal Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
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
              {/* Form Error Banner */}
              {formError && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs font-semibold">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Size Name */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Size Name <span className="text-destructive">*</span>
                </label>
                <Input
                  placeholder="e.g., 2-3 Years, 4-5 YRS, Newborn"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
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
                    value={formMinAge}
                    onChange={(e) => setFormMinAge(e.target.value)}
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
                    value={formMaxAge}
                    onChange={(e) => setFormMaxAge(e.target.value)}
                    className="h-10 text-xs font-semibold text-foreground bg-background"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    Age Unit <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={formAgeUnit}
                    onChange={(e) =>
                      setFormAgeUnit(e.target.value as SIZE["ageUnit"])
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
                  value={formStatus}
                  onChange={(e) =>
                    setFormStatus(e.target.value as SIZE["status"])
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
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
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
                onClick={() => setIsModalOpen(false)}
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

      {/* Delete Confirmation Modal */}
      <Dialog
        open={Boolean(deletingSize)}
        onOpenChange={(open) => !open && setDeletingSize(null)}
      >
        {deletingSize && (
          <DialogContent className="sm:max-w-[420px] rounded-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base font-bold text-destructive">
                <AlertTriangle className="h-5 w-5" /> Delete Size
              </DialogTitle>
              <DialogDescription className="text-xs pt-1 text-muted-foreground">
                Are you sure you want to delete this size? This action cannot be
                undone.
              </DialogDescription>
            </DialogHeader>

            <div className="p-4 rounded-xl bg-muted border border-border my-2 space-y-1">
              <p className="text-xs font-bold text-foreground">
                Size Name:{" "}
                <span className="font-extrabold text-foreground">
                  {deletingSize.name}
                </span>
              </p>
              <p className="text-xs text-muted-foreground">
                Age Range:{" "}
                <span className="font-semibold text-foreground">
                  {formatAgeRange(
                    deletingSize.minAge,
                    deletingSize.maxAge,
                    deletingSize.ageUnit,
                  )}
                </span>
              </p>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeletingSize(null)}
                className="rounded-full text-xs cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleConfirmDelete}
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold text-xs rounded-full px-5 cursor-pointer"
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
