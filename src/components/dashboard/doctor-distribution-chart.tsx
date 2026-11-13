"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
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

interface DoctorDistributionChartProps {
  data: DoctorDistributionPoint[];
}

export function DoctorDistributionChart({ data }: DoctorDistributionChartProps) {
  const chartData = data.map((item) => ({
    ...item,
    shortName: item.name.replace(/^Dr\.?\s+/i, ""),
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Doctor-Wise Patient Distribution</CardTitle>
        <CardDescription>
          Assigned patient caseload across active physicians
        </CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex h-[280px] items-center justify-center text-xs text-slate-400">
            Add doctors and assign patients to visualize caseload distribution.
          </div>
        ) : (
          <div className="h-[280px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 4, right: 16, left: 10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis
                  type="number"
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#64748b", fontSize: 11 }}
                />
                <YAxis
                  type="category"
                  dataKey="shortName"
                  width={95}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#334155", fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderRadius: "10px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 10px 15px -3px rgba(15, 23, 42, 0.08)",
                    fontSize: "12px",
                  }}
                  formatter={(value) => [`${value ?? 0} patient(s)`, "Assigned"]}
                />
                <Bar
                  dataKey="patientCount"
                  fill="#0d9488"
                  radius={[0, 6, 6, 0]}
                  barSize={18}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

