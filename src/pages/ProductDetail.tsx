import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Package,
  Edit2,
  FileText,
  Palette,
  Sparkles,
  Tag,
  Zap,
  Eye,
  Globe,
  Layers,
  BadgeCheck,
  Link2,
  Trash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  deleteProduct,
  getProductById,
  setProductDetails,
} from "@/store/productSlice";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const productVar = useSelector((state: RootState) => state.product);

  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [deletingProduct, setDeletingProduct] = useState(false);

  // Fetch on mount, clear on unmount
  useEffect(() => {
    if (id) {
      dispatch(getProductById(id));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    return () => {
      dispatch(setProductDetails(null));
    };
  }, [id, dispatch]);

  // Reset image index when variant changes
  useEffect(() => {
    setSelectedImageIndex(0);
  }, [selectedVariantIndex]);

  const isLoading = productVar.status === "loading";

  // Derived values from real API shape
  const defaultVariantIdx =
    productVar.productDetails?.variants?.findIndex((v: any) => v.defaultView) ??
    0;
  const activeVariantIdx =
    selectedVariantIndex < (productVar.productDetails?.variants?.length ?? 0)
      ? selectedVariantIndex
      : defaultVariantIdx;

  const activeVariant = productVar.productDetails?.variants?.[activeVariantIdx];
  const activeImages: string[] =
    activeVariant?.images?.map((img: any) => img.imageUrl ?? img) ?? [];

  const totalStock =
    productVar.productDetails?.variants?.reduce(
      (acc: number, v: any) =>
        acc +
        (v.options ?? []).reduce(
          (s: number, o: any) => s + (Number(o.stock) || 0),
          0,
        ),
      0,
    ) ?? 0;

  const stockLabel =
    totalStock > 10
      ? "In Stock"
      : totalStock > 0
        ? "Low Stock"
        : "Out of Stock";
  const stockClass =
    totalStock > 10
      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
      : totalStock > 0
        ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
        : "bg-destructive/10 text-destructive border-destructive/20";

  const categoryName = productVar.productDetails?.category?.[0]?.name ?? "—";
  const subCategoryName =
    productVar.productDetails?.subCategory?.[0]?.name ?? null;

  const handleDelete = (id: string) => {
    if (id) {
      dispatch(deleteProduct(id, navigate));
    }
    setDeletingProduct(false);
  };

  // Loading skeleton / not found
  if (isLoading || (!productVar.productDetails && !isLoading)) {
    return (
      <div className="p-4 md:p-8 space-y-6 max-w-[1400px] mx-auto pb-16 animate-in fade-in duration-300">
        {isLoading ? (
          <>
            <div className="h-10 w-64 bg-muted rounded-xl animate-pulse" />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 space-y-4">
                <div className="h-96 rounded-3xl bg-muted animate-pulse" />
                <div className="h-48 rounded-3xl bg-muted animate-pulse" />
              </div>
              <div className="lg:col-span-5 space-y-4">
                <div className="h-64 rounded-3xl bg-muted animate-pulse" />
                <div className="h-48 rounded-3xl bg-muted animate-pulse" />
              </div>
            </div>
          </>
        ) : (
          <div className="p-8 max-w-4xl mx-auto text-center space-y-4">
            <div className="p-4 rounded-full bg-muted inline-block text-muted-foreground">
              <Package className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold">Product Not Found</h2>
            <p className="text-xs text-muted-foreground">
              No product matching "{id}" was found in your catalog.
            </p>
            <Button
              onClick={() => navigate("/products")}
              className="gap-2 text-xs"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Products
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-[1400px] mx-auto pb-16 animate-in fade-in duration-300">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/products")}
            className="h-10 w-10 rounded-2xl border-border hover:bg-muted shrink-0"
            title="Back to Products"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground line-clamp-1">
                {productVar.productDetails?.name}
              </h1>
              <div className="flex items-center gap-1.5 flex-wrap">
                {productVar.productDetails?.isFeatured && (
                  <Badge className="text-[10px] font-semibold bg-amber-500/15 text-amber-600 border-amber-500/25 gap-1">
                    <Sparkles className="h-2.5 w-2.5" /> Featured
                  </Badge>
                )}
                {productVar.productDetails?.newArrival && (
                  <Badge className="text-[10px] font-semibold bg-blue-500/15 text-blue-600 border-blue-500/25 gap-1">
                    <Tag className="h-2.5 w-2.5" /> New Arrival
                  </Badge>
                )}
                {productVar.productDetails?.bestSeller && (
                  <Badge className="text-[10px] font-semibold bg-rose-500/15 text-rose-600 border-rose-500/25 gap-1">
                    <Zap className="h-2.5 w-2.5" /> Best Seller
                  </Badge>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">
              Slug:{" "}
              <span className="font-semibold text-foreground">
                {productVar.productDetails?.slug}
              </span>{" "}
              &bull; Category:{" "}
              <span className="font-semibold text-foreground">
                {categoryName}
                {subCategoryName && ` › ${subCategoryName}`}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-xs font-semibold text-rose-500 border-border hover:bg-rose-500/10 cursor-pointer"
              >
                <Trash className="h-4 w-4" /> Delete
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this Product?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  this Product.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-600 hover:bg-red-700"
                  onClick={() => handleDelete(productVar.productDetails?._id)}
                >
                  Yes, delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button
            onClick={() =>
              navigate(`/products/edit/${productVar.productDetails?._id}`)
            }
            className="gap-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md"
          >
            <Edit2 className="h-4 w-4" /> Edit Product
          </Button>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: Gallery + Description */}
        <div className="lg:col-span-7 space-y-5">
          {/* Variant Color Tabs */}
          {(productVar.productDetails?.variants?.length ?? 0) > 1 && (
            <div className="flex items-center gap-2 flex-wrap">
              {productVar.productDetails?.variants.map(
                (v: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedVariantIndex(idx)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                      idx === activeVariantIdx
                        ? "border-primary bg-primary/10 text-primary shadow-xs"
                        : "border-border bg-muted/20 text-muted-foreground hover:bg-muted/40"
                    }`}
                  >
                    {v.color?.hexCode && (
                      <span
                        className="h-3.5 w-3.5 rounded-full border border-black/15 shrink-0"
                        style={{ backgroundColor: v.color.hexCode }}
                      />
                    )}
                    {v.color?.name ?? `Variant ${idx + 1}`}
                    {v.defaultView && (
                      <span className="text-[9px] font-bold bg-primary/15 text-primary px-1 rounded">
                        Default
                      </span>
                    )}
                  </button>
                ),
              )}
            </div>
          )}

          {/* Image Gallery Card */}
          <Card className="rounded-3xl border border-border bg-card shadow-xs overflow-hidden">
            <CardContent className="p-4 space-y-4">
              <div className="relative aspect-square sm:aspect-[4/5] max-h-[540px] w-full rounded-2xl overflow-hidden border border-border/60 bg-muted/20 flex items-center justify-center">
                {activeImages.length > 0 ? (
                  <img
                    src={activeImages[selectedImageIndex]}
                    alt={productVar.productDetails?.name}
                    className="h-full w-full object-contain transition-all duration-300"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                    <Package className="h-12 w-12 opacity-30" />
                  </div>
                )}
                {activeImages.length > 1 && (
                  <span className="absolute bottom-3 right-3 bg-background/80 backdrop-blur-sm text-foreground text-[10px] font-bold px-2 py-1 rounded-lg border border-border/60">
                    {selectedImageIndex + 1} / {activeImages.length}
                  </span>
                )}
              </div>

              {activeImages.length > 1 && (
                <div className="flex items-center gap-2.5 overflow-x-auto py-2 px-3">
                  {activeImages.map((img: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`h-16 w-16 min-w-[64px] rounded-xl overflow-hidden border-2 transition-all shrink-0 bg-muted/20 flex items-center justify-center ${
                        selectedImageIndex === idx
                          ? "border-primary ring-2 ring-primary/20 scale-105 shadow-md"
                          : "border-border opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Thumb ${idx + 1}`}
                        className="h-full w-full object-contain"
                      />
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Description & Specs */}
          <Card className="rounded-3xl border border-border bg-card shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <FileText className="h-4 w-4 text-indigo-500" /> Product
                Overview & Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              <p className="text-xs text-muted-foreground leading-relaxed bg-muted/20 p-4 rounded-2xl border border-border/40">
                {productVar.productDetails?.description ||
                  "No detailed product description available."}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                {productVar.productDetails?.fabric && (
                  <div className="p-3 rounded-xl bg-background border border-border">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                      Fabric
                    </span>
                    <span className="font-semibold text-foreground mt-0.5 block">
                      {productVar.productDetails?.fabric}
                    </span>
                  </div>
                )}
                {productVar.productDetails?.careInstructions && (
                  <div className="p-3 rounded-xl bg-background border border-border col-span-2">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                      Care Instructions
                    </span>
                    <span className="font-medium text-foreground mt-0.5 block line-clamp-2">
                      {productVar.productDetails?.careInstructions}
                    </span>
                  </div>
                )}
                {productVar.productDetails?.specifications && (
                  <div className="p-3 rounded-xl bg-background border border-border col-span-full">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                      Specifications
                    </span>
                    <span className="font-medium text-foreground mt-0.5 block line-clamp-3">
                      {productVar.productDetails?.specifications}
                    </span>
                  </div>
                )}
                {productVar.productDetails?.isVirtualTryOnEnabled && (
                  <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 col-span-full flex items-center gap-2">
                    <Eye className="h-4 w-4 text-indigo-500 shrink-0" />
                    <div>
                      <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
                        Virtual Try-On Enabled
                      </span>
                      {productVar.productDetails?.virtualTryOnAssetUrl && (
                        <span className="font-mono text-[10px] text-muted-foreground line-clamp-1">
                          {productVar.productDetails?.virtualTryOnAssetUrl}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: Inventory + Meta */}
        <div className="lg:col-span-5 space-y-5">
          {/* Inventory Summary */}
          <Card className="rounded-3xl border border-border bg-card shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <Layers className="h-4 w-4 text-purple-500" /> Inventory Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              <div className="p-4 rounded-2xl bg-muted/30 border border-border flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                    Total Stock
                  </span>
                  <span className="text-2xl font-extrabold text-foreground">
                    {totalStock}
                    <span className="text-sm font-semibold text-muted-foreground ml-1">
                      units
                    </span>
                  </span>
                </div>
                <span
                  className={`px-3 py-1.5 rounded-full text-xs font-extrabold border ${stockClass}`}
                >
                  {stockLabel}
                </span>
              </div>

              <div className="space-y-3">
                {(productVar.productDetails?.variants ?? []).map(
                  (variant: any, vi: number) => {
                    const colorObj = variant.color;
                    const variantStock = (variant.options ?? []).reduce(
                      (s: number, o: any) => s + (Number(o.stock) || 0),
                      0,
                    );
                    return (
                      <div
                        key={vi}
                        className="rounded-xl border border-border bg-muted/10 overflow-hidden"
                      >
                        <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 border-b border-border/60">
                          {colorObj?.hexCode && (
                            <span
                              className="h-3.5 w-3.5 rounded-full border border-black/15 shrink-0"
                              style={{ backgroundColor: colorObj.hexCode }}
                            />
                          )}
                          <span className="text-xs font-bold text-foreground">
                            {colorObj?.name ?? `Variant ${vi + 1}`}
                          </span>
                          {variant.defaultView && (
                            <Badge className="text-[9px] ml-1 bg-primary/10 text-primary border-primary/20">
                              Default
                            </Badge>
                          )}
                          <span className="text-[10px] font-mono text-muted-foreground ml-auto">
                            {variantStock} units
                          </span>
                        </div>
                        <div className="divide-y divide-border/40">
                          {(variant.options ?? []).map(
                            (opt: any, oi: number) => {
                              const regular = Number(opt.price) || 0;
                              const discount = Number(opt.discountPrice) || 0;
                              const pct =
                                regular > 0 &&
                                discount > 0 &&
                                discount < regular
                                  ? Math.round(
                                      ((regular - discount) / regular) * 100,
                                    )
                                  : 0;
                              return (
                                <div
                                  key={oi}
                                  className="flex items-center justify-between px-3 py-2 text-[11px]"
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-foreground bg-background border border-border px-2 py-0.5 rounded-lg">
                                      {opt.size?.name ?? opt.size}
                                    </span>
                                    {opt.sku && (
                                      <span className="font-mono text-muted-foreground">
                                        {opt.sku}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <div>
                                      <span className="font-bold text-foreground">
                                        ₹{discount || regular}
                                      </span>
                                      {pct > 0 && (
                                        <>
                                          <span className="text-muted-foreground line-through ml-1">
                                            ₹{regular}
                                          </span>
                                          <span className="text-emerald-500 font-bold ml-1">
                                            -{pct}%
                                          </span>
                                        </>
                                      )}
                                    </div>
                                    <span
                                      className={`font-bold ${opt.stock > 5 ? "text-emerald-500" : opt.stock > 0 ? "text-amber-500" : "text-destructive"}`}
                                    >
                                      {opt.stock} pc
                                    </span>
                                  </div>
                                </div>
                              );
                            },
                          )}
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            </CardContent>
          </Card>

          {/* Product Metadata */}
          <Card className="rounded-3xl border border-border bg-card shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <BadgeCheck className="h-4 w-4 text-emerald-500" /> Product
                Metadata
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-1.5 text-xs">
              {[
                { label: "Product ID", value: productVar.productDetails._id },
                { label: "Slug", value: productVar.productDetails.slug },
                {
                  label: "Category",
                  value:
                    categoryName +
                    (subCategoryName ? ` › ${subCategoryName}` : ""),
                },
                {
                  label: "Size Chart",
                  value:
                    productVar.productDetails.sizeChart?.name ??
                    productVar.productDetails.sizeChart ??
                    "—",
                },
                {
                  label: "Created",
                  value: productVar.productDetails.createdAt
                    ? new Date(
                        productVar.productDetails.createdAt,
                      ).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "—",
                },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="flex items-start justify-between gap-4 py-1.5 border-b border-border/50 last:border-0"
                >
                  <span className="text-muted-foreground font-medium shrink-0">
                    {label}:
                  </span>
                  <span className="font-semibold text-foreground font-mono text-right break-all max-w-[200px]">
                    {value}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* SEO Card */}
          {(productVar.productDetails.metaTitle ||
            productVar.productDetails.metaDescription) && (
            <Card className="rounded-3xl border border-border bg-card shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Globe className="h-4 w-4 text-sky-500" /> SEO Metadata
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3 text-xs">
                {productVar.productDetails.metaTitle && (
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                      Meta Title
                    </span>
                    <p className="font-semibold text-foreground bg-muted/20 px-3 py-2 rounded-xl border border-border/50">
                      {productVar.productDetails.metaTitle}
                    </p>
                  </div>
                )}
                {productVar.productDetails.metaDescription && (
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                      Meta Description
                    </span>
                    <p className="text-muted-foreground leading-relaxed bg-muted/20 px-3 py-2 rounded-xl border border-border/50 line-clamp-3">
                      {productVar.productDetails.metaDescription}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Color Variants Quick Reference */}
          <Card className="rounded-3xl border border-border bg-card shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <Palette className="h-4 w-4 text-rose-500" /> Color Variants (
                {productVar.productDetails.variants?.length ?? 0})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 flex flex-wrap gap-2">
              {(productVar.productDetails.variants ?? []).map(
                (v: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/20 border border-border text-xs font-semibold"
                  >
                    {v.color?.hexCode && (
                      <span
                        className="h-3.5 w-3.5 rounded-full border border-black/15 shrink-0"
                        style={{ backgroundColor: v.color.hexCode }}
                      />
                    )}
                    {v.color?.name ?? `Variant ${i + 1}`}
                    <span className="text-[10px] text-muted-foreground font-normal">
                      {v.images?.length ?? 0} img
                    </span>
                  </div>
                ),
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* RELATED PRODUCTS */}
      {productVar.productDetails.relatedProducts &&
        productVar.productDetails.relatedProducts.length > 0 && (
          <Card className="rounded-3xl border border-border bg-card shadow-xs overflow-hidden">
            <CardHeader className="pb-3 border-b border-border/60">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                  <Link2 className="h-4 w-4 text-indigo-500" />
                  Related Products (
                  {productVar.productDetails.relatedProducts.length})
                </CardTitle>
                <Badge
                  variant="outline"
                  className="text-[11px] font-semibold text-muted-foreground"
                >
                  Linked Recommendations
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {productVar.productDetails.relatedProducts.map((rel: any) => {
                  if (!rel || typeof rel !== "object") return null;

                  const coverImg =
                    rel.variants?.[0]?.images?.[0]?.imageUrl ??
                    rel.variants?.[0]?.images?.[0] ??
                    "";
                  const firstOption = rel.variants?.[0]?.options?.[0];
                  const regularPrice = Number(firstOption?.price) || 0;
                  const offerPrice = Number(firstOption?.discountPrice) || 0;
                  const catName =
                    rel.category?.[0]?.name ?? rel.category?.name ?? "Clothing";

                  return (
                    <div
                      key={rel._id}
                      onClick={() => navigate(`/products/${rel._id}`)}
                      className="group rounded-2xl border border-border bg-background p-3.5 hover:border-primary/50 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
                    >
                      <div>
                        <div className="aspect-square w-full rounded-xl overflow-hidden bg-muted/20 border border-border/50 flex items-center justify-center relative mb-3">
                          {coverImg ? (
                            <img
                              src={coverImg}
                              alt={rel.name}
                              className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-200"
                            />
                          ) : (
                            <Package className="h-8 w-8 text-muted-foreground opacity-30" />
                          )}

                          {rel.isFeatured && (
                            <span className="absolute top-2 left-2 text-[9px] font-bold bg-amber-500/15 text-amber-600 border border-amber-500/25 px-1.5 py-0.5 rounded-md backdrop-blur-xs">
                              Featured
                            </span>
                          )}
                        </div>

                        <h4 className="text-xs font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                          {rel.name}
                        </h4>
                        <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5 font-medium">
                          {catName}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-3 mt-3 border-t border-border/60">
                        <div>
                          <span className="text-xs font-bold text-foreground">
                            ₹{offerPrice || regularPrice}
                          </span>
                          {offerPrice > 0 && regularPrice > offerPrice && (
                            <span className="text-[10px] text-muted-foreground line-through ml-1.5">
                              ₹{regularPrice}
                            </span>
                          )}
                        </div>

                        <span className="text-[11px] font-semibold text-primary group-hover:underline flex items-center gap-0.5">
                          View <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
    </div>
  );
}
