"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PaginationMeta } from "@/types/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PaginationProps {
  meta?: PaginationMeta;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  limitOptions?: number[];
  isLoading?: boolean;
}

export function Pagination({
  meta,
  onPageChange,
  onLimitChange,
  limitOptions = [10, 25, 50],
  isLoading,
}: PaginationProps) {
  if (!meta || meta.total === 0) {
    return null;
  }

  const start = (meta.page - 1) * meta.limit + 1;
  const end = Math.min(meta.page * meta.limit, meta.total);

  return (
    <div className="flex flex-col gap-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-4">
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Showing <span className="font-bold text-slate-900 dark:text-slate-100">{start}</span>–
          <span className="font-bold text-slate-900 dark:text-slate-100">{end}</span> of{" "}
          <span className="font-bold text-slate-900 dark:text-slate-100">{meta.total}</span> records
        </p>

        {onLimitChange && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span>Rows:</span>
            <Select
              value={String(meta.limit)}
              onValueChange={(val) => onLimitChange(Number(val))}
            >
              <SelectTrigger className="h-7 w-[68px] text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <SelectValue placeholder={String(meta.limit)} />
              </SelectTrigger>
              <SelectContent>
                {limitOptions.map((opt) => (
                  <SelectItem key={opt} value={String(opt)} className="text-xs">
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(meta.page - 1)}
          disabled={meta.page <= 1 || isLoading}
          className="h-8 gap-1 text-xs bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:text-slate-900 border-slate-200 dark:border-slate-800"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Previous
        </Button>
        <span className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs">
          Page {meta.page} of {meta.totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(meta.page + 1)}
          disabled={meta.page >= meta.totalPages || isLoading}
          className="h-8 gap-1 text-xs bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:text-slate-900 border-slate-200 dark:border-slate-800"
        >
          Next
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
