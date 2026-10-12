import React, { useState } from "react";
import {
  Image,
  Plus,
  Search,
  Sliders,
  SquarePen,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  Layers,
  Calendar,
  Upload,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
} from "@/components/ui/alert-dialog";
import {
  type Banner,
  type BannerStatus,
  INITIAL_BANNERS,
} from "@/data/mockBanners";
import { warningHandler } from "@/shared/_helper/responseHelper";

// ─── Dummy Data for Button Link Targets ──────────────────────────────────────
const DUMMY_CATEGORIES = [
  { label: "Newborn Essentials", value: "/categories/newborn-essentials" },
  { label: "Organic Cotton", value: "/categories/organic-cotton" },
  { label: "Baby Clothing", value: "/categories/baby-clothing" },
  { label: "Feeding & Nursing", value: "/categories/feeding-nursing" },
  { label: "Bath & Skincare", value: "/categories/bath-skincare" },
  { label: "Toys & Activity", value: "/categories/toys-activity" },
  { label: "Safety & Gear", value: "/categories/safety-gear" },
];

const DUMMY_PRODUCTS = [
  { label: "Organic Cotton Onesie", value: "/products/organic-cotton-onesie" },
  {
    label: "Bamboo Swaddle Blanket",
    value: "/products/bamboo-swaddle-blanket",
  },
  { label: "Baby Carrier Wrap", value: "/products/baby-carrier-wrap" },
  { label: "Silicone Feeding Set", value: "/products/silicone-feeding-set" },
  { label: "Natural Baby Lotion", value: "/products/natural-baby-lotion" },
  { label: "Wooden Rattle Toy", value: "/products/wooden-rattle-toy" },
  { label: "Anti-Colic Bottle", value: "/products/anti-colic-bottle" },
];

