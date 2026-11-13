import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-blue-200/80 bg-blue-50 text-blue-700",
        navy: "border-slate-800 bg-slate-900 text-white",
        secondary: "border-slate-200 bg-slate-100 text-slate-700",
        destructive: "border-rose-200 bg-rose-50 text-rose-700",
        outline: "border-slate-200 text-slate-700 bg-white",
        indigo: "border-indigo-200 bg-indigo-50 text-indigo-700",
        amber: "border-amber-200 bg-amber-50 text-amber-700",
        emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
        purple: "border-purple-200 bg-purple-50 text-purple-700",
        sky: "border-sky-200 bg-sky-50 text-sky-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
