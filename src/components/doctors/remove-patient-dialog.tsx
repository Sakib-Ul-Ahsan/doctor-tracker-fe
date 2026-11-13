"use client";

import { useState } from "react";
import { ArrowRightLeft, Loader2, Trash2, UserMinus } from "lucide-react";
import { useDoctorOptions } from "@/hooks/use-doctors";
import { useDeletePatient, useUpdatePatient } from "@/hooks/use-patients";
import { Patient } from "@/types/api";
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
      onOpenChange(false);
    } catch {
      // Handled by hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-100 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-200/60">
              <UserMinus className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-slate-900">
                Remove Patient from Physician
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-0.5">
                Choose to reassign the patient to another doctor or discharge the record.
              </DialogDescription>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <p className="text-sm text-slate-700 leading-relaxed">
            Patient: <span className="font-bold text-slate-900">{patient?.name}</span>{" "}
            ({patient?.condition})
          </p>

          {/* Option A: Reassign */}
          <div className="space-y-3 rounded-xl border border-blue-100 bg-blue-50/40 p-4">
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="h-4 w-4 text-blue-600" />
              <h4 className="text-xs font-bold text-blue-900">
                Option A: Reassign to Another Physician (Recommended)
              </h4>
            </div>
            <p className="text-xs text-blue-800 leading-relaxed">
              Maintains patient tracking while transferring their care to an alternate specialist.
            </p>
            <div className="space-y-1.5 pt-1">
              <Label htmlFor="targetDoctorId" className="text-xs font-semibold text-slate-700">
                Select Receiving Physician:
              </Label>
              <Select value={targetDoctorId} onValueChange={setTargetDoctorId}>
                <SelectTrigger id="targetDoctorId" className="bg-white text-xs">
                  <SelectValue placeholder="Choose doctor..." />
                </SelectTrigger>
                <SelectContent>
                  {otherDoctors.map((doc) => (
                    <SelectItem key={doc._id} value={doc._id} className="text-xs">
                      {doc.name} — {doc.specialization} ({doc.patientCount ?? 0} caseload)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              type="button"
              size="sm"
              onClick={handleReassign}
              disabled={!targetDoctorId || isBusy}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2 mt-2"
            >
              {updatePatient.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Reassigning Patient...
                </>
              ) : (
                <>
                  <ArrowRightLeft className="h-3.5 w-3.5" />
                  Reassign Patient
                </>
              )}
            </Button>
          </div>

          {/* Option B: Delete */}
          <div className="space-y-2 rounded-xl border border-rose-100 bg-rose-50/40 p-4">
            <div className="flex items-center gap-2">
              <Trash2 className="h-4 w-4 text-rose-600" />
              <h4 className="text-xs font-bold text-rose-900">
                Option B: Discharge / Delete Record
              </h4>
            </div>
            <p className="text-xs text-rose-700 leading-relaxed">
              Permanently removes this patient from the clinic database.
            </p>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={isBusy}
              className="w-full gap-2 mt-2"
            >
              {deletePatient.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Deleting Record...
                </>
              ) : (
                <>
                  <Trash2 className="h-3.5 w-3.5" />
                  Permanently Delete Patient
                </>
              )}
            </Button>
          </div>

          <DialogFooter className="pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isBusy}
              className="w-full"
            >
              Cancel
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
