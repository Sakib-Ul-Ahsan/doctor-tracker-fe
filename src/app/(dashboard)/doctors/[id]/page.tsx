"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  Building2,
  Calendar,
  Clock,
  Eye,
  Mail,
  Pencil,
  Phone,
  Search,
  Trash2,
  UserMinus,
  UserPlus,
  Users,
} from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { useDoctor, useDoctorPatients } from "@/hooks/use-doctors";
import { ApiClientError } from "@/lib/api";
import { formatDate, formatDateTime, getConditionBadgeVariant, getInitials } from "@/lib/utils";
import { Patient } from "@/types/api";
import { PageHeader } from "@/components/layout/page-header";
import { DoctorFormDialog } from "@/components/doctors/doctor-form-dialog";
import { DeleteDoctorDialog } from "@/components/doctors/delete-doctor-dialog";
import { RemovePatientDialog } from "@/components/doctors/remove-patient-dialog";
import { PatientFormDialog } from "@/components/patients/patient-form-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { Pagination } from "@/components/shared/pagination";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function DoctorDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const doctorId = params.id;

  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(searchInput, 350);

  const [editDoctorOpen, setEditDoctorOpen] = useState(false);
  const [deleteDoctorOpen, setDeleteDoctorOpen] = useState(false);
  const [addPatientOpen, setAddPatientOpen] = useState(false);
  const [removingPatient, setRemovingPatient] = useState<Patient | null>(null);

  const doctorQuery = useDoctor(doctorId);
  const patientsQuery = useDoctorPatients(doctorId, {
    search: debouncedSearch || undefined,
    page,
    limit: 10,
  });

  if (doctorQuery.isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-56 rounded-xl" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
    );
  }

  if (doctorQuery.isError || !doctorQuery.data) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/doctors" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Physicians Directory
          </Link>
        </Button>
        <ErrorState
          title="Physician Record Not Found"
          message={
            doctorQuery.error instanceof ApiClientError
              ? doctorQuery.error.message
              : "Could not load the requested physician details."
          }
          onRetry={() => void doctorQuery.refetch()}
        />
      </div>
    );
  }

  const doctor = doctorQuery.data;

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb={
          <Link
            href="/doctors"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Physicians Directory
          </Link>
        }
        title={doctor.name}
        description={`${doctor.specialization} • ${doctor.hospital}`}
        actions={
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              onClick={() => setEditDoctorOpen(true)}
              className="gap-2"
            >
              <Pencil className="h-4 w-4" />
              Edit Profile
            </Button>
            <Button
              variant="destructive"
              onClick={() => setDeleteDoctorOpen(true)}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete Physician
            </Button>
          </div>
        }
      />

      {/* Executive Doctor Profile Card */}
      <Card className="shadow-2xs overflow-hidden border-slate-200/90">
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-900 px-6 py-6 text-white sm:px-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-xl font-bold text-white shadow-inner backdrop-blur-md ring-2 ring-white/20">
                {getInitials(doctor.name)}
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-bold tracking-tight text-white">{doctor.name}</h2>
                  <Badge variant="navy" className="border-white/30 text-white bg-white/20 backdrop-blur-xs">
                    {doctor.specialization}
                  </Badge>
                </div>
                <p className="flex items-center gap-1.5 text-sm text-slate-300">
                  <Building2 className="h-4 w-4 text-blue-400 shrink-0" />
                  {doctor.hospital}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
              <div className="rounded-xl bg-white/10 px-3.5 py-2 backdrop-blur-xs border border-white/10">
                <span className="block text-[10px] uppercase font-bold text-slate-400">Total Caseload</span>
                <span className="text-lg font-bold text-white">{doctor.patientCount ?? 0} Patients</span>
              </div>
              <div className="rounded-xl bg-white/10 px-3.5 py-2 backdrop-blur-xs border border-white/10">
                <span className="block text-[10px] uppercase font-bold text-slate-400">Status</span>
                <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Active Physician
                </span>
              </div>
            </div>
          </div>
        </div>

        <CardContent className="p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50/50 p-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Mail className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <span className="block text-[11px] font-medium text-slate-400">Email Address</span>
                <span className="truncate text-xs font-semibold text-slate-800" title={doctor.email}>
                  {doctor.email}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50/50 p-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Phone className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <span className="block text-[11px] font-medium text-slate-400">Phone Number</span>
                <span className="truncate text-xs font-semibold text-slate-800">
                  {doctor.phone}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50/50 p-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                <Calendar className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <span className="block text-[11px] font-medium text-slate-400">Onboarding Date</span>
                <span className="text-xs font-semibold text-slate-800">
                  {formatDate(doctor.createdAt)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50/50 p-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                <Clock className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <span className="block text-[11px] font-medium text-slate-400">Last Record Update</span>
                <span className="text-xs font-semibold text-slate-800">
                  {formatDateTime(doctor.updatedAt)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Associated Assigned Patients Section */}
      <Card className="overflow-hidden shadow-2xs border-slate-200/90">
        <CardHeader className="flex flex-col gap-4 border-b border-slate-100 sm:flex-row sm:items-center sm:justify-between bg-slate-50/40">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              Assigned Patients Directory
              <Badge variant="default" className="text-xs">
                {doctor.patientCount ?? 0} Active
              </Badge>
            </CardTitle>
            <p className="mt-1 text-xs text-slate-500">
              Patients currently undergoing clinical treatment under {doctor.name}.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setPage(1);
                }}
                placeholder="Search assigned patients..."
                className="pl-9 bg-white"
              />
            </div>
            <Button
              onClick={() => setAddPatientOpen(true)}
              className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-600/20"
            >
              <UserPlus className="h-4 w-4" />
              Assign Patient
            </Button>
          </div>
        </CardHeader>

        {patientsQuery.isLoading ? (
          <TableSkeleton rows={5} columns={5} />
        ) : patientsQuery.isError ? (
          <div className="p-6">
            <ErrorState
              message={
                patientsQuery.error instanceof ApiClientError
                  ? patientsQuery.error.message
                  : "Failed to load assigned patients."
              }
              onRetry={() => void patientsQuery.refetch()}
            />
          </div>
        ) : !patientsQuery.data || patientsQuery.data.patients.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={Users}
              title={searchInput ? "No matching patients found" : "No patients assigned yet"}
              description={
                searchInput
                  ? "Try adjusting your search keywords."
                  : `There are currently no patients assigned to ${doctor.name}. Add a patient to start tracking their care.`
              }
              action={
                <Button
                  onClick={() => setAddPatientOpen(true)}
                  className="gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  <UserPlus className="h-4 w-4" />
                  Assign New Patient
                </Button>
              }
            />
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[260px]">Patient</TableHead>
                  <TableHead>Demographics</TableHead>
                  <TableHead>Clinical Condition</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patientsQuery.data.patients.map((patient) => (
                  <TableRow key={patient._id} className="group">
                    <TableCell>
                      <Link
                        href={`/patients/${patient._id}`}
                        className="flex items-center gap-3 group-hover:opacity-90"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xs font-bold text-blue-700 border border-blue-200/60 group-hover:border-blue-400 transition-colors">
                          {getInitials(patient.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {patient.name}
                          </p>
                          <p className="truncate text-xs text-slate-400">
                            ID: {patient._id.slice(-6)}
                          </p>
                        </div>
                      </Link>
                    </TableCell>

                    <TableCell>
                      <span className="text-xs font-medium text-slate-700">
                        {patient.age} yrs &bull; {patient.gender}
                      </span>
                    </TableCell>

                    <TableCell>
                      <Badge variant={getConditionBadgeVariant(patient.condition)}>
                        {patient.condition}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-0.5 text-xs text-slate-600">
                        <p>{patient.phone}</p>
                        <p className="text-slate-400">{patient.email}</p>
                      </div>
                    </TableCell>

                    <TableCell className="text-xs text-slate-500 whitespace-nowrap">
                      {formatDate(patient.createdAt)}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          asChild
                          title="View patient record"
                          className="text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                        >
                          <Link href={`/patients/${patient._id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setRemovingPatient(patient)}
                          title="Remove / Reassign patient"
                          className="text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                        >
                          <UserMinus className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Pagination
              meta={patientsQuery.data.meta}
              onPageChange={setPage}
              isLoading={patientsQuery.isFetching}
            />
          </>
        )}
      </Card>

      <DoctorFormDialog
        open={editDoctorOpen}
        onOpenChange={setEditDoctorOpen}
        doctor={doctor}
      />

      <DeleteDoctorDialog
        open={deleteDoctorOpen}
        onOpenChange={setDeleteDoctorOpen}
        doctor={doctor}
        onDeleted={() => router.push("/doctors")}
      />

      <PatientFormDialog
        open={addPatientOpen}
        onOpenChange={setAddPatientOpen}
        defaultDoctorId={doctor._id}
        lockDoctor={true}
      />

      <RemovePatientDialog
        open={Boolean(removingPatient)}
        onOpenChange={(open) => {
          if (!open) setRemovingPatient(null);
        }}
        patient={removingPatient}
        currentDoctorId={doctor._id}
      />
    </div>
  );
}
