"use client";

import { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useDeleteDoctor, useDoctorOptions } from "@/hooks/use-doctors";
import { Doctor } from "@/types/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DeleteDoctorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doctor: Doctor | null;
  onDeleted?: () => void;
}

export function DeleteDoctorDialog({
  open,
  onOpenChange,
  doctor,
  onDeleted,
}: DeleteDoctorDialogProps) {
  const [reassignTo, setReassignTo] = useState<string>("");
  const deleteDoctor = useDeleteDoctor();
  const { data: allDoctors } = useDoctorOptions();

  const assignedCount = doctor?.patientCount ?? 0;
  const requiresReassignment = assignedCount > 0;
  const availableTargets = (allDoctors ?? []).filter((d) => d._id !== doctor?._id);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setReassignTo("");
    }
    onOpenChange(nextOpen);
  };

  const handleConfirm = async () => {
    if (!doctor) return;
    if (requiresReassignment && !reassignTo) return;

    try {
      await deleteDoctor.mutateAsync({
        id: doctor._id,
        reassignTo: requiresReassignment ? reassignTo : undefined,
      });
      setReassignTo("");
      onOpenChange(false);
      onDeleted?.();
    } catch {
      // Handled by hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <div className="mb-1 flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-100 text-rose-600">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <DialogTitle>Delete Doctor Record</DialogTitle>
          </div>
          <DialogDescription>
            {requiresReassignment
              ? `${doctor?.name} currently has ${assignedCount} assigned patient(s). To prevent orphaned patient records, select another physician to transfer these patients to before deletion.`
              : `Are you sure you want to delete ${doctor?.name}? This action cannot be undone.`}
          </DialogDescription>
        </DialogHeader>

        {requiresReassignment ? (
          <div className="space-y-2 rounded-xl border border-amber-200 bg-amber-50/70 p-3.5">
            <Label htmlFor="reassign-doctor" className="text-amber-900">
              Reassign {assignedCount} patient(s) to
            </Label>
            {availableTargets.length > 0 ? (
              <Select value={reassignTo} onValueChange={setReassignTo}>
                <SelectTrigger id="reassign-doctor" className="bg-white">
                  <SelectValue placeholder="Choose receiving physician..." />
                </SelectTrigger>
                <SelectContent>
                  {availableTargets.map((target) => (
                    <SelectItem key={target._id} value={target._id}>
                      {target.name} — {target.specialization}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-xs text-rose-700">
                No other physicians are available to receive these patients. Create another doctor first or remove/reassign the patients manually.
              </p>
            )}
          </div>
        ) : null}

        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleteDoctor.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={
              deleteDoctor.isPending ||
              (requiresReassignment && (!reassignTo || availableTargets.length === 0))
            }
          >
            {deleteDoctor.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : requiresReassignment ? (
              "Reassign & Delete Doctor"
            ) : (
              "Delete Doctor"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
