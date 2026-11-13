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
import { formatDate, formatDateTime, getInitials } from "@/lib/utils";
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
        <Skeleton className="h-44 rounded-xl" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
    );
  }

  if (doctorQuery.isError || !doctorQuery.data) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/doctors">
            <ArrowLeft className="h-4 w-4" />
            Back to Doctors
          </Link>
        </Button>
        <ErrorState
          title="Doctor not found"
          message={
            doctorQuery.error instanceof ApiClientError
              ? doctorQuery.error.message
              : "Could not load physician details."
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
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-teal-700 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Doctors Directory
          </Link>
        }
        title={doctor.name}
        description={`${doctor.specialization} • ${doctor.hospital}`}
        actions={
          <>
            <Button variant="outline" onClick={() => setEditDoctorOpen(true)}>
              <Pencil className="h-4 w-4" />
              Edit Profile
            </Button>
            <Button
              variant="destructive"
              onClick={() => setDeleteDoctorOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
              Delete Doctor
            </Button>
          </>
        }
      />

      {/* Doctor Profile Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-teal-600 text-lg font-bold text-white shadow-sm shadow-teal-600/20">
                {getInitials(doctor.name)}
              </div>
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold text-slate-900">{doctor.name}</h2>
                  <Badge variant="default">{doctor.specialization}</Badge>
                </div>
                <p className="flex items-center gap-1.5 text-sm text-slate-600">
                  <Building2 className="h-4 w-4 text-slate-400" />
                  {doctor.hospital}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2 md:gap-x-8">
              <div className="flex items-center gap-2 text-slate-600">
                <Mail className="h-4 w-4 text-slate-400" />
                <span>{doctor.email}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Phone className="h-4 w-4 text-slate-400" />
                <span>{doctor.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <Calendar className="h-4 w-4 text-slate-400" />
                <span>Joined {formatDate(doctor.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <Clock className="h-4 w-4 text-slate-400" />
                <span>Updated {formatDateTime(doctor.updatedAt)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assigned Patients Section */}
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-col gap-4 border-b border-slate-100 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Assigned Patients
              <Badge variant="secondary">{doctor.patientCount ?? 0}</Badge>
            </CardTitle>
            <p className="mt-1 text-xs text-slate-500">
              Patients currently under the care of {doctor.name}.
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
                className="pl-9"
              />
            </div>
            <Button onClick={() => setAddPatientOpen(true)}>
              <UserPlus className="h-4 w-4" />
              Add Patient
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
          <div className="p-6">
            <EmptyState
              icon={Users}
              title={searchInput ? "No matching patients" : "No patients assigned yet"}
              description={
                searchInput
                  ? "No assigned patients matched your search query."
                  : `Register a new patient directly under ${doctor.name} to start tracking their care.`
              }
              action={
                searchInput ? (
                  <Button variant="outline" onClick={() => setSearchInput("")}>
                    Clear Search
                  </Button>
                ) : (
                  <Button onClick={() => setAddPatientOpen(true)}>
                    <UserPlus className="h-4 w-4" />
                    Add Patient to Doctor
                  </Button>
                )
              }
            />
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Demographics</TableHead>
                  <TableHead>Condition</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patientsQuery.data.patients.map((patient) => (
                  <TableRow key={patient._id}>
                    <TableCell>
                      <Link
                        href={`/patients/${patient._id}`}
                        className="font-medium text-slate-900 hover:text-teal-700 transition-colors"
                      >
                        {patient.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">
                      {patient.age} yrs &bull; {patient.gender}
                    </TableCell>
                    <TableCell>
                      <Badge variant="indigo">{patient.condition}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">
                      <div>{patient.email}</div>
                      <div className="text-slate-400">{patient.phone}</div>
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {formatDate(patient.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" asChild title="View patient">
                          <Link href={`/patients/${patient._id}`}>
                            <Eye className="h-4 w-4 text-slate-500" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setRemovingPatient(patient)}
                          className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                        >
                          <UserMinus className="h-4 w-4" />
                          Remove
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
        onDeleted={() => router.replace("/doctors")}
      />

      <PatientFormDialog
        open={addPatientOpen}
        onOpenChange={setAddPatientOpen}
        defaultDoctorId={doctor._id}
        lockDoctor
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

