"use client";

import { useState } from "react";
import { AlertTriangle, ArrowRightLeft, Loader2, ShieldAlert } from "lucide-react";
import { useDeleteDoctor, useDoctorOptions } from "@/hooks/use-doctors";
import { Doctor } from "@/types/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden">
        <div className="bg-rose-50/70 border-b border-rose-100 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white shadow-xs">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-slate-900">
                Delete Physician Record
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-600 mt-0.5">
                Review clinical safety policies before permanently removing this doctor.
              </DialogDescription>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-700 leading-relaxed">
            You are requesting to remove{" "}
            <span className="font-bold text-slate-900">{doctor?.name}</span> from the
            clinical directory.
          </p>

          {requiresReassignment ? (
            <div className="space-y-3 rounded-xl border border-amber-200/90 bg-amber-50/70 p-4">
              <div className="flex items-start gap-2.5">
                <ShieldAlert className="h-4 w-4 shrink-0 text-amber-700 mt-0.5" />
                <div className="text-xs text-amber-900 space-y-1">
                  <p className="font-bold">
                    Safe Deletion Policy: Reassignment Enforced
                  </p>
                  <p className="leading-relaxed">
                    This doctor currently has{" "}
                    <span className="font-bold underline">
                      {assignedCount} active patient(s)
                    </span>
                    . To prevent orphaned medical records, select a receiving physician to atomically transfer care.
                  </p>
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <Label htmlFor="reassignTo" className="text-xs font-semibold text-amber-950">
                  Transfer Patients To:
                </Label>
                <Select value={reassignTo} onValueChange={setReassignTo}>
                  <SelectTrigger id="reassignTo" className="bg-white border-amber-200 text-xs">
                    <SelectValue placeholder="Select receiving doctor..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTargets.map((d) => (
                      <SelectItem key={d._id} value={d._id} className="text-xs">
                        {d.name} — {d.specialization} ({d.patientCount ?? 0} caseload)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-600 leading-relaxed">
              This physician has no assigned patients. Deleting this record is safe and will not impact patient care.
            </div>
          )}

          <DialogFooter className="pt-4 border-t border-slate-100 sm:justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={deleteDoctor.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={
                deleteDoctor.isPending || (requiresReassignment && !reassignTo)
              }
              className="gap-2"
            >
              {deleteDoctor.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Transferring &amp; Deleting...
                </>
              ) : requiresReassignment ? (
                <>
                  <ArrowRightLeft className="h-4 w-4" />
                  Transfer &amp; Delete
                </>
              ) : (
                "Delete Physician"
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
