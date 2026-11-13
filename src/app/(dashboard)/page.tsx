"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Activity,
  ArrowRight,
  Building2,
  Plus,
  Stethoscope,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import { useDashboardStats } from "@/hooks/use-dashboard";
import { ApiClientError } from "@/lib/api";
import { formatDate, getConditionBadgeVariant, getInitials } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { RegistrationTrendChart } from "@/components/dashboard/registration-trend-chart";
import { DoctorDistributionChart } from "@/components/dashboard/doctor-distribution-chart";
import { MonthlyStatsChart } from "@/components/dashboard/monthly-stats-chart";
import { ActivityTimeline } from "@/components/dashboard/activity-timeline";
import { DoctorFormDialog } from "@/components/doctors/doctor-form-dialog";
import { PatientFormDialog } from "@/components/patients/patient-form-dialog";
import { ErrorState } from "@/components/shared/error-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const [days, setDays] = useState(14);
  const [doctorModalOpen, setDoctorModalOpen] = useState(false);
  const [patientModalOpen, setPatientModalOpen] = useState(false);

  const { data, isLoading, isError, error, refetch } = useDashboardStats({ days });

  // Current formatted date for greeting
  const todayFormatted = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clinical Operations Dashboard"
        description={`Real-time administrative console • ${todayFormatted}`}
        actions={
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              onClick={() => setDoctorModalOpen(true)}
              className="gap-2 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200"
            >
              <Plus className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              Add Physician
            </Button>
            <Button
              onClick={() => setPatientModalOpen(true)}
              className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-600/20 text-white"
            >
              <UserPlus className="h-4 w-4" />
              Register Patient
            </Button>
          </div>
        }
      />

      {isLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="dark:border-slate-800 dark:bg-slate-900">
                <CardContent className="p-6 space-y-3">
                  <Skeleton className="h-3.5 w-24" />
                  <Skeleton className="h-9 w-20" />
                  <Skeleton className="h-3 w-36" />
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Skeleton className="h-[360px] rounded-xl lg:col-span-2" />
            <Skeleton className="h-[360px] rounded-xl" />
            <Skeleton className="h-[360px] rounded-xl" />
          </div>
        </div>
      ) : isError ? (
        <ErrorState
          message={
            error instanceof ApiClientError
              ? error.message
              : "Failed to load dashboard statistics."
          }
          onRetry={() => void refetch()}
        />
      ) : data ? (
        <>
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total Physicians"
              value={data.summary.totalDoctors}
              subtitle="Registered active medical doctors"
              icon={Stethoscope}
              tone="slate"
              trendText="Active"
            />
            <StatCard
              title="Registered Patients"
              value={data.summary.totalPatients}
              subtitle="Active tracked patient profiles"
              icon={Users}
              tone="blue"
              trendText="Tracked"
            />
            <StatCard
              title="Average Caseload"
              value={data.summary.avgPatientsPerDoctor}
              subtitle="Mean patients assigned per doctor"
              icon={TrendingUp}
              tone="emerald"
              trendText="Optimal"
            />
            <StatCard
              title="Specializations"
              value={data.summary.specializationsCount}
              subtitle="Represented medical specialties"
              icon={Activity}
              tone="amber"
              trendText="Covered"
            />
          </div>

          {/* Analytics Visualizations */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <RegistrationTrendChart
              data={data.registrationTrends}
              days={days}
              onDaysChange={setDays}
            />
            <DoctorDistributionChart data={data.doctorDistribution} />
            <MonthlyStatsChart data={data.monthlyStats} />
          </div>

          {/* Activity Timeline (Administrative Audit Log) */}
          <ActivityTimeline activities={data.activities} />

          {/* Real Backend Recent Activity Feeds */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Recently Added Doctors */}
            <Card className="shadow-2xs border-slate-200/90 dark:border-slate-800 dark:bg-slate-900">
              <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <CardTitle className="text-base text-slate-900 dark:text-slate-100">
                    Recently Added Physicians
                  </CardTitle>
                  <CardDescription className="text-slate-500 dark:text-slate-400">
                    Latest medical staff onboarded to the platform
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="gap-1.5 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <Link href="/doctors">
                    View all
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="pt-3">
                {data.recentDoctors.length === 0 ? (
                  <div className="py-10 text-center text-xs text-slate-400 dark:text-slate-500">
                    No doctors onboarded yet.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {data.recentDoctors.map((doc) => (
                      <Link
                        key={doc._id}
                        href={`/doctors/${doc._id}`}
                        className="group flex items-center justify-between gap-3 py-3 transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/60 -mx-2 px-2 rounded-lg"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-xs font-bold text-white shadow-2xs group-hover:bg-blue-600 transition-colors dark:bg-slate-800 dark:group-hover:bg-blue-500">
                            {getInitials(doc.name)}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {doc.name}
                            </p>
                            <p className="flex items-center gap-1.5 truncate text-xs text-slate-500 dark:text-slate-400">
                              <Building2 className="h-3 w-3 shrink-0 text-slate-400" />
                              {doc.hospital}
                            </p>
                          </div>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1">
                          <Badge variant="default">{doc.specialization}</Badge>
                          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                            {doc.patientCount ?? 0} patient(s)
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recently Registered Patients */}
            <Card className="shadow-2xs border-slate-200/90 dark:border-slate-800 dark:bg-slate-900">
              <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <CardTitle className="text-base text-slate-900 dark:text-slate-100">
                    Recently Registered Patients
                  </CardTitle>
                  <CardDescription className="text-slate-500 dark:text-slate-400">
                    New clinical intake records and doctor assignments
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="gap-1.5 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <Link href="/patients">
                    View all
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="pt-3">
                {data.recentPatients.length === 0 ? (
                  <div className="py-10 text-center text-xs text-slate-400 dark:text-slate-500">
                    No patients registered yet.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {data.recentPatients.map((patient) => {
                      const doctorObj =
                        typeof patient.doctorId === "object" && patient.doctorId !== null
                          ? patient.doctorId
                          : null;

                      return (
                        <Link
                          key={patient._id}
                          href={`/patients/${patient._id}`}
                          className="group flex items-center justify-between gap-3 py-3 transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/60 -mx-2 px-2 rounded-lg"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xs font-bold text-blue-700 border border-blue-200/60 group-hover:border-blue-400 transition-colors dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800">
                              {getInitials(patient.name)}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {patient.name}
                              </p>
                              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                                {doctorObj ? `Attending: ${doctorObj.name}` : "Unassigned"} &bull;{" "}
                                {formatDate(patient.createdAt)}
                              </p>
                            </div>
                          </div>
                          <div className="flex shrink-0 flex-col items-end gap-1">
                            <Badge variant={getConditionBadgeVariant(patient.condition)}>
                              {patient.condition}
                            </Badge>
                            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                              {patient.age} yrs, {patient.gender}
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}

      <DoctorFormDialog open={doctorModalOpen} onOpenChange={setDoctorModalOpen} />
      <PatientFormDialog open={patientModalOpen} onOpenChange={setPatientModalOpen} />
    </div>
  );
}
