"use client";

import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { DashboardStats } from "@/types/api";

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: async () => {
      const response = await apiRequest<DashboardStats>("/dashboard/stats");
      return response.data;
    },
    staleTime: 30 * 1000,
  });
}

