import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import slugify from "slugify";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  FileText,
  Globe,
  Image as ImageIcon,
  Link as LinkIcon,
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
import {
  successHandler,
  warningHandler,
} from "@/shared/_helper/responseHelper";

export interface AddBlogFormData {
  title: string;
  slug: string;
  content: string;
  status: "active" | "inactive";
  image: File | null;
  imagePreview: string;
  metaTitle: string;
  metaDescription: string;
}

const INITIAL_FORM: AddBlogFormData = {
  title: "",
  slug: "",
  content: "",
  status: "active",
  image: null,
  imagePreview: "",
  metaTitle: "",
  metaDescription: "",
};

const generateSlug = (text: string): string => {
  return slugify(text, {
    lower: true,
    strict: true,
    trim: true,
  });
};

const stripHtml = (html: string): string => {
  if (!html) return "";
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

export default function AddBlog() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<AddBlogFormData>(INITIAL_FORM);
  const [isSlugCustomized, setIsSlugCustomized] = useState(false);
  const [isMetaTitleCustomized, setIsMetaTitleCustomized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle title change & auto-generate slug / metaTitle
  const handleTitleChange = (val: string) => {
    setFormData((prev) => ({
      ...prev,
      title: val,
      slug: !isSlugCustomized ? generateSlug(val) : prev.slug,
      metaTitle: !isMetaTitleCustomized ? val : prev.metaTitle,
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

  // Handle Image upload & validation
  const handleImageFileChange = (file: File) => {
    if (!file.type.startsWith("image/")) {
      warningHandler("Please upload a valid image file (PNG, JPG, WEBP).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      warningHandler("Cover image size should be less than 5MB.");
      return;
    }

    if (formData.imagePreview) {
      URL.revokeObjectURL(formData.imagePreview);
    }

    const previewUrl = URL.createObjectURL(file);
    setFormData((prev) => ({
      ...prev,
      image: file,
      imagePreview: previewUrl,
    }));
  };

  const handleClearImage = () => {
    if (formData.imagePreview) {
      URL.revokeObjectURL(formData.imagePreview);
    }
    setFormData((prev) => ({
      ...prev,
      image: null,
      imagePreview: "",
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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

  // Reset form
  const handleReset = () => {
    if (formData.imagePreview) {
      URL.revokeObjectURL(formData.imagePreview);
    }
    setFormData(INITIAL_FORM);
    setIsSlugCustomized(false);
    setIsMetaTitleCustomized(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Submit Handler (Static mode)
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

    setIsSubmitting(true);

    // Static simulation
    setTimeout(() => {
      setIsSubmitting(false);
      successHandler("Blog post created successfully!");
      navigate("/blogs");
    }, 600);
  };

  const plainContentLength = stripHtml(formData.content).trim().length;

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
              <BookOpen className="w-6 h-6 text-primary" /> Create Blog Post
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Draft, compose rich content, and configure SEO settings for your
              storefront article.
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
            disabled={isSubmitting}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold cursor-pointer shadow-sm gap-2"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? "Saving..." : "Save & Publish"}
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
                      Provide a compelling headline, permanent URL slug, and
                      compose the article body.
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
                      Article Content <span className="text-destructive">*</span>
                    </label>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {plainContentLength} characters
                    </span>
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
                  <p className="text-[10px] text-muted-foreground">
                    Use formatting tools in the rich editor to build engaging,
                    readable stories.
                  </p>
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
                      <span>yourstore.com &gt; blog &gt; {formData.slug || "url-slug"}</span>
                    </div>
                    <h3 className="text-base font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer line-clamp-1">
                      {formData.metaTitle || formData.title || "Untitled Blog Post"} | Baha Store
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

          {/* Right Column: Publishing, Image & Checklist (4 cols) */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-4">
            {/* Status & Publication Card */}
            <Card className="rounded-3xl border border-border bg-card shadow-xs overflow-hidden">
              <CardHeader className="p-5 pb-4 border-b border-border bg-muted/20">
                <CardTitle className="text-sm font-bold flex items-center justify-between">
                  <span>Publishing & Status</span>
                  <Badge
                    variant={
                      formData.status === "active" ? "success" : "secondary"
                    }
                    className="uppercase text-[10px]"
                  >
                    {formData.status}
                  </Badge>
                </CardTitle>
                <CardDescription className="text-xs">
                  Control article visibility across your online store.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-5 space-y-4">
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
                      className="h-10 w-full appearance-none rounded-xl border border-input bg-background px-3 py-2 text-xs font-semibold text-foreground shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
                    >
                      <option value="active">Active (Published)</option>
                      <option value="inactive">Inactive (Draft)</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
                      <span className="text-xs">▼</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    {formData.status === "active"
                      ? "This article will be publicly visible to storefront visitors."
                      : "Draft articles are kept hidden from storefront customers."}
                  </p>
                </div>

                <div className="pt-2">
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold cursor-pointer shadow-sm gap-2 rounded-xl h-10"
                  >
                    <Save className="w-4 h-4" />
                    {isSubmitting ? "Publishing Post..." : "Save & Publish Post"}
                  </Button>
                </div>
              </CardContent>
            </Card>

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

                {formData.imagePreview ? (
                  <div className="relative rounded-2xl overflow-hidden border border-border group bg-slate-900 aspect-16/9">
                    <img
                      src={formData.imagePreview}
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

              <CardContent className="p-5 space-y-3 text-xs">
                <div className="space-y-2">
                  <div className="flex items-center justify-between py-1 border-b border-border/60">
                    <span className="text-muted-foreground">Title</span>
                    {formData.title.trim() ? (
                      <span className="text-emerald-500 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                      </span>
                    ) : (
                      <span className="text-amber-500 font-medium">Required</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-border/60">
                    <span className="text-muted-foreground">Slug</span>
                    {formData.slug.trim() ? (
                      <span className="text-emerald-500 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                      </span>
                    ) : (
                      <span className="text-amber-500 font-medium">Required</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-border/60">
                    <span className="text-muted-foreground">Body Content</span>
                    {plainContentLength > 0 ? (
                      <span className="text-emerald-500 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                      </span>
                    ) : (
                      <span className="text-amber-500 font-medium">Required</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-border/60">
                    <span className="text-muted-foreground">Cover Image</span>
                    {formData.image ? (
                      <span className="text-emerald-500 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Uploaded
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Optional</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <span className="text-muted-foreground">Status</span>
                    <Badge
                      variant={
                        formData.status === "active" ? "success" : "secondary"
                      }
                      className="uppercase text-[10px]"
                    >
                      {formData.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}