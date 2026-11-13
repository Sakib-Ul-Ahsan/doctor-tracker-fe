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
import { formatDate, getInitials } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { RegistrationTrendChart } from "@/components/dashboard/registration-trend-chart";
import { DoctorDistributionChart } from "@/components/dashboard/doctor-distribution-chart";
import { MonthlyStatsChart } from "@/components/dashboard/monthly-stats-chart";
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
  const [doctorModalOpen, setDoctorModalOpen] = useState(false);
  const [patientModalOpen, setPatientModalOpen] = useState(false);

  const { data, isLoading, isError, error, refetch } = useDashboardStats();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clinical Operations Dashboard"
        description="Real-time overview of physicians, patient caseloads, and registration analytics."
        actions={
          <>
            <Button variant="outline" onClick={() => setDoctorModalOpen(true)}>
              <Plus className="h-4 w-4" />
              Add Doctor
            </Button>
            <Button onClick={() => setPatientModalOpen(true)}>
              <UserPlus className="h-4 w-4" />
              Register Patient
            </Button>
          </>
        }
      />

      {isLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6 space-y-3">
                  <Skeleton className="h-3.5 w-24" />
                  <Skeleton className="h-8 w-16" />
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
              title="Total Doctors"
              value={data.summary.totalDoctors}
              subtitle="Registered active physicians"
              icon={Stethoscope}
              tone="teal"
            />
            <StatCard
              title="Total Patients"
              value={data.summary.totalPatients}
              subtitle="Patients currently tracked"
              icon={Users}
              tone="indigo"
            />
            <StatCard
              title="Avg. Patients / Doctor"
              value={data.summary.avgPatientsPerDoctor}
              subtitle="Mean caseload per physician"
              icon={TrendingUp}
              tone="emerald"
            />
            <StatCard
              title="Specializations"
              value={data.summary.specializationsCount}
              subtitle="Distinct medical departments"
              icon={Activity}
              tone="amber"
            />
          </div>

          {/* Analytics Charts */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <RegistrationTrendChart data={data.registrationTrends} />
            <DoctorDistributionChart data={data.doctorDistribution} />
            <MonthlyStatsChart data={data.monthlyStats} />
          </div>

          {/* Recently Added Activity */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle>Recently Added Doctors</CardTitle>
                  <CardDescription>Latest physicians onboarded to the directory</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/doctors">
                    View all
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {data.recentDoctors.length === 0 ? (
                  <p className="py-8 text-center text-xs text-slate-400">
                    No doctors registered yet.
                  </p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {data.recentDoctors.map((doc) => (
                      <Link
                        key={doc._id}
                        href={`/doctors/${doc._id}`}
                        className="flex items-center justify-between gap-3 py-3 transition-colors hover:bg-slate-50/80 -mx-2 px-2 rounded-lg"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-50 text-xs font-semibold text-teal-700 ring-1 ring-teal-200/70">
                            {getInitials(doc.name)}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-slate-900">
                              {doc.name}
                            </p>
                            <p className="flex items-center gap-1 truncate text-xs text-slate-500">
                              <Building2 className="h-3 w-3 shrink-0 text-slate-400" />
                              {doc.hospital}
                            </p>
                          </div>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1">
                          <Badge variant="default">{doc.specialization}</Badge>
                          <span className="text-[11px] text-slate-400">
                            {doc.patientCount ?? 0} patient(s)
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle>Recently Registered Patients</CardTitle>
                  <CardDescription>Newest patient records and assigned physicians</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/patients">
                    View all
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {data.recentPatients.length === 0 ? (
                  <p className="py-8 text-center text-xs text-slate-400">
                    No patients registered yet.
                  </p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {data.recentPatients.map((patient) => {
                      const doctorObj =
                        typeof patient.doctorId === "object" && patient.doctorId !== null
                          ? patient.doctorId
                          : null;

                      return (
                        <Link
                          key={patient._id}
                          href={`/patients/${patient._id}`}
                          className="flex items-center justify-between gap-3 py-3 transition-colors hover:bg-slate-50/80 -mx-2 px-2 rounded-lg"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-200/70">
                              {getInitials(patient.name)}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-slate-900">
                                {patient.name}
                              </p>
                              <p className="truncate text-xs text-slate-500">
                                {doctorObj ? doctorObj.name : "Unassigned"} &bull;{" "}
                                {formatDate(patient.createdAt)}
                              </p>
                            </div>
                          </div>
                          <div className="flex shrink-0 flex-col items-end gap-1">
                            <Badge variant="indigo">{patient.condition}</Badge>
                            <span className="text-[11px] text-slate-400">
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

