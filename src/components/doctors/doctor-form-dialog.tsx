"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Building2,
  Loader2,
  Mail,
  Phone,
  Stethoscope,
  User,
} from "lucide-react";
import { doctorFormSchema, DoctorFormValues } from "@/lib/validations";
import { useCreateDoctor, useUpdateDoctor } from "@/hooks/use-doctors";
import { Doctor } from "@/types/api";
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

interface DoctorFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doctor?: Doctor | null;
}

export function DoctorFormDialog({
  open,
  onOpenChange,
  doctor,
}: DoctorFormDialogProps) {
  const isEditing = Boolean(doctor);
  const createDoctor = useCreateDoctor();
  const updateDoctor = useUpdateDoctor();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<DoctorFormValues>({
    resolver: zodResolver(doctorFormSchema),
    defaultValues: {
      name: "",
      specialization: "",
      hospital: "",
      phone: "",
      email: "",
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: doctor?.name ?? "",
        specialization: doctor?.specialization ?? "",
        hospital: doctor?.hospital ?? "",
        phone: doctor?.phone ?? "",
        email: doctor?.email ?? "",
      });
    }
  }, [open, doctor, reset]);

  const isSubmitting = createDoctor.isPending || updateDoctor.isPending;

  const onSubmit = async (values: DoctorFormValues) => {
    try {
      if (doctor) {
        await updateDoctor.mutateAsync({ id: doctor._id, values });
      } else {
        await createDoctor.mutateAsync(values);
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
      <DialogContent className="sm:max-w-[520px] p-0 overflow-hidden">
        {/* Header with gradient badge */}
        <div className="bg-slate-50 border-b border-slate-100 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-600/20">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-slate-900">
                {isEditing ? "Edit Physician Profile" : "Onboard New Physician"}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-0.5">
                {isEditing
                  ? "Update physician credentials, hospital affiliation, and contact details."
                  : "Register a verified doctor into the clinical operations network."}
              </DialogDescription>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Section 1: Clinical Identity */}
          <div className="space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Professional Identity
            </span>

            <div className="space-y-1.5">
              <Label htmlFor="doctor-name" className="text-xs font-semibold text-slate-700">
                Full Legal / Professional Name
              </Label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  id="doctor-name"
                  placeholder="Dr. Mahmudul Hasan"
                  className="pl-9"
                  {...register("name")}
                />
              </div>
              {errors.name && (
                <p className="text-xs text-rose-600 font-medium">{errors.name.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="doctor-spec" className="text-xs font-semibold text-slate-700">
                  Medical Specialization
                </Label>
                <div className="relative">
                  <Stethoscope className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    id="doctor-spec"
                    placeholder="e.g. Cardiology"
                    className="pl-9"
                    {...register("specialization")}
                  />
                </div>
                {errors.specialization && (
                  <p className="text-xs text-rose-600 font-medium">
                    {errors.specialization.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="doctor-hospital" className="text-xs font-semibold text-slate-700">
                  Hospital Affiliation
                </Label>
                <div className="relative">
                  <Building2 className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    id="doctor-hospital"
                    placeholder="e.g. Square Hospital, Dhaka"
                    className="pl-9"
                    {...register("hospital")}
                  />
                </div>
                {errors.hospital && (
                  <p className="text-xs text-rose-600 font-medium">
                    {errors.hospital.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Contact Details */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Direct Contact Details
            </span>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="doctor-email" className="text-xs font-semibold text-slate-700">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    id="doctor-email"
                    type="email"
                    placeholder="doctor@hospital.org"
                    className="pl-9"
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-rose-600 font-medium">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="doctor-phone" className="text-xs font-semibold text-slate-700">
                  Phone Number
                </Label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    id="doctor-phone"
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
                  {isEditing ? "Saving Changes..." : "Registering Doctor..."}
                </>
              ) : isEditing ? (
                "Save Profile Changes"
              ) : (
                "Register Physician"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
