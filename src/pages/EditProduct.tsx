import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Eye,
  FileText,
  FolderTree,
  Globe,
  HelpCircle,
  Image as ImageIcon,
  Link2,
  Loader2,
  Package,
  Palette,
  Plus,
  RefreshCw,
  Search,
  Shirt,
  Sparkles,
  Tag,
  Trash2,
  Upload,
  X,
  Zap,
} from "lucide-react";

import type { AppDispatch, RootState } from "@/store/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { getAllCategories } from "@/store/categorySlice";
import { getColors } from "@/store/colorSlice";
import { getAllSize } from "@/store/sizeSlice";
import { getAllSizeCharts } from "@/store/sizeChartSlice";
import { getAllSubCategories } from "@/store/subCategorySlice";
import { warningHandler } from "@/shared/_helper/responseHelper";
import { generateSlug } from "@/lib/utils";
import {
  getProductById,
  updateProduct,
  setProductDetails,
  getAllProducts,
} from "@/store/productSlice";

import type { ProductFormData, ProductOption, ProductVariant } from "./AddProduct";

const STEPS = [
  {
    id: 1,
    title: "General & Category",
    description: "Name, category & badges",
    icon: FileText,
  },
  {
    id: 2,
    title: "Attributes & Specs",
    description: "Fabric, care & try-on",
    icon: Shirt,
  },
  {
    id: 3,
    title: "Variants & Inventory",
    description: "Colors, photos & pricing",
    icon: Palette,
  },
  {
    id: 4,
    title: "Related Products",
    description: "Cross-sell recommendations",
    icon: Link2,
  },
  {
    id: 5,
    title: "SEO & Review",
    description: "Search preview & publish",
    icon: Globe,
  },
];

const EMPTY_FORM: ProductFormData = {
  name: "",
  slug: "",
  description: "",
  status: "active",
  category: "",
  subCategory: "",
  fabric: "",
  careInstructions: "",
  sizeChart: "",
  specifications: "",
  isFeatured: false,
  newArrival: true,
  bestSeller: false,
  isVirtualTryOnEnabled: false,
  virtualTryOnAssetUrl: "",
  metaTitle: "",
  metaDescription: "",
  relatedProducts: [],
};

