"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Eye,
  FilterX,
  Mail,
  Pencil,
  Phone,
  RotateCcw,
  Search,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { useDoctorOptions } from "@/hooks/use-doctors";
import { usePatients } from "@/hooks/use-patients";
import { ApiClientError } from "@/lib/api";
import { formatDate, getConditionBadgeVariant, getInitials } from "@/lib/utils";
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

  const activeFiltersCount = [
    Boolean(searchInput),
    condition !== "all",
    doctorId !== "all",
    Boolean(startDate),
    Boolean(endDate),
  ].filter(Boolean).length;

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
        description="Comprehensive clinical patient database, medical conditions, attending physician assignments, and demographic intake."
        actions={
          <Button onClick={openCreate} className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-600/20">
            <UserPlus className="h-4 w-4" />
            Register Patient
          </Button>
        }
      />

      {/* Advanced Filter Toolbar */}
      <Card className="p-4 sm:p-5 shadow-2xs border-slate-200/90">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-12 md:items-end">
          {/* Search Query */}
          <div className="md:col-span-3 space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
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
                placeholder="Name, email, condition..."
                className="pl-9 pr-8 bg-white"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput("");
                    setPage(1);
                  }}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Condition Filter */}
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Medical Condition
            </label>
            <Select
              value={condition}
              onValueChange={(value) => {
                setCondition(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-9 bg-white">
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

          {/* Assigned Doctor Filter */}
          <div className="md:col-span-3 space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Attending Physician
            </label>
            <Select
              value={doctorId}
              onValueChange={(value) => {
                setDoctorId(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-9 bg-white">
                <SelectValue placeholder="All Physicians" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Physicians</SelectItem>
                {(doctorOptions ?? []).map((doc) => (
                  <SelectItem key={doc._id} value={doc._id}>
                    {doc.name} ({doc.specialization})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Filter Range */}
          <div className="md:col-span-3 grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">From</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(1);
                }}
                className="h-9 bg-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">To</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(1);
                }}
                className="h-9 bg-white"
              />
            </div>
          </div>

          {/* Reset Filters Button */}
          <div className="md:col-span-1 flex items-end">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={resetFilters}
              disabled={activeFiltersCount === 0}
              title={activeFiltersCount > 0 ? `Reset ${activeFiltersCount} filter(s)` : "No active filters"}
              className="w-full h-9 gap-1.5 text-slate-600 hover:text-slate-900 relative"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Patients Table Card */}
      <Card className="overflow-hidden shadow-2xs border-slate-200/90">
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
              title={activeFiltersCount > 0 ? "No matching patients found" : "No patients registered yet"}
              description={
                activeFiltersCount > 0
                  ? "Try clearing or adjusting your search keywords, doctor, or condition filters."
                  : "Start populating the clinic records by registering your first patient."
              }
              action={
                activeFiltersCount > 0 ? (
                  <Button variant="outline" onClick={resetFilters} className="gap-2">
                    <FilterX className="h-4 w-4" />
                    Clear Filters
                  </Button>
                ) : (
                  <Button onClick={openCreate} className="gap-2 bg-blue-600 hover:bg-blue-700">
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
                  <TableHead className="w-[260px]">Patient Record</TableHead>
                  <TableHead>Demographics</TableHead>
                  <TableHead>Medical Condition</TableHead>
                  <TableHead>Attending Physician</TableHead>
                  <TableHead>Contact Information</TableHead>
                  <TableHead>Intake Date</TableHead>
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
                    <TableRow key={patient._id} className="group">
                      {/* Patient Name & Initials */}
                      <TableCell>
                        <Link
                          href={`/patients/${patient._id}`}
                          className="flex items-center gap-3 group-hover:opacity-90"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xs font-bold text-blue-700 border border-blue-200/60 group-hover:border-blue-400 transition-colors">
                            {getInitials(patient.name)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                              {patient.name}
                            </p>
                            <p className="truncate text-xs text-slate-400">
                              MRN-{patient._id.slice(-6).toUpperCase()}
                            </p>
                          </div>
                        </Link>
                      </TableCell>

                      {/* Demographics */}
                      <TableCell>
                        <span className="text-xs font-medium text-slate-700">
                          {patient.age} yrs &bull; {patient.gender}
                        </span>
                      </TableCell>

                      {/* Medical Condition Badge */}
                      <TableCell>
                        <Badge variant={getConditionBadgeVariant(patient.condition)}>
                          {patient.condition}
                        </Badge>
                      </TableCell>

                      {/* Attending Physician */}
                      <TableCell>
                        {doctorObj ? (
                          <Link
                            href={`/doctors/${doctorObj._id}`}
                            className="inline-flex items-center gap-2 group/doc hover:text-blue-600 transition-colors"
                          >
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-[10px] font-bold text-slate-700 group-hover/doc:bg-blue-100 group-hover/doc:text-blue-700">
                              {getInitials(doctorObj.name)}
                            </div>
                            <div className="text-xs">
                              <p className="font-medium text-slate-900 group-hover/doc:text-blue-600">
                                {doctorObj.name}
                              </p>
                              <p className="text-[11px] text-slate-400">
                                {doctorObj.specialization}
                              </p>
                            </div>
                          </Link>
                        ) : (
                          <span className="text-xs text-slate-400 italic">
                            Unassigned
                          </span>
                        )}
                      </TableCell>

                      {/* Contact */}
                      <TableCell>
                        <div className="space-y-0.5 text-xs text-slate-600">
                          <p className="flex items-center gap-1.5">
                            <Phone className="h-3 w-3 text-slate-400 shrink-0" />
                            <span>{patient.phone}</span>
                          </p>
                          <p className="flex items-center gap-1.5 text-slate-400">
                            <Mail className="h-3 w-3 text-slate-400 shrink-0" />
                            <span className="truncate max-w-[160px]">{patient.email}</span>
                          </p>
                        </div>
                      </TableCell>

                      {/* Registration Date */}
                      <TableCell className="text-xs text-slate-500 whitespace-nowrap">
                        {formatDate(patient.createdAt)}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            asChild
                            title="View patient profile"
                            className="text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                          >
                            <Link href={`/patients/${patient._id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => openEdit(patient)}
                            title="Edit patient"
                            className="text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setDeletingPatient(patient)}
                            title="Delete patient"
                            className="text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                          >
                            <Trash2 className="h-4 w-4" />
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
