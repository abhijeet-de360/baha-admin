import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Eye,
  Image as ImageIcon,
  Link2,
  Monitor,
  RefreshCw,
  Save,
  Smartphone,
  Sparkles,
  Upload,
  X,
  ExternalLink,
  Layers,
  Loader2,
  AlertCircle,
  Sliders,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAllCategories } from "@/store/categorySlice";
import { getAllProducts } from "@/store/productSlice";
import {
  getBannerById,
  updateBanner,
  resetBannerDetails,
} from "@/store/bannerSlice";
import { warningHandler } from "@/shared/_helper/responseHelper";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from "@/components/ui/combobox";

export interface EditBannerFormData {
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLinkTarget: "category" | "product" | "custom";
  buttonLink: string;
  image: File | string | null;
  order: number;
  status: "active" | "inactive";
  startDate: string;
  endDate: string;
}

const INITIAL_FORM: EditBannerFormData = {
  title: "",
  subtitle: "",
  buttonText: "",
  buttonLinkTarget: "category",
  buttonLink: "",
  image: "",
  order: 1,
  status: "active",
  startDate: "",
  endDate: "",
};

// Helper to safely format ISO date string to YYYY-MM-DD for date inputs
const formatDateForInput = (dateStr?: string | null): string => {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().split("T")[0];
  } catch {
    return "";
  }
};

