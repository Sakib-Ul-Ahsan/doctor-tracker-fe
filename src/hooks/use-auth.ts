"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { apiRequest, ApiClientError } from "@/lib/api";
import { LoginFormValues } from "@/lib/validations";
import { AdminUser } from "@/types/api";

export const AUTH_QUERY_KEY = ["auth", "me"] as const;

export function useCurrentAdmin() {
  return useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: async () => {
      const response = await apiRequest<{ admin: AdminUser }>("/auth/me", {
        skipUnauthorizedRedirect: true,
      });
      return response.data.admin;
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (credentials: LoginFormValues) => {
      const response = await apiRequest<{ admin: AdminUser }>("/auth/login", {
        method: "POST",
        body: credentials,
        skipUnauthorizedRedirect: true,
      });
      return response.data.admin;
    },
    onSuccess: (admin) => {
      queryClient.setQueryData(AUTH_QUERY_KEY, admin);
      toast.success(`Welcome back, ${admin.name}`);
      router.replace("/");
    },
    onError: (error: unknown) => {
      const message =
        error instanceof ApiClientError ? error.message : "Failed to sign in. Please try again.";
      toast.error(message);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      await apiRequest<{ loggedOut: boolean }>("/auth/logout", {
        method: "POST",
        skipUnauthorizedRedirect: true,
      });
    },
    onSuccess: () => {
      queryClient.clear();
      toast.success("Signed out successfully");
      router.replace("/login");
    },
    onError: () => {
      queryClient.clear();
      router.replace("/login");
    },
  });
}

