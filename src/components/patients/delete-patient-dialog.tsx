"use client";

import { AlertTriangle, Loader2 } from "lucide-react";
import { useDeletePatient } from "@/hooks/use-patients";
import { Patient } from "@/types/api";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface DeletePatientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: Patient | null;
  onDeleted?: () => void;
}

export function DeletePatientDialog({
  open,
  onOpenChange,
  patient,
  onDeleted,
}: DeletePatientDialogProps) {
  const deletePatient = useDeletePatient();

  const handleDelete = async () => {
    if (!patient) return;
    try {
      await deletePatient.mutateAsync(patient._id);
      onOpenChange(false);
      onDeleted?.();
    } catch {
      // Handled by hook
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-[460px] p-0 overflow-hidden">
        <div className="bg-rose-50/70 border-b border-rose-100 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white shadow-xs">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <AlertDialogTitle className="text-lg font-bold text-slate-900">
                Delete Patient Record
              </AlertDialogTitle>
              <AlertDialogDescription className="text-xs text-slate-600 mt-0.5">
                Permanent clinical record deletion confirmation.
              </AlertDialogDescription>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-700 leading-relaxed">
            Are you sure you want to permanently discharge and remove{" "}
            <span className="font-bold text-slate-900">{patient?.name}</span> (MRN-
            {patient?._id.slice(-6).toUpperCase()}) from the healthcare registry?
          </p>

          <div className="rounded-xl border border-rose-200/80 bg-rose-50/50 p-3.5 text-xs text-rose-800 leading-relaxed">
            This action is permanent and cannot be undone. All clinical tracking history for this patient will be erased.
          </div>

          <AlertDialogFooter className="pt-4 border-t border-slate-100 sm:justify-end gap-2">
            <AlertDialogCancel disabled={deletePatient.isPending}>
              Cancel
            </AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deletePatient.isPending}
              className="gap-2"
            >
              {deletePatient.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting Record...
                </>
              ) : (
                "Delete Patient"
              )}
            </Button>
          </AlertDialogFooter>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
