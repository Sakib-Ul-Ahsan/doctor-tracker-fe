"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { HeartPulse } from "lucide-react";
import { setUnauthorizedHandler } from "@/lib/api";
import { useCurrentAdmin } from "@/hooks/use-auth";
import { toast } from "sonner";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: admin, isLoading, isError } = useCurrentAdmin();

  useEffect(() => {
    setUnauthorizedHandler(() => {
      queryClient.clear();
      toast.error("Your session has expired. Please sign in again.");
      router.replace("/login");
    });

    return () => {
      setUnauthorizedHandler(null);
    };
  }, [queryClient, router]);

  useEffect(() => {
    if (!isLoading && (isError || !admin)) {
      router.replace("/login");
    }
  }, [isLoading, isError, admin, router]);

  if (isLoading || !admin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-slate-950 via-slate-900 to-blue-700 text-white shadow-md shadow-blue-600/20 animate-pulse">
            <HeartPulse className="h-6 w-6 text-blue-400" />
          </div>
          <div className="space-y-1 text-center">
            <p className="text-sm font-bold text-slate-900">Doctor Tracker</p>
            <p className="text-xs text-slate-500 font-medium">Verifying administrator session...</p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
