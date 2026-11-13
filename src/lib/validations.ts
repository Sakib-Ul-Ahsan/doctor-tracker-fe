import { z } from "zod";

export const loginFormSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;

export const doctorFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Doctor name must be at least 2 characters")
    .max(120, "Doctor name cannot exceed 120 characters"),
  specialization: z
    .string()
    .trim()
    .min(2, "Specialization must be at least 2 characters")
    .max(100, "Specialization cannot exceed 100 characters"),
  hospital: z
    .string()
    .trim()
    .min(2, "Hospital name must be at least 2 characters")
    .max(150, "Hospital name cannot exceed 150 characters"),
  phone: z
    .string()
    .trim()
    .min(5, "Phone number must be at least 5 characters")
    .max(30, "Phone number cannot exceed 30 characters"),
  email: z.string().trim().email("Enter a valid email address"),
});

export type DoctorFormValues = z.infer<typeof doctorFormSchema>;

export const patientFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Patient name must be at least 2 characters")
    .max(120, "Patient name cannot exceed 120 characters"),
  age: z
    .number({ error: "Age must be a number" })
    .int("Age must be a whole number")
    .min(0, "Age cannot be negative")
    .max(150, "Age cannot exceed 150"),
  gender: z.enum(["Male", "Female", "Other"], {
    error: "Please select a gender",
  }),
  phone: z
    .string()
    .trim()
    .min(5, "Phone number must be at least 5 characters")
    .max(30, "Phone number cannot exceed 30 characters"),
  email: z.string().trim().email("Enter a valid email address"),
  condition: z
    .string()
    .trim()
    .min(2, "Medical condition must be at least 2 characters")
    .max(150, "Medical condition cannot exceed 150 characters"),
  doctorId: z.string().min(1, "Please assign a doctor"),
});

export type PatientFormValues = z.infer<typeof patientFormSchema>;
