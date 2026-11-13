"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Building2,
  Download,
  Eye,
  FilterX,
  Loader2,
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
import { useBulkDeleteDoctors, useDoctors } from "@/hooks/use-doctors";
import { apiRequest, ApiClientError } from "@/lib/api";
import { downloadCsv } from "@/lib/csv-export";
import { formatDate, getInitials } from "@/lib/utils";
import { Doctor } from "@/types/api";
import { PageHeader } from "@/components/layout/page-header";
import { DoctorFormDialog } from "@/components/doctors/doctor-form-dialog";
import { DeleteDoctorDialog } from "@/components/doctors/delete-doctor-dialog";
import { BulkActionsBar } from "@/components/shared/bulk-actions-bar";
import { DataTableViewOptions } from "@/components/shared/data-table-view-options";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { Pagination } from "@/components/shared/pagination";
import { SortableTableHead } from "@/components/shared/sortable-table-head";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import { toast } from "sonner";

type DoctorSortKey = "name" | "specialization" | "hospital" | "createdAt";

interface ColumnVisibility {
  specialization: boolean;
  hospital: boolean;
  contact: boolean;
  caseload: boolean;
  createdAt: boolean;
}

const DEFAULT_COLUMNS: ColumnVisibility = {
  specialization: true,
  hospital: true,
  contact: true,
  caseload: true,
  createdAt: true,
};

