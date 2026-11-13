"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { MonthlyStatPoint } from "@/types/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BarChart3, Calendar, Stethoscope, Users } from "lucide-react";

interface MonthlyStatsChartProps {
  data: MonthlyStatPoint[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; fill: string; color?: string }>;
  label?: string;
}

function MonthlyStatsTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  const patientsVal = payload.find((p) => p.name === "Patients")?.value ?? 0;
  const doctorsVal = payload.find((p) => p.name === "Doctors")?.value ?? 0;
  const total = patientsVal + doctorsVal;

  return (
    <div className="rounded-xl border border-slate-200/90 bg-white/95 p-3.5 shadow-xl shadow-slate-900/10 backdrop-blur-md min-w-[200px] dark:border-slate-800 dark:bg-slate-900/95 animate-in fade-in-0 zoom-in-95 duration-150">
      <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2 mb-2.5">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
          <Calendar className="h-3.5 w-3.5" />
        </div>
        <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{label}</p>
      </div>

      <div className="space-y-2 text-[11px]">
        {payload.some((p) => p.name === "Patients") && (
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-medium">
              <span className="h-2 w-2 rounded-full bg-blue-600" />
              Registered Patients:
            </span>
            <span className="font-bold text-blue-700 bg-blue-50 dark:bg-blue-950/50 dark:text-blue-300 px-2 py-0.5 rounded-md">
              {patientsVal}
            </span>
          </div>
        )}

        {payload.some((p) => p.name === "Doctors") && (
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-medium">
              <span className="h-2 w-2 rounded-full bg-slate-800 dark:bg-slate-300" />
              Onboarded Doctors:
            </span>
            <span className="font-bold text-slate-800 bg-slate-100 dark:bg-slate-800 dark:text-slate-200 px-2 py-0.5 rounded-md">
              {doctorsVal}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
          <span>Total Monthly Intake:</span>
          <span className="text-slate-900 dark:text-slate-100 font-bold">{total} total</span>
        </div>
      </div>
    </div>
  );
}

export function MonthlyStatsChart({ data }: MonthlyStatsChartProps) {
  const [showPatients, setShowPatients] = useState(true);
  const [showDoctors, setShowDoctors] = useState(true);

  const totalPatients = data.reduce((acc, curr) => acc + (curr.patients || 0), 0);
  const totalDoctors = data.reduce((acc, curr) => acc + (curr.doctors || 0), 0);

  const togglePatients = () => {
    // Prevent hiding both
    if (showPatients && !showDoctors) return;
    setShowPatients((prev) => !prev);
  };

  const toggleDoctors = () => {
    // Prevent hiding both
    if (showDoctors && !showPatients) return;
    setShowDoctors((prev) => !prev);
  };

  return (
    <Card className="shadow-2xs border-slate-200/90 dark:border-slate-800 dark:bg-slate-900 overflow-hidden flex flex-col justify-between">
      <CardHeader className="pb-3 border-b border-slate-100/80 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
                Monthly Patient &amp; Doctor Intake
              </CardTitle>
              <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                6-Month Trend
              </span>
            </div>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Comparative intake (click pill/legend to filter series)
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={togglePatients}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold shadow-2xs transition-all ${
                showPatients
                  ? "border-blue-200/60 bg-blue-50/60 text-blue-700 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-300"
                  : "border-slate-200 bg-slate-50 text-slate-400 line-through opacity-60 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-600"
              }`}
            >
              <Users className="h-3 w-3" />
              <span>{totalPatients} Patients</span>
            </button>
            <button
              type="button"
              onClick={toggleDoctors}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold shadow-2xs transition-all ${
                showDoctors
                  ? "border-slate-200 bg-slate-100 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  : "border-slate-200 bg-slate-50 text-slate-400 line-through opacity-60 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-600"
              }`}
            >
              <Stethoscope className="h-3 w-3" />
              <span>{totalDoctors} Doctors</span>
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4 pb-4">
        {data.length === 0 ? (
          <div className="flex h-[290px] flex-col items-center justify-center gap-2.5 text-center text-xs text-slate-400 dark:text-slate-500">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400">
              <BarChart3 className="h-5 w-5" />
            </div>
            <p className="font-semibold text-slate-700 dark:text-slate-300">No Historical Data Recorded</p>
            <p className="max-w-xs text-slate-400 dark:text-slate-500">
              Intake volume for the past 6 months will appear as records are registered.
            </p>
          </div>
        ) : (
          <div className="h-[290px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 12, right: 12, left: -22, bottom: 4 }}
                barCategoryGap="25%"
                barGap={4}
              >
                <defs>
                  <linearGradient id="patientMonthlyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#1d4ed8" />
                  </linearGradient>
                  <linearGradient id="doctorMonthlyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#475569" />
                    <stop offset="100%" stopColor="#0f172a" />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  horizontal={true}
                  stroke="#cbd5e1"
                  strokeOpacity={0.3}
                />

                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={{ stroke: "#cbd5e1", strokeOpacity: 0.5 }}
                  tick={{ fill: "#64748b", fontSize: 11, fontWeight: 500 }}
                  dy={6}
                />

                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={{ stroke: "#cbd5e1", strokeOpacity: 0.5 }}
                  tick={{ fill: "#64748b", fontSize: 11, fontWeight: 500 }}
                  dx={-4}
                />

                <Tooltip
                  content={<MonthlyStatsTooltip />}
                  cursor={{ fill: "rgba(59, 130, 246, 0.08)" }}
                />

                <Legend
                  verticalAlign="top"
                  align="right"
                  wrapperStyle={{ paddingBottom: "12px", fontSize: "11px", fontWeight: 600, cursor: "pointer" }}
                  onClick={(e) => {
                    if (e && e.dataKey === "patients") togglePatients();
                    if (e && e.dataKey === "doctors") toggleDoctors();
                  }}
                  formatter={(value) => (
                    <span className="text-slate-700 dark:text-slate-300 ml-1 select-none">
                      {value}
                    </span>
                  )}
                  iconType="circle"
                  iconSize={7}
                />

                {showPatients && (
                  <Bar
                    dataKey="patients"
                    name="Patients"
                    fill="url(#patientMonthlyGrad)"
                    radius={[5, 5, 1, 1]}
                    barSize={18}
                    animationDuration={800}
                    animationEasing="ease-out"
                  />
                )}

                {showDoctors && (
                  <Bar
                    dataKey="doctors"
                    name="Doctors"
                    fill="url(#doctorMonthlyGrad)"
                    radius={[5, 5, 1, 1]}
                    barSize={18}
                    animationDuration={800}
                    animationEasing="ease-out"
                  />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
