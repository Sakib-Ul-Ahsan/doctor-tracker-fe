"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Activity,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";
import { loginFormSchema, LoginFormValues } from "@/lib/validations";
import { useCurrentAdmin, useLogin } from "@/hooks/use-auth";
import { ApiClientError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const { data: admin, isLoading: checkingSession } = useCurrentAdmin();
  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (!checkingSession && admin) {
      router.replace("/");
    }
  }, [admin, checkingSession, router]);

  const onSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(values);
  };

  const errorMessage =
    loginMutation.error instanceof ApiClientError
      ? loginMutation.error.message
      : loginMutation.isError
        ? "Unable to sign in. Please verify your credentials."
        : null;

  return (
    <div className="relative flex min-h-screen flex-col justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      {/* Subtle decorative clinical grid */}
      <div
        className="pointer-events-none fixed inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(#cbd5e1 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative mx-auto w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-lg shadow-teal-600/25">
            <Stethoscope className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Doctor Tracker
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Healthcare Operations &amp; Patient Assignment Console
          </p>
        </div>

        <Card className="border-slate-200/90 shadow-lg shadow-slate-200/50">
          <CardHeader className="space-y-1 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Administrator Sign In</CardTitle>
              <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2.5 py-0.5 text-[11px] font-medium text-teal-700">
                <ShieldCheck className="h-3 w-3" />
                HTTP-Only JWT
              </span>
            </div>
            <CardDescription>
              Enter your administrator credentials to access the clinical dashboard.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {errorMessage ? (
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-700">
                  {errorMessage}
                </div>
              ) : null}

              <div className="space-y-1.5">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@doctortracker.local"
                    autoComplete="email"
                    className="pl-9"
                    {...register("email")}
                  />
                </div>
                {errors.email ? (
                  <p className="text-xs text-rose-600">{errors.email.message}</p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="pl-9 pr-10"
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-2.5 top-2 rounded-md p-0.5 text-slate-400 hover:text-slate-600"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password ? (
                  <p className="text-xs text-rose-600">{errors.password.message}</p>
                ) : null}
              </div>

              <Button
                type="submit"
                className="w-full h-10 font-semibold"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In to Dashboard"
                )}
              </Button>
            </form>

            <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-slate-100 bg-slate-50/80 p-3 text-xs text-slate-500">
              <Activity className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
              <p className="leading-relaxed">
                Admin accounts are provisioned securely via the backend seed script (
                <code className="rounded bg-slate-200/70 px-1 py-0.5 font-mono text-[11px] text-slate-700">
                  npm run seed
                </code>
                ). Public registration is disabled.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

