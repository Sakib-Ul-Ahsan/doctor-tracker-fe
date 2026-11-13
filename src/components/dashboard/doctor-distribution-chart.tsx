"use client";

import { useRouter } from "next/navigation";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DoctorDistributionPoint } from "@/types/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Building2, ExternalLink, Stethoscope, Users } from "lucide-react";

interface DoctorDistributionChartProps {
  data: DoctorDistributionPoint[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: DoctorDistributionPoint & { shortName: string } }>;
}

function DoctorCaseloadTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0].payload;

  return (
    <div className="rounded-xl border border-slate-200/90 bg-white/95 p-3.5 shadow-xl shadow-slate-900/10 backdrop-blur-md min-w-[220px] dark:border-slate-800 dark:bg-slate-900/95 animate-in fade-in-0 zoom-in-95 duration-150">
      <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2 mb-2.5">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
          <Stethoscope className="h-3.5 w-3.5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-bold text-slate-900 dark:text-slate-100">{item.name}</p>
          <p className="truncate text-[10px] font-medium text-blue-600 dark:text-blue-400">{item.specialization}</p>
        </div>
      </div>

      <div className="space-y-1.5 text-[11px]">
        <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
          <span className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
            <Building2 className="h-3 w-3 shrink-0" />
            Hospital:
          </span>
          <span className="font-medium text-slate-800 dark:text-slate-200 max-w-[120px] truncate" title={item.hospital}>
            {item.hospital}
          </span>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
          <span className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300">
            <Users className="h-3 w-3 text-blue-600 dark:text-blue-400" />
            Active Caseload:
          </span>
          <span className="inline-flex items-center rounded-md bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 font-bold text-blue-700 dark:text-blue-300">
            {item.patientCount} patient{item.patientCount === 1 ? "" : "s"}
          </span>
        </div>

        <div className="pt-1.5 flex items-center justify-center text-[10px] text-blue-600 dark:text-blue-400 font-medium">
          <span>Click bar to view profile</span>
          <ExternalLink className="h-2.5 w-2.5 ml-1" />
        </div>
      </div>
    </div>
  );
}

export function DoctorDistributionChart({ data }: DoctorDistributionChartProps) {
  const router = useRouter();

  const chartData = data.map((item) => ({
    ...item,
    shortName: item.name.replace(/^Dr\.?\s+/i, ""),
  }));

  const totalAssignedPatients = chartData.reduce((acc, curr) => acc + (curr.patientCount || 0), 0);

  const handleBarClick = (entry: unknown) => {
    const item = entry as { doctorId?: string };
    if (item && item.doctorId) {
      router.push(`/doctors/${item.doctorId}`);
    }
  };

  return (
    <Card className="shadow-2xs border-slate-200/90 dark:border-slate-800 dark:bg-slate-900 overflow-hidden flex flex-col justify-between">
      <CardHeader className="pb-3 border-b border-slate-100/80 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
                Doctor-Wise Caseload Distribution
              </CardTitle>
              <span className="rounded-full bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
                Live
              </span>
            </div>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Assigned patient intake volume per active physician (click bar to view profile)
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-2xs">
              <Users className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              <span>{totalAssignedPatients} Assigned</span>
            </span>
            <span className="rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-400">
              {chartData.length} Doctors
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4 pb-4">
        {chartData.length === 0 ? (
          <div className="flex h-[290px] flex-col items-center justify-center gap-2.5 text-center text-xs text-slate-400 dark:text-slate-500">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400">
              <Users className="h-5 w-5" />
            </div>
            <p className="font-semibold text-slate-700 dark:text-slate-300">No Caseload Assigned</p>
            <p className="max-w-xs text-slate-400 dark:text-slate-500">
              Onboard physicians and assign registered patients to visualize caseload allocation.
            </p>
          </div>
        ) : (
          <div className="h-[290px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 8, right: 36, left: 12, bottom: 4 }}
                barCategoryGap="20%"
              >
                <defs>
                  <linearGradient id="caseloadBarGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#1d4ed8" />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  vertical={true}
                  stroke="#cbd5e1"
                  strokeOpacity={0.3}
                />

                <XAxis
                  type="number"
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={{ stroke: "#cbd5e1", strokeOpacity: 0.5 }}
                  tick={{ fill: "#64748b", fontSize: 11, fontWeight: 500 }}
                  dy={4}
                />

                <YAxis
                  type="category"
                  dataKey="shortName"
                  width={110}
                  tickLine={false}
                  axisLine={{ stroke: "#cbd5e1", strokeOpacity: 0.5 }}
                  tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }}
                  interval={0}
                />

                <Tooltip
                  content={<DoctorCaseloadTooltip />}
                  cursor={{ fill: "rgba(59, 130, 246, 0.08)" }}
                />

                <Bar
                  dataKey="patientCount"
                  fill="url(#caseloadBarGrad)"
                  radius={[0, 6, 6, 0]}
                  barSize={18}
                  className="cursor-pointer"
                  onClick={handleBarClick}
                  background={{ fill: "#f1f5f9", radius: 6 }}
                  animationDuration={800}
                  animationEasing="ease-out"
                >
                  <LabelList
                    dataKey="patientCount"
                    position="right"
                    fill="#64748b"
                    fontSize={11}
                    fontWeight={700}
                    offset={8}
                    formatter={(val) => (typeof val === "number" && val > 0 ? val : "")}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
