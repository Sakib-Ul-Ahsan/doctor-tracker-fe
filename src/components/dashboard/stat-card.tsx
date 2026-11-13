import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  tone?: "teal" | "indigo" | "amber" | "emerald";
}

const TONE_CLASSES: Record<NonNullable<StatCardProps["tone"]>, string> = {
  teal: "bg-teal-50 text-teal-600 ring-teal-100",
  indigo: "bg-indigo-50 text-indigo-600 ring-indigo-100",
  amber: "bg-amber-50 text-amber-600 ring-amber-100",
  emerald: "bg-emerald-50 text-emerald-600 ring-emerald-100",
};

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  tone = "teal",
}: StatCardProps) {
  return (
    <Card className="transition-shadow hover:shadow-sm">
      <CardContent className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              {title}
            </p>
            <p className="text-3xl font-bold tracking-tight text-slate-900">
              {value}
            </p>
            <p className="text-xs text-slate-500">{subtitle}</p>
          </div>
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-4",
              TONE_CLASSES[tone]
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

