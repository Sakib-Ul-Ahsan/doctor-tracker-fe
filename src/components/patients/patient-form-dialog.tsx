"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { patientFormSchema, PatientFormValues } from "@/lib/validations";
import { useDoctorOptions } from "@/hooks/use-doctors";
import { useCreatePatient, useUpdatePatient } from "@/hooks/use-patients";
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
    } catch {
      // Handled by hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Patient Record" : "Register New Patient"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update patient demographics, medical condition, and assigned physician."
              : "Enter patient details and assign them to an attending physician."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="patient-name">Full Name</Label>
            <Input
              id="patient-name"
              placeholder="Tariqul Islam"
              {...register("name")}
            />
            {errors.name ? (
              <p className="text-xs text-rose-600">{errors.name.message}</p>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="patient-age">Age</Label>
              <Input
                id="patient-age"
                type="number"
                min={0}
                max={150}
                {...register("age", { valueAsNumber: true })}
              />
              {errors.age ? (
                <p className="text-xs text-rose-600">{errors.age.message}</p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label>Gender</Label>
              <Controller
                control={control}
                name="gender"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
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
              {errors.gender ? (
                <p className="text-xs text-rose-600">{errors.gender.message}</p>
              ) : null}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="patient-phone">Phone Number</Label>
              <Input
                id="patient-phone"
                placeholder="+880-1712-000201"
                {...register("phone")}
              />
              {errors.phone ? (
                <p className="text-xs text-rose-600">{errors.phone.message}</p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="patient-email">Email Address</Label>
              <Input
                id="patient-email"
                type="email"
                placeholder="tariqul.islam@example.com"
                {...register("email")}
              />
              {errors.email ? (
                <p className="text-xs text-rose-600">{errors.email.message}</p>
              ) : null}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="patient-condition">Medical Condition</Label>
            <Input
              id="patient-condition"
              placeholder="Hypertension"
              {...register("condition")}
            />
            {errors.condition ? (
              <p className="text-xs text-rose-600">{errors.condition.message}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label>Assigned Doctor</Label>
            <Controller
              control={control}
              name="doctorId"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={lockDoctor || doctorsLoading}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        doctorsLoading ? "Loading physicians..." : "Select attending physician"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {(doctors ?? []).map((doc) => (
                      <SelectItem key={doc._id} value={doc._id}>
                        {doc.name} ({doc.specialization})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.doctorId ? (
              <p className="text-xs text-rose-600">{errors.doctorId.message}</p>
            ) : null}
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
                "Register Patient"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
