"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { doctorFormSchema, DoctorFormValues } from "@/lib/validations";
import { useCreateDoctor, useUpdateDoctor } from "@/hooks/use-doctors";
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
    } catch {
      // Error toast handled in mutation hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Doctor Profile" : "Add New Doctor"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update physician credentials, hospital affiliation, and contact details."
              : "Register a new physician in the clinical directory."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="doctor-name">Full Name</Label>
            <Input
              id="doctor-name"
              placeholder="Dr. Mahmudul Hasan"
              {...register("name")}
            />
            {errors.name ? (
              <p className="text-xs text-rose-600">{errors.name.message}</p>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="doctor-specialization">Specialization</Label>
              <Input
                id="doctor-specialization"
                placeholder="Cardiology"
                {...register("specialization")}
              />
              {errors.specialization ? (
                <p className="text-xs text-rose-600">{errors.specialization.message}</p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="doctor-hospital">Hospital / Clinic</Label>
              <Input
                id="doctor-hospital"
                placeholder="Dhaka Medical College Hospital"
                {...register("hospital")}
              />
              {errors.hospital ? (
                <p className="text-xs text-rose-600">{errors.hospital.message}</p>
              ) : null}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="doctor-phone">Phone Number</Label>
              <Input
                id="doctor-phone"
                placeholder="+880-1711-000101"
                {...register("phone")}
              />
              {errors.phone ? (
                <p className="text-xs text-rose-600">{errors.phone.message}</p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="doctor-email">Email Address</Label>
              <Input
                id="doctor-email"
                type="email"
                placeholder="mahmudul.hasan@hospital.org.bd"
                {...register("email")}
              />
              {errors.email ? (
                <p className="text-xs text-rose-600">{errors.email.message}</p>
              ) : null}
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : isEditing ? (
                "Save Changes"
              ) : (
                "Create Doctor"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

