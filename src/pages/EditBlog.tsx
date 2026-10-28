import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  FileText,
  Globe,
  Image as ImageIcon,
  Link as LinkIcon,
  Loader2,
  RefreshCw,
  Save,
  Sparkles,
  Upload,
  X,
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
import { RichEditor } from "@/components/ui/rich-editor";
import { warningHandler } from "@/shared/_helper/responseHelper";
import { generateSlug } from "@/lib/utils";
import type { AppDispatch, RootState } from "@/store/store";
import { getBlogById, resetBlogDetails, updateBlog } from "@/store/blogSlice";

export interface EditBlogFormData {
  title: string;
  slug: string;
  content: string;
  image: File | string;
  existingImage: string;
  metaTitle: string;
  metaDescription: string;
}

const INITIAL_FORM: EditBlogFormData = {
  title: "",
  slug: "",
  content: "",
  image: null,
  existingImage: "",
  metaTitle: "",
  metaDescription: "",
};

const stripHtml = (html: string): string => {
  if (!html) return "";
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

export default function EditBlog() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();

  const blogVar = useSelector((state: RootState) => state.blog);

  const [formData, setFormData] = useState<EditBlogFormData>(INITIAL_FORM);
  const [initialData, setInitialData] = useState<EditBlogFormData | null>(null);
  const [isSlugCustomized, setIsSlugCustomized] = useState(true);
  const [isMetaTitleCustomized, setIsMetaTitleCustomized] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch blog data on mount & clean up on unmount
  useEffect(() => {
    if (id) {
      dispatch(getBlogById(id));
    }
    return () => {
      dispatch(resetBlogDetails());
    };
  }, [id, dispatch]);

  // Populate form once blog details are loaded
  useEffect(() => {
    if (!blogVar.blogDetails) return;

    const populated: EditBlogFormData = {
      title: blogVar.blogDetails.title || "",
      slug: blogVar.blogDetails.slug || "",
      content: blogVar.blogDetails.content || "",
      image: blogVar.blogDetails.image,
      existingImage: blogVar.blogDetails.image || "",
      metaTitle: blogVar.blogDetails.metaTitle || "",
      metaDescription: blogVar.blogDetails.metaDescription || "",
    };

    setFormData(populated);
    setInitialData(populated);
    setIsSlugCustomized(Boolean(blogVar.blogDetails.slug));
    setIsMetaTitleCustomized(Boolean(blogVar.blogDetails.metaTitle));
  }, [blogVar.blogDetails]);

  // Handle title change & auto-update slug / metaTitle if uncustomized
  const handleTitleChange = (val: string) => {
    setFormData((prev) => ({
      ...prev,
      title: val,
    }));
  };

  // Handle manual slug change
  const handleSlugChange = (val: string) => {
    setIsSlugCustomized(true);
    setFormData((prev) => ({
      ...prev,
      slug: val,
    }));
  };

  // Re-generate slug from current title
  const handleRegenerateSlug = () => {
    const freshSlug = generateSlug(formData.title);
    setFormData((prev) => ({
      ...prev,
      slug: freshSlug,
    }));
    setIsSlugCustomized(false);
  };

  // Handle image upload & validation
  const handleImageFileChange = (file: File) => {
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

  const handleClearImage = () => {
    setFormData((prev) => ({ ...prev, image: null }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFileChange(e.dataTransfer.files[0]);
    }
  };

  // Reset form to initial loaded data
  const handleReset = () => {
    if (
      typeof formData.image === "string" &&
      formData.image.startsWith("blob:")
    ) {
      URL.revokeObjectURL(formData.image);
    }
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData(INITIAL_FORM);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      warningHandler("Please enter a blog post title.");
      return;
    }

    const finalSlug = formData.slug.trim()
      ? generateSlug(formData.slug)
      : generateSlug(formData.title);

    if (!finalSlug) {
      warningHandler("Please provide a valid slug for the blog post.");
      return;
    }

    const plainText = stripHtml(formData.content).trim();
    if (!plainText) {
      warningHandler("Please compose content for the blog post.");
      return;
    }

    if (!id) {
      warningHandler("Invalid blog ID.");
      return;
    }

    const data = new FormData();
    data.append("title", formData.title.trim());
    data.append("slug", finalSlug);
    data.append("content", formData.content);
    data.append("metaTitle", formData.metaTitle.trim());
    data.append("metaDescription", formData.metaDescription.trim());

    if (formData.image instanceof File) {
      data.append("image", formData.image);
    }

    dispatch(updateBlog(id, data, navigate));
  };

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      slug: generateSlug(formData.title),
    }));
  }, [formData.title]);

  // Not found / error state
  if (blogVar.status === "error" && !blogVar.blogDetails) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] p-6 text-center">
        <div className="p-4 rounded-2xl bg-destructive/10 text-destructive mb-4">
          <AlertCircle className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-bold text-foreground">
          Blog Post Not Found
        </h2>
        <p className="text-sm text-muted-foreground max-w-md mt-1 mb-6">
          The blog post with ID{" "}
          <code className="font-mono text-primary font-semibold">{id}</code>{" "}
          could not be found or has been removed.
        </p>
        <Button
          onClick={() => navigate("/blogs")}
          className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 cursor-pointer rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Blogs
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-full pb-16">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-xl shrink-0 hover:bg-muted cursor-pointer"
            onClick={() => navigate("/blogs")}
            title="Return to Blogs"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-primary" /> Edit Blog Post
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Update article content, cover image, and SEO settings for your
              storefront.
            </p>
          </div>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/blogs")}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={handleReset}
            className="cursor-pointer text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className="w-4 h-4 mr-1.5" /> Reset
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={blogVar.status === "loading"}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold cursor-pointer shadow-sm gap-2"
          >
            <Save className="w-4 h-4" />
            {blogVar.status === "loading" ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Main Editor & SEO Details (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Article Details Card */}
            <Card className="rounded-3xl border border-border bg-card shadow-xs overflow-hidden">
              <CardHeader className="p-5 pb-4 border-b border-border bg-muted/20">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold">
                      Article Details
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Update the headline, permanent URL slug, and article body.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-5 sm:p-6 space-y-5">
                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Blog Title <span className="text-destructive">*</span>
                  </label>
                  <Input
                    placeholder="e.g. 10 Essential Summer Clothing Tips for Toddlers"
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="h-11 bg-background text-sm font-semibold rounded-xl"
                  />
                </div>

                {/* Slug */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <LinkIcon className="w-3.5 h-3.5" /> URL Slug{" "}
                      <span className="text-destructive">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleRegenerateSlug}
                      disabled={!formData.title.trim()}
                      className="text-[11px] text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-40"
                    >
                      <RefreshCw className="w-3 h-3" /> Auto-generate from title
                    </button>
                  </div>
                  <div className="relative flex items-center">
                    <div className="absolute left-3 text-xs font-mono text-muted-foreground/70 pointer-events-none select-none">
                      /blog/
                    </div>
                    <Input
                      placeholder="10-essential-summer-clothing-tips-for-toddlers"
                      value={formData.slug}
                      onChange={(e) => handleSlugChange(e.target.value)}
                      className="h-10 pl-16 bg-background font-mono text-xs rounded-xl"
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Unique, SEO-friendly web address key for this article.
                  </p>
                </div>

                {/* Rich Editor for Content */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Article Content{" "}
                      <span className="text-destructive">*</span>
                    </label>
                  </div>
                  <div className="rounded-xl border border-border overflow-hidden bg-background">
                    <RichEditor
                      value={formData.content}
                      onChange={(val) =>
                        setFormData((prev) => ({ ...prev, content: val }))
                      }
                      placeholder="Compose your blog article content here. You can add formatted text, headings, bullet lists, block quotes, links, and tables..."
                      minHeight="380px"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SEO & Search Engine Optimization Card */}
            <Card className="rounded-3xl border border-border bg-card shadow-xs overflow-hidden">
              <CardHeader className="p-5 pb-4 border-b border-border bg-muted/20">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold">
                      Search Engine Optimization (SEO)
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Optimize how this blog post looks in Google and other
                      search results.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-5 sm:p-6 space-y-5">
                {/* Meta Title */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Meta Title
                    </label>
                    <span
                      className={`text-[11px] font-mono ${
                        formData.metaTitle.length > 60
                          ? "text-amber-500 font-bold"
                          : "text-muted-foreground"
                      }`}
                    >
                      {formData.metaTitle.length}/60 chars
                    </span>
                  </div>
                  <Input
                    placeholder="Enter SEO meta title..."
                    value={formData.metaTitle}
                    onChange={(e) => {
                      setIsMetaTitleCustomized(true);
                      setFormData((prev) => ({
                        ...prev,
                        metaTitle: e.target.value,
                      }));
                    }}
                    className="h-10 bg-background text-xs rounded-xl"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Defaults to the article title if left unchanged.
                  </p>
                </div>

                {/* Meta Description */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Meta Description
                    </label>
                    <span
                      className={`text-[11px] font-mono ${
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
                    placeholder="Brief summary of the article to capture reader clicks in search engine results..."
                    value={formData.metaDescription}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        metaDescription: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-input bg-background p-3 text-xs placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Recommended length: 120-160 characters.
                  </p>
                </div>

                {/* Google SERP Live Snippet Preview */}
                <div className="pt-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
                    Google Search Result Preview
                  </span>
                  <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-1 text-left font-sans">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground truncate font-mono">
                      <span className="w-3.5 h-3.5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[9px] font-bold">
                        B
                      </span>
                      <span>
                        yourstore.com &gt; blog &gt;{" "}
                        {formData.slug || "url-slug"}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer line-clamp-1">
                      {formData.metaTitle ||
                        formData.title ||
                        "Untitled Blog Post"}{" "}
                      | Baha Store
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {formData.metaDescription ||
                        stripHtml(formData.content).slice(0, 150) ||
                        "Add a meta description or article body content to preview how this blog post will appear to users searching on Google..."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Featured Image, Checklist & Update Action (4 cols) */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-4">
            {/* Featured Image Card */}
            <Card className="rounded-3xl border border-border bg-card shadow-xs overflow-hidden">
              <CardHeader className="p-5 pb-4 border-b border-border bg-muted/20">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-bold">
                      Featured Cover Image
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Main header graphic for blog cards & banners.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-5 space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleImageFileChange(e.target.files[0]);
                    }
                  }}
                />

                {formData.image ? (
                  <div className="relative rounded-2xl overflow-hidden border border-border group bg-slate-900 aspect-16/9">
                    <img
                      src={
                        typeof formData.image === "string"
                          ? formData.image
                          : URL.createObjectURL(formData.image)
                      }
                      alt="Cover Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => fileInputRef.current?.click()}
                        className="cursor-pointer text-xs"
                      >
                        Change
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={handleClearImage}
                        className="cursor-pointer text-xs"
                      >
                        <X className="w-3.5 h-3.5" /> Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2.5 ${
                      isDragging
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50 hover:bg-muted/30"
                    }`}
                  >
                    <div className="p-3 rounded-full bg-muted text-muted-foreground">
                      <Upload className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">
                        Click to upload or drag & drop
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        PNG, JPG, or WEBP (Max 5MB)
                      </p>
                    </div>
                    <span className="text-[10px] font-medium text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                      Recommended: 1200 x 630px
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Checklist & Readiness Summary Card */}
            <Card className="rounded-3xl border border-border bg-card shadow-xs overflow-hidden">
              <CardHeader className="p-5 pb-3 border-b border-border bg-muted/20">
                <CardTitle className="text-sm font-bold flex items-center justify-between">
                  <span>Post Readiness</span>
                  <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] gap-1">
                    <Sparkles className="w-3 h-3" /> Ready
                  </Badge>
                </CardTitle>
              </CardHeader>

              {/* <CardContent className="p-5 space-y-3 text-xs">
                <div className="space-y-2">
                  <div className="flex items-center justify-between py-1 border-b border-border/60">
                    <span className="text-muted-foreground">Title</span>
                    {formData.title.trim() ? (
                      <span className="text-emerald-500 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                      </span>
                    ) : (
                      <span className="text-amber-500 font-medium">
                        Required
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-border/60">
                    <span className="text-muted-foreground">Slug</span>
                    {formData.slug.trim() ? (
                      <span className="text-emerald-500 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                      </span>
                    ) : (
                      <span className="text-amber-500 font-medium">
                        Required
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-border/60">
                    <span className="text-muted-foreground">Body Content</span>
                    {stripHtml(formData.content).trim().length > 0 ? (
                      <span className="text-emerald-500 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                      </span>
                    ) : (
                      <span className="text-amber-500 font-medium">
                        Required
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <span className="text-muted-foreground">Cover Image</span>
                    {formData.imagePreview ? (
                      <span className="text-emerald-500 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Available
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Optional</span>
                    )}
                  </div>
                </div>
              </CardContent> */}
            </Card>

            {/* Save Changes Action Card */}
            <Card className="rounded-3xl border border-border bg-card shadow-xs overflow-hidden">
              <CardHeader className="p-5 pb-4 border-b border-border bg-muted/20">
                <CardTitle className="text-sm font-bold">Update Post</CardTitle>
                <CardDescription className="text-xs">
                  Save modifications to your online storefront.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-5">
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={blogVar.status === "loading"}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold cursor-pointer shadow-sm gap-2 rounded-xl h-10"
                >
                  <Save className="w-4 h-4" />
                  {blogVar.status === "loading"
                    ? "Updating Post..."
                    : "Save Changes"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
