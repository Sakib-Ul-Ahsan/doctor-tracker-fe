"use client";

import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { DashboardStats } from "@/types/api";

export function useDashboardStats(params: { days?: number } = {}) {
  const days = params.days ?? 14;

  return useQuery({
    queryKey: ["dashboard", "stats", days],
    queryFn: async () => {
      const response = await apiRequest<DashboardStats>("/dashboard/stats", {
        params: { days },
      });
      return response.data;
    },
    staleTime: 30 * 1000,
  });
}
