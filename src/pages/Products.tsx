import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Plus,
  Search,
  SquarePen,
  Eye,
  Filter,
  Sparkles,
  Loader2,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
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
import { CustomPagination } from "@/components/ui/custom-pagination";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteProduct,
  getAllProducts,
} from "@/store/productSlice";
import type { AppDispatch, RootState } from "@/store/store";
import { getAllCategories } from "@/store/categorySlice";
import { getAllSize } from "@/store/sizeSlice";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Products() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const productsVar = useSelector((state: RootState) => state.product);
  const categoryVar = useSelector((state: RootState) => state.category);
  const sizeVar = useSelector((state: RootState) => state.size);

  const [formVar, setFormVar] = useState({
    keyword: "",
    limit: 10,
    offset: 0,
    status: "",
    category: "",
    size: "",
  });

  // Ref
  const searchTimeoutRef = useRef<any>(null);
  // Derive total stock for a product across all variants/options
  const getTotalStock = (product: any): number =>
    (product.variants ?? []).reduce(
      (acc: number, v: any) =>
        acc +
        (v.options ?? []).reduce((a: number, o: any) => a + (o.stock ?? 0), 0),
      0,
    );

  // Get the display price (discountPrice first, then price) from first option of first variant
  const getDisplayPrice = (product: any) => {
    const firstOption = product.variants?.[0]?.options?.[0];
    return {
      price: firstOption?.price ?? 0,
      discountPrice: firstOption?.discountPrice,
    };
  };

  // Handle Category change
  const handleCategoryChange = (value: any) => {
    setFormVar((prev) => ({
      ...prev,
      category: value,
      offset: 0,
    }));

    dispatch(
      getAllProducts(
        formVar.keyword,
        formVar.limit,
        0,
        formVar.status,
        value,
        formVar.size,
      ),
    );
  };

  // handle size change
  const handleSizeChange = (value: any) => {
    setFormVar((prev) => ({
      ...prev,
      size: value,
      offset: 0,
    }));

    dispatch(
      getAllProducts(
        formVar.keyword,
        formVar.limit,
        0,
        formVar.status,
        formVar.category,
        value,
      ),
    );
  };

  // handle status change
  const handleStatusChange = (value: any) => {
    setFormVar((prev) => ({
      ...prev,
      status: value,
      offset: 0,
    }));

    dispatch(
      getAllProducts(
        formVar.keyword,
        formVar.limit,
        0,
        value,
        formVar.category,
        formVar.size,
      ),
    );
  };

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
        getAllProducts(
          searchTerm,
          formVar.limit,
          0,
          formVar.status,
          formVar.category,
          formVar.size,
        ),
      );
    }, 500);
  };

  // handle delete
  const handleDelete = (id: string) => {
    dispatch(deleteProduct(id));
  };
  // Pagination calculations and handler
  const totalProducts = productsVar.total || 0;
  const totalPages = Math.ceil(totalProducts / formVar.limit) || 1;
  const currentPage = Math.floor(formVar.offset / formVar.limit) + 1;

  const handlePageChange = (page: number) => {
    const newOffset = (page - 1) * formVar.limit;
    setFormVar((prev) => ({
      ...prev,
      offset: newOffset,
    }));

    dispatch(
      getAllProducts(
        formVar.keyword,
        formVar.limit,
        newOffset,
        formVar.status,
        formVar.category,
        formVar.size,
      ),
    );
  };



  // Load products on mount
  useEffect(() => {
    Promise.all([
      dispatch(
        getAllProducts(
          formVar.keyword,
          formVar.limit,
          formVar.offset,
          formVar.status,
          formVar.category,
          formVar.size,
        ),
      ),
      dispatch(getAllCategories("", 0, 0, "")),
      dispatch(getAllSize("", 0, 0, "")),
    ]);
  }, []);

  return (
    <div className="space-y-4 max-w-full mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-4 sm:p-5 rounded-2xl border border-border">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary text-primary-foreground shadow-md">
              <Package className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Products
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Manage your kids clothing products, pricing, sizes, images, and
            inventory.
          </p>
        </div>

        {/* Primary Navigate to Add Product Page Button */}
        <Button
          onClick={() => navigate("/products/add")}
          className="rounded-full px-5 py-2.5 shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2 shrink-0 text-xs font-semibold"
        >
          <Plus className="h-4 w-4" /> Add Product
        </Button>
      </div>

      {/* Main Table / Grid Container */}
      <Card className="rounded-3xl border border-border shadow-xs overflow-hidden bg-card">
        {/* Controls Header */}
        <div className="p-4 sm:p-6 border-b border-border space-y-4">
          <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search product title, SKU, category..."
                value={formVar.keyword}
                onChange={(e) => {
                  handleSearch(e.target.value);
                }}
                className="pl-10 h-10 text-xs rounded-xl border-border bg-background shadow-2xs font-semibold"
              />
            </div>
            {/* Filter Chips Bar */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="flex items-center gap-1.5 text-xs font-bold">
                <Filter className="h-3.5 w-3.5" />
                <span>Filters:</span>
              </div>

              {/* Category Filter */}
              <select
                value={formVar.category}
                onChange={(e) => {
                  handleCategoryChange(e.target.value);
                }}
                className="h-8 px-2.5 rounded-lg border border-input bg-background text-[11px] font-semibold focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
              >
                <option value="">All Categories</option>
                {categoryVar.categories?.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              {/* Size Filter */}
              <select
                value={formVar.size}
                onChange={(e) => {
                  handleSizeChange(e.target.value);
                }}
                className="h-8 px-2.5 rounded-lg border border-input bg-background text-[11px] font-semibold focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
              >
                <option value="">All Sizes</option>
                {sizeVar.sizes?.map((sz) => (
                  <option key={sz._id} value={sz._id}>
                    Size: {sz.name}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={formVar.status}
                onChange={(e) => {
                  handleStatusChange(e.target.value);
                }}
                className="h-8 px-2.5 rounded-lg border border-input bg-background text-[11px] font-semibold focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              <button
                onClick={() => {
                  setFormVar({
                    keyword: "",
                    limit: 10,
                    offset: 0,
                    status: "",
                    category: "",
                    size: "",
                  });

                  dispatch(getAllProducts("", 10, 0, "", "", ""));
                }}
                className="text-[11px] font-bold hover:underline ml-auto cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Product List: Mobile/Tablet Cards (< md) & Desktop Table (>= md) */}
        <CardContent className="p-0">
          {productsVar.status !== "loading" && productsVar.products.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="p-4 rounded-full bg-muted inline-block text-muted-foreground">
                <Package className="h-8 w-8" />
              </div>
              <h3 className="text-sm font-bold text-foreground">
                No products found
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                No items matched your active search or filters. Try adjusting
                your search query or add a new product.
              </p>
              <Button
                onClick={() => navigate("/products/add")}
                size="sm"
                className="bg-primary text-primary-foreground rounded-xl text-xs font-semibold cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Product
              </Button>
            </div>
          ) : (
            <>
              {/* Mobile / Tablet Card View (Visible below 'md' breakpoint) */}
              <div className="block lg:hidden p-4 space-y-4">
                {productsVar.products.map((product: any) => {
                  const primaryImg =
                    product.variants?.[0]?.images?.[0]?.imageUrl ?? "";
                  const { price, discountPrice } = getDisplayPrice(product);
                  const totalStock = getTotalStock(product);
                  const firstSku =
                    product.variants?.[0]?.options?.[0]?.sku ?? "—";
                  const categoryName = product.category?.[0]?.name ?? "—";
                  const subCategoryName = product.subCategory?.[0]?.name ?? "";
                  return (
                    <div
                      key={product._id}
                      className="p-4 rounded-2xl border border-border bg-card shadow-xs space-y-3.5"
                    >
                      {/* Top Row: Image, Title, Category, SKU */}
                      <div className="flex items-start gap-3">
                        <div className="h-16 w-16 rounded-xl overflow-hidden border border-border bg-muted shrink-0">
                          {primaryImg ? (
                            <img
                              src={primaryImg}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                              <Package className="h-6 w-6" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-muted text-muted-foreground uppercase">
                              {categoryName}
                            </span>
                            {subCategoryName && (
                              <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-500 font-semibold">
                                {subCategoryName}
                              </span>
                            )}
                            {product.isFeatured && (
                              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 flex items-center gap-0.5">
                                <Sparkles className="h-3 w-3" /> Featured
                              </span>
                            )}
                          </div>
                          <h4 className="font-bold text-foreground text-sm leading-tight truncate">
                            {product.name}
                          </h4>
                          <p className="text-[11px] font-mono text-muted-foreground">
                            SKU: {firstSku}
                          </p>
                        </div>
                      </div>

                      {/* Color Swatches */}
                      {product.variants?.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {product.variants.map((v: any) => (
                            <span
                              key={v._id}
                              title={v.color?.name}
                              className="h-4 w-4 rounded-full border-2 border-border shadow-sm"
                              style={{ backgroundColor: v.color?.hexCode }}
                            />
                          ))}
                        </div>
                      )}

                      {/* Middle Row: Price, Stock, Status */}
                      <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
                        <div>
                          <span className="text-[10px] text-muted-foreground block font-medium">
                            Price
                          </span>
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-extrabold text-foreground text-sm">
                              ₹{(discountPrice ?? price).toLocaleString()}
                            </span>
                            {discountPrice && (
                              <span className="line-through text-muted-foreground text-[10px]">
                                ₹{price.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-center">
                          <span className="text-[10px] text-muted-foreground block font-medium">
                            Stock
                          </span>
                          <span className="font-bold text-foreground">
                            {totalStock}
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] text-muted-foreground block font-medium mb-1">
                            Status
                          </span>
                          <div className="flex items-center justify-end">
                            <Badge
                              variant={
                                product.status === "active"
                                  ? "success"
                                  : "secondary"
                              }
                              className="uppercase"
                            >
                              {product.status}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Row: Actions */}
                      <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-border/60">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/products/${product._id}`)}
                          className="h-8 w-8 text-xs text-indigo-400 border-border hover:bg-indigo-500/10 cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            navigate(`/products/edit/${product._id}`)
                          }
                          className="h-8 w-8 text-xs text-amber-400 border-border hover:bg-amber-500/10 cursor-pointer"
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
                                Delete this Product?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will
                                permanently delete this Product.
                              </AlertDialogDescription>
                            </AlertDialogHeader>

                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-600 hover:bg-red-700"
                                onClick={() => handleDelete(product._id)}
                              >
                                Yes, delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop Table View (Visible on 'md' breakpoint and larger) */}
              <div className="hidden lg:block overflow-x-auto">
                <Table className="w-full text-left text-xs border-collapse">
                  <TableHeader>
                    <TableRow className="border-b border-border bg-muted/50 text-muted-foreground uppercase font-semibold text-[10px] tracking-wider hover:bg-muted/50">
                      <TableHead className="py-3 px-6 min-w-[260px]">Product Info</TableHead>
                      <TableHead className="py-3 px-6">Category</TableHead>
                      <TableHead className="py-3 px-6">Colors</TableHead>
                      <TableHead className="py-3 px-6">Price</TableHead>
                      <TableHead className="py-3 px-6">Stock</TableHead>
                      <TableHead className="py-3 px-6">Status</TableHead>
                      <TableHead className="py-3 px-6 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-border">
                    {productsVar.products.map((product: any) => {
                      const primaryImg =
                        product.variants?.[0]?.images?.[0]?.imageUrl ?? "";
                      const { price, discountPrice } = getDisplayPrice(product);
                      const totalStock = getTotalStock(product);
                      const firstSku =
                        product.variants?.[0]?.options?.[0]?.sku ?? "—";
                      const categoryName = product.category?.[0]?.name ?? "—";
                      const subCategoryName =
                        product.subCategory?.[0]?.name ?? "";
                      return (
                        <TableRow
                          key={product._id}
                          className="hover:bg-muted/30 transition-colors group"
                        >
                          {/* Info Column */}
                          <TableCell className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="h-12 w-12 rounded-xl overflow-hidden border border-border bg-muted shrink-0">
                                {primaryImg ? (
                                  <img
                                    src={primaryImg}
                                    alt={product.name}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                                    <Package className="h-5 w-5" />
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <h4 className="font-bold text-foreground text-xs truncate max-w-[200px]">
                                    {product.name}
                                  </h4>
                                  {product.isFeatured && (
                                    <span title="Featured">
                                      <Sparkles className="h-3 w-3 text-amber-500 shrink-0" />
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] font-mono text-muted-foreground">
                                  SKU: {firstSku}
                                </p>
                              </div>
                            </div>
                          </TableCell>

                          {/* Category / Sub-category Column */}
                          <TableCell className="py-4 px-6">
                            <div className="space-y-1">
                              <span className="inline-block px-2 py-0.5 rounded bg-muted text-[11px] font-semibold">
                                {categoryName}
                              </span>
                              {subCategoryName && (
                                <span className="block text-[10px] text-muted-foreground">
                                  {subCategoryName}
                                </span>
                              )}
                            </div>
                          </TableCell>

                          {/* Colors Column */}
                          <TableCell className="py-4 px-6">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {(product.variants ?? []).map((v: any) => (
                                <span
                                  key={v._id}
                                  title={v.color?.name}
                                  className="h-5 w-5 rounded-full border-2 border-border shadow-sm"
                                  style={{ backgroundColor: v.color?.hexCode }}
                                />
                              ))}
                            </div>
                          </TableCell>

                          {/* Price Column */}
                          <TableCell className="py-4 px-6">
                            <div className="flex items-baseline gap-1.5">
                              <span className="font-bold text-foreground">
                                ₹{(discountPrice ?? price).toLocaleString()}
                              </span>
                              {discountPrice && (
                                <span className="line-through text-muted-foreground text-[10px]">
                                  ₹{price.toLocaleString()}
                                </span>
                              )}
                            </div>
                          </TableCell>

                          {/* Total Stock Column */}
                          <TableCell className="py-4 px-6">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                totalStock === 0
                                  ? "bg-destructive/10 text-destructive border-destructive/20"
                                  : totalStock <= 10
                                    ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                    : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                              }`}
                            >
                              {totalStock} units
                            </span>
                          </TableCell>

                          {/* Status Column */}
                          <TableCell className="py-4 px-6">
                            <Badge
                              variant={
                                product.status === "active"
                                  ? "success"
                                  : "secondary"
                              }
                              className="uppercase"
                            >
                              {product.status}
                            </Badge>
                          </TableCell>

                          {/* Actions */}
                          <TableCell className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  navigate(`/products/${product._id}`)
                                }
                                className="h-8 w-8 text-xs text-indigo-400 border-border hover:bg-indigo-500/10 cursor-pointer"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  navigate(`/products/edit/${product._id}`)
                                }
                                className="h-8 w-8 text-xs text-amber-400 border-border hover:bg-amber-500/10 cursor-pointer"
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
                                      Delete this Product?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. This will
                                      permanently delete this Product.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>

                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-red-600 hover:bg-red-700"
                                      onClick={() => handleDelete(product._id)}
                                    >
                                      Yes, delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Pagination  */}
      {totalProducts > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-2">

          {totalPages > 1 && (
            <CustomPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      )}
    </div>
  );
}
