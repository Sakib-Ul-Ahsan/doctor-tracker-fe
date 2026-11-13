"use client";

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { TableHead } from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface SortableTableHeadProps<T extends string> {
  columnKey: T;
  label: string;
  activeKey?: T;
  activeOrder?: "asc" | "desc";
  onSort: (key: T) => void;
  className?: string;
  align?: "left" | "right" | "center";
}

export function SortableTableHead<T extends string>({
  columnKey,
  label,
  activeKey,
  activeOrder,
  onSort,
  className,
  align = "left",
}: SortableTableHeadProps<T>) {
  const isActive = activeKey === columnKey;

  return (
    <TableHead
      className={cn(
        "select-none",
        align === "center" && "text-center",
        align === "right" && "text-right",
        align === "left" && "text-left",
        className
      )}
    >
      <button
        type="button"
        onClick={() => onSort(columnKey)}
        className={cn(
          "group/sort inline-flex items-center gap-1.5 font-semibold text-xs tracking-wider uppercase transition-colors hover:text-blue-600 dark:hover:text-blue-400 focus-visible:outline-hidden",
          isActive
            ? "text-blue-600 dark:text-blue-400"
            : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200",
          align === "right" && "ml-auto justify-end",
          align === "center" && "mx-auto justify-center",
          align === "left" && "justify-start text-left"
        )}
      >
        <span>{label}</span>
        {isActive ? (
          activeOrder === "asc" ? (
            <ArrowUp className="h-3.5 w-3.5 stroke-[2.5]" />
          ) : (
            <ArrowDown className="h-3.5 w-3.5 stroke-[2.5]" />
          )
        ) : (
          <ArrowUpDown className="h-3 w-3 opacity-35 group-hover/sort:opacity-80 transition-opacity" />
        )}
      </button>
    </TableHead>
  );
}
