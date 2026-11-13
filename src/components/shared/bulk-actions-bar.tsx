"use client";

import { Download, Loader2, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
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

interface BulkActionsBarProps {
  selectedCount: number;
  itemLabel?: string;
  onClearSelection: () => void;
  onExportSelected: () => void;
  onDeleteSelected: () => void;
  isDeleting?: boolean;
  isExporting?: boolean;
  warningNotice?: string;
}

export function BulkActionsBar({
  selectedCount,
  itemLabel = "items",
  onClearSelection,
  onExportSelected,
  onDeleteSelected,
  isDeleting = false,
  isExporting = false,
  warningNotice,
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-200 bg-blue-50/90 px-4 py-2.5 text-xs text-blue-900 shadow-xs dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-200 animate-in fade-in slide-in-from-top-2">
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white shadow-2xs dark:bg-blue-500">
          {selectedCount}
        </span>
        <span className="font-semibold text-slate-800 dark:text-slate-100">
          {selectedCount} {itemLabel} selected
        </span>
      </div>

      <div className="flex items-center gap-2">
        {/* Export Selected Button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onExportSelected}
          disabled={isExporting}
          className="h-8 gap-1.5 border-blue-200 bg-white text-xs text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:bg-slate-900 dark:text-blue-300 dark:hover:bg-blue-950"
        >
          {isExporting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Download className="h-3.5 w-3.5" />
          )}
          <span>Export Selected</span>
        </Button>

        {/* Bulk Delete with Alert Dialog */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={isDeleting}
              className="h-8 gap-1.5 bg-rose-600 hover:bg-rose-700 text-xs text-white"
            >
              {isDeleting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
              <span>Delete Selected</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Bulk Deletion</AlertDialogTitle>
              <AlertDialogDescription className="space-y-2">
                <p>
                  Are you sure you want to permanently delete{" "}
                  <strong className="text-slate-900 dark:text-slate-100 font-semibold">
                    {selectedCount} selected {itemLabel}
                  </strong>
                  ? This administrative action cannot be undone.
                </p>
                {warningNotice && (
                  <p className="rounded-lg bg-amber-50 p-2 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
                    {warningNotice}
                  </p>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={onDeleteSelected}
                className="bg-rose-600 hover:bg-rose-700 text-white"
              >
                Delete {selectedCount} {itemLabel}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Clear Selection */}
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onClearSelection}
          title="Clear selection"
          className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

