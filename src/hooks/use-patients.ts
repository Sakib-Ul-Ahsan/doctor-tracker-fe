"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiRequest, ApiClientError } from "@/lib/api";
import { PatientFormValues } from "@/lib/validations";
import { PaginationMeta, Patient } from "@/types/api";

export interface PatientsQueryParams {
  search?: string;
  condition?: string;
  doctorId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "name" | "age" | "condition";
  sortOrder?: "asc" | "desc";
}

interface PatientsListPayload {
  patients: Patient[];
  conditions?: string[];
  filters?: {
    conditions?: string[];
  };
}

export function usePatients(params: PatientsQueryParams = {}) {
  return useQuery({
    queryKey: ["patients", params],
    queryFn: async () => {
      const response = await apiRequest<PatientsListPayload>("/patients", {
        params: {
          search: params.search,
          condition: params.condition,
          doctorId: params.doctorId,
          startDate: params.startDate,
          endDate: params.endDate,
          page: params.page ?? 1,
          limit: params.limit ?? 10,
          sortBy: params.sortBy ?? "createdAt",
          sortOrder: params.sortOrder ?? "desc",
        },
      });

      const conditions =
        response.data.conditions ??
        response.data.filters?.conditions ??
        [];

      return {
        patients: response.data.patients ?? [],
        conditions,
        meta: response.meta as PaginationMeta,
      };
    },
    placeholderData: keepPreviousData,
  });
}

export function usePatient(id: string) {
  return useQuery({
    queryKey: ["patient", id],
    queryFn: async () => {
      const response = await apiRequest<{ patient: Patient }>(`/patients/${id}`);
      return response.data.patient;
    },
    enabled: Boolean(id),
  });
}

export function useCreatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: PatientFormValues) => {
      const response = await apiRequest<{ patient: Patient }>("/patients", {
        method: "POST",
        body: values,
      });
      return response.data.patient;
    },
    onSuccess: (patient) => {
      const docId =
        typeof patient.doctorId === "string" ? patient.doctorId : patient.doctorId?._id;
      void queryClient.invalidateQueries({ queryKey: ["patients"] });
      void queryClient.invalidateQueries({ queryKey: ["doctors"] });
      if (docId) {
        void queryClient.invalidateQueries({ queryKey: ["doctor", docId] });
      }
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Patient registered successfully");
    },
    onError: (error: unknown) => {
      toast.error(error instanceof ApiClientError ? error.message : "Failed to register patient");
    },
  });
}

export function useUpdatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, values }: { id: string; values: Partial<PatientFormValues> }) => {
      const response = await apiRequest<{ patient: Patient }>(`/patients/${id}`, {
        method: "PATCH",
        body: values,
      });
      return response.data.patient;
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["patients"] });
      void queryClient.invalidateQueries({ queryKey: ["patient", variables.id] });
      void queryClient.invalidateQueries({ queryKey: ["doctors"] });
      void queryClient.invalidateQueries({ queryKey: ["doctor"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Patient updated successfully");
    },
    onError: (error: unknown) => {
      toast.error(error instanceof ApiClientError ? error.message : "Failed to update patient");
    },
  });
}

export function useDeletePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest<{ deletedId: string }>(`/patients/${id}`, {
        method: "DELETE",
      });
      return response;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["patients"] });
      void queryClient.invalidateQueries({ queryKey: ["doctors"] });
      void queryClient.invalidateQueries({ queryKey: ["doctor"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Patient record deleted successfully");
    },
    onError: (error: unknown) => {
      toast.error(error instanceof ApiClientError ? error.message : "Failed to delete patient");
    },
  });
}

export function useBulkDeletePatients() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const response = await apiRequest<{ deletedCount: number; deletedIds: string[] }>(
        "/patients/bulk-delete",
        {
          method: "POST",
          body: { ids },
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ["patients"] });
      void queryClient.invalidateQueries({ queryKey: ["doctors"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success(`Successfully deleted ${data.deletedCount} patient(s)`);
    },
    onError: (error: unknown) => {
      toast.error(
        error instanceof ApiClientError
          ? error.message
          : "Failed to delete selected patients."
      );
    },
  });
}