export default function DoctorsPage() {
  const [searchInput, setSearchInput] = useState("");
  const [specialization, setSpecialization] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState<DoctorSortKey>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Selection & Columns
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [columns, setColumns] = useState<ColumnVisibility>(DEFAULT_COLUMNS);
  const [isExportingAll, setIsExportingAll] = useState(false);

  // Dialogs
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
    limit,
    sortBy,
    sortOrder,
  });

  const bulkDeleteMutation = useBulkDeleteDoctors();

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

  const handleSort = (key: DoctorSortKey) => {
    if (sortBy === key) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(key);
      setSortOrder("asc");
    }
    setPage(1);
  };

  const toggleColumn = (key: string) => {
    setColumns((prev) => ({
      ...prev,
      [key]: !prev[key as keyof ColumnVisibility],
    }));
  };

  const resetColumns = () => {
    setColumns(DEFAULT_COLUMNS);
  };

  const visibleDoctors = data?.doctors ?? [];

  // Selection handlers
  const isAllSelected =
    visibleDoctors.length > 0 &&
    visibleDoctors.every((doc) => selectedIds.includes(doc._id));
  const isPartiallySelected =
    visibleDoctors.some((doc) => selectedIds.includes(doc._id)) && !isAllSelected;

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      const pageIds = visibleDoctors.map((d) => d._id);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    } else {
      const pageIds = new Set(visibleDoctors.map((d) => d._id));
      setSelectedIds((prev) => prev.filter((id) => !pageIds.has(id)));
    }
  };

  const toggleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    }
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  // CSV Export
  const exportRows = (doctorsToExport: Doctor[], filenamePrefix = "doctors-export") => {
    const headers = [
      "Physician Name",
      "Specialization",
      "Hospital Affiliation",
      "Email Address",
      "Phone Number",
      "Active Caseload",
      "Onboarding Date",
      "Physician ID",
    ];

    const rows = doctorsToExport.map((doc) => [
      doc.name,
      doc.specialization,
      doc.hospital,
      doc.email,
      doc.phone,
      doc.patientCount ?? 0,
      doc.createdAt ? formatDate(doc.createdAt) : "",
      doc._id,
    ]);

    const timestamp = new Date().toISOString().slice(0, 10);
    downloadCsv(`${filenamePrefix}-${timestamp}`, headers, rows);
    toast.success(`Exported ${doctorsToExport.length} physician record(s) to CSV`);
  };

  const handleExportSelected = () => {
    if (selectedIds.length === 0) return;
    const selectedDoctors = visibleDoctors.filter((doc) => selectedIds.includes(doc._id));
    exportRows(selectedDoctors, "selected-doctors");
  };

  const handleExportAllFiltered = async () => {
    try {
      setIsExportingAll(true);
      const response = await apiRequest<{ doctors: Doctor[] }>("/doctors", {
        params: {
          search: debouncedSearch || undefined,
          specialization: specialization === "all" ? undefined : specialization,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          limit: 1000,
          page: 1,
          sortBy,
          sortOrder,
        },
      });

      const records = response.data.doctors;
      if (!records || records.length === 0) {
        toast.info("No records to export matching current filters");
        return;
      }

      exportRows(records, "doctors-directory");
    } catch (err) {
      toast.error(
        err instanceof ApiClientError ? err.message : "Failed to export physicians CSV"
      );
    } finally {
      setIsExportingAll(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    try {
      await bulkDeleteMutation.mutateAsync(selectedIds);
      clearSelection();
    } catch {
      // Handled in mutation hook toast
    }
  };

  const columnOptions = useMemo(
    () => [
      { id: "specialization", label: "Specialization", isVisible: columns.specialization },
      { id: "hospital", label: "Hospital", isVisible: columns.hospital },
      { id: "contact", label: "Contact Info", isVisible: columns.contact },
      { id: "caseload", label: "Caseload", isVisible: columns.caseload },
      { id: "createdAt", label: "Onboarded Date", isVisible: columns.createdAt },
    ],
    [columns]
  );

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
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleExportAllFiltered}
              disabled={isExportingAll || isLoading}
              className="gap-2 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200"
            >
              {isExportingAll ? (
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              ) : (
                <Download className="h-4 w-4 text-slate-500 dark:text-slate-400" />
              )}
              <span>Export CSV</span>
            </Button>
            <Button
              onClick={openCreate}
              className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-600/20 text-white"
            >
              <Plus className="h-4 w-4" />
              Add Physician
            </Button>
          </div>
        }
      />

      {/* Bulk Actions Banner */}
      <BulkActionsBar
        selectedCount={selectedIds.length}
        itemLabel="physician(s)"
        onClearSelection={clearSelection}
        onExportSelected={handleExportSelected}
        onDeleteSelected={handleBulkDelete}
        isDeleting={bulkDeleteMutation.isPending}
        warningNotice="Physicians with active assigned patients cannot be deleted. You must reassign their patients before deletion."
      />

      {/* Search & Filter Toolbar */}
      <Card className="p-4 sm:p-5 shadow-2xs border-slate-200/90 dark:border-slate-800 dark:bg-slate-900">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:items-end">
          {/* Search Field */}
          <div className="md:col-span-4 space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
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
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Specialization Filter */}
          <div className="md:col-span-3 space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Specialization
            </label>
            <Select
              value={specialization}
              onValueChange={(value) => {
                setSpecialization(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-9 bg-white dark:bg-slate-900">
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
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              From Date
            </label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="bg-white dark:bg-slate-900"
            />
          </div>

          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              To Date
            </label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="bg-white dark:bg-slate-900"
            />
          </div>

          {/* Table View Options & Reset Filter Buttons */}
          <div className="md:col-span-1 flex items-center justify-end gap-1.5">
            <DataTableViewOptions
              columns={columnOptions}
              onToggleColumn={toggleColumn}
              onResetColumns={resetColumns}
            />

            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={resetFilters}
              disabled={activeFiltersCount === 0}
              title={
                activeFiltersCount > 0
                  ? `Reset ${activeFiltersCount} active filter(s)`
                  : "No active filters"
              }
              className="h-9 w-9 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 relative"
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
      <Card className="overflow-hidden shadow-2xs border-slate-200/90 dark:border-slate-800 dark:bg-slate-900">
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
              title={
                activeFiltersCount > 0
                  ? "No matching physicians found"
                  : "No physicians registered yet"
              }
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
                  <Button onClick={openCreate} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="h-4 w-4" />
                    Add Physician
                  </Button>
                )
              }
            />
          </div>
        ) : (
          <>
            <Table className="w-full table-fixed min-w-[1100px]">
              <colgroup>
                <col className="w-12" />
                <col className="w-[240px]" />
                {columns.specialization && <col className="w-[160px]" />}
                {columns.hospital && <col className="w-[220px]" />}
                {columns.contact && <col className="w-[200px]" />}
                {columns.caseload && <col className="w-[150px]" />}
                {columns.createdAt && <col className="w-[140px]" />}
                <col className="w-[120px]" />
              </colgroup>
              <TableHeader>
                <TableRow>
                  {/* Select All Checkbox */}
                  <TableHead className="w-12 p-0 text-center">
                    <div className="flex items-center justify-center">
                      <Checkbox
                        checked={
                          isAllSelected ? true : isPartiallySelected ? "indeterminate" : false
                        }
                        onCheckedChange={toggleSelectAll}
                        aria-label="Select all physicians on this page"
                      />
                    </div>
                  </TableHead>

                  {/* Physician Name */}
                  <SortableTableHead
                    columnKey="name"
                    label="Physician"
                    activeKey={sortBy}
                    activeOrder={sortOrder}
                    onSort={handleSort}
                    align="left"
                    className="w-[240px] px-4"
                  />

                  {/* Specialization */}
                  {columns.specialization && (
                    <SortableTableHead
                      columnKey="specialization"
                      label="Specialization"
                      activeKey={sortBy}
                      activeOrder={sortOrder}
                      onSort={handleSort}
                      align="left"
                      className="w-[160px] px-4"
                    />
                  )}

                  {/* Hospital */}
                  {columns.hospital && (
                    <SortableTableHead
                      columnKey="hospital"
                      label="Hospital Affiliation"
                      activeKey={sortBy}
                      activeOrder={sortOrder}
                      onSort={handleSort}
                      align="left"
                      className="w-[220px] px-4"
                    />
                  )}

                  {/* Contact Info */}
                  {columns.contact && (
                    <TableHead className="w-[200px] text-left px-4">Contact Info</TableHead>
                  )}

                  {/* Caseload */}
                  {columns.caseload && (
                    <TableHead className="w-[150px] text-left px-4">Active Caseload</TableHead>
                  )}

                  {/* Onboarded Date */}
                  {columns.createdAt && (
                    <SortableTableHead
                      columnKey="createdAt"
                      label="Onboarded"
                      activeKey={sortBy}
                      activeOrder={sortOrder}
                      onSort={handleSort}
                      align="left"
                      className="w-[140px] px-4"
                    />
                  )}

                  <TableHead className="w-[120px] text-center px-2">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.doctors.map((doctor) => {
                  const isSelected = selectedIds.includes(doctor._id);

                  return (
                    <TableRow
                      key={doctor._id}
                      className={`group transition-colors ${
                        isSelected ? "bg-blue-50/60 dark:bg-blue-950/25" : ""
                      }`}
                    >
                      {/* Row Checkbox */}
                      <TableCell className="w-12 p-0 text-center">
                        <div className="flex items-center justify-center">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) =>
                              toggleSelectRow(doctor._id, checked)
                            }
                            aria-label={`Select ${doctor.name}`}
                          />
                        </div>
                      </TableCell>

                      {/* Physician Name & Avatar */}
                      <TableCell className="w-[240px] px-4">
                        <Link
                          href={`/doctors/${doctor._id}`}
                          className="flex items-center gap-3 group-hover:opacity-90"
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-xs font-bold text-white shadow-2xs group-hover:bg-blue-600 transition-colors dark:bg-slate-800 dark:group-hover:bg-blue-500">
                            {getInitials(doctor.name)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p
                              className="truncate text-xs font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                              title={doctor.name}
                            >
                              {doctor.name}
                            </p>
                            <p className="truncate text-[11px] text-slate-400 dark:text-slate-500">
                              ID: {doctor._id.slice(-6)}
                            </p>
                          </div>
                        </Link>
                      </TableCell>

                      {/* Specialization Badge */}
                      {columns.specialization && (
                        <TableCell className="w-[160px] px-4">
                          <div className="flex items-center justify-start">
                            <Badge
                              variant="default"
                              className="text-xs font-medium max-w-[140px] truncate"
                              title={doctor.specialization}
                            >
                              {doctor.specialization}
                            </Badge>
                          </div>
                        </TableCell>
                      )}

                      {/* Hospital Affiliation */}
                      {columns.hospital && (
                        <TableCell className="w-[220px] px-4">
                          <div className="flex items-center justify-start">
                            <span
                              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 max-w-[200px]"
                              title={doctor.hospital}
                            >
                              <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                              <span className="truncate">{doctor.hospital}</span>
                            </span>
                          </div>
                        </TableCell>
                      )}

                      {/* Contact Info */}
                      {columns.contact && (
                        <TableCell className="w-[200px] px-4">
                          <div className="space-y-1 text-xs">
                            <p
                              className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300"
                              title={doctor.email}
                            >
                              <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                              <span className="truncate max-w-[170px]">{doctor.email}</span>
                            </p>
                            <p
                              className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400"
                              title={doctor.phone}
                            >
                              <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                              <span className="truncate max-w-[170px]">{doctor.phone}</span>
                            </p>
                          </div>
                        </TableCell>
                      )}

                      {/* Patient Caseload */}
                      {columns.caseload && (
                        <TableCell className="w-[150px] px-4">
                          <div className="flex items-center justify-start">
                            <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300">
                              <Users className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
                              <span>{doctor.patientCount ?? 0} patient(s)</span>
                            </div>
                          </div>
                        </TableCell>
                      )}

                      {/* Onboarded Date */}
                      {columns.createdAt && (
                        <TableCell className="w-[140px] px-4 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {formatDate(doctor.createdAt)}
                        </TableCell>
                      )}

                      {/* Actions Menu */}
                      <TableCell className="w-[120px] px-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            asChild
                            title="View doctor profile"
                            className="text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40"
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
                            className="text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setDeletingDoctor(doctor)}
                            title="Delete doctor"
                            className="text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
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
              onLimitChange={(newLimit) => {
                setLimit(newLimit);
                setPage(1);
              }}
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
