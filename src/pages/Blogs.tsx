import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Plus,
  Search,
  SquarePen,
  Trash2,
  Calendar,
  Link as LinkIcon,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { deleteBlog, getAllBlogs } from "@/store/blogSlice";
import { formatDataString } from "@/lib/utils";
import CustomPagination from "@/components/ui/custom-pagination";

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  category: string;
  author: string;
  date: string;
  status: "Published" | "Draft";
  coverImage: string;
  excerpt: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
}

export default function BlogsPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const blogVar = useSelector((state: RootState) => state.blog);

  const [formVar, setFormVar] = useState({
    keyword: "",
    limit: 10,
    offset: 0,
  });

  // Ref
  const searchTimeoutRef = useRef<any>(null);

  // Open Add Page
  const handleOpenAddModal = () => {
    navigate("/blog/add");
  };

  // Confirm Delete
  const handleDelete = (id: string) => {
    dispatch(deleteBlog(id));
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
      dispatch(getAllBlogs(searchTerm, formVar.limit, 0));
    }, 500);
  };

  // Pagination Handler
  const totalPages = Math.ceil(blogVar.total / formVar.limit) || 1;
  const currentPage = Math.floor(formVar.offset / formVar.limit) + 1;

  const handlePageChange = (page: number) => {
    const newOffset = (page - 1) * formVar.limit;
    setFormVar((prev) => ({ ...prev, offset: newOffset }));
    dispatch(getAllBlogs(formVar.keyword, formVar.limit, newOffset));
  };

  useEffect(() => {
    if (blogVar.blogs.length === 0) {
      dispatch(getAllBlogs());
    }
  }, []);

  return (
    <div className="space-y-6 md:space-y-8 w-full font-sans pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary text-primary-foreground">
              <BookOpen className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Blog Management
            </h1>
          </div>
          <p className="text-xs text-muted-foreground sm:pl-10">
            Create, edit, and publish SEO-optimized articles for your store.
          </p>
        </div>

        {/* Create Blog Button */}
        <Button
          onClick={handleOpenAddModal}
          className="rounded-full font-semibold text-xs px-5 py-2.5 gap-2 shadow-md shrink-0 cursor-pointer transition-all"
        >
          <Plus className="h-4 w-4" /> Add New Blog Post
        </Button>
      </div>

      {/* Search Bar & Status Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-card p-4 rounded-2xl border border-border shadow-xs">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search blog title, URL slug, category, or author..."
            value={formVar.keyword}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 h-10 bg-background text-xs"
          />
        </div>
      </div>

      {/* Blogs Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {blogVar.status !== "loading" && blogVar.blogs.length === 0 ? (
          <div className="col-span-full">
            <Card className="rounded-2xl border-border p-12 text-center">
              <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
              <p className="text-sm font-semibold text-foreground">
                No Blog Posts Found
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Try clearing your search or add a new blog post.
              </p>
            </Card>
          </div>
        ) : (
          blogVar.blogs.map((blog) => (
            <Card
              key={blog._id}
              className="rounded-2xl border-border shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group"
            >
              <div>
                {/* Cover Image Header */}
                <div className="relative h-44 w-full bg-muted overflow-hidden">
                  <img
                    src={blog.image}
                    alt={blog.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Article Info */}
                <CardContent className="p-5 space-y-2.5">
                  <h3 className="text-base font-bold text-foreground leading-snug line-clamp-2">
                    {blog.title}
                  </h3>

                  {/* Auto-Generated Slug Badge */}
                  <div className="flex items-center gap-1 text-[11px] font-mono text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-lg w-max max-w-full overflow-hidden truncate border border-border/50">
                    <LinkIcon className="h-3 w-3 shrink-0" />
                    <span className="truncate">/{blog.slug}</span>
                  </div>

                  <div
                    className="text-xs text-muted-foreground line-clamp-2 pt-1"
                    dangerouslySetInnerHTML={{ __html: blog.content }}
                  />

                  <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border/40">
                    <span className="flex items-center gap-1.5 font-mono">
                      <Calendar className="h-3.5 w-3.5" />{" "}
                      {formatDataString(blog.createdAt)}
                    </span>
                  </div>
                </CardContent>
              </div>

              {/* Action Buttons */}
              <CardFooter className="px-5 py-3 border-t border-border/60 bg-muted/20 flex items-center justify-end">
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigate(`/blogs/${blog._id}`)}
                    className="h-8 w-8 text-indigo-400 border-border hover:bg-indigo-500/10 cursor-pointer"
                    title="View Article & SEO"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigate(`/blog/edit/${blog._id}`)}
                    className="h-8 w-8 text-amber-400 border-border hover:bg-amber-500/10 cursor-pointer"
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
                        <AlertDialogTitle>Delete this Blog?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          delete this Blog.
                        </AlertDialogDescription>
                      </AlertDialogHeader>

                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-600 hover:bg-red-700"
                          onClick={() => handleDelete(blog._id)}
                        >
                          Yes, delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardFooter>
            </Card>
          ))
        )}
      </div>

      {/* Pagination  */}
      {blogVar.total > 1 && (
        <CustomPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
