"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Activity,
  Loader2,
  Mail,
  Phone,
  User,
  UserPlus,
} from "lucide-react";
import { patientFormSchema, PatientFormValues } from "@/lib/validations";
import { useDoctorOptions } from "@/hooks/use-doctors";
import { useCreatePatient, useUpdatePatient } from "@/hooks/use-patients";
import { Patient } from "@/types/api";
import { ApiClientError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PatientFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient?: Patient | null;
  defaultDoctorId?: string;
  lockDoctor?: boolean;
}

export function PatientFormDialog({
  open,
  onOpenChange,
  patient,
  defaultDoctorId,
  lockDoctor = false,
}: PatientFormDialogProps) {
  const isEditing = Boolean(patient);
  const createPatient = useCreatePatient();
  const updatePatient = useUpdatePatient();
  const { data: doctors, isLoading: doctorsLoading } = useDoctorOptions();

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: {
      name: "",
      age: 30,
      gender: "Male",
      phone: "",
      email: "",
      condition: "",
      doctorId: defaultDoctorId ?? "",
    },
  });

  useEffect(() => {
    if (open) {
      const assignedDoctorId = patient
        ? typeof patient.doctorId === "string"
          ? patient.doctorId
          : patient.doctorId?._id ?? ""
        : defaultDoctorId ?? "";

      reset({
        name: patient?.name ?? "",
        age: patient?.age ?? 30,
        gender: patient?.gender ?? "Male",
        phone: patient?.phone ?? "",
        email: patient?.email ?? "",
        condition: patient?.condition ?? "",
        doctorId: assignedDoctorId,
      });
    }
  }, [open, patient, defaultDoctorId, reset]);

  const isSubmitting = createPatient.isPending || updatePatient.isPending;

  const onSubmit = async (values: PatientFormValues) => {
    try {
      if (patient) {
        await updatePatient.mutateAsync({ id: patient._id, values });
      } else {
        await createPatient.mutateAsync(values);
      }
      onOpenChange(false);
    } catch (err: unknown) {
      if (err instanceof ApiClientError && err.errors && err.errors.length > 0) {
        for (const errorItem of err.errors) {
          if (errorItem.field === "email" || errorItem.field === "phone") {
            setError(errorItem.field, { message: errorItem.message });
          }
        }
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px] p-0 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-50 border-b border-slate-100 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-600/20">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-slate-900">
                {isEditing ? "Edit Patient Record" : "Register Clinical Patient"}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-0.5">
                {isEditing
                  ? "Update patient demographic, clinical condition, or attending physician."
                  : "Enter patient intake details and assign an attending doctor."}
              </DialogDescription>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Section 1: Demographics */}
          <div className="space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Demographic Profile
            </span>

            <div className="space-y-1.5">
              <Label htmlFor="patient-name" className="text-xs font-semibold text-slate-700">
                Full Patient Name
              </Label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  id="patient-name"
                  placeholder="Tariqul Islam"
                  className="pl-9"
                  {...register("name")}
                />
              </div>
              {errors.name && (
                <p className="text-xs text-rose-600 font-medium">{errors.name.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="patient-age" className="text-xs font-semibold text-slate-700">
                  Age (Years)
                </Label>
                <Input
                  id="patient-age"
                  type="number"
                  min={0}
                  max={130}
                  {...register("age", { valueAsNumber: true })}
                />
                {errors.age && (
                  <p className="text-xs text-rose-600 font-medium">{errors.age.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">
                  Biological Gender
                </Label>
                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="h-9 bg-white">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.gender && (
                  <p className="text-xs text-rose-600 font-medium">{errors.gender.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Contact Info */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Contact Channels
            </span>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="patient-phone" className="text-xs font-semibold text-slate-700">
                  Phone Number
                </Label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    id="patient-phone"
                    placeholder="88017XXXXXXXX"
                    className="pl-9"
                    {...register("phone")}
                  />
                </div>
                <p className="text-[10px] text-slate-400">Format: 8801XXXXXXXXX (13 digits)</p>
                {errors.phone && (
                  <p className="text-xs text-rose-600 font-medium">{errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="patient-email" className="text-xs font-semibold text-slate-700">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    id="patient-email"
                    type="email"
                    placeholder="patient@example.com"
                    className="pl-9"
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-rose-600 font-medium">{errors.email.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Clinical Condition & Assignment */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Clinical Condition &amp; Doctor Assignment
            </span>

            <div className="space-y-1.5">
              <Label htmlFor="patient-condition" className="text-xs font-semibold text-slate-700">
                Medical Diagnosis / Primary Condition
              </Label>
              <div className="relative">
                <Activity className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  id="patient-condition"
                  placeholder="e.g. Hypertension, Seasonal Asthma, Type 2 Diabetes"
                  className="pl-9"
                  {...register("condition")}
                />
              </div>
              {errors.condition && (
                <p className="text-xs text-rose-600 font-medium">
                  {errors.condition.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">
                Attending Physician
              </Label>
              <Controller
                name="doctorId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={lockDoctor}
                  >
                    <SelectTrigger className="h-9 bg-white">
                      <SelectValue
                        placeholder={
                          doctorsLoading ? "Loading available physicians..." : "Select attending physician"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {(doctors ?? []).map((doc) => (
                        <SelectItem key={doc._id} value={doc._id}>
                          {doc.name} — {doc.specialization} ({doc.hospital})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.doctorId && (
                <p className="text-xs text-rose-600 font-medium">
                  {errors.doctorId.message}
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-slate-100 sm:justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isEditing ? "Saving Patient..." : "Registering Patient..."}
                </>
              ) : isEditing ? (
                "Save Patient Record"
              ) : (
                "Complete Registration"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