export default function EditBanner() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();

  const [formData, setFormData] = useState<EditBannerFormData>(INITIAL_FORM);
  const [initialData, setInitialData] = useState<EditBannerFormData | null>(
    null,
  );

  const [categorySearchQuery, setCategorySearchQuery] = useState("");
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">(
    "desktop",
  );

  const searchTimeoutRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const bannerVar = useSelector((state: RootState) => state.banner);
  const categoryVar = useSelector((state: RootState) => state.category);
  const productVar = useSelector((state: RootState) => state.product);

  // Fetch initial data & cleanup on unmount
  useEffect(() => {
    dispatch(getAllCategories("", 0, 0, ""));
    dispatch(getAllProducts("", 10, 0, ""));

    if (id) {
      dispatch(getBannerById(id));
    }

    return () => {
      dispatch(resetBannerDetails());
    };
  }, [id, dispatch]);

  // Populate form once banner details are loaded
  useEffect(() => {
    if (!bannerVar.bannerDetails) return;

    const rawLink = bannerVar.bannerDetails.buttonLink || "";
    let detectedTarget: "category" | "product" | "custom" = "custom";
    if (rawLink.startsWith("/categories/")) {
      detectedTarget = "category";
    } else if (rawLink.startsWith("/products/")) {
      detectedTarget = "product";
    }

    const populated: EditBannerFormData = {
      title: bannerVar.bannerDetails.title || "",
      subtitle: bannerVar.bannerDetails.subTitle || bannerVar.bannerDetails.subtitle || "",
      buttonText: bannerVar.bannerDetails.buttonLabel || bannerVar.bannerDetails.buttonText || "",
      buttonLinkTarget: detectedTarget,
      buttonLink: rawLink,
      image: bannerVar.bannerDetails.image,
      order: typeof bannerVar.bannerDetails.order === "number" ? bannerVar.bannerDetails.order : 1,
      status: bannerVar.bannerDetails.status === "inactive" ? "inactive" : "active",
      startDate: formatDateForInput(bannerVar.bannerDetails.startDate),
      endDate: formatDateForInput(bannerVar.bannerDetails.endDate),
    };

    setFormData(populated);
    setInitialData(populated);
  }, [bannerVar.bannerDetails]);

  // Options for Category dropdown
  const categoryOptions = useMemo(() => {
    if (!categoryVar.categories || categoryVar.categories.length === 0)
      return [];
    return categoryVar.categories.map((cat: any) => ({
      label: cat.name,
      value: `/categories/${cat.slug}`,
    }));
  }, [categoryVar.categories]);

  // Options for Product dropdown
  const productOptions = useMemo(() => {
    if (!productVar.products || productVar.products.length === 0) return [];
    return productVar.products.map((prod: any) => ({
      label: prod.name,
      value: `/products/${prod.slug}`,
    }));
  }, [productVar.products]);

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      warningHandler("Please upload a valid image file (PNG, JPG, WEBP).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      warningHandler("Image size should be less than 10MB.");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      image: file,
    }));
  };

  // Clear existing image completely
  const handleClearExistingImage = () => {
    setFormData((prev) => ({ ...prev, image: null }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Switch destination type
  const handleTargetTypeChange = (
    targetType: "category" | "product" | "custom",
  ) => {
    let defaultLink = "";
    if (targetType === "category") {
      defaultLink = categoryOptions[0]?.value || "";
    } else if (targetType === "product") {
      defaultLink = productOptions[0]?.value || "";
    } else {
      defaultLink = "";
    }

    setFormData((prev) => ({
      ...prev,
      buttonLinkTarget: targetType,
      buttonLink: defaultLink,
    }));
  };

  // Category live search debounce
  const handleCategoryInputChange = (searchTerm: string) => {
    setCategorySearchQuery(searchTerm);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      dispatch(getAllCategories(searchTerm, 10, 0, ""));
    }, 500);
  };

  // Product live search debounce
  const handleProductInputChange = (searchTerm: string) => {
    setProductSearchQuery(searchTerm);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      dispatch(getAllProducts(searchTerm, 10, 0, ""));
    }, 500);
  };

  // Reset form back to loaded state
  const handleReset = () => {
    if (initialData) {
      setFormData(initialData);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) {
      warningHandler("Invalid banner ID.");
      return;
    }

    if (!formData.title.trim()) {
      warningHandler("Please enter a title for the hero slide.");
      return;
    }

    if (!formData.image) {
      warningHandler("Please provide a hero banner image.");
      return;
    }

    const data = new FormData();
    data.append("title", formData.title.trim());
    data.append("subTitle", formData.subtitle.trim());
    data.append("buttonLabel", formData.buttonText.trim());
    data.append("buttonLink", formData.buttonLink.trim());
    data.append("order", String(Number(formData.order) || 0));
    data.append("status", formData.status);

    if (formData.startDate) {
      data.append("startDate", formData.startDate);
    }
    if (formData.endDate) {
      data.append("endDate", formData.endDate);
    }

    // Only append image file if a new file was chosen
    if (formData.image instanceof File) {
      data.append("image", formData.image);
    }

    dispatch(updateBanner(id, data, navigate));
  };

  // Not found or failed load
  if (bannerVar.status === "error" && !bannerVar.bannerDetails) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] p-6 text-center">
        <div className="p-4 rounded-2xl bg-rose-500/10 text-rose-500 mb-4">
          <AlertCircle className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Slide Not Found</h2>
        <p className="text-sm text-muted-foreground max-w-md mt-1 mb-6">
          The hero slide with ID{" "}
          <code className="font-mono text-amber-500">{id}</code> could not be
          found or has been removed.
        </p>
        <Button
          onClick={() => navigate("/banners")}
          className="bg-amber-500 hover:bg-amber-600 text-white gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Hero Sliders
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-full pb-16">
      {/* ─── Top Header & Breadcrumbs ───────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-xl shrink-0 hover:bg-muted cursor-pointer"
            onClick={() => navigate("/banners")}
            title="Return to Banners"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <div className="flex flex-col">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <Sliders className="w-6 h-6 text-amber-500" />
                Edit Hero Slide
              </h1>
              {id && (
                <Badge
                  variant="outline"
                  className="font-mono text-[11px] text-muted-foreground border-border"
                >
                  ID: {id}
                </Badge>
              )}
              <Badge
                className={
                  formData.status === "active"
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[11px]"
                    : "bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30 text-[11px]"
                }
              >
                {formData.status.toUpperCase()}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              Update headline, promotional CTA, visual imagery, and scheduling
              for your storefront home slider.
            </p>
          </div>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/banners")}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={handleReset}
            className="cursor-pointer text-muted-foreground hover:text-foreground"
            title="Reset changes back to initial saved state"
          >
            <RefreshCw className="w-4 h-4 mr-1.5" /> Reset
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={bannerVar.status === "loading"}
            className="bg-amber-500 hover:bg-amber-600 text-white font-medium cursor-pointer shadow-sm gap-2"
          >
            {bannerVar.status === "loading" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving Changes...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ─── Left Column: Form Controls (7 cols) ─────────────────────────── */}
          <div className="lg:col-span-7 space-y-6">
            {/* Card 1: Slide Content & Messaging */}
            <Card className="bg-card border-border shadow-xs">
              <CardHeader className="pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-500">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold">
                      Hero Slide Messaging
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Headline and subtitle displayed prominently over the
                      banner asset.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-5 space-y-4">
                {/* Title */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Hero Slide Title <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {formData.title.length}/80
                    </span>
                  </div>
                  <Input
                    placeholder="e.g. Spring Organic Baby Collection 2026"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        title: e.target.value.slice(0, 80),
                      })
                    }
                    className="bg-background text-sm font-medium"
                    required
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Crisp, attention-grabbing headline displayed prominently on
                    the hero slider.
                  </p>
                </div>

                {/* Subtitle */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Subtitle / Tagline
                    </label>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {formData.subtitle.length}/160
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    placeholder="e.g. Ultra-soft 100% GOTS certified organic cotton for newborns & toddlers..."
                    value={formData.subtitle}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        subtitle: e.target.value.slice(0, 160),
                      })
                    }
                    className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Supporting description or value proposition highlighting the
                    collection.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Card 2: Slide Banner Image */}
            <Card className="bg-card border-border shadow-xs">
              <CardHeader className="pb-3 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-500">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-semibold">
                        Hero Banner Image
                      </CardTitle>
                      <CardDescription className="text-xs">
                        High-resolution visual asset for your storefront hero
                        carousel.
                      </CardDescription>
                    </div>
                  </div>

                  {formData.image && (
                    <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[11px] gap-1">
                      New Image Selected
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-5 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-foreground">
                      <Monitor className="w-3.5 h-3.5 text-amber-500" />
                      Slide Banner Asset{" "}
                      <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[11px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      Rec: 1920 × 750px (16:6 ~ 16:9)
                    </span>
                  </div>

                  {formData.image ? (
                    <div className="relative rounded-xl overflow-hidden border border-border bg-slate-950 group shadow-xs">
                      <div className="relative aspect-16/7 w-full overflow-hidden bg-slate-900">
                        <img
                          src={
                            typeof formData.image === "string"
                              ? formData.image
                              : URL.createObjectURL(formData.image)
                          }
                          alt="Banner Preview"
                          className="w-full h-full object-cover"
                        />

                        {/* Hover Overlay with Action Buttons */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2.5 p-4">
                          <label className="bg-white/95 text-slate-900 hover:bg-white text-xs font-semibold px-3 py-2 rounded-lg cursor-pointer flex items-center gap-1.5 shadow-md transition-all">
                            <Upload className="w-3.5 h-3.5" />
                            {formData.image
                              ? "Change New Image"
                              : "Upload Replacement Image"}
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleImageChange}
                            />
                          </label>

                          {formData.image && (
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={handleClearExistingImage}
                              className="cursor-pointer gap-1 text-xs"
                              title="Remove banner image"
                            >
                              <X className="w-3.5 h-3.5" /> Remove
                            </Button>
                          )}
                        </div>
                      </div>                    
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-border hover:border-amber-500/60 rounded-xl p-8 flex flex-col items-center justify-center gap-2 cursor-pointer bg-muted/15 hover:bg-muted/30 transition-all text-center group">
                      <div className="p-3.5 rounded-full bg-muted text-muted-foreground group-hover:text-amber-500 group-hover:bg-amber-500/10 transition-colors">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-sm font-semibold text-foreground">
                          Click or drag image file here to upload
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Supports PNG, JPG, WEBP up to 10 MB
                        </p>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </label>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Card 3: Call to Action (CTA) & Redirection */}
            <Card className="bg-card border-border shadow-xs">
              <CardHeader className="pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-500">
                    <Link2 className="w-4 h-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold">
                      Call to Action (CTA) & Destination
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Set up the clickable button text and the customer redirect
                      target.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-5 space-y-4">
                {/* Button Label */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Button Label
                  </label>
                  <Input
                    placeholder="e.g. Shop New Arrivals"
                    value={formData.buttonText}
                    onChange={(e) =>
                      setFormData({ ...formData, buttonText: e.target.value })
                    }
                    className="bg-background text-sm font-medium"
                  />
                </div>

                {/* Target Type Selector */}
                <div className="space-y-2 pt-2 border-t border-border">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Redirect Destination Type
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: "category", label: "Category Page" },
                      { key: "product", label: "Specific Product" },
                      { key: "custom", label: "Custom URL / Link" },
                    ].map((tab) => (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => handleTargetTypeChange(tab.key as any)}
                        className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                          formData.buttonLinkTarget === tab.key
                            ? "bg-amber-500/15 border-amber-500/50 text-amber-600 dark:text-amber-400 font-bold"
                            : "bg-background border-border text-muted-foreground hover:text-foreground hover:bg-muted/40"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dynamic Destination Selector */}
                {formData.buttonLinkTarget === "category" && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Select Target Category
                    </label>
                    <Combobox
                      items={categoryOptions}
                      value={formData.buttonLink}
                      onInputValueChange={(val, details) => {
                        if (
                          details.reason === "input-change" ||
                          details.reason === "clear-press"
                        ) {
                          handleCategoryInputChange(val);
                        }
                      }}
                      onValueChange={(val: any) =>
                        setFormData({
                          ...formData,
                          buttonLink: val
                            ? typeof val === "string"
                              ? val
                              : val.value
                            : "",
                        })
                      }
                    >
                      <ComboboxInput
                        placeholder="Search and select category..."
                        className="w-full"
                        showClear
                        onChange={(e) =>
                          handleCategoryInputChange(e.target.value)
                        }
                      />
                      <ComboboxContent
                        align="start"
                        className="w-[--anchor-width] min-w-72"
                      >
                        <ComboboxEmpty>
                          {categorySearchQuery
                            ? `No category found matching "${categorySearchQuery}".`
                            : "No category found matching your search."}
                        </ComboboxEmpty>
                        <ComboboxList>
                          {categoryOptions.map((cat) => (
                            <ComboboxItem key={cat.value} value={cat}>
                              <div className="flex flex-col min-w-0 pr-2">
                                <span className="truncate font-medium">
                                  {cat.label}
                                </span>
                                <span className="text-[10px] font-mono text-muted-foreground truncate">
                                  {cat.value}
                                </span>
                              </div>
                            </ComboboxItem>
                          ))}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                  </div>
                )}

                {formData.buttonLinkTarget === "product" && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Select Target Product
                    </label>
                    <Combobox
                      items={productOptions}
                      value={formData.buttonLink}
                      onInputValueChange={(val, details) => {
                        if (
                          details.reason === "input-change" ||
                          details.reason === "clear-press"
                        ) {
                          handleProductInputChange(val);
                        }
                      }}
                      onValueChange={(val: any) =>
                        setFormData({
                          ...formData,
                          buttonLink: val
                            ? typeof val === "string"
                              ? val
                              : val.value
                            : "",
                        })
                      }
                    >
                      <ComboboxInput
                        placeholder="Search and select product..."
                        className="w-full"
                        showClear
                        onChange={(e) =>
                          handleProductInputChange(e.target.value)
                        }
                      />
                      <ComboboxContent
                        align="start"
                        className="w-[--anchor-width] min-w-72"
                      >
                        <ComboboxEmpty>
                          {productSearchQuery
                            ? `No product found matching "${productSearchQuery}".`
                            : "No product found matching your search."}
                        </ComboboxEmpty>
                        <ComboboxList>
                          {productOptions.map((prod) => (
                            <ComboboxItem key={prod.value} value={prod}>
                              <div className="flex flex-col min-w-0 pr-2">
                                <span className="truncate font-medium">
                                  {prod.label}
                                </span>
                                <span className="text-[10px] font-mono text-muted-foreground truncate">
                                  {prod.value}
                                </span>
                              </div>
                            </ComboboxItem>
                          ))}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                  </div>
                )}

                {formData.buttonLinkTarget === "custom" && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Custom URL Link
                    </label>
                    <Input
                      placeholder="/offers/summer-sale or https://..."
                      value={formData.buttonLink}
                      onChange={(e) =>
                        setFormData({ ...formData, buttonLink: e.target.value })
                      }
                      className="bg-background text-sm font-mono"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Card 4: Sequence Order, Status & Schedule Settings */}
            <Card className="bg-card border-border shadow-xs">
              <CardHeader className="pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-500">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold">
                      Sequence, Status & Scheduling
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Priority sequence in carousel, display status, and active
                      date window.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Order / Sequence */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Sequence Position
                    </label>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 shrink-0 cursor-pointer"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            order: Math.max(1, prev.order - 1),
                          }))
                        }
                      >
                        -
                      </Button>
                      <Input
                        type="number"
                        min="1"
                        max="99"
                        value={formData.order}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            order: Math.max(1, parseInt(e.target.value) || 1),
                          })
                        }
                        className="text-center font-bold font-mono"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 shrink-0 cursor-pointer"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            order: prev.order + 1,
                          }))
                        }
                      >
                        +
                      </Button>
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      Lower numbers appear first (#1 is the first slide).
                    </p>
                  </div>

                  {/* Status Select */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Status <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={formData.status}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            status: e.target.value as "active" | "inactive",
                          }))
                        }
                        className="h-9 w-full appearance-none rounded-md border border-input bg-background px-3 py-1.5 text-xs font-semibold text-foreground shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
                        <span className="text-xs">▼</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      Inactive slides are hidden from the storefront hero slider.
                    </p>
                  </div>
                </div>

                {/* Schedule Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border">
                  {/* Start Date */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-amber-500" />
                        Start Date (Optional)
                      </label>
                      {formData.startDate && (
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({ ...prev, startDate: "" }))
                          }
                          className="text-[11px] text-muted-foreground hover:text-destructive cursor-pointer transition-colors"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <Input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          startDate: e.target.value,
                        })
                      }
                      className="h-10 text-xs font-medium bg-background border-input focus-visible:ring-2 focus-visible:ring-amber-500 cursor-pointer [color-scheme:light] dark:[color-scheme:dark]"
                    />
                    <p className="text-[10px] text-muted-foreground">
                      Leave empty to activate immediately.
                    </p>
                  </div>

                  {/* End Date */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-amber-500" />
                        End Date (Optional)
                      </label>
                      {formData.endDate && (
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({ ...prev, endDate: "" }))
                          }
                          className="text-[11px] text-muted-foreground hover:text-destructive cursor-pointer transition-colors"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <Input
                      type="date"
                      min={formData.startDate || undefined}
                      value={formData.endDate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          endDate: e.target.value,
                        })
                      }
                      className="h-10 text-xs font-medium bg-background border-input focus-visible:ring-2 focus-visible:ring-amber-500 cursor-pointer [color-scheme:light] dark:[color-scheme:dark]"
                    />
                    <p className="text-[10px] text-muted-foreground">
                      Leave empty for continuous display.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ─── Right Column: Real-Time Live Preview & Summary (5 cols) ─────── */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-4">
            {/* Live Storefront Hero Preview */}
            <Card className="bg-card border-border shadow-md overflow-hidden">
              <CardHeader className="p-4 pb-3 border-b border-border bg-muted/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-amber-500" />
                    <CardTitle className="text-sm font-bold">
                      Storefront Live Preview
                    </CardTitle>
                  </div>

                  {/* Device Switcher */}
                  <div className="flex items-center gap-1 bg-muted p-1 rounded-md border border-border">
                    <button
                      type="button"
                      onClick={() => setPreviewDevice("desktop")}
                      className={`p-1.5 rounded transition-all cursor-pointer ${
                        previewDevice === "desktop"
                          ? "bg-card text-foreground shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                      title="Desktop Preview"
                    >
                      <Monitor className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewDevice("mobile")}
                      className={`p-1.5 rounded transition-all cursor-pointer ${
                        previewDevice === "mobile"
                          ? "bg-card text-foreground shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                      title="Mobile Viewport"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-4 flex flex-col items-center">
                {/* Desktop Preview */}
                {previewDevice === "desktop" ? (
                  <div className="w-full relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shadow-xl group">
                    {/* Simulated Browser Bar */}
                    <div className="h-6 bg-slate-900 border-b border-slate-800 flex items-center px-3 gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500/80 inline-block" />
                      <span className="w-2 h-2 rounded-full bg-amber-500/80 inline-block" />
                      <span className="w-2 h-2 rounded-full bg-emerald-500/80 inline-block" />
                      <span className="text-[10px] text-slate-500 font-mono ml-2 truncate">
                        yourstore.com
                      </span>
                    </div>

                    {/* Banner Canvas */}
                    <div className="relative aspect-16/9 w-full overflow-hidden flex items-center bg-slate-900">
                      {formData.image ? (
                        <img
                          src={
                            typeof formData.image === "string"
                              ? formData.image
                              : URL.createObjectURL(formData.image)
                          }
                          alt="Live Preview"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-tr from-slate-950 via-slate-900 to-amber-950/40 flex flex-col items-center justify-center text-slate-500 gap-2 p-4 text-center">
                          <ImageIcon className="w-10 h-10 opacity-30" />
                          <p className="text-xs text-slate-400">
                            Provide a banner image to see it rendered live.
                          </p>
                        </div>
                      )}

                      {/* Dark Gradient Overlay for Readability */}
                      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent pointer-events-none" />

                      {/* Hero Content Overlay */}
                      <div className="absolute inset-0 p-5 sm:p-6 flex flex-col justify-center max-w-[85%] z-10 items-start text-left">
                        {/* Title */}
                        <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight leading-tight drop-shadow-sm mb-1.5 line-clamp-2">
                          {formData.title || "Your Hero Slide Title"}
                        </h2>

                        {/* Subtitle */}
                        {formData.subtitle && (
                          <p className="text-xs text-gray-200 line-clamp-2 mb-4 drop-shadow-xs max-w-sm">
                            {formData.subtitle}
                          </p>
                        )}

                        {/* CTA Button */}
                        {formData.buttonText && (
                          <div>
                            <button
                              type="button"
                              className="px-4 py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer flex items-center gap-1.5 bg-amber-500 text-white hover:bg-amber-600 shadow-md shadow-amber-500/25"
                            >
                              {formData.buttonText}
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Simulated Slide Order Indicator */}
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[10px] font-mono text-white/90 z-10">
                        Slide #{formData.order}
                      </div>

                      {/* Simulated Dots indicator */}
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 z-10">
                        <span className="w-4 h-1.5 rounded-full bg-amber-500" />
                        <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
                        <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Mobile Preview Device Frame */
                  <div className="w-64 rounded-3xl overflow-hidden bg-slate-950 border-4 border-slate-800 shadow-2xl relative">
                    {/* Top Notch */}
                    <div className="h-5 bg-slate-900 flex items-center justify-center">
                      <div className="w-16 h-3 rounded-full bg-slate-950" />
                    </div>

                    {/* Mobile Banner Canvas */}
                    <div className="relative aspect-3/4 w-full overflow-hidden flex items-center bg-slate-900">
                      {formData.image ? (
                        <img
                          src={
                            typeof formData.image === "string"
                              ? formData.image
                              : URL.createObjectURL(formData.image)
                          }
                          alt="Mobile Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-b from-slate-950 to-slate-900 flex flex-col items-center justify-center text-slate-500 gap-2 p-4 text-center">
                          <Smartphone className="w-8 h-8 opacity-30" />
                          <p className="text-[11px] text-slate-400">
                            Provide a banner image to preview mobile rendering.
                          </p>
                        </div>
                      )}

                      {/* Dark Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

                      {/* Content Overlay */}
                      <div className="absolute inset-0 p-4 flex flex-col justify-end text-left z-10 pb-6">
                        <h3 className="text-sm font-extrabold text-white leading-tight mb-1 line-clamp-2">
                          {formData.title || "Hero Headline"}
                        </h3>
                        {formData.subtitle && (
                          <p className="text-[11px] text-gray-300 line-clamp-2 mb-3">
                            {formData.subtitle}
                          </p>
                        )}
                        {formData.buttonText && (
                          <button
                            type="button"
                            className="px-3 py-1 text-[11px] font-bold rounded-full w-fit bg-amber-500 text-white shadow-sm"
                          >
                            {formData.buttonText}
                          </button>
                        )}
                      </div>

                      {/* Badge in mobile */}
                      <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/60 text-[9px] text-white font-mono">
                        #{formData.order}
                      </div>
                    </div>

                    {/* Bottom Home Indicator */}
                    <div className="h-4 bg-slate-950 flex items-center justify-center">
                      <div className="w-20 h-1 rounded-full bg-slate-700" />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Slide Configuration Summary & Checklist */}
            <Card className="bg-card border-border shadow-xs">
              <CardHeader className="pb-3 border-b border-border">
                <CardTitle className="text-sm font-semibold flex items-center justify-between">
                  <span>Slide Configuration</span>
                  <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 gap-1 text-xs">
                    <Sparkles className="w-3 h-3" /> Ready to Save
                  </Badge>
                </CardTitle>
              </CardHeader>

              <CardContent className="p-4 space-y-3 text-xs">
                {/* Checklist */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between py-1 border-b border-border/60">
                    <span className="text-muted-foreground">
                      Title Provided
                    </span>
                    {formData.title.trim() ? (
                      <span className="text-emerald-500 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                      </span>
                    ) : (
                      <span className="text-rose-500 font-medium">
                        Required
                      </span>
                    )}
                  </div>

                  {/* <div className="flex items-center justify-between py-1 border-b border-border/60">
                    <span className="text-muted-foreground">Banner Asset</span>
                    {formData.image ? (
                      <span className="text-amber-500 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> New Upload
                      </span>
                    ) : formData.existingImageUrl ? (
                      <span className="text-emerald-500 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Current Image
                      </span>
                    ) : (
                      <span className="text-rose-500 font-medium">Missing</span>
                    )}
                  </div> */}

                  <div className="flex items-center justify-between py-1 border-b border-border/60">
                    <span className="text-muted-foreground">Status</span>
                    <span
                      className={`font-semibold ${
                        formData.status === "active"
                          ? "text-emerald-500"
                          : "text-slate-500"
                      }`}
                    >
                      {formData.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-border/60">
                    <span className="text-muted-foreground">
                      CTA Destination
                    </span>
                    <span className="font-mono text-foreground truncate max-w-[150px]">
                      {formData.buttonLink || "None"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <span className="text-muted-foreground">
                      Carousel Sequence
                    </span>
                    <span className="font-bold text-foreground bg-muted px-2 py-0.5 rounded">
                      Position #{formData.order}
                    </span>
                  </div>
                </div>

                {/* Submit button in Sidebar */}
                <div className="pt-2">
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={bannerVar.status === "loading"}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold cursor-pointer shadow-sm gap-2"
                  >
                    {bannerVar.status === "loading" ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving Changes...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
