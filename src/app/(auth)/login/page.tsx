"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  HeartPulse,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
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
    setValue,
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

  const handleFillDemo = () => {
    setValue("email", "admin@doctortracker.local", { shouldValidate: true });
    setValue("password", "ChangeMe123!", { shouldValidate: true });
  };

  const errorMessage =
    loginMutation.error instanceof ApiClientError
      ? loginMutation.error.message
      : loginMutation.isError
        ? "Unable to sign in. Please verify your administrator credentials."
        : null;

  return (
    <div className="flex min-h-screen w-full bg-slate-50">
      {/* Left Brand & Feature Showcase (Visible on lg+) */}
      <div className="hidden lg:relative lg:flex lg:w-1/2 lg:flex-col lg:justify-between lg:overflow-hidden lg:bg-gradient-to-br lg:from-slate-950 lg:via-slate-900 lg:to-blue-950 lg:p-12 lg:text-white">
        {/* Subtle radial glow background */}
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full opacity-30 blur-3xl"
          style={{ background: "radial-gradient(circle, #3b82f6 0%, transparent 70%)" }}
        />
        <div
          className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, #2563eb 0%, transparent 70%)" }}
        />

        {/* Top Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-lg shadow-blue-500/20">
            <HeartPulse className="h-6 w-6 text-white" />
          </div>
          <div>
            <span className="block text-lg font-bold tracking-tight text-white">
              Doctor Tracker
            </span>
            <span className="block text-xs font-medium text-blue-400">
              Healthcare Administration Platform
            </span>
          </div>
        </div>

        {/* Center Marketing Highlights */}
        <div className="relative z-10 max-w-lg space-y-8 my-auto">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-300 backdrop-blur-md">
              <ShieldCheck className="h-3.5 w-3.5" />
              Enterprise Clinical Operations
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl leading-tight">
              Physician Management &amp; Patient Assignment Platform.
            </h1>
            <p className="text-sm leading-relaxed text-slate-300">
              Engineered for healthcare administrators to coordinate doctor directories, maintain strict patient assignments with zero orphan records, and monitor real-time clinical intake metrics.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-xs">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div className="text-xs">
                <span className="font-semibold text-white block">Zero Orphaned Patient Policy</span>
                <span className="text-slate-400">
                  Automated reassignments enforce atomic patient transfers during doctor removal.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-xs">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
                <Activity className="h-4 w-4" />
              </div>
              <div className="text-xs">
                <span className="font-semibold text-white block">Real-Time Caseload Analytics</span>
                <span className="text-slate-400">
                  Continuous 14-day velocity and department aggregations powered by MongoDB pipelines.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Security Footer */}
        <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-6 text-xs text-slate-400">
          <span>Production Ready • Independent Next.js &amp; Express Architecture</span>
          <span className="flex items-center gap-1 font-mono text-[11px] text-blue-400">
            <Lock className="h-3 w-3" />
            256-Bit SSL / HTTP-Only
          </span>
        </div>
      </div>

      {/* Right Login Form Container */}
      <div className="flex w-full flex-col justify-center px-4 py-12 sm:px-6 lg:w-1/2 lg:px-12 xl:px-16">
        <div className="mx-auto w-full max-w-md">
          {/* Mobile Logo Branding (hidden on desktop) */}
          <div className="mb-8 flex flex-col items-center text-center lg:hidden">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-slate-950 via-slate-900 to-blue-700 text-white shadow-md">
              <HeartPulse className="h-6 w-6 text-blue-400" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Doctor Tracker
            </h2>
            <p className="text-xs text-slate-500">
              Clinical Operations &amp; Administration Console
            </p>
          </div>

          <Card className="shadow-lg border-slate-200/90 shadow-slate-200/50">
            <CardHeader className="space-y-1.5 pb-4 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold text-slate-900">
                  Administrator Sign In
                </CardTitle>
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700 border border-blue-200/60">
                  <ShieldCheck className="h-3 w-3" />
                  Admin Only
                </span>
              </div>
              <CardDescription>
                Enter your administrative credentials to securely access clinical records.
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {errorMessage && (
                  <div className="rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-semibold text-rose-700 animate-in fade-in duration-200">
                    {errorMessage}
                  </div>
                )}

                {/* Email Field */}
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-semibold text-slate-700">
                    Administrator Email
                  </Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@doctortracker.local"
                      autoComplete="email"
                      className="pl-9 h-10"
                      {...register("email")}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-rose-600 font-medium">{errors.email.message}</p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-xs font-semibold text-slate-700">
                      Password
                    </Label>
                  </div>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter administrator password"
                      autoComplete="current-password"
                      className="pl-9 pr-10 h-10"
                      {...register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-rose-600 font-medium">{errors.password.message}</p>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-10 font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-600/20 gap-2"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Authenticating session...
                    </>
                  ) : (
                    <>
                      Sign In to Console
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              {/* Quick Fill Demo Credentials Action */}
              <div className="mt-5 rounded-xl border border-slate-200/90 bg-slate-50/70 p-3.5">
                <div className="flex items-center justify-between mb-2">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <KeyRound className="h-3.5 w-3.5 text-blue-600" />
                    Initial Seed Account
                  </span>
                  <button
                    type="button"
                    onClick={handleFillDemo}
                    className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                  >
                    Auto-Fill
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Default credentials seeded via <code className="rounded bg-slate-200/80 px-1 py-0.5 font-mono text-[10px] text-slate-800">npm run seed</code>:
                  <span className="block mt-1 font-mono text-[11px] text-slate-700 font-medium">
                    admin@doctortracker.local &bull; ChangeMe123!
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
