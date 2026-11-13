"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiRequest, ApiClientError } from "@/lib/api";
import { DoctorFormValues } from "@/lib/validations";
import { Doctor, PaginationMeta, Patient } from "@/types/api";

export interface DoctorsQueryParams {
  search?: string;
  specialization?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "name" | "specialization" | "hospital";
  sortOrder?: "asc" | "desc";
}

interface DoctorsListPayload {
  doctors: Doctor[];
  filters: {
    specializations: string[];
  };
}

export function useDoctors(params: DoctorsQueryParams = {}) {
  return useQuery({
    queryKey: ["doctors", params],
    queryFn: async () => {
      const response = await apiRequest<DoctorsListPayload>("/doctors", {
        params: {
          search: params.search,
          specialization: params.specialization,
          startDate: params.startDate,
          endDate: params.endDate,
          page: params.page ?? 1,
          limit: params.limit ?? 10,
          sortBy: params.sortBy ?? "createdAt",
          sortOrder: params.sortOrder ?? "desc",
        },
      });
      return {
        doctors: response.data.doctors,
        specializations: response.data.filters.specializations,
        meta: response.meta as PaginationMeta,
      };
    },
    placeholderData: keepPreviousData,
  });
}

export function useDoctorOptions() {
  return useQuery({
    queryKey: ["doctors", "options"],
    queryFn: async () => {
      const response = await apiRequest<DoctorsListPayload>("/doctors", {
        params: { page: 1, limit: 100, sortBy: "name", sortOrder: "asc" },
      });
      return response.data.doctors;
    },
    staleTime: 60 * 1000,
  });
}

export function useDoctor(id: string) {
  return useQuery({
    queryKey: ["doctor", id],
    queryFn: async () => {
      const response = await apiRequest<{ doctor: Doctor }>(`/doctors/${id}`);
      return response.data.doctor;
    },
    enabled: Boolean(id),
  });
}

export function useDoctorPatients(
  doctorId: string,
  params: { search?: string; page?: number; limit?: number } = {}
) {
  return useQuery({
    queryKey: ["doctor", doctorId, "patients", params],
    queryFn: async () => {
      const response = await apiRequest<{ patients: Patient[] }>(
        `/doctors/${doctorId}/patients`,
        {
          params: {
            search: params.search,
            page: params.page ?? 1,
            limit: params.limit ?? 10,
          },
        }
      );
      return {
        patients: response.data.patients,
        meta: response.meta as PaginationMeta,
      };
    },
    enabled: Boolean(doctorId),
    placeholderData: keepPreviousData,
  });
}

export function useCreateDoctor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: DoctorFormValues) => {
      const response = await apiRequest<{ doctor: Doctor }>("/doctors", {
        method: "POST",
        body: values,
      });
      return response.data.doctor;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["doctors"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Doctor added successfully");
    },
    onError: (error: unknown) => {
      toast.error(error instanceof ApiClientError ? error.message : "Failed to create doctor");
    },
  });
}

export function useUpdateDoctor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, values }: { id: string; values: Partial<DoctorFormValues> }) => {
      const response = await apiRequest<{ doctor: Doctor }>(`/doctors/${id}`, {
        method: "PATCH",
        body: values,
      });
      return response.data.doctor;
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["doctors"] });
      void queryClient.invalidateQueries({ queryKey: ["doctor", variables.id] });
      void queryClient.invalidateQueries({ queryKey: ["patients"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Doctor updated successfully");
    },
    onError: (error: unknown) => {
      toast.error(error instanceof ApiClientError ? error.message : "Failed to update doctor");
    },
  });
}

export function useDeleteDoctor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reassignTo }: { id: string; reassignTo?: string }) => {
      const response = await apiRequest<{
        deletedId: string;
        reassignedPatientsCount: number;
      }>(`/doctors/${id}`, {
        method: "DELETE",
        params: reassignTo ? { reassignTo } : undefined,
      });
      return response;
    },
    onSuccess: (res) => {
      void queryClient.invalidateQueries({ queryKey: ["doctors"] });
      void queryClient.invalidateQueries({ queryKey: ["patients"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success(res.message || "Doctor deleted successfully");
    },
    onError: (error: unknown) => {
      toast.error(error instanceof ApiClientError ? error.message : "Failed to delete doctor");
    },
  });
}

