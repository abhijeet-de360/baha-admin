import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  Calendar,
  FileText,
  Globe,
  Image as ImageIcon,
  Link as LinkIcon,
  Loader2,
  SquarePen,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import type { AppDispatch, RootState } from "@/store/store";
import { deleteBlog, getBlogById, resetBlogDetails } from "@/store/blogSlice";
import { formatDataString } from "@/lib/utils";

const stripHtml = (html: string): string => {
  if (!html) return "";
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

export default function BlogDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const blogVar = useSelector((state: RootState) => state.blog);
  const blog = blogVar.blogDetails;
  const isLoading = blogVar.status === "loading";

  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch blog data on mount & clean up on unmount
  useEffect(() => {
    if (id) {
      dispatch(getBlogById(id));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    return () => {
      dispatch(resetBlogDetails());
    };
  }, [id, dispatch]);

  // Delete handler
  const handleDelete = async () => {
    if (!id) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteBlog(id));
      navigate("/blogs");
    } finally {
      setIsDeleting(false);
    }
  };

  // Content calculations
  const plainText = stripHtml(blog?.content || "");

  // Loading skeleton
  if (isLoading && !blog) {
    return (
      <div className="space-y-6 max-w-full pb-16 animate-in fade-in duration-300">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-muted animate-pulse" />
            <div className="space-y-2">
              <div className="h-6 w-48 bg-muted rounded-md animate-pulse" />
              <div className="h-3 w-64 bg-muted rounded-md animate-pulse" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-9 w-20 bg-muted rounded-xl animate-pulse" />
            <div className="h-9 w-20 bg-muted rounded-xl animate-pulse" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <div className="h-80 rounded-3xl bg-muted animate-pulse" />
            <div className="h-96 rounded-3xl bg-muted animate-pulse" />
          </div>
          <div className="lg:col-span-4 space-y-6">
            <div className="h-64 rounded-3xl bg-muted animate-pulse" />
            <div className="h-64 rounded-3xl bg-muted animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // Not found or error state
  if ((blogVar.status === "error" || !blog) && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] p-6 text-center animate-in fade-in">
        <div className="p-4 rounded-2xl bg-destructive/10 text-destructive mb-4">
          <AlertCircle className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Blog Post Not Found</h2>
        <p className="text-sm text-muted-foreground max-w-md mt-1 mb-6">
          The blog post with ID{" "}
          <code className="font-mono text-primary font-semibold">{id}</code>{" "}
          could not be found or may have been deleted.
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
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight text-foreground line-clamp-1">
                {blog?.title || "Blog Post"}
              </h1>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {formatDataString(blog?.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate(`/blog/edit/${blog?._id}`)}
            className="cursor-pointer rounded-xl gap-1.5 text-xs text-amber-500 hover:text-amber-600 hover:bg-amber-500/10 border-amber-500/30"
          >
            <SquarePen className="w-3.5 h-3.5" />
            <span>Edit Post</span>
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="cursor-pointer rounded-xl gap-1.5 text-xs text-destructive hover:bg-destructive/10 border-destructive/30"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent className="rounded-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this Blog Post?</AlertDialogTitle>
                <AlertDialogDescription className="text-xs">
                  This action cannot be undone. This will permanently remove{" "}
                  <strong className="text-foreground">"{blog?.title}"</strong>{" "}
                  from your storefront and database.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-xl text-xs">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-xl text-xs font-semibold"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Yes, Delete Article"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Cover Image & Article Content (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Cover Image Card */}
          {blog?.image ? (
            <Card className="rounded-3xl border border-border bg-card shadow-xs overflow-hidden">
              <div className="relative w-full aspect-16/9 bg-muted overflow-hidden group">
                <img
                  src={blog.image}
                  alt={blog.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6">
                  <div className="space-y-1 text-white">
                    <span className="text-[11px] font-mono bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20">
                      /blog/{blog.slug}
                    </span>
                    <h2 className="text-lg md:text-xl font-bold text-white drop-shadow-sm line-clamp-2">
                      {blog.title}
                    </h2>
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="rounded-3xl border border-border bg-card shadow-xs p-8 text-center">
              <div className="p-3 rounded-full bg-muted text-muted-foreground mx-auto w-max mb-2">
                <ImageIcon className="w-6 h-6" />
              </div>
              <p className="text-xs text-muted-foreground font-medium">
                No featured cover image uploaded for this article.
              </p>
            </Card>
          )}

          {/* Article Body Content Card */}
          <Card className="rounded-3xl border border-border bg-card shadow-xs overflow-hidden">
            <CardHeader className="p-5 pb-4 border-b border-border bg-muted/20">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold">
                    Article Content
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Full formatted body text published on the storefront.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 md:p-8">
              {blog?.content ? (
                <div
                  className="text-sm md:text-base leading-relaxed text-foreground space-y-4 font-sans prose dark:prose-invert max-w-none break-words [&_img]:rounded-xl [&_img]:max-w-full [&_table]:w-full [&_table]:border-collapse [&_th]:border [&_th]:p-2 [&_td]:border [&_td]:p-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_a]:text-primary [&_a]:underline"
                  dangerouslySetInnerHTML={{ __html: blog.content }}
                />
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  No article content available.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Metadata, SEO & Details (4 cols) */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-4">
          {/* Post Information Card */}
          <Card className="rounded-3xl border border-border bg-card shadow-xs overflow-hidden">
            <CardHeader className="p-5 pb-3 border-b border-border bg-muted/20">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                Post Details
              </CardTitle>
            </CardHeader>

            <CardContent className="p-5 space-y-3.5 text-xs">
              <div className="flex items-start justify-between py-1 border-b border-border/60 gap-2">
                <span className="text-muted-foreground shrink-0">URL Slug</span>
                <div className="flex items-center gap-1.5 text-right font-mono text-[11px] text-foreground truncate max-w-[200px]">
                  <LinkIcon className="w-3 h-3 text-muted-foreground shrink-0" />
                  <span className="truncate">/{blog?.slug}</span>
                </div>
              </div>

              <div
                className={`flex items-center justify-between py-1 ${
                  blog?.updatedAt && blog.updatedAt !== blog.createdAt
                    ? "border-b border-border/60"
                    : ""
                }`}
              >
                <span className="text-muted-foreground">Published Date</span>
                <span className="font-semibold text-foreground">
                  {formatDataString(blog?.createdAt)}
                </span>
              </div>

              {blog?.updatedAt && blog.updatedAt !== blog.createdAt && (
                <div className="flex items-center justify-between py-1">
                  <span className="text-muted-foreground">Last Updated</span>
                  <span className="font-semibold text-foreground">
                    {formatDataString(blog.updatedAt)}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Search Engine Optimization (SEO) Card */}
          <Card className="rounded-3xl border border-border bg-card shadow-xs overflow-hidden">
            <CardHeader className="p-5 pb-3 border-b border-border bg-muted/20">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  <Globe className="w-3.5 h-3.5" />
                </div>
                <CardTitle className="text-sm font-bold">
                  SEO & Search Preview
                </CardTitle>
              </div>
            </CardHeader>

            <CardContent className="p-5 space-y-4 text-xs">
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Meta Title
                </span>
                <p className="font-medium text-foreground bg-muted/40 p-2.5 rounded-xl border border-border">
                  {blog?.metaTitle || blog?.title || "—"}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Meta Description
                </span>
                <p className="font-normal text-muted-foreground bg-muted/40 p-2.5 rounded-xl border border-border leading-relaxed text-xs">
                  {blog?.metaDescription ||
                    plainText.slice(0, 150) ||
                    "No meta description set."}
                </p>
              </div>

              {/* Google SERP Snippet Preview */}
              <div className="pt-2 border-t border-border/60 space-y-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
                  Google Search Result Preview
                </span>
                <div className="p-3.5 rounded-2xl bg-muted/30 border border-border space-y-1 text-left font-sans">
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground truncate font-mono">
                    <span className="w-3 h-3 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[8px] font-bold">
                      B
                    </span>
                    <span className="truncate">
                      yourstore.com &gt; blog &gt; {blog?.slug}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-blue-600 dark:text-blue-400 line-clamp-1">
                    {blog?.metaTitle || blog?.title || "Untitled Blog"} | Baha Store
                  </h4>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                    {blog?.metaDescription ||
                      plainText.slice(0, 140) ||
                      "Explore this blog article on our store."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions Card */}
          <Card className="rounded-3xl border border-border bg-card shadow-xs overflow-hidden">
            <CardHeader className="p-5 pb-3 border-b border-border bg-muted/20">
              <CardTitle className="text-sm font-bold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-2.5">
              <Button
                type="button"
                onClick={() => navigate(`/blog/edit/${blog?._id}`)}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold cursor-pointer shadow-sm gap-2 rounded-xl h-10 text-xs"
              >
                <SquarePen className="w-4 h-4" /> Edit Blog Post
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/blogs")}
                className="w-full cursor-pointer rounded-xl h-10 text-xs gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Return to Blogs List
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}