export default function Banners() {
  const [banners, setBanners] = useState<Banner[]>(INITIAL_BANNERS);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");

  // Modals state
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [previewBanner, setPreviewBanner] = useState<Banner | null>(null);
  const [deletingBanner, setDeletingBanner] = useState<Banner | null>(null);

  // Form state
  const [formData, setFormData] = useState<any>({
    title: "",
    subTitle: "",
    buttonLabel: "",
    buttonLink: "",
    buttonLinkTarget: "category",
    image: "",
    status: "active",
    order: 1,
    startDate: "",
    endDate: "",
  });

  // Filter hero sliders
  const filteredBanners = banners
    .filter((b) => {
      const matchesSearch =
        b.title.toLowerCase().includes(search.toLowerCase()) ||
        b.subtitle.toLowerCase().includes(search.toLowerCase()) ||
        b.id.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        selectedStatus === "All" || b.status === selectedStatus;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => a.order - b.order);

  // Open Add modal
  const handleOpenAdd = () => {
    setEditingBanner(null);
    const nextOrder = banners.length + 1;
    setFormData({
      title: "",
      subTitle: "",
      buttonLabel: "",
      buttonLink: "",
      buttonLinkTarget: "category",
      image: "",
      status: "Active",
      order: nextOrder,
      startDate: "",
      endDate: "",
    });
    setIsAddEditOpen(true);
  };

  // Open Edit modal
  const handleOpenEdit = (banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      subTitle: banner.subTitle,
      buttonLabel: banner.buttonLabel,
      buttonLink: banner.buttonLink,
      buttonLinkTarget: banner.buttonLinkTarget,
      image: banner.image,
      status: banner.status,
      order: banner.order,
      startDate: banner.startDate || "",
      endDate: banner.endDate || "",
    });
    setIsAddEditOpen(true);
  };

  // Save Add/Edit
  const handleSaveBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.imageUrl) return;

    if (editingBanner) {
    } else {
    }

    setIsAddEditOpen(false);
  };

  // Delete slider
  const handleDeleteConfirm = () => {};

  const getStatusBadge = (status: BannerStatus) => {
    switch (status) {
      case "Active":
        return (
          <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 border-emerald-500/30 gap-1">
            <CheckCircle2 className="w-3 h-3" /> Active
          </Badge>
        );
      case "Inactive":
        return (
          <Badge className="bg-slate-500/15 text-slate-600 dark:text-slate-400 hover:bg-slate-500/25 border-slate-500/30 gap-1">
            <AlertCircle className="w-3 h-3" /> Inactive
          </Badge>
        );
      case "Scheduled":
        return (
          <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 hover:bg-amber-500/25 border-amber-500/30 gap-1">
            <Clock className="w-3 h-3" /> Scheduled
          </Badge>
        );
    }
  };

  // Image upload handler
  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormData((prev: any) => ({
      ...prev,
      image: file,
    }));
  };

  return (
    <div className="space-y-4 max-w-full mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Sliders className="w-6 h-6 text-amber-500" />
            Home Hero Sliders
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage main storefront homepage hero carousel slides, sequence
            order, and promotional CTAs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleOpenAdd} className="text-white gap-2">
            <Plus className="w-4 h-4" /> Add Hero Slide
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="bg-card border-border">
        <CardContent className="p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search hero slide title, subtitle or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-background"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 text-sm rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Mobile Card View */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:hidden gap-4">
        {filteredBanners.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground bg-card border border-border rounded-lg p-6">
            No hero slides found matching your search.
          </div>
        ) : (
          filteredBanners.map((banner) => (
            <Card
              key={banner.id}
              className="overflow-hidden border-border bg-card flex flex-col justify-between"
            >
              <div>
                {/* Image Header */}
                <div className="relative h-44 w-full bg-slate-900 overflow-hidden group">
                  <img
                    src={banner.imageUrl}
                    alt={banner.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2 flex items-center gap-1.5">
                    {getStatusBadge(banner.status)}
                  </div>
                  <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-black/60 backdrop-blur-sm text-[11px] text-white font-medium">
                    Slide Position: #{banner.order}
                  </div>
                </div>

                {/* Body */}
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-mono text-amber-500">
                      {banner.id}
                    </span>
                    {banner.startDate && (
                      <span className="flex items-center gap-1 text-[11px]">
                        <Calendar className="w-3 h-3" /> {banner.startDate} to{" "}
                        {banner.endDate || "Ongoing"}
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-foreground text-base line-clamp-1">
                    {banner.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {banner.subtitle}
                  </p>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-3 bg-muted/40 border-t border-border flex items-center justify-end gap-2">
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs text-indigo-400 border-border hover:bg-indigo-500/10 cursor-pointer"
                    onClick={() => setPreviewBanner(banner)}
                  >
                    <Eye className="h-3.5 w-3.5" /> Preview
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 text-amber-400 border-border hover:bg-amber-500/10 cursor-pointer"
                    onClick={() => handleOpenEdit(banner)}
                    title="Edit"
                  >
                    <SquarePen className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 text-rose-500 border-border hover:bg-rose-500/10 cursor-pointer"
                    onClick={() => setDeletingBanner(banner)}
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <Card className="hidden xl:block bg-card border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-muted-foreground text-xs uppercase tracking-wider">
                <th className="py-3.5 px-4 font-semibold w-16 text-center">
                  Slide #
                </th>
                <th className="py-3.5 px-4 font-semibold w-32">Slide Image</th>
                <th className="py-3.5 px-4 font-semibold">Title & Subtitle</th>
                <th className="py-3.5 px-4 font-semibold">Button CTA</th>
                <th className="py-3.5 px-4 font-semibold">Schedule</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredBanners.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-8 text-center text-muted-foreground"
                  >
                    No hero slides found.
                  </td>
                </tr>
              ) : (
                filteredBanners.map((banner) => (
                  <tr
                    key={banner.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    {/* Sequence Controls */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="font-bold text-xs text-foreground bg-muted px-1.5 py-0.5 rounded">
                          #{banner.order}
                        </span>
                      </div>
                    </td>

                    {/* Image Thumbnail */}
                    <td className="py-3 px-4">
                      <div
                        className="relative w-24 h-14 rounded-md overflow-hidden bg-slate-900 border border-border group cursor-pointer"
                        onClick={() => setPreviewBanner(banner)}
                      >
                        <img
                          src={banner.imageUrl}
                          alt={banner.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Eye className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    </td>

                    {/* Title & Details */}
                    <td className="py-3 px-4 max-w-sm">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[11px] font-mono font-medium text-amber-500">
                          {banner.id}
                        </span>
                      </div>
                      <h4 className="font-semibold text-foreground text-sm line-clamp-1">
                        {banner.title}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {banner.subtitle}
                      </p>
                    </td>

                    {/* CTA */}
                    <td className="py-3 px-4">
                      <div className="text-xs font-medium text-foreground">
                        {banner.buttonText}
                      </div>
                      <div className="text-[11px] text-muted-foreground flex items-center gap-0.5 font-mono truncate max-w-[140px]">
                        <ExternalLink className="w-2.5 h-2.5 shrink-0" />{" "}
                        {banner.buttonLink}
                      </div>
                    </td>

                    {/* Schedule */}
                    <td className="py-3 px-4 text-xs text-muted-foreground">
                      {banner.startDate ? (
                        <div>
                          <div>{banner.startDate}</div>
                          <div className="text-[11px] text-muted-foreground/70">
                            to {banner.endDate || "Forever"}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground/60 italic">
                          Always Active
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <button
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                        title="Click to toggle status"
                      >
                        {getStatusBadge(banner.status)}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setPreviewBanner(banner)}
                          title="View"
                          className="h-8 w-8 text-indigo-400 border-border hover:bg-indigo-500/10 cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleOpenEdit(banner)}
                          title="Edit"
                          className="h-8 w-8 text-amber-400 border-border hover:bg-amber-500/10 cursor-pointer"
                        >
                          <SquarePen className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setDeletingBanner(banner)}
                          title="Delete"
                          className="h-8 w-8 text-rose-500 border-border hover:bg-rose-500/10 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add / Edit Hero Slide Dialog */}
      <Dialog open={isAddEditOpen} onOpenChange={setIsAddEditOpen}>
        <DialogContent className="sm:max-w-2xl bg-card border-border max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
              <Sliders className="w-5 h-5 text-amber-500" />
              {editingBanner ? "Edit Hero Slide" : "Create New Hero Slide"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveBanner} className="space-y-4 py-2">
            {/* Title & Subtitle */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-muted-foreground">
                Hero Slide Title *
              </label>
              <Input
                placeholder="e.g. Spring Organic Collection 2026"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-muted-foreground">
                Subtitle / Tagline
              </label>
              <Input
                placeholder="e.g. Ultra-soft 100% GOTS certified organic cotton for newborns & toddlers..."
                value={formData.subTitle}
                onChange={(e) =>
                  setFormData({ ...formData, subTitle: e.target.value })
                }
              />
            </div>

            {/* Banner Image Upload */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 text-muted-foreground">
                <Image className="h-3.5 w-3.5 text-foreground" /> Banner Image *
              </label>

              {formData.image ? (
                <div className="relative h-44 w-full rounded-xl overflow-hidden border border-border bg-muted group shadow-xs">
                  <img
                    src={URL.createObjectURL(formData.image)}
                    alt="Banner Preview"
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
                        onChange={handleUploadImage}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, image: "" })}
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
                      PNG, JPG, WEBP up to 10 MB
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleUploadImage}
                  />
                </label>
              )}
            </div>

            {/* CTA Button Text & Link */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-muted-foreground">
                  Button Label
                </label>
                <Input
                  placeholder="Shop New Arrivals"
                  value={formData.buttonLabel}
                  onChange={(e) =>
                    setFormData({ ...formData, buttonLabel: e.target.value })
                  }
                />
              </div>

              {/* Button Redirect to: Select Category or Products */}
              <div>
                <label className="text-xs font-semibold uppercase text-muted-foreground">
                  Button Redirect to
                </label>
                <select
                  value={formData.buttonLinkTarget}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      buttonLinkTarget: e.target.value as
                        | "category"
                        | "product",
                    })
                  }
                  className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background text-foreground"
                >
                  <option value="category">Category</option>
                  <option value="product">Product</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-muted-foreground">
                  Button Link Target
                </label>
                <Input
                  placeholder="/categories/organic-cotton"
                  value={formData.buttonLink}
                  onChange={(e) =>
                    setFormData({ ...formData, buttonLink: e.target.value })
                  }
                  list="buttonLinkTargets"
                />
                <datalist id="buttonLinkTargets">
                  {(formData.buttonLinkTarget === "category"
                    ? DUMMY_CATEGORIES
                    : DUMMY_PRODUCTS
                  ).map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </datalist>
              </div>
            </div>

            {/* Status & Sequence */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-muted-foreground">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as BannerStatus,
                    })
                  }
                  className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background text-foreground"
                >
                  <option value="Active">Active</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-muted-foreground">
                  Slide Sequence Order
                </label>
                <Input
                  type="number"
                  min="1"
                  value={formData.order}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      order: parseInt(e.target.value) || 1,
                    })
                  }
                />
              </div>
            </div>

            {/* Schedule Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-muted-foreground">
                  Start Date (Optional)
                </label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-muted-foreground">
                  End Date (Optional)
                </label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                />
              </div>
            </div>

            <DialogFooter className="pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddEditOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-amber-500 hover:bg-amber-600 text-white"
              >
                {editingBanner ? "Save Changes" : "Create Slide"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Preview Live Hero Slide Modal */}
      {previewBanner && (
        <Dialog
          open={!!previewBanner}
          onOpenChange={() => setPreviewBanner(null)}
        >
          <DialogContent className="sm:max-w-3xl bg-slate-950 text-white border-slate-800 p-0 overflow-hidden">
            <div className="relative h-80 sm:h-96 w-full flex items-center justify-center overflow-hidden">
              <img
                src={previewBanner.imageUrl}
                alt={previewBanner.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent p-6 sm:p-10 flex flex-col justify-center max-w-xl">
                <Badge className="w-fit mb-3 bg-amber-500 text-white hover:bg-amber-600">
                  Hero Slide #{previewBanner.order}
                </Badge>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight mb-2">
                  {previewBanner.title}
                </h2>
                <p className="text-sm sm:text-base text-gray-200 mb-6 line-clamp-2">
                  {previewBanner.subtitle}
                </p>
                <div>
                  <Button className="bg-white text-black hover:bg-gray-100 font-bold px-6 py-2.5 rounded-full shadow-lg">
                    {previewBanner.buttonText} →
                  </Button>
                </div>
              </div>
            </div>
            <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-gray-400">
              <div className="flex items-center gap-3">
                <span>
                  Slide ID:{" "}
                  <strong className="text-white font-mono">
                    {previewBanner.id}
                  </strong>
                </span>
                <span>
                  Status:{" "}
                  <strong className="text-amber-400">
                    {previewBanner.status}
                  </strong>
                </span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-slate-800"
                onClick={() => setPreviewBanner(null)}
              >
                Close Preview
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Alert */}
      <AlertDialog
        open={!!deletingBanner}
        onOpenChange={() => setDeletingBanner(null)}
      >
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">
              Delete Hero Slide?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">
                "{deletingBanner?.title}"
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              Delete Slide
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
