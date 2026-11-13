"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Columns3 } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ColumnOption {
  id: string;
  label: string;
  isVisible: boolean;
}

interface DataTableViewOptionsProps {
  columns: ColumnOption[];
  onToggleColumn: (id: string) => void;
  onResetColumns?: () => void;
}

export function DataTableViewOptions({
  columns,
  onToggleColumn,
  onResetColumns,
}: DataTableViewOptionsProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen((prev) => !prev)}
        className="gap-2 h-9 text-xs text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
      >
        <Columns3 className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
        <span>Columns</span>
      </Button>

      {open && (
        <div className="absolute right-0 z-30 mt-2 w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg dark:border-slate-800 dark:bg-slate-900 animate-in fade-in zoom-in-95">
          <div className="px-2 py-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Toggle Columns
          </div>
          <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
          <div className="space-y-0.5">
            {columns.map((col) => (
              <button
                key={col.id}
                type="button"
                onClick={() => onToggleColumn(col.id)}
                className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
              >
                <span>{col.label}</span>
                <div
                  className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${
                    col.isVisible
                      ? "border-blue-600 bg-blue-600 text-white dark:border-blue-500 dark:bg-blue-500"
                      : "border-slate-300 bg-transparent dark:border-slate-600"
                  }`}
                >
                  {col.isVisible && <Check className="h-3 w-3 stroke-[3]" />}
                </div>
              </button>
            ))}
          </div>
          {onResetColumns && (
            <>
              <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
              <button
                type="button"
                onClick={() => {
                  onResetColumns();
                  setOpen(false);
                }}
                className="w-full text-center rounded-lg px-2 py-1 text-[11px] text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/40"
              >
                Reset to default
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

