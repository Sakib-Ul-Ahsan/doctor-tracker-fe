"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { RegistrationTrendPoint } from "@/types/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Activity, Calendar } from "lucide-react";

interface RegistrationTrendChartProps {
  data: RegistrationTrendPoint[];
  days?: number;
  onDaysChange?: (days: number) => void;
}

export function RegistrationTrendChart({
  data,
  days = 14,
  onDaysChange,
}: RegistrationTrendChartProps) {
  const totalInPeriod = data.reduce((acc, curr) => acc + (curr.count || 0), 0);

  return (
    <Card className="col-span-1 lg:col-span-2 shadow-2xs border-slate-200/90 dark:border-slate-800 dark:bg-slate-900">
      <CardHeader className="flex flex-col gap-3 pb-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100/80 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
              Patient Registration Trends
            </CardTitle>
            <span className="rounded-full bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
              {days}-Day Velocity
            </span>
          </div>
          <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Continuous daily patient intake volume across all hospital departments
          </CardDescription>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          {onDaysChange && (
            <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-0.5 text-xs shadow-2xs">
              {[7, 14, 30].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => onDaysChange(d)}
                  className={`rounded-md px-2.5 py-1 font-semibold transition-all ${
                    days === d
                      ? "bg-blue-600 text-white shadow-2xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                  }`}
                >
                  {d}d
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-2xs">
            <Calendar className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            <span>Total in {days}d:</span>
            <span className="font-bold text-slate-900 dark:text-slate-100">{totalInPeriod}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4 pb-4">
        {data.length === 0 ? (
          <div className="flex h-[280px] flex-col items-center justify-center gap-2.5 text-center text-xs text-slate-400 dark:text-slate-500">
            <Activity className="h-8 w-8 text-slate-300 dark:text-slate-600" />
            <p>No intake data recorded in this period.</p>
          </div>
        ) : (
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="patientTrendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#cbd5e1"
                  strokeOpacity={0.3}
                />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={{ stroke: "#cbd5e1", strokeOpacity: 0.5 }}
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  interval="preserveStartEnd"
                  dy={6}
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={{ stroke: "#cbd5e1", strokeOpacity: 0.5 }}
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  dx={-4}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderRadius: "10px",
                    border: "none",
                    boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.25)",
                    color: "#ffffff",
                    fontSize: "12px",
                    padding: "8px 12px",
                  }}
                  itemStyle={{ color: "#93c5fd" }}
                  labelStyle={{ color: "#ffffff", fontWeight: 600, marginBottom: "4px" }}
                  formatter={(value) => [`${value ?? 0} patients`, "Daily Intake"]}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "#2563eb", stroke: "#ffffff", strokeWidth: 1.5 }}
                  activeDot={{ r: 6, fill: "#1d4ed8", stroke: "#ffffff", strokeWidth: 2 }}
                  fill="url(#patientTrendGradient)"
                  animationDuration={800}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
