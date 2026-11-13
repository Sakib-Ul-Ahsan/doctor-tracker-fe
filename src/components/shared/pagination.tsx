"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PaginationMeta } from "@/types/api";

interface PaginationProps {
  meta?: PaginationMeta;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export function Pagination({ meta, onPageChange, isLoading }: PaginationProps) {
  if (!meta || meta.total === 0) {
    return null;
  }

  const start = (meta.page - 1) * meta.limit + 1;
  const end = Math.min(meta.page * meta.limit, meta.total);

  return (
    <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/40 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-slate-500 font-medium">
        Showing <span className="font-bold text-slate-900">{start}</span>–
        <span className="font-bold text-slate-900">{end}</span> of{" "}
        <span className="font-bold text-slate-900">{meta.total}</span> records
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(meta.page - 1)}
          disabled={meta.page <= 1 || isLoading}
          className="h-8 gap-1 text-xs bg-white text-slate-700 hover:text-slate-900"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Previous
        </Button>
        <span className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs">
          Page {meta.page} of {meta.totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(meta.page + 1)}
          disabled={meta.page >= meta.totalPages || isLoading}
          className="h-8 gap-1 text-xs bg-white text-slate-700 hover:text-slate-900"
        >
          Next
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
