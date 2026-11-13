"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Eye,
  Mail,
  Pencil,
  Phone,
  RotateCcw,
  Search,
  Stethoscope,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { useDoctorOptions } from "@/hooks/use-doctors";
import { usePatients } from "@/hooks/use-patients";
import { ApiClientError } from "@/lib/api";
import { formatDate, getInitials } from "@/lib/utils";
import { Patient } from "@/types/api";
import { PageHeader } from "@/components/layout/page-header";
import { PatientFormDialog } from "@/components/patients/patient-form-dialog";
import { DeletePatientDialog } from "@/components/patients/delete-patient-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { Pagination } from "@/components/shared/pagination";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function PatientsPage() {
  const [searchInput, setSearchInput] = useState("");
  const [condition, setCondition] = useState("all");
  const [doctorId, setDoctorId] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [deletingPatient, setDeletingPatient] = useState<Patient | null>(null);

  const debouncedSearch = useDebounce(searchInput, 350);

  const { data: doctorOptions } = useDoctorOptions();
  const { data, isLoading, isFetching, isError, error, refetch } = usePatients({
    search: debouncedSearch || undefined,
    condition: condition === "all" ? undefined : condition,
    doctorId: doctorId === "all" ? undefined : doctorId,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    page,
    limit: 10,
  });

  const hasActiveFilters =
    Boolean(searchInput) ||
    condition !== "all" ||
    doctorId !== "all" ||
    Boolean(startDate) ||
    Boolean(endDate);

  const resetFilters = () => {
    setSearchInput("");
    setCondition("all");
    setDoctorId("all");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  const openCreate = () => {
    setEditingPatient(null);
    setFormOpen(true);
  };

  const openEdit = (patient: Patient) => {
    setEditingPatient(patient);
    setFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Patients Registry"
        description="Track registered patients, medical conditions, and attending physician assignments."
        actions={
          <Button onClick={openCreate}>
            <UserPlus className="h-4 w-4" />
            Register Patient
          </Button>
        }
      />

      {/* Search & Filter Toolbar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-12 md:items-end">
          <div className="md:col-span-3 space-y-1">
            <label className="text-xs font-medium text-slate-600">
              Search Patients
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setPage(1);
                }}
                placeholder="Name, email, phone, condition..."
                className="pl-9"
              />
            </div>
          </div>

          <div className="md:col-span-2 space-y-1">
            <label className="text-xs font-medium text-slate-600">
              Medical Condition
            </label>
            <Select
              value={condition}
              onValueChange={(value) => {
                setCondition(value);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Conditions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Conditions</SelectItem>
                {(data?.conditions ?? []).map((cond) => (
                  <SelectItem key={cond} value={cond}>
                    {cond}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2 space-y-1">
            <label className="text-xs font-medium text-slate-600">
              Assigned Doctor
            </label>
            <Select
              value={doctorId}
              onValueChange={(value) => {
                setDoctorId(value);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Doctors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Doctors</SelectItem>
                {(doctorOptions ?? []).map((doc) => (
                  <SelectItem key={doc._id} value={doc._id}>
                    {doc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2 space-y-1">
            <label className="text-xs font-medium text-slate-600">
              Registered From
            </label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="md:col-span-2 space-y-1">
            <label className="text-xs font-medium text-slate-600">
              Registered To
            </label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="md:col-span-1 flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={resetFilters}
              disabled={!hasActiveFilters}
              title="Reset filters"
              aria-label="Reset filters"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Patients Table Card */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={6} columns={6} />
        ) : isError ? (
          <div className="p-6">
            <ErrorState
              message={
                error instanceof ApiClientError
                  ? error.message
                  : "Failed to load patient records."
              }
              onRetry={() => void refetch()}
            />
          </div>
        ) : !data || data.patients.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={Users}
              title={hasActiveFilters ? "No matching patients found" : "No patients registered yet"}
              description={
                hasActiveFilters
                  ? "Try clearing or adjusting your search query, condition, doctor, or date filters."
                  : "Register your first patient and assign them to an attending physician."
              }
              action={
                hasActiveFilters ? (
                  <Button variant="outline" onClick={resetFilters}>
                    Clear Filters
                  </Button>
                ) : (
                  <Button onClick={openCreate}>
                    <UserPlus className="h-4 w-4" />
                    Register Patient
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
                  <TableHead>Age &amp; Gender</TableHead>
                  <TableHead>Medical Condition</TableHead>
                  <TableHead>Assigned Doctor</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.patients.map((patient) => {
                  const doctorObj =
                    typeof patient.doctorId === "object" && patient.doctorId !== null
                      ? patient.doctorId
                      : null;

                  return (
                    <TableRow key={patient._id}>
                      <TableCell>
                        <Link
                          href={`/patients/${patient._id}`}
                          className="group flex items-center gap-3"
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-200/80">
                            {getInitials(patient.name)}
                          </div>
                          <span className="font-medium text-slate-900 group-hover:text-teal-700 transition-colors">
                            {patient.name}
                          </span>
                        </Link>
                      </TableCell>
                      <TableCell className="text-xs text-slate-600 whitespace-nowrap">
                        {patient.age} yrs &bull; {patient.gender}
                      </TableCell>
                      <TableCell>
                        <Badge variant="indigo">{patient.condition}</Badge>
                      </TableCell>
                      <TableCell>
                        {doctorObj ? (
                          <Link
                            href={`/doctors/${doctorObj._id}`}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-700 hover:underline"
                          >
                            <Stethoscope className="h-3.5 w-3.5 shrink-0" />
                            {doctorObj.name}
                          </Link>
                        ) : (
                          <span className="text-xs text-slate-400">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-0.5 text-xs">
                          <p className="flex items-center gap-1.5 text-slate-700">
                            <Mail className="h-3 w-3 text-slate-400" />
                            {patient.email}
                          </p>
                          <p className="flex items-center gap-1.5 text-slate-500">
                            <Phone className="h-3 w-3 text-slate-400" />
                            {patient.phone}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-slate-500 whitespace-nowrap">
                        {formatDate(patient.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            title="View patient details"
                          >
                            <Link href={`/patients/${patient._id}`}>
                              <Eye className="h-4 w-4 text-slate-500" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(patient)}
                            title="Edit patient"
                          >
                            <Pencil className="h-4 w-4 text-slate-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeletingPatient(patient)}
                            title="Delete patient"
                            className="hover:bg-rose-50 hover:text-rose-600"
                          >
                            <Trash2 className="h-4 w-4 text-slate-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            <Pagination
              meta={data.meta}
              onPageChange={setPage}
              isLoading={isFetching}
            />
          </>
        )}
      </Card>

      <PatientFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        patient={editingPatient}
      />

      <DeletePatientDialog
        open={Boolean(deletingPatient)}
        onOpenChange={(open) => {
          if (!open) setDeletingPatient(null);
        }}
        patient={deletingPatient}
      />
    </div>
  );
}

