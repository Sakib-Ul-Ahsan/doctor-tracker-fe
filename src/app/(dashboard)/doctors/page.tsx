"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Building2,
  Eye,
  Mail,
  Pencil,
  Phone,
  Plus,
  RotateCcw,
  Search,
  Stethoscope,
  Trash2,
} from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { useDoctors } from "@/hooks/use-doctors";
import { ApiClientError } from "@/lib/api";
import { formatDate, getInitials } from "@/lib/utils";
import { Doctor } from "@/types/api";
import { PageHeader } from "@/components/layout/page-header";
import { DoctorFormDialog } from "@/components/doctors/doctor-form-dialog";
import { DeleteDoctorDialog } from "@/components/doctors/delete-doctor-dialog";
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

export default function DoctorsPage() {
  const [searchInput, setSearchInput] = useState("");
  const [specialization, setSpecialization] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [deletingDoctor, setDeletingDoctor] = useState<Doctor | null>(null);

  const debouncedSearch = useDebounce(searchInput, 350);

  const { data, isLoading, isFetching, isError, error, refetch } = useDoctors({
    search: debouncedSearch || undefined,
    specialization: specialization === "all" ? undefined : specialization,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    page,
    limit: 10,
  });

  const hasActiveFilters =
    Boolean(searchInput) || specialization !== "all" || Boolean(startDate) || Boolean(endDate);

  const resetFilters = () => {
    setSearchInput("");
    setSpecialization("all");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  const openCreate = () => {
    setEditingDoctor(null);
    setFormOpen(true);
  };

  const openEdit = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Doctors Directory"
        description="Manage registered physicians, specializations, hospital affiliations, and caseloads."
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Add Doctor
          </Button>
        }
      />

      {/* Search & Filter Toolbar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-12 md:items-end">
          <div className="md:col-span-4 space-y-1">
            <label className="text-xs font-medium text-slate-600">
              Search Physicians
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setPage(1);
                }}
                placeholder="Name, specialization, or hospital..."
                className="pl-9"
              />
            </div>
          </div>

          <div className="md:col-span-3 space-y-1">
            <label className="text-xs font-medium text-slate-600">
              Specialization
            </label>
            <Select
              value={specialization}
              onValueChange={(value) => {
                setSpecialization(value);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Specializations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specializations</SelectItem>
                {(data?.specializations ?? []).map((spec) => (
                  <SelectItem key={spec} value={spec}>
                    {spec}
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

      {/* Doctors Table Card */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={6} columns={6} />
        ) : isError ? (
          <div className="p-6">
            <ErrorState
              message={
                error instanceof ApiClientError
                  ? error.message
                  : "Failed to load doctors directory."
              }
              onRetry={() => void refetch()}
            />
          </div>
        ) : !data || data.doctors.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={Stethoscope}
              title={hasActiveFilters ? "No matching doctors found" : "No doctors registered yet"}
              description={
                hasActiveFilters
                  ? "Try clearing or adjusting your search keywords, specialization, or date filters."
                  : "Get started by adding your first physician to the clinical directory."
              }
              action={
                hasActiveFilters ? (
                  <Button variant="outline" onClick={resetFilters}>
                    Clear Filters
                  </Button>
                ) : (
                  <Button onClick={openCreate}>
                    <Plus className="h-4 w-4" />
                    Add Doctor
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
                  <TableHead>Physician</TableHead>
                  <TableHead>Specialization</TableHead>
                  <TableHead>Hospital</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Patients</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.doctors.map((doctor) => (
                  <TableRow key={doctor._id}>
                    <TableCell>
                      <Link
                        href={`/doctors/${doctor._id}`}
                        className="group flex items-center gap-3"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-50 text-xs font-semibold text-teal-700 ring-1 ring-teal-200/80">
                          {getInitials(doctor.name)}
                        </div>
                        <span className="font-medium text-slate-900 group-hover:text-teal-700 transition-colors">
                          {doctor.name}
                        </span>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant="default">{doctor.specialization}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 text-slate-600">
                        <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        {doctor.hospital}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5 text-xs">
                        <p className="flex items-center gap-1.5 text-slate-700">
                          <Mail className="h-3 w-3 text-slate-400" />
                          {doctor.email}
                        </p>
                        <p className="flex items-center gap-1.5 text-slate-500">
                          <Phone className="h-3 w-3 text-slate-400" />
                          {doctor.phone}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {doctor.patientCount ?? 0} assigned
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-slate-500 whitespace-nowrap">
                      {formatDate(doctor.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                          title="View doctor details"
                        >
                          <Link href={`/doctors/${doctor._id}`}>
                            <Eye className="h-4 w-4 text-slate-500" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(doctor)}
                          title="Edit doctor"
                        >
                          <Pencil className="h-4 w-4 text-slate-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeletingDoctor(doctor)}
                          title="Delete doctor"
                          className="hover:bg-rose-50 hover:text-rose-600"
                        >
                          <Trash2 className="h-4 w-4 text-slate-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
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

      <DoctorFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        doctor={editingDoctor}
      />

      <DeleteDoctorDialog
        open={Boolean(deletingDoctor)}
        onOpenChange={(open) => {
          if (!open) setDeletingDoctor(null);
        }}
        doctor={deletingDoctor}
      />
    </div>
  );
}

