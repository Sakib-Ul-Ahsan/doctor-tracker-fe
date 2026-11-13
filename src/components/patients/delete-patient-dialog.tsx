"use client";

import { Loader2 } from "lucide-react";
import { useDeletePatient } from "@/hooks/use-patients";
import { Patient } from "@/types/api";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
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
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Patient Record</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to permanently remove{" "}
            <span className="font-medium text-slate-900">{patient?.name}</span> from
            the system? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deletePatient.isPending}>
            Cancel
          </AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deletePatient.isPending}
          >
            {deletePatient.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Patient"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

