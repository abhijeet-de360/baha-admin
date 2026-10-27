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
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { formatDataString } from "@/lib/utils";

export default function ClothingSizes() {
  const sizesVar = useSelector((state: RootState) => state.size);
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
    status: "all",
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
      await dispatch(
        updateSize(editingSize._id, {
          name: formData.name.trim(),
          minAge: minNum,
          maxAge: maxNum,
          ageUnit: formData.ageUnit,
          description: formData.description.trim(),
          status: selectedStatus,
        }),
      ).finally(() => {
        setEditingSize(null);
      });
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
  const fetchMoreSizes = () => {
    if (
      sizesVar.status === "loading" ||
      sizesVar.sizes.length >= sizesVar.total
    )
      return;

    const newOffset = formVar.offset + formVar.limit;

    dispatch(
      getAllSize(
        formVar.keyword,
        formVar.limit,
        newOffset,
        formVar.status === "all" ? "" : formVar.status,
      ),
    );

    setFormVar((prev) => ({
      ...prev,
      offset: newOffset,
    }));

    if (newOffset + formVar.limit >= sizesVar.total) {
      setHasMore(false);
    }
  };

  useEffect(() => {
    if (sizesVar.sizes.length >= sizesVar.total && sizesVar.total > 0) {
      setHasMore(false);
    } else {
      setHasMore(true);
    }
  }, [sizesVar.sizes.length, sizesVar.total]);

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
        getAllSize(
          searchTerm,
          formVar.limit,
          0,
          formVar.status === "all" ? "" : formVar.status,
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
      getAllSize(
        formVar.keyword,
        formVar.limit,
        0,
        status === "all" ? "" : status,
      ),
    );
  };

  useEffect(() => {
    dispatch(
      getAllSize(
        formVar.keyword,
        formVar.limit,
        formVar.offset,
        formVar.status === "all" ? "" : formVar.status,
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

      {/* Main Sizes Card */}
      <Card className="rounded-3xl border border-border shadow-xs overflow-hidden bg-card">
        {/* Search & Filter Toolbar */}
        <div className="p-4 sm:p-6 border-b border-border space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search size name, age range, description..."
                value={formVar.keyword}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 h-10 bg-background text-xs placeholder:text-muted-foreground/40 font-semibold rounded-xl border-border shadow-2xs"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">
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
          {sizesVar.sizes.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="p-3.5 rounded-full bg-muted text-muted-foreground w-fit mx-auto">
                <Ruler className="h-8 w-8" />
              </div>
              <h3 className="text-sm font-bold text-foreground">
                No sizes found
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {formVar.keyword || formVar.status !== "all"
                  ? "Try adjusting your search criteria or status filter."
                  : "Get started by creating your first clothing size specification."}
              </p>
              {!formVar.keyword && formVar.status === "all" && (
                <Button
                  onClick={handleOpenAddModal}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs rounded-xl px-4 py-2 mt-2 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Size
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* ========================================= */}
              {/* Mobile & Tablet */}
              {/* ========================================= */}
              <div
                id="sizes-mobile-list"
                className="xl:hidden max-h-[600px] overflow-y-auto"
              >
                <InfiniteScroll
                  dataLength={sizesVar.sizes.length}
                  next={fetchMoreSizes}
                  hasMore={hasMore}
                  loader={
                    <div className="py-4 text-center text-xs text-muted-foreground font-medium">
                      Loading more sizes...
                    </div>
                  }
                  endMessage={
                    <div className="py-4 text-center text-xs text-muted-foreground font-medium">
                      Showing all {sizesVar.sizes.length} of {sizesVar.total} sizes
                    </div>
                  }
                  scrollableTarget="sizes-mobile-list"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                    {sizesVar.sizes.map((size) => (
                      <div
                        key={size._id}
                        className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs hover:shadow-md hover:border-primary/20 transition-all flex flex-col p-4 justify-between space-y-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <div className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center font-extrabold text-xs border border-border/60">
                              {size.name}
                            </div>
                            <div>
                              <p className="text-xs font-semibold">
                                {formatAgeRange(
                                  size.minAge,
                                  size.maxAge,
                                  size.ageUnit,
                                )}
                              </p>
                            </div>
                          </div>

                          <Badge
                            variant={
                              size.status?.toLowerCase() === "active"
                                ? "success"
                                : "secondary"
                            }
                            className="uppercase"
                          >
                            {size.status}
                          </Badge>
                        </div>

                        {size.description && (
                          <p className="text-xs line-clamp-2 bg-muted/30 p-2 rounded-lg">
                            {size.description}
                          </p>
                        )}

                        <div className="pt-2 border-t border-border flex items-center justify-between text-xs mt-auto">
                          <span className="text-[11px] flex items-center gap-1">
                            <Calendar className="h-3 w-3" />{" "}
                            {formatDataString(size.createdAt || "")}
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
                </InfiniteScroll>
              </div>

              {/* ========================================= */}
              {/* Desktop */}
              {/* ========================================= */}
              <div
                id="sizes-desktop-list"
                className="hidden xl:block max-h-[600px] overflow-y-auto"
              >
                <InfiniteScroll
                  dataLength={sizesVar.sizes.length}
                  next={fetchMoreSizes}
                  hasMore={hasMore}
                  loader={
                    <div className="py-4 text-center text-xs text-muted-foreground font-medium">
                      Loading more sizes...
                    </div>
                  }
                  endMessage={
                    <div className="py-4 text-center text-xs text-muted-foreground font-medium">
                      Showing all {sizesVar.sizes.length} of {sizesVar.total} sizes
                    </div>
                  }
                  scrollableTarget="sizes-desktop-list"
                >
                  <Table className="w-full text-left border-collapse">
                    <TableHeader>
                      <TableRow className="border-b border-border bg-muted/50 text-muted-foreground uppercase font-semibold text-[10px] tracking-wider hover:bg-muted/50">
                        <TableHead className="py-3.5 px-5">Size Name</TableHead>
                        <TableHead className="py-3.5 px-4">Age Range</TableHead>
                        <TableHead className="py-3.5 px-4">Min Age</TableHead>
                        <TableHead className="py-3.5 px-4">Max Age</TableHead>
                        <TableHead className="py-3.5 px-4">Description</TableHead>
                        <TableHead className="py-3.5 px-4">Status</TableHead>
                        <TableHead className="py-3.5 px-4">Created Date</TableHead>
                        <TableHead className="py-3.5 px-5 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-border text-xs">
                      {sizesVar.sizes.map((size) => (
                        <TableRow
                          key={size._id}
                          className="hover:bg-muted/30 transition-colors group"
                        >
                          <TableCell className="py-4 px-5 font-bold">
                            {size.name}
                          </TableCell>
                          <TableCell className="py-4 px-4 font-semibold">
                            {formatAgeRange(
                              size.minAge,
                              size.maxAge,
                              size.ageUnit,
                            )}
                          </TableCell>
                          <TableCell className="py-4 px-4 font-medium">
                            {size.minAge} {size.ageUnit}
                          </TableCell>
                          <TableCell className="py-4 px-4 font-medium">
                            {size.maxAge} {size.ageUnit}
                          </TableCell>
                          <TableCell className="py-4 px-4 max-w-xs truncate">
                            {size.description || "—"}
                          </TableCell>
                          <TableCell className="py-4 px-4">
                            <Badge
                              variant={
                                size.status?.toLowerCase() === "active"
                                  ? "success"
                                  : "secondary"
                              }
                              className="uppercase"
                            >
                              {size.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-4 px-4 font-mono text-[11px]">
                            {formatDataString(size.createdAt || "")}
                          </TableCell>
                          <TableCell className="py-4 px-5 text-right">
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

      {/* Add / Edit Size Modal Dialog */}
      <Dialog
        open={sizesVar.isAddModalOpen}
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
                  className="w-full h-10 px-3 rounded-xl border border-input bg-background text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-ring text-foreground cursor-pointer"
                  required
                >
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
                disabled={sizesVar.status === "loading"}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs rounded-xl px-5 cursor-pointer disabled:opacity-50"
              >
                {sizesVar.status === "loading"
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
