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
}

export function RegistrationTrendChart({ data }: RegistrationTrendChartProps) {
  const totalInPeriod = data.reduce((acc, curr) => acc + (curr.count || 0), 0);

  return (
    <Card className="col-span-1 lg:col-span-2 shadow-2xs">
      <CardHeader className="flex flex-col gap-2 pb-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle>Patient Registration Trends</CardTitle>
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
              14-Day Velocity
            </span>
          </div>
          <CardDescription className="mt-1">
            Continuous daily patient intake volume across all hospital departments
          </CardDescription>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-1.5 border border-slate-100 text-xs font-medium text-slate-700">
          <Calendar className="h-3.5 w-3.5 text-blue-600" />
          <span>Total registered in 14 days: </span>
          <span className="font-bold text-slate-900">{totalInPeriod}</span>
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-[280px] flex-col items-center justify-center gap-2 text-center text-xs text-slate-400">
            <Activity className="h-8 w-8 text-slate-300" />
            <p>No intake data recorded in this period.</p>
          </div>
        ) : (
          <div className="h-[280px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="patientTrendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  interval="preserveStartEnd"
                  dy={6}
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
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
                  activeDot={{ r: 6, fill: "#1e40af", stroke: "#ffffff", strokeWidth: 2 }}
                  fillOpacity={1}
                  fill="url(#patientTrendGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
