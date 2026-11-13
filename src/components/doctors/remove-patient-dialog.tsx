"use client";

import { useState } from "react";
import { ArrowRightLeft, Loader2, Trash2 } from "lucide-react";
import { useDoctorOptions } from "@/hooks/use-doctors";
import { useDeletePatient, useUpdatePatient } from "@/hooks/use-patients";
import { Patient } from "@/types/api";
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

interface RemovePatientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: Patient | null;
  currentDoctorId: string;
}

export function RemovePatientDialog({
  open,
  onOpenChange,
  patient,
  currentDoctorId,
}: RemovePatientDialogProps) {
  const [targetDoctorId, setTargetDoctorId] = useState("");
  const { data: doctors } = useDoctorOptions();
  const updatePatient = useUpdatePatient();
  const deletePatient = useDeletePatient();

  const otherDoctors = (doctors ?? []).filter((d) => d._id !== currentDoctorId);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setTargetDoctorId("");
    }
    onOpenChange(nextOpen);
  };

  const isBusy = updatePatient.isPending || deletePatient.isPending;

  const handleReassign = async () => {
    if (!patient || !targetDoctorId) return;
    try {
      await updatePatient.mutateAsync({
        id: patient._id,
        values: { doctorId: targetDoctorId },
      });
      setTargetDoctorId("");
      onOpenChange(false);
    } catch {
      // Handled by hook
    }
  };

  const handleDelete = async () => {
    if (!patient) return;
    try {
      await deletePatient.mutateAsync(patient._id);
      setTargetDoctorId("");
      onOpenChange(false);
    } catch {
      // Handled by hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>Remove Patient from Doctor</DialogTitle>
          <DialogDescription>
            Every patient must remain assigned to a physician to prevent orphaned records. Reassign{" "}
            <span className="font-medium text-slate-900">{patient?.name}</span> to another doctor or delete the record permanently.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
          <Label htmlFor="target-doctor">Reassign to another physician</Label>
          {otherDoctors.length > 0 ? (
            <div className="flex flex-col gap-2 sm:flex-row">
              <Select value={targetDoctorId} onValueChange={setTargetDoctorId}>
                <SelectTrigger id="target-doctor" className="bg-white flex-1">
                  <SelectValue placeholder="Select receiving doctor..." />
                </SelectTrigger>
                <SelectContent>
                  {otherDoctors.map((doc) => (
                    <SelectItem key={doc._id} value={doc._id}>
                      {doc.name} ({doc.specialization})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                onClick={handleReassign}
                disabled={!targetDoctorId || isBusy}
                className="shrink-0"
              >
                {updatePatient.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRightLeft className="h-4 w-4" />
                )}
                Reassign
              </Button>
            </div>
          ) : (
            <p className="text-xs text-slate-500">
              No other doctors are available in the directory yet.
            </p>
          )}
        </div>

        <DialogFooter className="items-center justify-between sm:justify-between border-t border-slate-100 pt-4">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={isBusy}
            className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
          >
            {deletePatient.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            Delete Patient Permanently
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isBusy}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
