"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Building2,
  Eye,
  FilterX,
  Mail,
  Pencil,
  Phone,
  Plus,
  RotateCcw,
  Search,
  Stethoscope,
  Trash2,
  Users,
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

  const activeFiltersCount = [
    Boolean(searchInput),
    specialization !== "all",
    Boolean(startDate),
    Boolean(endDate),
  ].filter(Boolean).length;

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
        title="Physicians Directory"
        description="Comprehensive directory of registered doctors, specializations, hospital affiliations, and active patient caseloads."
        actions={
          <Button onClick={openCreate} className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-600/20">
            <Plus className="h-4 w-4" />
            Add Physician
          </Button>
        }
      />

      {/* Search & Filter Toolbar */}
      <Card className="p-4 sm:p-5 shadow-2xs border-slate-200/90">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:items-end">
          {/* Search Field */}
          <div className="md:col-span-4 space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
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
                placeholder="Search by name, specialization, or hospital..."
                className="pl-9 pr-8"
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

          {/* Specialization Filter */}
          <div className="md:col-span-3 space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Specialization
            </label>
            <Select
              value={specialization}
              onValueChange={(value) => {
                setSpecialization(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-9 bg-white">
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

          {/* Date Registered Range */}
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              From Date
            </label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="bg-white"
            />
          </div>

          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              To Date
            </label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="bg-white"
            />
          </div>

          {/* Reset Filters Button */}
          <div className="md:col-span-1 flex items-end">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={resetFilters}
              disabled={activeFiltersCount === 0}
              title={activeFiltersCount > 0 ? `Reset ${activeFiltersCount} active filter(s)` : "No active filters"}
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

      {/* Doctors Table Card */}
      <Card className="overflow-hidden shadow-2xs border-slate-200/90">
        {isLoading ? (
          <TableSkeleton rows={6} columns={6} />
        ) : isError ? (
          <div className="p-6">
            <ErrorState
              message={
                error instanceof ApiClientError
                  ? error.message
                  : "Failed to load physicians directory."
              }
              onRetry={() => void refetch()}
            />
          </div>
        ) : !data || data.doctors.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={Stethoscope}
              title={activeFiltersCount > 0 ? "No matching physicians found" : "No physicians registered yet"}
              description={
                activeFiltersCount > 0
                  ? "Try clearing or adjusting your search keywords, specialization, or date filters."
                  : "Get started by adding your first physician to the clinical operations directory."
              }
              action={
                activeFiltersCount > 0 ? (
                  <Button variant="outline" onClick={resetFilters} className="gap-2">
                    <FilterX className="h-4 w-4" />
                    Clear Filters
                  </Button>
                ) : (
                  <Button onClick={openCreate} className="gap-2 bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4" />
                    Add Physician
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
                  <TableHead className="w-[280px]">Physician</TableHead>
                  <TableHead>Specialization</TableHead>
                  <TableHead>Hospital Affiliation</TableHead>
                  <TableHead>Contact Info</TableHead>
                  <TableHead>Active Caseload</TableHead>
                  <TableHead>Onboarded</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.doctors.map((doctor) => (
                  <TableRow key={doctor._id} className="group">
                    {/* Physician Name & Avatar */}
                    <TableCell>
                      <Link
                        href={`/doctors/${doctor._id}`}
                        className="flex items-center gap-3 group-hover:opacity-90"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-xs font-bold text-white shadow-2xs group-hover:bg-blue-600 transition-colors">
                          {getInitials(doctor.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {doctor.name}
                          </p>
                          <p className="truncate text-xs text-slate-400">
                            ID: {doctor._id.slice(-6)}
                          </p>
                        </div>
                      </Link>
                    </TableCell>

                    {/* Specialization Badge */}
                    <TableCell>
                      <Badge variant="default">{doctor.specialization}</Badge>
                    </TableCell>

                    {/* Hospital Affiliation */}
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700">
                        <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="max-w-[200px] truncate" title={doctor.hospital}>
                          {doctor.hospital}
                        </span>
                      </span>
                    </TableCell>

                    {/* Contact Info */}
                    <TableCell>
                      <div className="space-y-1 text-xs">
                        <p className="flex items-center gap-1.5 text-slate-700">
                          <Mail className="h-3 w-3 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[180px]">{doctor.email}</span>
                        </p>
                        <p className="flex items-center gap-1.5 text-slate-500">
                          <Phone className="h-3 w-3 text-slate-400 shrink-0" />
                          <span>{doctor.phone}</span>
                        </p>
                      </div>
                    </TableCell>

                    {/* Patient Caseload */}
                    <TableCell>
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                        <Users className="h-3.5 w-3.5 text-slate-500" />
                        <span>{doctor.patientCount ?? 0} patient(s)</span>
                      </div>
                    </TableCell>

                    {/* Onboarded Date */}
                    <TableCell className="text-xs text-slate-500 whitespace-nowrap">
                      {formatDate(doctor.createdAt)}
                    </TableCell>

                    {/* Actions Menu */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          asChild
                          title="View doctor profile"
                          className="text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                        >
                          <Link href={`/doctors/${doctor._id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => openEdit(doctor)}
                          title="Edit doctor profile"
                          className="text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setDeletingDoctor(doctor)}
                          title="Delete doctor"
                          className="text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                        >
                          <Trash2 className="h-4 w-4" />
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
