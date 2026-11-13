import { LucideIcon, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  tone?: "blue" | "slate" | "indigo" | "amber" | "emerald" | "teal";
  trendText?: string;
}

const TONE_CLASSES: Record<NonNullable<StatCardProps["tone"]>, { icon: string; border: string; glow: string }> = {
  blue: {
    icon: "bg-blue-50 text-blue-600 ring-blue-100",
    border: "border-l-4 border-l-blue-600",
    glow: "bg-blue-500/5",
  },
  slate: {
    icon: "bg-slate-100 text-slate-800 ring-slate-200",
    border: "border-l-4 border-l-slate-900",
    glow: "bg-slate-500/5",
  },
  indigo: {
    icon: "bg-indigo-50 text-indigo-600 ring-indigo-100",
    border: "border-l-4 border-l-indigo-600",
    glow: "bg-indigo-500/5",
  },
  amber: {
    icon: "bg-amber-50 text-amber-600 ring-amber-100",
    border: "border-l-4 border-l-amber-500",
    glow: "bg-amber-500/5",
  },
  emerald: {
    icon: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    border: "border-l-4 border-l-emerald-600",
    glow: "bg-emerald-500/5",
  },
  teal: {
    icon: "bg-blue-50 text-blue-600 ring-blue-100",
    border: "border-l-4 border-l-blue-600",
    glow: "bg-blue-500/5",
  },
};

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  tone = "blue",
  trendText,
}: StatCardProps) {
  const styles = TONE_CLASSES[tone];

  return (
    <Card className={cn("relative overflow-hidden transition-all duration-200 hover:shadow-sm hover:border-slate-300", styles.border)}>
      <div className={cn("absolute inset-0 pointer-events-none", styles.glow)} />
      <CardContent className="p-5 sm:p-6 relative z-10">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              {title}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                {value}
              </span>
              {trendText && (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                  <TrendingUp className="h-2.5 w-2.5" />
                  {trendText}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium">{subtitle}</p>
          </div>
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-4 shadow-2xs transition-transform duration-200 group-hover:scale-105",
              styles.icon
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
