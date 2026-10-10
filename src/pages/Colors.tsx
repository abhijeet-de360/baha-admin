import { useState, useEffect, useRef } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import {
  Palette,
  Plus,
  Search,
  SquarePen,
  Trash2,
  Copy,
  Check,
  RefreshCw,
  Hash,
} from "lucide-react";
import Wheel from "@uiw/react-color-wheel";
import Sketch from "@uiw/react-color-sketch";
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
  type ColorItem,
  addColor,
  updateColor,
  deleteColor,
  getColors,
  toogleModal,
} from "@/store/colorSlice";
import { warningHandler } from "@/shared/_helper/responseHelper";

export default function Colors() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    colors = [],
    total = 0,
    status,
    isModalOpen,
  } = useSelector((state: RootState) => state.color);

  const [hasMore, setHasMore] = useState(true);

  // Ref
  const searchTimeoutRef = useRef<any>(null);

  // Modal States
  const [editingColor, setEditingColor] = useState<ColorItem | null>(null);
  const [deletingColor, setDeletingColor] = useState<ColorItem | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    hexCode: "#38BDF8",
    status: "active",
  });

  const [formVar, setFormVar] = useState({
    keyword: "",
    limit: 10,
    offset: 0,
    status: "all",
  });

  // UI state
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [pickerMode, setPickerMode] = useState<"wheel" | "sketch">("wheel");

  // Infinite Scroll fetch more
  const fetchMoreColors = () => {
    if (status === "loading" || colors.length >= total) return;

    const newOffset = formVar.offset + formVar.limit;

    dispatch(
      getColors(
        formVar.keyword,
        formVar.limit,
        newOffset,
        formVar.status === "all" ? "" : formVar.status,
      ),
    );

    setFormVar((prev) => ({ ...prev, offset: newOffset }));

    if (newOffset + formVar.limit >= total) {
      setHasMore(false);
    }
  };

  useEffect(() => {
    if (colors.length >= total && total > 0) {
      setHasMore(false);
    } else {
      setHasMore(true);
    }
  }, [colors.length, total]);

  // Handle search colors
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
        getColors(
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
      getColors(
        formVar.keyword,
        formVar.limit,
        0,
        status === "all" ? "" : status,
      ),
    );
  };

  // Hex Validation helper
  const isValidHex = (hex: string): boolean => {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/i.test(hex);
  };

  // Handle Hex Input change with auto # prefix
  const handleHexInputChange = (val: string) => {
    let formatted = val.trim();
    if (formatted && !formatted.startsWith("#")) {
      formatted = "#" + formatted;
    }
    handleInputChange("hexCode", formatted);
  };

  // Open Modal for Add
  const handleOpenAddModal = () => {
    setEditingColor(null);
    setFormData({
      name: "",
      hexCode: "#38BDF8",
      status: "active",
    });
    dispatch(toogleModal(true));
  };

  // Open Modal for Edit
  const handleOpenEditModal = (color: ColorItem) => {
    setEditingColor(color);
    setFormData({
      name: color.name,
      hexCode: color.hexCode,
      status: color.status,
    });
    dispatch(toogleModal(true));
  };

  // Save / Update Color
  const handleSaveColor = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      warningHandler("Please enter a color name.");
      return;
    }

    if (!isValidHex(formData.hexCode)) {
      warningHandler("Please enter a valid HEX code (e.g. #FF5733 or #FFF).");
      return;
    }

    const cleanHex = formData.hexCode.toUpperCase();

    if (editingColor) {
      // Update Color
      await dispatch(
        updateColor(editingColor._id, {
          name: formData.name.trim(),
          hexCode: cleanHex,
          status: formData.status,
          slug: editingColor.slug,
        }),
      );
    } else {
      // Create Color
      await dispatch(
        addColor({
          name: formData.name.trim(),
          hexCode: cleanHex,
          status: formData.status,
        }),
      );
    }
  };

  // Delete Color
  const handleDelete = (id: string) => {
    dispatch(deleteColor(id));
  };

  // Copy HEX to clipboard
  const handleCopyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  // Calculate Contrast Color for badge/text
  const getContrastTextColor = (hex: string) => {
    if (!isValidHex(hex)) return "#ffffff";
    const c = hex.replace("#", "");
    const fullHex =
      c.length === 3
        ? c
            .split("")
            .map((x) => x + x)
            .join("")
        : c;
    const r = parseInt(fullHex.substring(0, 2), 16);
    const g = parseInt(fullHex.substring(2, 4), 16);
    const b = parseInt(fullHex.substring(4, 6), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 128 ? "#0f172a" : "#ffffff";
  };

  // Handle input change
  const handleInputChange = (name: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (colors.length <= 0 || total === 0) {
      dispatch(
        getColors(
          formVar.keyword,
          formVar.limit,
          formVar.offset,
          formVar.status === "all" ? "" : formVar.status,
        ),
      );
    }
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-6 rounded-3xl border border-border">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary text-primary-foreground shadow-md">
              <Palette className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Colors
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Manage product colors and HEX swatches available for your kids
            clothing products.
          </p>
        </div>

        <Button
          onClick={handleOpenAddModal}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-2xl px-5 py-2.5 shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center gap-2 shrink-0 text-xs"
        >
          <Plus className="h-4 w-4" /> Add Color
        </Button>
      </div>

      {/* Main List Container */}
      <Card className="rounded-3xl border border-border shadow-xs overflow-hidden bg-card">
        {/* Controls Bar */}
        <div className="p-4 sm:p-6 border-b border-border space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search color name or #HEX code..."
                value={formVar.keyword}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 h-10 text-xs rounded-xl border-border bg-background shadow-2xs font-semibold"
              />
            </div>

            {/* Filters and View Switcher */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Status Filter */}
              <div className="flex items-center gap-1 bg-muted p-1 rounded-xl">
                {(["all", "active", "inactive"] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => handleStatusChange(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer capitalize ${
                      formVar.status === st
                        ? "bg-background text-foreground shadow-2xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <CardContent className="p-0">
          {colors?.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="p-4 rounded-full bg-muted inline-block text-muted-foreground">
                <Palette className="h-8 w-8" />
              </div>
              <h3 className="text-sm font-bold text-foreground">
                {status === "loading" ? "Loading colors..." : "No colors found"}
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {formVar.keyword
                  ? `No color matched your search "${formVar.keyword}". Try searching for another color name or add a new color.`
                  : "Get started by creating your first product color."}
              </p>
              <Button
                onClick={handleOpenAddModal}
                size="sm"
                className="bg-black text-white dark:bg-white dark:text-black rounded-xl text-xs font-semibold cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Color
              </Button>
            </div>
          ) : (
            <InfiniteScroll
              dataLength={colors.length}
              next={fetchMoreColors}
              hasMore={hasMore}
              loader={
                <div className="py-4 text-center text-xs text-muted-foreground font-medium">
                  Loading more colors...
                </div>
              }
              endMessage={
                colors.length > 0 && (
                  <div className="py-4 text-center text-xs text-muted-foreground font-medium">
                    Showing all {colors.length} of {total} colors
                  </div>
                )
              }
            >
              {/* Mobile & Tablet Card View (screens smaller than lg) */}
              <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
                {colors?.map((color) => {
                  const isCopied = copiedHex === color.hexCode;
                  return (
                    <Card
                      key={color._id}
                      className="rounded-2xl border border-border/70 bg-card/60 shadow-xs hover:border-primary/40 transition-all p-4 space-y-3"
                    >
                      {/* Swatch & Status Header */}
                      <div className="flex items-center justify-between gap-3 border-b border-border/50 pb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="h-10 w-10 rounded-full border-2 border-white shadow-md ring-1 ring-border shrink-0"
                            style={{ backgroundColor: color.hexCode }}
                          />
                          <div>
                            <h4 className="font-bold text-foreground text-sm">
                              {color.name}
                            </h4>
                            <p className="text-[11px] text-muted-foreground font-mono">
                              {color.createdAt
                                ? new Date(color.createdAt)
                                    .toISOString()
                                    .split("T")[0]
                                : "—"}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border capitalize shrink-0 ${
                            color.status?.toLowerCase() === "active"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                              : "bg-muted text-muted-foreground border-border"
                          }`}
                        >
                          {color.status}
                        </span>
                      </div>

                      {/* HEX Code Bar */}
                      <div className="flex items-center justify-between bg-muted/40 p-2.5 rounded-xl border border-border/40 text-xs">
                        <span className="text-muted-foreground font-medium">
                          HEX Code:
                        </span>
                        <div className="inline-flex items-center gap-1.5 font-mono font-bold text-foreground">
                          <span>{color.hexCode}</span>
                          <button
                            onClick={() => handleCopyHex(color.hexCode)}
                            className="cursor-pointer text-muted-foreground hover:text-foreground"
                            title="Copy HEX"
                          >
                            {isCopied ? (
                              <Check className="h-3.5 w-3.5 text-primary" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-border/40">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleOpenEditModal(color)}
                          className="h-8 w-8 text-amber-500 border-border hover:bg-amber-500/10 cursor-pointer"
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
                                Delete this Color?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will
                                permanently delete this Color.
                              </AlertDialogDescription>
                            </AlertDialogHeader>

                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-600 hover:bg-red-700"
                                onClick={() => handleDelete(color?._id)}
                              >
                                Yes, delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* Desktop Table View (screens lg and larger) */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      <th className="py-3.5 px-6">Color Swatch</th>
                      <th className="py-3.5 px-6">Color Name</th>
                      <th className="py-3.5 px-6">HEX Code</th>
                      <th className="py-3.5 px-6">Status</th>
                      <th className="py-3.5 px-6">Created Date</th>
                      <th className="py-3.5 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-xs">
                    {colors?.map((color) => {
                      const isCopied = copiedHex === color.hexCode;
                      return (
                        <tr
                          key={color._id}
                          className="hover:bg-muted/30 transition-colors group"
                        >
                          {/* Swatch */}
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div
                                className="h-10 w-10 rounded-full border-2 border-white shadow-md ring-1 ring-border shrink-0 flex items-center justify-center transition-transform group-hover:scale-110"
                                style={{ backgroundColor: color.hexCode }}
                              />
                            </div>
                          </td>

                          {/* Name */}
                          <td className="py-4 px-6 font-bold text-foreground text-sm">
                            {color.name}
                          </td>

                          {/* HEX Code */}
                          <td className="py-4 px-6 font-mono font-semibold">
                            <div className="inline-flex items-center gap-1.5 bg-muted text-foreground px-2.5 py-1 rounded-lg border border-border">
                              <Hash className="h-3 w-3 text-muted-foreground" />
                              <span>{color.hexCode}</span>
                              <button
                                onClick={() => handleCopyHex(color.hexCode)}
                                className="cursor-pointer text-muted-foreground hover:text-foreground ml-1"
                                title="Copy HEX"
                              >
                                {isCopied ? (
                                  <Check className="h-3.5 w-3.5 text-primary" />
                                ) : (
                                  <Copy className="h-3.5 w-3.5" />
                                )}
                              </button>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-4 px-6">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border capitalize ${
                                color.status?.toLowerCase() === "active"
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                  : "bg-muted text-muted-foreground border-border"
                              }`}
                            >
                              {color.status}
                            </span>
                          </td>

                          {/* Created Date */}
                          <td className="py-4 px-6 text-muted-foreground font-mono">
                            {color.createdAt
                              ? new Date(color.createdAt)
                                  .toISOString()
                                  .split("T")[0]
                              : "—"}
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleOpenEditModal(color)}
                                title="Edit"
                                className="h-8 w-8 text-amber-500 border-border hover:bg-amber-500/10 cursor-pointer"
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
                                      Delete this Color?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. This will
                                      permanently delete this Color.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>

                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-red-600 hover:bg-red-700"
                                      onClick={() => handleDelete(color?._id)}
                                    >
                                      Yes, delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </InfiniteScroll>
          )}
        </CardContent>
      </Card>

      {/* Add / Edit Color Modal */}
      <Dialog
        open={isModalOpen}
        onOpenChange={(open) => {
          dispatch(toogleModal(open));
        }}
      >
        <DialogContent className="sm:max-w-xl rounded-3xl p-6 overflow-hidden">
          <form onSubmit={handleSaveColor}>
            <DialogHeader className="pb-2">
              <DialogTitle className="flex items-center gap-2 text-base font-bold">
                <Palette className="h-5 w-5 text-primary" />
                {editingColor ? "Edit Product Color" : "Add New Product Color"}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Pick a color visually with the color picker or type a HEX code
                manually.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {/* Top inputs: Color Name + Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Color Name */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    Color Name <span className="text-destructive">*</span>
                  </label>
                  <Input
                    placeholder="e.g. Coral Pink, Sky Blue"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="h-9 text-xs font-semibold placeholder:text-muted-foreground/40"
                    required
                  />
                </div>

                {/* Status */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    Status <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      handleInputChange("status", e.target.value)
                    }
                    className="w-full h-9 px-3 rounded-xl border border-input bg-background text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-ring"
                    required
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Color Picker & Realtime Preview Split View */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-muted/40 p-4 rounded-2xl border border-border">
                {/* Visual Color Picker */}
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="flex items-center justify-between w-full pb-1">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      Color Picker
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setPickerMode(
                          pickerMode === "wheel" ? "sketch" : "wheel",
                        )
                      }
                      className="text-[10px] text-primary font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="h-3 w-3" /> Toggle Picker Mode
                    </button>
                  </div>

                  {pickerMode === "wheel" ? (
                    <Wheel
                      color={
                        isValidHex(formData.hexCode)
                          ? formData.hexCode
                          : "#38BDF8"
                      }
                      onChange={(color) => {
                        handleInputChange("hexCode", color.hex.toUpperCase());
                      }}
                      width={150}
                      height={150}
                    />
                  ) : (
                    <Sketch
                      color={
                        isValidHex(formData.hexCode)
                          ? formData.hexCode
                          : "#38BDF8"
                      }
                      onChange={(color) => {
                        handleInputChange("hexCode", color.hex.toUpperCase());
                      }}
                      disableAlpha
                      style={{
                        boxShadow: "none",
                        borderRadius: "12px",
                        border: "1px solid #e2e8f0",
                        width: "100%",
                      }}
                    />
                  )}
                </div>

                {/* Manual HEX Input & Swatch Preview */}
                <div className="flex flex-col justify-between space-y-3">
                  {/* HEX Input */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <Hash className="h-3 w-3" /> HEX Code{" "}
                      <span className="text-destructive">*</span>
                    </label>
                    <Input
                      placeholder="#FF5733"
                      value={formData.hexCode}
                      onChange={(e) => handleHexInputChange(e.target.value)}
                      className="h-9 text-xs font-mono font-bold uppercase placeholder:text-muted-foreground/40"
                      maxLength={7}
                      required
                    />
                  </div>

                  {/* Realtime Color Preview Box */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                      Live Color Preview
                    </span>
                    <div
                      className="h-20 rounded-xl shadow-md border-2 border-background ring-1 ring-border flex flex-col justify-between p-2.5 transition-all"
                      style={{
                        backgroundColor: isValidHex(formData.hexCode)
                          ? formData.hexCode
                          : "#e2e8f0",
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className="text-[10px] font-extrabold px-2 py-0.5 rounded-full"
                          style={{
                            color: getContrastTextColor(
                              isValidHex(formData.hexCode)
                                ? formData.hexCode
                                : "#ffffff",
                            ),
                            backgroundColor: "rgba(0,0,0,0.15)",
                          }}
                        >
                          {formData.name || "Color Swatch"}
                        </span>
                        <span
                          className="text-[10px] font-mono font-bold"
                          style={{
                            color: getContrastTextColor(
                              isValidHex(formData.hexCode)
                                ? formData.hexCode
                                : "#ffffff",
                            ),
                          }}
                        >
                          {formData.hexCode}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => dispatch(toogleModal(false))}
                className="rounded-full text-xs cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={status === "loading"}
                className="rounded-full font-semibold text-xs px-5 cursor-pointer"
              >
                {editingColor ? "Update Color" : "Save Color"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
