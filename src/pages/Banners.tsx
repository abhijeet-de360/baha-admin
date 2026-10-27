import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
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
  Calendar,
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
  DialogDescription,
} from "@/components/ui/dialog";

import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import { deleteBanner, getAllBanners } from "@/store/bannerSlice";
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
import { formatDataString } from "@/lib/utils";

export default function Banners() {
  const navigate = useNavigate();
  const bannerVar = useSelector((state: RootState) => state.banner);

  const dispatch = useDispatch<AppDispatch>();

  const searchTimeoutRef = useRef<any>(null);

  const [formVar, setFormVar] = useState({
    keyword: "",
    status: "",
  });

  // Modals state
  const [previewBanner, setPreviewBanner] = useState<any>(null);

  // Open Add modal -> Navigate to dedicated Add page
  const handleOpenAdd = () => {
    navigate("/banner/add");
  };

  // Delete slider
  const handleDelete = (id: string) => {
    dispatch(deleteBanner(id));
  };

  // handle input change
  const handleInputChange = (searchTerm: string) => {
    setFormVar((prev) => ({
      ...prev,
      keyword: searchTerm,
    }));

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      dispatch(getAllBanners(searchTerm, formVar.status));
    }, 500);
  };

  const handleStatusChange = (status: string) => {
    setFormVar((prev) => ({
      ...prev,
      status: status,
    }));

    dispatch(getAllBanners(formVar.keyword, status));
  };



  const getStatusBadge = (status: any) => {
    switch (status?.toLowerCase?.() || status) {
      case "active":
        return (
          <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 border-emerald-500/30 gap-1">
            <CheckCircle2 className="w-3 h-3" /> Active
          </Badge>
        );
      case "inactive":
        return (
          <Badge className="bg-slate-500/15 text-slate-600 dark:text-slate-400 hover:bg-slate-500/25 border-slate-500/30 gap-1">
            <AlertCircle className="w-3 h-3" /> Inactive
          </Badge>
        );
      case "scheduled":
        return (
          <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 hover:bg-amber-500/25 border-amber-500/30 gap-1">
            <Clock className="w-3 h-3" /> Scheduled
          </Badge>
        );
      default:
        return (
          <Badge className="bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30 gap-1 capitalize">
            {status || "Unknown"}
          </Badge>
        );
    }
  };

  useEffect(() => {
    dispatch(getAllBanners("", ""));
  }, []);

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

      <Card className="rounded-3xl border border-border shadow-xs overflow-hidden bg-card">
        {/* Filter and Search Bar */}
        <div className="p-4 sm:p-6 border-b border-border space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search hero slide title, subtitle or ID..."
                value={formVar.keyword}
                onChange={(e) => handleInputChange(e.target.value)}
                className="pl-9 bg-background"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <select
                value={formVar.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="px-3 py-2 text-sm rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        <CardContent className="p-0">
          {bannerVar.status !== "loading" && bannerVar.banners.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="p-3.5 rounded-full bg-muted text-muted-foreground w-fit mx-auto">
                <Sliders className="h-8 w-8 text-amber-500" />
              </div>
              <h3 className="text-sm font-bold text-foreground">
                No hero slides found
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {formVar.keyword || (formVar.status && formVar.status !== "all")
                  ? "Try adjusting your search criteria or status filter."
                  : "Get started by creating your first homepage hero slide."}
              </p>
              <Button
                onClick={handleOpenAdd}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs rounded-xl px-4 py-2 mt-2 inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" /> Add Hero Slide
              </Button>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:hidden gap-4">
                {bannerVar.banners.map((banner) => (
                  <div
                    key={banner._id}
                    className="overflow-hidden border-border bg-card flex flex-col justify-between"
                  >
                    <div>
                      {/* Image Header */}
                      <div
                        className="relative h-44 w-full bg-slate-900 overflow-hidden group cursor-pointer"
                        onClick={() => setPreviewBanner(banner)}
                      >
                        <img
                          src={banner.image || banner.imageUrl}
                          alt={banner.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 right-2 flex items-center gap-1.5">
                          <Badge
                            variant={
                              banner.status === "active"
                                ? "success"
                                : "secondary"
                            }
                            className="uppercase"
                          >
                            {banner.status}
                          </Badge>
                        </div>
                        <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-black/60 backdrop-blur-sm text-[11px] text-white font-medium">
                          Slide Position: #{banner.order ?? 1}
                        </div>
                      </div>

                      {/* Body */}
                      <div className="p-4 space-y-2">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          {banner.startDate && (
                            <span className="flex items-center gap-1 text-[11px]">
                              <Calendar className="w-3 h-3" />{" "}
                              {formatDataString(banner.startDate)} to{" "}
                              {banner.endDate
                                ? formatDataString(banner.endDate)
                                : "Ongoing"}
                            </span>
                          )}
                        </div>

                        <h3 className="font-bold text-foreground text-base line-clamp-1">
                          {banner.title}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {banner.subTitle || banner.subtitle}
                        </p>
                      </div>
                    </div>

                    {/* Actions Footer */}
                    <div className="p-3 bg-muted/40 border-t border-border flex items-center justify-end gap-2">
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 text-xs text-indigo-400 border-border hover:bg-indigo-500/10 cursor-pointer"
                          onClick={() => setPreviewBanner(banner)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 text-amber-400 border-border hover:bg-amber-500/10 cursor-pointer"
                          onClick={() => navigate(`/banner/edit/${banner._id}`)}
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
                                Delete this Banner?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will
                                permanently delete this Banner.
                              </AlertDialogDescription>
                            </AlertDialogHeader>

                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-600 hover:bg-red-700"
                                onClick={() => handleDelete(banner._id || "")}
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

              {/* Desktop Table View */}
              <div className="hidden xl:block bg-card border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-muted/50 text-muted-foreground text-xs uppercase tracking-wider">
                        <th className="py-3.5 px-4 font-semibold w-16 text-center">
                          Slide #
                        </th>
                        <th className="py-3.5 px-4 font-semibold w-32">
                          Slide Image
                        </th>
                        <th className="py-3.5 px-4 font-semibold">
                          Title & Subtitle
                        </th>
                        <th className="py-3.5 px-4 font-semibold">
                          Button CTA
                        </th>
                        <th className="py-3.5 px-4 font-semibold">Schedule</th>
                        <th className="py-3.5 px-4 font-semibold">Status</th>
                        <th className="py-3.5 px-4 font-semibold text-right">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {bannerVar.banners.map((banner) => (
                        <tr
                          key={banner._id || banner.id}
                          className="hover:bg-muted/30 transition-colors"
                        >
                          {/* Sequence Controls */}
                          <td className="py-3 px-4 text-center">
                            <div className="flex flex-col items-center gap-0.5">
                              <span className="font-bold text-xs text-foreground bg-muted px-1.5 py-0.5 rounded">
                                #{banner.order ?? 1}
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
                                src={banner.image || banner.imageUrl}
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
                            <h4 className="font-semibold text-foreground text-sm line-clamp-1">
                              {banner.title}
                            </h4>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {banner.subTitle || banner.subtitle}
                            </p>
                          </td>

                          {/* CTA */}
                          <td className="py-3 px-4">
                            <div className="text-xs font-medium text-foreground">
                              {banner.buttonLabel || banner.buttonText}
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
                                <div>{formatDataString(banner.startDate)}</div>
                                <div className="text-[11px] text-muted-foreground/70">
                                  to{" "}
                                  {banner.endDate
                                    ? formatDataString(banner.endDate)
                                    : "Forever"}
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
                            <Badge
                              variant={
                                banner.status === "active"
                                  ? "success"
                                  : "secondary"
                              }
                              className="uppercase"
                            >
                              {banner.status}
                            </Badge>
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
                                onClick={() =>
                                  navigate(`/banner/edit/${banner._id}`)
                                }
                                title="Edit"
                                className="h-8 w-8 text-amber-400 border-border hover:bg-amber-500/10 cursor-pointer"
                              >
                                <SquarePen className="h-3.5 w-3.5" />
                              </Button>
                              {/* Delete action button */}
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
                                      Delete this Banner?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. This will
                                      permanently delete this Banner.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>

                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-red-600 hover:bg-red-700"
                                      onClick={() => handleDelete(banner._id || "")}
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
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Preview Live Hero Slide Modal */}
      {previewBanner && (
        <Dialog
          open={!!previewBanner}
          onOpenChange={(open) => !open && setPreviewBanner(null)}
        >
          <DialogContent className="sm:max-w-3xl bg-slate-950 text-white border-slate-800 p-0 overflow-hidden shadow-2xl rounded-2xl">
            <DialogHeader className="sr-only">
              <DialogTitle>Hero Slide Preview</DialogTitle>
              <DialogDescription>
                Storefront live banner preview
              </DialogDescription>
            </DialogHeader>

            <div className="relative aspect-16/9 sm:aspect-16/7 w-full flex items-center justify-center overflow-hidden bg-slate-900">
              <img
                src={previewBanner.image || previewBanner.imageUrl}
                alt={previewBanner.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent p-6 sm:p-10 flex flex-col justify-center max-w-xl z-10 text-left items-start">
                <div className="flex items-center gap-2 mb-3">
                  <Badge className="w-fit bg-amber-500 text-white font-bold text-xs hover:bg-amber-600">
                    Hero Slide #{previewBanner.order ?? 1}
                  </Badge>
                  {getStatusBadge(previewBanner.status)}
                </div>
                <h2 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight mb-2 drop-shadow-sm line-clamp-2">
                  {previewBanner.title}
                </h2>
                {(previewBanner.subTitle || previewBanner.subtitle) && (
                  <p className="text-xs sm:text-sm text-gray-200 mb-5 line-clamp-2 drop-shadow-xs max-w-md">
                    {previewBanner.subTitle || previewBanner.subtitle}
                  </p>
                )}
                {(previewBanner.buttonLabel || previewBanner.buttonText) && (
                  <div>
                    <a
                      href={previewBanner.buttonLink || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-5 py-2 rounded-full text-xs sm:text-sm shadow-lg shadow-amber-500/25 transition-all inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      {previewBanner.buttonLabel || previewBanner.buttonText}
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-400">
              <div className="flex flex-wrap items-center gap-4">
                <span>
                  Slide ID:{" "}
                  <strong className="text-white font-mono">
                    {previewBanner._id || previewBanner.id}
                  </strong>
                </span>
                {previewBanner.buttonLink && (
                  <span className="flex items-center gap-1">
                    Link:{" "}
                    <strong className="text-amber-400 font-mono truncate max-w-xs">
                      {previewBanner.buttonLink}
                    </strong>
                  </span>
                )}
                {previewBanner.startDate && (
                  <span>
                    Schedule:{" "}
                    <strong className="text-gray-200 font-mono">
                      {new Date(previewBanner.startDate).toLocaleDateString()}
                      {previewBanner.endDate
                        ? ` to ${new Date(previewBanner.endDate).toLocaleDateString()}`
                        : " (Ongoing)"}
                    </strong>
                  </span>
                )}
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-slate-800 cursor-pointer"
                onClick={() => setPreviewBanner(null)}
              >
                Close Preview
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
