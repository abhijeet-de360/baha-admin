import * as React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

export interface CustomPaginationProps {
  /** The active 1-indexed page number */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Callback fired when a page change is triggered */
  onPageChange: (page: number) => void;
  /** Optional additional class names for the pagination nav element */
  className?: string;
  /** Total number of items (optional, displays "Showing X to Y of Z" text when provided with itemsPerPage) */
  totalItems?: number;
  /** Number of items per page (optional) */
  itemsPerPage?: number;
  /** Label for items, e.g. "products", "orders", "items" (defaults to "items") */
  itemLabel?: string;
}

export function CustomPagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
  totalItems,
  itemsPerPage,
  itemLabel = "items",
}: CustomPaginationProps) {
  // If there's 1 or 0 pages and no summary text is needed, render nothing
  if (totalPages <= 1 && totalItems === undefined) {
    return null;
  }

  const getPageNumbers = (): (number | "ellipsis")[] => {
    const pages: (number | "ellipsis")[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push("ellipsis");
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("ellipsis");
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push("ellipsis");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const paginationControls = (
    <Pagination className={cn("mx-0 w-auto justify-end", className)}>
      <PaginationContent>
        {/* Previous Page Button */}
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (currentPage > 1) {
                onPageChange(currentPage - 1);
              }
            }}
            className={
              currentPage <= 1
                ? "pointer-events-none opacity-50 cursor-not-allowed"
                : "cursor-pointer"
            }
          />
        </PaginationItem>

        {/* Page Number & Ellipsis Links */}
        {getPageNumbers().map((page, idx) => (
          <PaginationItem key={idx}>
            {page === "ellipsis" ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink
                href="#"
                isActive={page === currentPage}
                onClick={(e) => {
                  e.preventDefault();
                  if (page !== currentPage) {
                    onPageChange(page);
                  }
                }}
                className="cursor-pointer"
              >
                {page}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}

        {/* Next Page Button */}
        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (currentPage < totalPages) {
                onPageChange(currentPage + 1);
              }
            }}
            className={
              currentPage >= totalPages
                ? "pointer-events-none opacity-50 cursor-not-allowed"
                : "cursor-pointer"
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );

  // If totalItems is provided, render full container with "Showing X to Y of Z" summary
  if (totalItems !== undefined && itemsPerPage !== undefined) {
    const startItem = Math.min((currentPage - 1) * itemsPerPage + 1, totalItems);
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-2">
        <div className="text-xs text-muted-foreground font-medium">
          Showing{" "}
          <span className="font-semibold text-foreground">{startItem}</span> to{" "}
          <span className="font-semibold text-foreground">{endItem}</span> of{" "}
          <span className="font-semibold text-foreground">{totalItems}</span>{" "}
          {itemLabel}
        </div>

        {totalPages > 1 && paginationControls}
      </div>
    );
  }

  // Standalone pagination controls
  return paginationControls;
}

export default CustomPagination;
