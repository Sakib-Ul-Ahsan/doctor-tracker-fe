"use client";

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

interface MonthlyStatsChartProps {
  data: MonthlyStatPoint[];
}

export function MonthlyStatsChart({ data }: MonthlyStatsChartProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Monthly Patient &amp; Doctor Statistics</CardTitle>
        <CardDescription>
          6-month comparison of newly registered patients and onboarded doctors
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#64748b", fontSize: 11 }}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#64748b", fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 10px 15px -3px rgba(15, 23, 42, 0.08)",
                  fontSize: "12px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
              <Bar
                dataKey="patients"
                name="Patients"
                fill="#0d9488"
                radius={[6, 6, 0, 0]}
                barSize={20}
              />
              <Bar
                dataKey="doctors"
                name="Doctors"
                fill="#6366f1"
                radius={[6, 6, 0, 0]}
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