export default function EditProduct() {
  const navigate = useNavigate();
  const { id: productId } = useParams<{ id: string }>();

  const dispatch = useDispatch<AppDispatch>();

  const searchTimeoutRef = useRef<any>(null);

  const categoryVar = useSelector((state: RootState) => state.category);
  const subCategoryVar = useSelector((state: RootState) => state.subCategory);
  const colorVar = useSelector((state: RootState) => state.color);
  const sizeVar = useSelector((state: RootState) => state.size);
  const sizeChartVar = useSelector((state: RootState) => state.sizeChart);
  const productVar = useSelector((state: RootState) => state.product);

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ProductFormData>(EMPTY_FORM);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [isPopulated, setIsPopulated] = useState(false);

  // Related products state & search
  const [relatedSearch, setRelatedSearch] = useState("");
  const [selectedProductsData, setSelectedProductsData] = useState<any[]>([]);

  const handleSearch = (value: string) => {
    setRelatedSearch(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      dispatch(getAllProducts(value, 20, 0, "", ""));
    }, 300);
  };

  const toggleRelatedProduct = (product: any) => {
    const pId = String(product._id);
    const isAlreadySelected = (formData.relatedProducts || []).includes(pId);

    if (isAlreadySelected) {
      setFormData((prev) => ({
        ...prev,
        relatedProducts: prev.relatedProducts.filter((id) => id !== pId),
      }));
      setSelectedProductsData((prev) =>
        prev.filter((p) => String(p._id) !== pId),
      );
    } else {
      setFormData((prev) => ({
        ...prev,
        relatedProducts: [...(prev.relatedProducts || []), pId],
      }));
      setSelectedProductsData((prev) => {
        if (!prev.some((p) => String(p._id) === pId)) {
          return [...prev, product];
        }
        return prev;
      });
    }
  };

  const removeRelatedProduct = (productIdToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      relatedProducts: (prev.relatedProducts || []).filter(
        (id) => id !== productIdToRemove,
      ),
    }));
    setSelectedProductsData((prev) =>
      prev.filter((p) => String(p._id) !== productIdToRemove),
    );
  };

  // ─── Fetch reference data & product details on mount ───────────────────────
  useEffect(() => {
    Promise.all([
      dispatch(getAllCategories("", 0, 0, "")),
      dispatch(getAllSubCategories("", 0, 0, "", "")),
      dispatch(getColors("", 0, 0, "")),
      dispatch(getAllSize("", 0, 0, "")),
      dispatch(getAllSizeCharts("", 0, 0)),
      dispatch(getAllProducts("", 20, 0, "", "")),
    ]);

    if (productId) {
      dispatch(getProductById(productId));
    }

    // Clear details when unmounting to avoid stale data on next visit
    return () => {
      dispatch(setProductDetails(null));
    };
  }, [productId, dispatch]);

  // ─── Populate form once productDetails arrives ──────────────────────────────
  useEffect(() => {
    if (!productVar.productDetails || isPopulated) return;

    const populatedRelated = (productVar.productDetails.relatedProducts ?? []).map(
      (p: any) => (typeof p === "object" ? p._id : p),
    );

    const relatedObjs = (productVar.productDetails.relatedProducts ?? []).filter(
      (p: any) => typeof p === "object",
    );
    if (relatedObjs.length > 0) {
      setSelectedProductsData(relatedObjs);
    }

    setFormData({
      name: productVar.productDetails.name ?? "",
      slug: productVar.productDetails.slug ?? "",
      description: productVar.productDetails.description ?? "",
      status: productVar.productDetails.status ?? "active",
      category: productVar.productDetails.category[0]?._id ?? "",
      subCategory: productVar.productDetails.subCategory[0]?._id ?? "",
      fabric: productVar.productDetails.fabric ?? "",
      careInstructions: productVar.productDetails.careInstructions ?? "",
      sizeChart:
        productVar.productDetails.sizeChart?._id ?? productVar.productDetails.sizeChart ?? "",
      specifications: productVar.productDetails.specifications ?? "",
      isFeatured: productVar.productDetails.isFeatured ?? false,
      newArrival: productVar.productDetails.newArrival ?? false,
      bestSeller: productVar.productDetails.bestSeller ?? false,
      isVirtualTryOnEnabled: productVar.productDetails.isVirtualTryOnEnabled ?? false,
      virtualTryOnAssetUrl: productVar.productDetails.virtualTryOnAssetUrl ?? "",
      metaTitle: productVar.productDetails.metaTitle ?? "",
      metaDescription: productVar.productDetails.metaDescription ?? "",
      relatedProducts: populatedRelated,
    });

    // Map backend variants → local state
    const mappedVariants: ProductVariant[] = (
      productVar.productDetails.variants ?? []
    ).map((v: any) => ({
      color: v.color?._id ?? v.color ?? "",
      defaultView: v.defaultView ?? false,
      // existing server images become preview-only (no file)
      images: v.images,
      options: (v.options ?? []).map((o: any) => ({
        sku: o.sku ?? "",
        size: o.size?._id ?? o.size ?? "",
        stock: o.stock ?? 0,
        isAvailable: o.isAvailable ?? true,
        price: o.price ?? 0,
        discountPrice: o.discountPrice ?? 0,
      })),
    }));

    setVariants(mappedVariants);
    setIsPopulated(true);
  }, [productVar.productDetails, isPopulated]);

  // ─── Handlers ──────────────────────────────────────────────────────────────
  const regenerateSlug = () => {
    setFormData((prev) => ({ ...prev, slug: generateSlug(formData.name) }));
  };

  const handleChange = (field: keyof ProductFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Variant operations
  const addVariant = () => {
    const usedColors = new Set(variants.map((v) => v.color));
    const nextColor =
      colorVar.colors?.find((c) => !usedColors.has(c._id)) ||
      colorVar.colors[0];

    const newVariant: ProductVariant = {
      color: nextColor?._id || "",
      defaultView: variants.length === 0,
      images: [],
      options: [
        {
          sku: "",
          size: sizeVar.sizes?.[0]?._id || "",
          stock: 10,
          isAvailable: true,
          price: variants[0]?.options[0]?.price || 999,
          discountPrice: variants[0]?.options[0]?.discountPrice || 799,
        },
      ],
    };

    setVariants((prev) => [...prev, newVariant]);
  };

  const removeVariant = (variantIndex: number) => {
    setVariants((prev) => {
      const filtered = prev.filter((_, index) => index !== variantIndex);
      if (filtered.length > 0 && !filtered.some((v) => v.defaultView)) {
        filtered[0].defaultView = true;
      }
      return filtered;
    });
  };

  const updateVariant = (
    variantIndex: number,
    field: keyof ProductVariant,
    value: any,
  ) => {
    setVariants((prev) =>
      prev.map((variant, index) =>
        index === variantIndex ? { ...variant, [field]: value } : variant,
      ),
    );
  };

  const setDefaultVariant = (variantIndex: number) => {
    setVariants((prev) =>
      prev.map((variant, index) => ({
        ...variant,
        defaultView: index === variantIndex,
      })),
    );
  };

  // Option operations
  const addOption = (variantIndex: number) => {
    const currentOptions = variants[variantIndex].options;
    const usedSizes = new Set(currentOptions.map((o) => o.size));
    const nextSize =
      sizeVar.sizes.find((s) => !usedSizes.has(s._id)) || sizeVar.sizes[0];
    const prevOption = currentOptions[currentOptions.length - 1];

    setVariants((prev) =>
      prev.map((variant, index) =>
        index === variantIndex
          ? {
              ...variant,
              options: [
                ...variant.options,
                {
                  sku: "",
                  size: nextSize?._id || "",
                  stock: 15,
                  isAvailable: true,
                  price: prevOption ? prevOption.price : 999,
                  discountPrice: prevOption ? prevOption.discountPrice : 799,
                },
              ],
            }
          : variant,
      ),
    );
  };

  const removeOption = (variantIndex: number, optionIndex: number) => {
    setVariants((prev) =>
      prev.map((variant, index) =>
        index === variantIndex
          ? {
              ...variant,
              options: variant.options.filter((_, idx) => idx !== optionIndex),
            }
          : variant,
      ),
    );
  };

  const updateOption = (
    variantIndex: number,
    optionIndex: number,
    field: keyof ProductOption,
    value: any,
  ) => {
    setVariants((prev) =>
      prev.map((variant, index) =>
        index === variantIndex
          ? {
              ...variant,
              options: variant.options.map((option, idx) =>
                idx === optionIndex ? { ...option, [field]: value } : option,
              ),
            }
          : variant,
      ),
    );
  };

  // Image handling – new uploads only
  const handleImages = (variantIndex: number, files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newImages = Array.from(files).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setVariants((prev) =>
      prev.map((variant, index) =>
        index === variantIndex
          ? { ...variant, images: [...variant.images, ...newImages] }
          : variant,
      ),
    );
  };

  const removeImage = (variantIndex: number, imageIndex: number) => {
    setVariants((prev) =>
      prev.map((variant, index) =>
        index === variantIndex
          ? {
              ...variant,
              images: variant.images.filter((_, idx) => idx !== imageIndex),
            }
          : variant,
      ),
    );
  };

  // ─── Step validation & navigation ──────────────────────────────────────────
  const validateStep = (stepNumber: number): boolean => {
    if (stepNumber === 1) {
      if (!formData.name.trim()) {
        warningHandler("Please enter a product title to proceed.");
        return false;
      }
      if (!formData.category) {
        warningHandler("Please select a product category to proceed.");
        return false;
      }
      if (!formData.status) {
        warningHandler("Please select a product status to proceed.");
        return false;
      }
    }
    if (stepNumber === 3) {
      if (variants.length === 0) {
        warningHandler("Please add at least one color variant with sizes.");
        return false;
      }
      if (variants.some((v) => !v.color)) {
        warningHandler("Please ensure every variant has an assigned color.");
        return false;
      }
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStepClick = (stepId: number) => {
    if (stepId > currentStep) {
      if (!validateStep(currentStep)) return;
    }
    setCurrentStep(stepId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ─── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = () => {
    if (!validateStep(1) || !validateStep(3)) return;

    const formDataToSend = new FormData();

    const productData = {
      ...formData,
      variants: variants.map((variant) => ({
        color: variant.color,
        defaultView: variant.defaultView,
        // Keep existing image URLs (those without .file) as-is
        images: variant.images
          .filter((img) => !img.file)
          .map((img) => img),
        options: variant.options.map((option) => ({
          sku: option.sku,
          size: option.size,
          stock: Number(option.stock),
          isAvailable: option.isAvailable,
          price: Number(option.price),
          discountPrice:
            option.discountPrice !== undefined && option.discountPrice !== null
              ? Number(option.discountPrice)
              : undefined,
        })),
      })),
    };

    formDataToSend.append("data", JSON.stringify(productData));

    // Append new image uploads per variant
    variants.forEach((variant, variantIndex) => {
      variant.images.forEach((image) => {
        if (image.file instanceof File) {
          formDataToSend.append(`variant-${variantIndex}`, image.file);
        }
      });
    });

    // console.log("Form DataToSend ===> ", Object.fromEntries(formDataToSend));

    dispatch(updateProduct(productId!, formDataToSend, navigate));
  };

  // ─── Derived values ────────────────────────────────────────────────────────
  const filteredSubCategories = subCategoryVar.subCategories.filter(
    (item) =>
      !formData.category ||
      String(item?.category?._id) === String(formData.category),
  );

  const totalVariants = variants.length;
  const totalStock = variants.reduce(
    (acc, v) =>
      acc + v.options.reduce((sum, o) => sum + (Number(o.stock) || 0), 0),
    0,
  );
  const totalImages = variants.reduce((acc, v) => acc + v.images.length, 0);

  const selectedCategoryObj = categoryVar.categories.find(
    (c) => String(c._id) === String(formData.category),
  );
  const selectedSubCategoryObj = subCategoryVar.subCategories.find(
    (sc) => String(sc._id) === String(formData.subCategory),
  );

  console.log("Form Data ===> ", formData);
  console.log("Variant ===> ", variants);

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-24 animate-in fade-in duration-300">
      {/* STICKY TOP HEADER */}
      <div className="bg-card p-4 sm:p-5 rounded-2xl border border-border shadow-xs sticky top-0 z-30 backdrop-blur-md transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-xl shrink-0 hover:bg-muted"
              onClick={() => navigate("/products")}
              title="Return to products"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  Edit Product
                </h1>
                <Badge variant="outline" className="text-[11px] font-semibold">
                  Step {currentStep} of {STEPS.length}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {STEPS[currentStep - 1].title} —{" "}
                {STEPS[currentStep - 1].description}
              </p>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2.5 self-end sm:self-center">
            <Button
              type="button"
              variant="outline"
              className="text-xs font-semibold rounded-xl h-10 px-4"
              onClick={() => navigate("/products")}
            >
              Cancel
            </Button>

            {currentStep > 1 && (
              <Button
                type="button"
                variant="secondary"
                className="text-xs font-semibold rounded-xl h-10 px-4"
                onClick={handlePrevStep}
              >
                <ArrowLeft className="h-4 w-4 mr-1.5" />
                Previous
              </Button>
            )}

            {currentStep < STEPS.length ? (
              <Button
                type="button"
                className="text-xs font-semibold rounded-xl h-10 px-5 shadow-sm bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={handleNextStep}
              >
                Next Step
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            ) : (
              <Button
                type="button"
                className="text-xs font-semibold rounded-xl h-10 px-5 shadow-sm bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-1.5"
                onClick={handleSubmit}
              >
                <Check className="h-4 w-4" />
                Save Changes
              </Button>
            )}
          </div>
        </div>

        {/* STEPPER PROGRESS BAR */}
        <div className="mt-5 pt-4 border-t border-border">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
            {STEPS.map((step) => {
              const Icon = step.icon;
              const isCurrent = step.id === currentStep;
              const isCompleted = step.id < currentStep;

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => handleStepClick(step.id)}
                  className={`text-left p-3 rounded-xl border transition-all duration-200 flex items-center gap-3 ${
                    isCurrent
                      ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary/30"
                      : isCompleted
                        ? "border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 cursor-pointer"
                        : "border-border/60 bg-muted/20 hover:bg-muted/40 opacity-75"
                  }`}
                >
                  <div
                    className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs transition-colors ${
                      isCurrent
                        ? "bg-primary text-primary-foreground"
                        : isCompleted
                          ? "bg-emerald-500 text-white"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p
                      className={`text-[10px] font-bold uppercase tracking-wider ${
                        isCurrent
                          ? "text-primary"
                          : isCompleted
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-muted-foreground"
                      }`}
                    >
                      Step 0{step.id}
                    </p>
                    <p className="text-xs font-bold text-foreground truncate">
                      {step.title}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── STEP 1: GENERAL & CATEGORY ─────────────────────────────────────── */}
      {currentStep === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200">
          <div className="lg:col-span-8 space-y-6">
            <Card className="rounded-2xl border-border shadow-xs">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold text-foreground">
                      Basic Product Information
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      Define customer-facing title, clean permalink slug, and
                      full description.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 pt-0">
                {/* Product Title */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      Product Title <span className="text-destructive">*</span>
                    </label>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {formData.name.length} chars
                    </span>
                  </div>
                  <Input
                    placeholder="e.g. Royal Silk Festive Kurta & Pyjama Set for Boys"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="h-10 text-sm font-medium rounded-xl bg-background"
                    required
                  />
                </div>

                {/* Slug */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      Slug / URL Identifier
                      <span
                        title="Used in customer URL path. Auto-generated from title."
                        className="cursor-help"
                      >
                        <HelpCircle className="h-3 w-3 text-muted-foreground" />
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={regenerateSlug}
                      className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1"
                    >
                      <RefreshCw className="h-3 w-3" /> Auto-sync
                    </button>
                  </div>

                  <div className="relative">
                    <Input
                      placeholder="royal-silk-festive-kurta"
                      value={formData.slug}
                      onChange={(e) => handleChange("slug", e.target.value)}
                      className="h-10 text-xs font-mono font-medium rounded-xl bg-background"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      Product Description
                    </label>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {formData.description.length} chars
                    </span>
                  </div>
                  <textarea
                    rows={5}
                    placeholder="Detail the craftsmanship, fit, occasion suitability, styling suggestions, and uniqueness of this outfit..."
                    value={formData.description}
                    onChange={(e) =>
                      handleChange("description", e.target.value)
                    }
                    className="w-full rounded-xl border border-input bg-background p-3 text-sm placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors resize-y leading-relaxed"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-4 space-y-6">
            {/* Category Card */}
            <Card className="rounded-2xl border-border shadow-xs">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <FolderTree className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold text-foreground">
                      Category Taxonomy
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      Map to store catalog structure.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 pt-0">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    Primary Category <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={formData.category}
                      onChange={(e) => {
                        handleChange("category", e.target.value);
                        handleChange("subCategory", "");
                      }}
                      className="h-10 w-full appearance-none rounded-xl border border-input bg-background px-3 py-2 text-xs font-semibold text-foreground shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="">Select primary category</option>
                      {categoryVar?.categories?.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
                      <span className="text-xs">▼</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    Subcategory
                  </label>
                  <div className="relative">
                    <select
                      value={formData.subCategory}
                      onChange={(e) =>
                        handleChange("subCategory", e.target.value)
                      }
                      disabled={!formData.category}
                      className="h-10 w-full appearance-none rounded-xl border border-input bg-background px-3 py-2 text-xs font-semibold text-foreground shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {formData.category
                          ? "Select subcategory"
                          : "Choose category first"}
                      </option>
                      {filteredSubCategories.map((subCategory) => (
                        <option key={subCategory._id} value={subCategory._id}>
                          {subCategory.name}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
                      <span className="text-xs">▼</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Badges Card */}
            <Card className="rounded-2xl border-border shadow-xs">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <Tag className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold text-foreground">
                      Visibility & Badges
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      Control storefront status and highlights.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 pt-0">
                {/* Product Status */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    Status <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        handleChange(
                          "status",
                          e.target.value as "active" | "inactive",
                        )
                      }
                      className="h-10 w-full appearance-none rounded-xl border border-input bg-background px-3 py-2 text-xs font-semibold text-foreground shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
                      <span className="text-xs">▼</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-border/70 space-y-3">
                <div className="flex items-center justify-between p-2.5 rounded-xl border border-border/70 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-md bg-amber-500/15 text-amber-500">
                      <Sparkles className="h-3 w-3" />
                    </span>
                    <span className="text-xs font-bold text-foreground">
                      Featured
                    </span>
                  </div>
                  <Switch
                    checked={formData.isFeatured}
                    onCheckedChange={(checked) =>
                      handleChange("isFeatured", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl border border-border/70 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-md bg-blue-500/15 text-blue-500">
                      <Tag className="h-3 w-3" />
                    </span>
                    <span className="text-xs font-bold text-foreground">
                      New Arrival
                    </span>
                  </div>
                  <Switch
                    checked={formData.newArrival}
                    onCheckedChange={(checked) =>
                      handleChange("newArrival", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl border border-border/70 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-md bg-rose-500/15 text-rose-500">
                      <Zap className="h-3 w-3" />
                    </span>
                    <span className="text-xs font-bold text-foreground">
                      Best Seller
                    </span>
                  </div>
                  <Switch
                    checked={formData.bestSeller}
                    onCheckedChange={(checked) =>
                      handleChange("bestSeller", checked)
                    }
                  />
                </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ── STEP 2: SPECIFICATIONS & ATTRIBUTES ────────────────────────────── */}
      {currentStep === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200">
          <div className="lg:col-span-8 space-y-6">
            <Card className="rounded-2xl border-border shadow-xs">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <Shirt className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold text-foreground">
                      Garment Specifications
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      Provide fabric composition, sizing chart association, and
                      laundry directions.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 pt-0">
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Fabric */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      Fabric Composition
                    </label>
                    <Input
                      placeholder="e.g. 100% Organic Pure Cotton & Chanderi Silk"
                      value={formData.fabric}
                      onChange={(e) => handleChange("fabric", e.target.value)}
                      className="h-10 text-xs rounded-xl bg-background"
                    />
                  </div>

                  {/* Size Chart Selection */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      Associated Size Chart
                    </label>
                    <div className="relative">
                      <select
                        value={formData.sizeChart}
                        onChange={(e) =>
                          handleChange("sizeChart", e.target.value)
                        }
                        className="h-10 w-full appearance-none rounded-xl border border-input bg-background px-3 py-2 text-xs font-semibold text-foreground shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        <option value="">Select size chart</option>
                        {sizeChartVar.sizeCharts?.map((chart) => (
                          <option key={chart._id} value={chart._id}>
                            {chart.name}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
                        <span className="text-xs">▼</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Care Instructions */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    Care & Maintenance Instructions
                  </label>
                  <textarea
                    rows={4}
                    placeholder="e.g. Dry clean recommended for first wash. Machine wash cold with gentle detergent..."
                    value={formData.careInstructions}
                    onChange={(e) =>
                      handleChange("careInstructions", e.target.value)
                    }
                    className="w-full rounded-xl border border-input bg-background p-3 text-xs placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors resize-y leading-relaxed"
                  />
                </div>

                {/* Specifications */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    Technical Specifications
                  </label>
                  <textarea
                    rows={4}
                    placeholder="e.g. Pattern: Embroidered Zari • Neck: Mandarin Collar • Sleeve: Full Sleeve..."
                    value={formData.specifications}
                    onChange={(e) =>
                      handleChange("specifications", e.target.value)
                    }
                    className="w-full rounded-xl border border-input bg-background p-3 text-xs placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors resize-y leading-relaxed"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-4 space-y-6">
            {/* Virtual Try-On Card */}
            <Card className="rounded-2xl border-border shadow-xs">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    <Eye className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold text-foreground">
                      Virtual Try-On (AR)
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      Interactive 3D AR clothing fitting.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 pt-0">
                <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/20">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-foreground">
                      Enable Virtual Try-On
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Allow customers to preview on AR avatar
                    </p>
                  </div>
                  <Switch
                    checked={formData.isVirtualTryOnEnabled}
                    onCheckedChange={(checked) =>
                      handleChange("isVirtualTryOnEnabled", checked)
                    }
                  />
                </div>

                {formData.isVirtualTryOnEnabled && (
                  <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      3D Asset URL (.glb / .usdz)
                    </label>
                    <Input
                      placeholder="https://cdn.baha.store/models/kurta-boys.glb"
                      value={formData.virtualTryOnAssetUrl}
                      onChange={(e) =>
                        handleChange("virtualTryOnAssetUrl", e.target.value)
                      }
                      className="h-10 text-xs font-mono rounded-xl bg-background"
                    />
                    <p className="text-[10px] text-muted-foreground">
                      Direct secure HTTPS link to 3D model asset.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ── STEP 3: COLOR VARIANTS, MEDIA & SIZING MATRIX ──────────────────── */}
      {currentStep === 3 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <Card className="rounded-2xl border-border shadow-xs">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  <Palette className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-foreground">
                    Color Variants & Inventory Matrix
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Upload gallery photos, set color shades, configure sizes,
                    inventory stock, and pricing.
                  </CardDescription>
                </div>
              </div>

              <Button
                type="button"
                onClick={addVariant}
                size="sm"
                className="rounded-xl font-semibold text-xs h-9 shadow-xs self-start sm:self-center"
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Add Color Variant
              </Button>
            </CardHeader>

            <CardContent className="space-y-6 pt-0">
              {variants.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-border p-10 text-center bg-muted/20">
                  <div className="mx-auto h-12 w-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground mb-3">
                    <Palette className="h-6 w-6" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground">
                    No Color Variants Added
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1 mb-4">
                    Every product must have at least one color variant with
                    associated pictures and sizing options.
                  </p>
                  <Button
                    type="button"
                    onClick={addVariant}
                    size="sm"
                    className="rounded-xl font-semibold text-xs shadow-xs"
                  >
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                    Add First Color Variant
                  </Button>
                </div>
              ) : (
                variants.map((variant, variantIndex) => {
                  const selectedColorObj = colorVar.colors?.find(
                    (c) => String(c._id) === String(variant.color),
                  );

                  return (
                    <div
                      key={variantIndex}
                      className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                        variant.defaultView
                          ? "border-primary/50 shadow-sm bg-card ring-1 ring-primary/20"
                          : "border-border bg-card/60 hover:border-border/80"
                      }`}
                    >
                      {/* VARIANT HEADER */}
                      <div className="p-4 bg-muted/40 border-b border-border flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-background text-[11px] font-bold text-foreground border border-border">
                            {variantIndex + 1}
                          </span>

                          <div className="flex items-center gap-2">
                            {selectedColorObj?.hexCode && (
                              <span
                                className="h-4 w-4 rounded-full border border-black/20 shadow-xs inline-block shrink-0"
                                style={{
                                  backgroundColor: selectedColorObj.hexCode,
                                }}
                              />
                            )}
                            <h3 className="text-sm font-bold text-foreground">
                              {selectedColorObj?.name ||
                                `Color Variant ${variantIndex + 1}`}
                            </h3>
                          </div>

                          {variant.defaultView && (
                            <Badge
                              variant="default"
                              className="text-[10px] font-bold uppercase tracking-wider bg-primary/15 text-primary border-primary/20"
                            >
                              Default Front View
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer px-2 py-1 rounded-lg hover:bg-background/80 transition-colors">
                            <input
                              type="radio"
                              name="defaultVariantRadio"
                              checked={variant.defaultView}
                              onChange={() => setDefaultVariant(variantIndex)}
                              className="accent-primary h-3.5 w-3.5"
                            />
                            <span>Set as Default</span>
                          </label>

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            onClick={() => removeVariant(variantIndex)}
                            title="Delete this variant"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* VARIANT CONTENT */}
                      <div className="p-5 space-y-6">
                        {/* COLOR SELECTOR */}
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                              <Palette className="h-3.5 w-3.5 text-foreground" />
                              Color Shade{" "}
                              <span className="text-destructive">*</span>
                            </label>
                            <div className="relative">
                              <select
                                value={variant.color}
                                onChange={(e) =>
                                  updateVariant(
                                    variantIndex,
                                    "color",
                                    e.target.value,
                                  )
                                }
                                className="h-10 w-full appearance-none rounded-xl border border-input bg-background px-3 py-2 text-xs font-semibold text-foreground shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                              >
                                <option value="">Select color</option>
                                {colorVar.colors?.map((color) => (
                                  <option key={color._id} value={color._id}>
                                    {color.name}
                                  </option>
                                ))}
                              </select>
                              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
                                <span className="text-xs">▼</span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                              Color Swatch Preview
                            </label>
                            <div className="flex items-center gap-3 h-10 px-3.5 rounded-xl border border-input bg-muted/20">
                              <div
                                className="h-5 w-5 rounded-full border border-black/20 shadow-xs shrink-0"
                                style={{
                                  backgroundColor:
                                    selectedColorObj?.hexCode || "#94a3b8",
                                }}
                              />
                              <span className="text-xs font-medium text-foreground">
                                {selectedColorObj?.name || "Unassigned"}
                              </span>
                              {selectedColorObj?.hexCode && (
                                <span className="text-[10px] font-mono text-muted-foreground ml-auto">
                                  {selectedColorObj.hexCode}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* GALLERY IMAGES */}
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                              <ImageIcon className="h-3.5 w-3.5 text-foreground" />
                              Variant Images ({variant.images.length})
                            </label>
                            <span className="text-[10px] text-muted-foreground">
                              PNG, JPG, WEBP • Max 10MB each
                            </span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                            {variant.images.map((image, imageIndex) => (
                              <div
                                key={imageIndex}
                                className="group relative aspect-square rounded-xl overflow-hidden border border-border bg-muted/30 shadow-xs"
                              >
                                <img
                                  src={image.file ? URL.createObjectURL(image.file) : image?.imageUrl}
                                  alt={`Variant image ${imageIndex + 1}`}
                                  className="h-full w-full object-cover transition-transform group-hover:scale-105 duration-200"
                                />

                                {imageIndex === 0 && (
                                  <span className="absolute top-1.5 left-1.5 bg-background/90 text-foreground font-bold text-[9px] px-1.5 py-0.5 rounded-md shadow-xs backdrop-blur-xs">
                                    Cover
                                  </span>
                                )}

                                {/* Server-hosted badge */}
                                {!image.file && (
                                  <span className="absolute bottom-1.5 left-1.5 bg-emerald-500/90 text-white font-bold text-[9px] px-1.5 py-0.5 rounded-md shadow-xs">
                                    Saved
                                  </span>
                                )}

                                <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      removeImage(variantIndex, imageIndex)
                                    }
                                    className="p-1.5 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm transition-transform hover:scale-110"
                                    title="Delete image"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}

                            <label className="aspect-square flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border hover:border-primary/60 bg-muted/10 hover:bg-muted/30 cursor-pointer transition-all text-center p-2 group">
                              <div className="p-2 rounded-full bg-muted group-hover:bg-primary/10 group-hover:text-primary text-muted-foreground transition-colors mb-1.5">
                                <Upload className="h-4 w-4" />
                              </div>
                              <span className="text-[11px] font-bold text-foreground">
                                Upload Photo
                              </span>
                              <span className="text-[9px] text-muted-foreground">
                                Click or drag
                              </span>
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={(e) =>
                                  handleImages(variantIndex, e.target.files)
                                }
                              />
                            </label>
                          </div>
                        </div>

                        {/* SIZE OPTIONS MATRIX */}
                        <div className="space-y-3 pt-2 border-t border-border/70">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                                <Package className="h-3.5 w-3.5 text-foreground" />
                                Sizing, Pricing & Stock
                              </h4>
                              <p className="text-[11px] text-muted-foreground">
                                Configure separate SKU, inventory count, regular
                                price, and discounted offer price for each size.
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={() => addOption(variantIndex)}
                                className="h-8 rounded-lg text-[11px] font-semibold"
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Add Size
                              </Button>
                            </div>
                          </div>

                          {/* Matrix Rows */}
                          <div className="space-y-2.5">
                            {variant.options.length === 0 ? (
                              <div className="p-6 text-center rounded-xl border border-dashed border-border bg-muted/20">
                                <p className="text-xs text-muted-foreground mb-2">
                                  No sizes configured for this color variant.
                                </p>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => addOption(variantIndex)}
                                  className="text-xs rounded-lg"
                                >
                                  <Plus className="h-3 w-3 mr-1" /> Add Size
                                  Option
                                </Button>
                              </div>
                            ) : (
                              variant.options.map((option, optionIndex) => {
                                const regular = Number(option.price) || 0;
                                const discount =
                                  Number(option.discountPrice) || 0;
                                const discountPercent =
                                  regular > 0 &&
                                  discount > 0 &&
                                  discount < regular
                                    ? Math.round(
                                        ((regular - discount) / regular) * 100,
                                      )
                                    : 0;

                                return (
                                  <div
                                    key={optionIndex}
                                    className="p-3.5 rounded-xl border border-border bg-muted/15 hover:bg-muted/30 transition-colors"
                                  >
                                    <div className="grid grid-cols-2 sm:grid-cols-12 gap-3 items-end">
                                      {/* SIZE */}
                                      <div className="sm:col-span-2 space-y-1">
                                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                          Size
                                        </label>
                                        <select
                                          value={option.size}
                                          onChange={(e) =>
                                            updateOption(
                                              variantIndex,
                                              optionIndex,
                                              "size",
                                              e.target.value,
                                            )
                                          }
                                          className="h-9 w-full rounded-lg border border-input bg-background px-2.5 py-1 text-xs font-semibold text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                        >
                                          <option value="">Choose</option>
                                          {sizeVar.sizes?.map((size) => (
                                            <option
                                              key={size._id}
                                              value={size._id}
                                            >
                                              {size.name}
                                            </option>
                                          ))}
                                        </select>
                                      </div>

                                      {/* SKU */}
                                      <div className="sm:col-span-3 space-y-1">
                                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                          SKU Code
                                        </label>
                                        <Input
                                          placeholder="BAHA-01-SZ"
                                          value={option.sku}
                                          onChange={(e) =>
                                            updateOption(
                                              variantIndex,
                                              optionIndex,
                                              "sku",
                                              e.target.value,
                                            )
                                          }
                                          className="h-9 text-xs font-mono rounded-lg bg-background"
                                        />
                                      </div>

                                      {/* STOCK */}
                                      <div className="sm:col-span-2 space-y-1">
                                        <div className="flex items-center justify-between">
                                          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                            Stock
                                          </label>
                                          <span
                                            className={`text-[9px] font-bold ${
                                              option.stock > 5
                                                ? "text-emerald-500"
                                                : option.stock > 0
                                                  ? "text-amber-500"
                                                  : "text-destructive"
                                            }`}
                                          >
                                            {option.stock > 5
                                              ? "In Stock"
                                              : option.stock > 0
                                                ? "Low"
                                                : "Out"}
                                          </span>
                                        </div>
                                        <Input
                                          type="number"
                                          min="0"
                                          placeholder="0"
                                          value={option.stock}
                                          onChange={(e) =>
                                            updateOption(
                                              variantIndex,
                                              optionIndex,
                                              "stock",
                                              Math.max(
                                                0,
                                                parseInt(e.target.value) || 0,
                                              ),
                                            )
                                          }
                                          className="h-9 text-xs rounded-lg bg-background"
                                        />
                                      </div>

                                      {/* REGULAR PRICE */}
                                      <div className="sm:col-span-2 space-y-1">
                                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                          MRP (₹)
                                        </label>
                                        <Input
                                          type="number"
                                          min="0"
                                          placeholder="1299"
                                          value={option.price}
                                          onChange={(e) =>
                                            updateOption(
                                              variantIndex,
                                              optionIndex,
                                              "price",
                                              Math.max(
                                                0,
                                                parseFloat(e.target.value) || 0,
                                              ),
                                            )
                                          }
                                          className="h-9 text-xs rounded-lg bg-background"
                                        />
                                      </div>

                                      {/* SALE PRICE */}
                                      <div className="sm:col-span-2 space-y-1">
                                        <div className="flex items-center justify-between">
                                          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                            Offer (₹)
                                          </label>
                                          {discountPercent > 0 && (
                                            <span className="text-[9px] font-bold text-emerald-500">
                                              -{discountPercent}%
                                            </span>
                                          )}
                                        </div>
                                        <Input
                                          type="number"
                                          min="0"
                                          placeholder="999"
                                          value={option.discountPrice}
                                          onChange={(e) =>
                                            updateOption(
                                              variantIndex,
                                              optionIndex,
                                              "discountPrice",
                                              Math.max(
                                                0,
                                                parseFloat(e.target.value) || 0,
                                              ),
                                            )
                                          }
                                          className="h-9 text-xs rounded-lg bg-background font-semibold"
                                        />
                                      </div>

                                      {/* ACTIONS */}
                                      <div className="sm:col-span-1 flex items-center justify-end gap-1.5 pb-1">
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon"
                                          onClick={() =>
                                            removeOption(
                                              variantIndex,
                                              optionIndex,
                                            )
                                          }
                                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                                          title="Delete size"
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── STEP 4: RELATED PRODUCTS ───────────────────────────────────────── */}
      {currentStep === 4 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200">
          {/* Main search and catalogue selector */}
          <div className="lg:col-span-8 space-y-6">
            <Card className="rounded-2xl border-border shadow-xs">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    <Link2 className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold text-foreground">
                      Select Related Products
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      Search and link matching outfits, accessories, or matching sets for product recommendations.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 pt-0">
                {/* Search input */}
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products by title, slug, or SKU..."
                    value={relatedSearch}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10 pr-10 h-10 text-xs rounded-xl bg-background font-medium"
                  />
                  {relatedSearch && (
                    <button
                      type="button"
                      onClick={() => handleSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Candidate products grid */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground font-semibold px-1">
                    <span>
                      {productVar.status === "loading"
                        ? "Searching catalog..."
                        : `${
                            (productVar.products || []).filter(
                              (p: any) => String(p._id) !== String(productId),
                            ).length
                          } product(s) available`}
                    </span>
                    <span>Click card to toggle selection</span>
                  </div>

                  {productVar.status === "loading" ? (
                    <div className="py-12 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      <p className="text-xs font-medium">Fetching catalog products...</p>
                    </div>
                  ) : (productVar.products || []).filter(
                      (p: any) => String(p._id) !== String(productId),
                    ).length === 0 ? (
                    <div className="p-8 text-center rounded-xl border border-dashed border-border bg-muted/15 space-y-2">
                      <Package className="h-8 w-8 text-muted-foreground mx-auto opacity-50" />
                      <p className="text-xs font-semibold text-foreground">No products found</p>
                      <p className="text-[11px] text-muted-foreground">
                        Try searching with a different term or keyword.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
                      {(productVar.products || [])
                        .filter(
                          (p: any) => String(p._id) !== String(productId),
                        )
                        .map((p: any) => {
                          const isSelected = (formData.relatedProducts || []).includes(String(p._id));
                          const coverImg =
                            p.variants?.[0]?.images?.[0]?.imageUrl ??
                            p.variants?.[0]?.images?.[0] ??
                            "";
                          const price =
                            p.variants?.[0]?.options?.[0]?.discountPrice ||
                            p.variants?.[0]?.options?.[0]?.price ||
                            0;
                          const catName = p.category?.[0]?.name || p.category?.name || "General";

                          return (
                            <div
                              key={p._id}
                              onClick={() => toggleRelatedProduct(p)}
                              className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer flex items-center gap-3 ${
                                isSelected
                                  ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary/40"
                                  : "border-border bg-card hover:bg-muted/30 hover:border-border/80"
                              }`}
                            >
                              <div className="h-14 w-14 rounded-lg overflow-hidden border border-border/80 bg-muted/30 shrink-0 flex items-center justify-center">
                                {coverImg ? (
                                  <img
                                    src={coverImg}
                                    alt={p.name}
                                    className="h-full w-full object-contain"
                                  />
                                ) : (
                                  <Package className="h-6 w-6 text-muted-foreground opacity-40" />
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-foreground line-clamp-1">
                                  {p.name}
                                </p>
                                <p className="text-[10px] text-muted-foreground font-medium line-clamp-1 mt-0.5">
                                  {catName} {price > 0 && `• ₹${price}`}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge
                                    variant={isSelected ? "default" : "outline"}
                                    className={`text-[9px] px-1.5 py-0 font-semibold ${
                                      isSelected
                                        ? "bg-primary text-primary-foreground"
                                        : "text-muted-foreground"
                                    }`}
                                  >
                                    {isSelected ? "Selected" : "Add to Related"}
                                  </Badge>
                                </div>
                              </div>

                              <div
                                className={`h-5 w-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                                  isSelected
                                    ? "bg-primary border-primary text-primary-foreground"
                                    : "border-border text-transparent"
                                }`}
                              >
                                <Check className="h-3 w-3 stroke-[3]" />
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Selected products summary sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="rounded-2xl border-border shadow-xs">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-bold text-foreground">
                        Selected ({formData.relatedProducts?.length || 0})
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground">
                        Linked cross-sell items.
                      </CardDescription>
                    </div>
                  </div>

                  {formData.relatedProducts?.length > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, relatedProducts: [] }));
                        setSelectedProductsData([]);
                      }}
                      className="text-[11px] h-7 px-2 text-muted-foreground hover:text-destructive"
                    >
                      Clear all
                    </Button>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-3 pt-0">
                {formData.relatedProducts?.length === 0 ? (
                  <div className="p-6 text-center rounded-xl border border-dashed border-border bg-muted/15 space-y-2">
                    <Link2 className="h-6 w-6 text-muted-foreground mx-auto opacity-50" />
                    <p className="text-xs font-semibold text-foreground">No items selected</p>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                      Search and select products from the left to recommend them on this product's page.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                    {formData.relatedProducts.map((pId) => {
                      const prodObj =
                        selectedProductsData.find((p) => String(p._id) === String(pId)) ||
                        productVar.products?.find((p) => String(p._id) === String(pId));
                      const name = prodObj?.name || `Product ID: ${pId}`;
                      const coverImg =
                        prodObj?.variants?.[0]?.images?.[0]?.imageUrl ??
                        prodObj?.variants?.[0]?.images?.[0] ??
                        "";
                      const price =
                        prodObj?.variants?.[0]?.options?.[0]?.discountPrice ||
                        prodObj?.variants?.[0]?.options?.[0]?.price;

                      return (
                        <div
                          key={pId}
                          className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-border bg-muted/20"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="h-10 w-10 rounded-lg overflow-hidden border border-border bg-background shrink-0 flex items-center justify-center">
                              {coverImg ? (
                                <img
                                  src={coverImg}
                                  alt={name}
                                  className="h-full w-full object-contain"
                                />
                              ) : (
                                <Package className="h-4 w-4 text-muted-foreground opacity-40" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-foreground truncate">
                                {name}
                              </p>
                              {price !== undefined && (
                                <p className="text-[10px] text-muted-foreground font-mono">
                                  ₹{price}
                                </p>
                              )}
                            </div>
                          </div>

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeRelatedProduct(pId)}
                            className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0 rounded-lg"
                            title="Remove related product"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ── STEP 5: SEO & REVIEW ───────────────────────────────────────────── */}
      {currentStep === 5 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200">
          <div className="lg:col-span-7 space-y-6">
            {/* SEO Card */}
            <Card className="rounded-2xl border-border shadow-xs">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
                    <Globe className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold text-foreground">
                      Search Engine Optimization (SEO)
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      Tune metadata tags for search engine crawling and SERP
                      display.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 pt-0">
                {/* Meta Title */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      Meta Title
                    </label>
                    <span
                      className={`text-[10px] font-mono ${
                        formData.metaTitle.length > 60
                          ? "text-amber-500 font-bold"
                          : "text-muted-foreground"
                      }`}
                    >
                      {formData.metaTitle.length}/60 chars
                    </span>
                  </div>
                  <Input
                    placeholder="e.g. Traditional Boys Silk Kurta & Pajama | Baha"
                    value={formData.metaTitle}
                    onChange={(e) => handleChange("metaTitle", e.target.value)}
                    className="h-10 text-xs rounded-xl bg-background font-medium"
                  />
                </div>

                {/* Meta Description */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      Meta Description
                    </label>
                    <span
                      className={`text-[10px] font-mono ${
                        formData.metaDescription.length > 160
                          ? "text-amber-500 font-bold"
                          : "text-muted-foreground"
                      }`}
                    >
                      {formData.metaDescription.length}/160 chars
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    placeholder="Summarize product appeal, material, and age range for Google searchers..."
                    value={formData.metaDescription}
                    onChange={(e) =>
                      handleChange("metaDescription", e.target.value)
                    }
                    className="w-full rounded-xl border border-input bg-background p-3 text-xs placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors resize-y leading-relaxed"
                  />
                </div>

                {/* LIVE GOOGLE SERP PREVIEW BOX */}
                <div className="pt-2 border-t border-border/80">
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    Google Search Result Preview
                  </p>
                  <div className="p-3.5 rounded-xl border border-border bg-muted/30 space-y-1 font-sans">
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <span className="font-semibold text-foreground">
                        baha.store
                      </span>
                      <span>›</span>
                      <span>products</span>
                      <span>›</span>
                      <span className="truncate max-w-[120px]">
                        {formData.slug || "product-name"}
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline line-clamp-1 cursor-pointer">
                      {formData.metaTitle ||
                        formData.name ||
                        "Product Title Preview | Baha Store"}
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {formData.metaDescription ||
                        formData.description ||
                        "Browse our exquisite children's clothing collection at Baha. Handcrafted with skin-friendly fabrics for maximum comfort and regal charm."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* FINAL REVIEW SUMMARY CARD */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="rounded-2xl border-border shadow-xs bg-card">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold text-foreground">
                      Product Summary Review
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      Verify specifications before saving changes.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 pt-0 text-xs">
                {/* Title & Category overview */}
                <div className="p-3.5 rounded-xl border border-border bg-muted/20 space-y-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Title
                    </span>
                    <p className="text-sm font-bold text-foreground line-clamp-2">
                      {formData.name || "Untitled Product"}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 pt-1 border-t border-border/60">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Category
                      </span>
                      <p className="font-semibold text-foreground">
                        {selectedCategoryObj?.name || "None"}
                        {selectedSubCategoryObj &&
                          ` › ${selectedSubCategoryObj.name}`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Badges overview */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Badge
                    variant={
                      formData.status === "active" ? "success" : "secondary"
                    }
                    className="text-[10px] font-semibold uppercase"
                  >
                    {formData.status}
                  </Badge>
                  {formData.isFeatured && (
                    <Badge
                      variant="warning"
                      className="text-[10px] font-semibold"
                    >
                      <Sparkles className="h-3 w-3 mr-1" /> Featured
                    </Badge>
                  )}
                  {formData.newArrival && (
                    <Badge
                      variant="default"
                      className="text-[10px] font-semibold bg-blue-500/15 text-blue-500 border-blue-500/20"
                    >
                      <Tag className="h-3 w-3 mr-1" /> New Arrival
                    </Badge>
                  )}
                  {formData.bestSeller && (
                    <Badge
                      variant="default"
                      className="text-[10px] font-semibold bg-rose-500/15 text-rose-500 border-rose-500/20"
                    >
                      <Zap className="h-3 w-3 mr-1" /> Best Seller
                    </Badge>
                  )}
                  {formData.isVirtualTryOnEnabled && (
                    <Badge
                      variant="outline"
                      className="text-[10px] font-semibold text-indigo-500"
                    >
                      <Eye className="h-3 w-3 mr-1" /> Virtual Try-On
                    </Badge>
                  )}
                </div>

                {/* Inventory & Variants overview */}
                <div className="p-3.5 rounded-xl border border-border bg-muted/20 space-y-2.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Color Variants & Inventory ({variants.length})
                  </span>

                  <div className="space-y-1.5">
                    {variants.map((v, i) => {
                      const colorObj = colorVar.colors?.find(
                        (c) => String(c._id) === String(v.color),
                      );
                      const totalSizeCount = v.options.length;
                      const variantStock = v.options.reduce(
                        (sum, o) => sum + (Number(o.stock) || 0),
                        0,
                      );

                      return (
                        <div
                          key={i}
                          className="flex items-center justify-between text-[11px] p-2 rounded-lg bg-background border border-border/80"
                        >
                          <div className="flex items-center gap-2">
                            {colorObj?.hexCode && (
                              <span
                                className="h-3.5 w-3.5 rounded-full border border-black/20"
                                style={{ backgroundColor: colorObj.hexCode }}
                              />
                            )}
                            <span className="font-semibold text-foreground">
                              {colorObj?.name || `Color #${i + 1}`}
                            </span>
                            {v.defaultView && (
                              <span className="text-[9px] px-1.5 rounded bg-primary/10 text-primary font-bold">
                                Default
                              </span>
                            )}
                          </div>

                          <span className="text-muted-foreground font-mono">
                            {totalSizeCount} size(s) • {variantStock} units
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/60 font-semibold">
                    <span>Variants & Media:</span>
                    <span className="font-bold text-foreground">
                      {totalVariants} variant(s) • {totalImages} image(s)
                    </span>
                  </div>
                  <div className="flex items-center justify-between font-semibold">
                    <span>Total Stock Available:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {totalStock} Units
                    </span>
                  </div>
                </div>

                {/* Fabric & Specifications */}
                {(formData.fabric || formData.careInstructions) && (
                  <div className="p-3 rounded-xl border border-border bg-muted/20 space-y-1">
                    {formData.fabric && (
                      <p className="text-[11px]">
                        <span className="text-muted-foreground font-medium">
                          Fabric:{" "}
                        </span>
                        <span className="font-semibold text-foreground">
                          {formData.fabric}
                        </span>
                      </p>
                    )}
                    {formData.careInstructions && (
                      <p className="text-[11px] line-clamp-1">
                        <span className="text-muted-foreground font-medium">
                          Care:{" "}
                        </span>
                        <span className="text-foreground">
                          {formData.careInstructions}
                        </span>
                      </p>
                    )}
                  </div>
                )}

                {/* Related Products overview */}
                <div className="p-3.5 rounded-xl border border-border bg-muted/20 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Related Products
                    </span>
                    <Badge variant="outline" className="text-[10px] font-semibold">
                      {formData.relatedProducts?.length || 0} Linked
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {formData.relatedProducts?.length > 0
                      ? `${formData.relatedProducts.length} product(s) linked for cross-sell recommendations.`
                      : "No related products linked."}
                  </p>
                </div>

                {/* Final Submission Button */}
                <Button
                  type="button"
                  onClick={handleSubmit}
                  className="w-full h-11 text-xs font-bold rounded-xl shadow-md bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-2 mt-4"
                >
                  <Check className="h-4 w-4" />
                  Save & Update Product
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
