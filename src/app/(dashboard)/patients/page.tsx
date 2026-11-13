"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Download,
  Eye,
  FilterX,
  Loader2,
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
import { useBulkDeletePatients, usePatients } from "@/hooks/use-patients";
import { apiRequest, ApiClientError } from "@/lib/api";
import { downloadCsv } from "@/lib/csv-export";
import { formatDate, getConditionBadgeVariant, getInitials } from "@/lib/utils";
import { Patient } from "@/types/api";
import { PageHeader } from "@/components/layout/page-header";
import { PatientFormDialog } from "@/components/patients/patient-form-dialog";
import { DeletePatientDialog } from "@/components/patients/delete-patient-dialog";
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

type PatientSortKey = "name" | "age" | "condition" | "createdAt";

interface ColumnVisibility {
  demographics: boolean;
  condition: boolean;
  doctor: boolean;
  contact: boolean;
  createdAt: boolean;
}

const DEFAULT_COLUMNS: ColumnVisibility = {
  demographics: true,
  condition: true,
  doctor: true,
  contact: true,
  createdAt: true,
};

export default function PatientsPage() {
  const [searchInput, setSearchInput] = useState("");
  const [condition, setCondition] = useState("all");
  const [doctorId, setDoctorId] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState<PatientSortKey>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Selection & Columns
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [columns, setColumns] = useState<ColumnVisibility>(DEFAULT_COLUMNS);
  const [isExportingAll, setIsExportingAll] = useState(false);

  // Dialogs
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
    limit,
    sortBy,
    sortOrder,
  });

  const bulkDeleteMutation = useBulkDeletePatients();

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

  const handleSort = (key: PatientSortKey) => {
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

  const visiblePatients = data?.patients ?? [];

  // Selection
  const isAllSelected =
    visiblePatients.length > 0 &&
    visiblePatients.every((pat) => selectedIds.includes(pat._id));
  const isPartiallySelected =
    visiblePatients.some((pat) => selectedIds.includes(pat._id)) && !isAllSelected;

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      const pageIds = visiblePatients.map((p) => p._id);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    } else {
      const pageIds = new Set(visiblePatients.map((p) => p._id));
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
  const exportRows = (patientsToExport: Patient[], filenamePrefix = "patients-export") => {
    const headers = [
      "Patient Name",
      "Age",
      "Gender",
      "Medical Condition",
      "Attending Physician",
      "Physician Specialization",
      "Email Address",
      "Phone Number",
      "Intake Date",
      "Medical Record Number (MRN)",
    ];

    const rows = patientsToExport.map((pat) => {
      const doc =
        typeof pat.doctorId === "object" && pat.doctorId !== null ? pat.doctorId : null;

      return [
        pat.name,
        pat.age,
        pat.gender,
        pat.condition,
        doc?.name ?? "Unassigned",
        doc?.specialization ?? "",
        pat.email,
        pat.phone,
        pat.createdAt ? formatDate(pat.createdAt) : "",
        pat._id,
      ];
    });

    const timestamp = new Date().toISOString().slice(0, 10);
    downloadCsv(`${filenamePrefix}-${timestamp}`, headers, rows);
    toast.success(`Exported ${patientsToExport.length} patient record(s) to CSV`);
  };

  const handleExportSelected = () => {
    if (selectedIds.length === 0) return;
    const selectedPatients = visiblePatients.filter((pat) => selectedIds.includes(pat._id));
    exportRows(selectedPatients, "selected-patients");
  };

  const handleExportAllFiltered = async () => {
    try {
      setIsExportingAll(true);
      const response = await apiRequest<{ patients: Patient[] }>("/patients", {
        params: {
          search: debouncedSearch || undefined,
          condition: condition === "all" ? undefined : condition,
          doctorId: doctorId === "all" ? undefined : doctorId,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          limit: 1000,
          page: 1,
          sortBy,
          sortOrder,
        },
      });

      const records = response.data.patients;
      if (!records || records.length === 0) {
        toast.info("No patient records to export matching current filters");
        return;
      }

      exportRows(records, "patients-registry");
    } catch (err) {
      toast.error(
        err instanceof ApiClientError ? err.message : "Failed to export patients CSV"
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
      { id: "demographics", label: "Demographics", isVisible: columns.demographics },
      { id: "condition", label: "Medical Condition", isVisible: columns.condition },
      { id: "doctor", label: "Attending Physician", isVisible: columns.doctor },
      { id: "contact", label: "Contact Info", isVisible: columns.contact },
      { id: "createdAt", label: "Intake Date", isVisible: columns.createdAt },
    ],
    [columns]
  );

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
              <UserPlus className="h-4 w-4" />
              Register Patient
            </Button>
          </div>
        }
      />

      {/* Bulk Actions Banner */}
      <BulkActionsBar
        selectedCount={selectedIds.length}
        itemLabel="patient(s)"
        onClearSelection={clearSelection}
        onExportSelected={handleExportSelected}
        onDeleteSelected={handleBulkDelete}
        isDeleting={bulkDeleteMutation.isPending}
      />

      {/* Advanced Filter Toolbar */}
      <Card className="p-4 sm:p-5 shadow-2xs border-slate-200/90 dark:border-slate-800 dark:bg-slate-900">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-12 md:items-end">
          {/* Search Query */}
          <div className="md:col-span-3 space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
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
                className="pl-9 pr-8 bg-white dark:bg-slate-900"
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

          {/* Condition Filter */}
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Medical Condition
            </label>
            <Select
              value={condition}
              onValueChange={(value) => {
                setCondition(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-9 bg-white dark:bg-slate-900">
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
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Attending Physician
            </label>
            <Select
              value={doctorId}
              onValueChange={(value) => {
                setDoctorId(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-9 bg-white dark:bg-slate-900">
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
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">From</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(1);
                }}
                className="h-9 bg-white dark:bg-slate-900"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">To</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(1);
                }}
                className="h-9 bg-white dark:bg-slate-900"
              />
            </div>
          </div>

          {/* Table View Options & Reset Filter */}
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
                  ? `Reset ${activeFiltersCount} filter(s)`
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

      {/* Patients Table Card */}
      <Card className="overflow-hidden shadow-2xs border-slate-200/90 dark:border-slate-800 dark:bg-slate-900">
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
              title={
                activeFiltersCount > 0
                  ? "No matching patients found"
                  : "No patients registered yet"
              }
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
                  <Button onClick={openCreate} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                    <UserPlus className="h-4 w-4" />
                    Register Patient
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
                {columns.demographics && <col className="w-[140px]" />}
                {columns.condition && <col className="w-[160px]" />}
                {columns.doctor && <col className="w-[220px]" />}
                {columns.contact && <col className="w-[200px]" />}
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
                        aria-label="Select all patients on this page"
                      />
                    </div>
                  </TableHead>

                  {/* Patient Record */}
                  <SortableTableHead
                    columnKey="name"
                    label="Patient Record"
                    activeKey={sortBy}
                    activeOrder={sortOrder}
                    onSort={handleSort}
                    align="left"
                    className="w-[240px] px-4"
                  />

                  {/* Demographics */}
                  {columns.demographics && (
                    <SortableTableHead
                      columnKey="age"
                      label="Demographics"
                      activeKey={sortBy}
                      activeOrder={sortOrder}
                      onSort={handleSort}
                      align="left"
                      className="w-[140px] px-4"
                    />
                  )}

                  {/* Medical Condition */}
                  {columns.condition && (
                    <SortableTableHead
                      columnKey="condition"
                      label="Medical Condition"
                      activeKey={sortBy}
                      activeOrder={sortOrder}
                      onSort={handleSort}
                      align="left"
                      className="w-[160px] px-4"
                    />
                  )}

                  {/* Attending Physician */}
                  {columns.doctor && (
                    <TableHead className="w-[220px] text-left px-4">Attending Physician</TableHead>
                  )}

                  {/* Contact Information */}
                  {columns.contact && (
                    <TableHead className="w-[200px] text-left px-4">Contact Info</TableHead>
                  )}

                  {/* Intake Date */}
                  {columns.createdAt && (
                    <SortableTableHead
                      columnKey="createdAt"
                      label="Intake Date"
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
                {data.patients.map((patient) => {
                  const isSelected = selectedIds.includes(patient._id);
                  const doctorObj =
                    typeof patient.doctorId === "object" && patient.doctorId !== null
                      ? patient.doctorId
                      : null;

                  return (
                    <TableRow
                      key={patient._id}
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
                              toggleSelectRow(patient._id, checked)
                            }
                            aria-label={`Select ${patient.name}`}
                          />
                        </div>
                      </TableCell>

                      {/* Patient Name & Initials */}
                      <TableCell className="w-[240px] px-4">
                        <Link
                          href={`/patients/${patient._id}`}
                          className="flex items-center gap-3 group-hover:opacity-90"
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xs font-bold text-blue-700 border border-blue-200/60 group-hover:border-blue-400 transition-colors dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800">
                            {getInitials(patient.name)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p
                              className="truncate text-xs font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                              title={patient.name}
                            >
                              {patient.name}
                            </p>
                            <p className="truncate text-[11px] text-slate-400 dark:text-slate-500">
                              MRN-{patient._id.slice(-6).toUpperCase()}
                            </p>
                          </div>
                        </Link>
                      </TableCell>

                      {/* Demographics */}
                      {columns.demographics && (
                        <TableCell className="w-[140px] px-4">
                          <div className="flex items-center justify-start">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300">
                              <span>{patient.age} yrs</span>
                              <span className="text-slate-400">&bull;</span>
                              <span>{patient.gender}</span>
                            </span>
                          </div>
                        </TableCell>
                      )}

                      {/* Medical Condition Badge */}
                      {columns.condition && (
                        <TableCell className="w-[160px] px-4">
                          <div className="flex items-center justify-start">
                            <Badge
                              variant={getConditionBadgeVariant(patient.condition)}
                              className="text-xs font-medium max-w-[145px] truncate"
                              title={patient.condition}
                            >
                              {patient.condition}
                            </Badge>
                          </div>
                        </TableCell>
                      )}

                      {/* Attending Physician */}
                      {columns.doctor && (
                        <TableCell className="w-[220px] px-4">
                          {doctorObj ? (
                            <Link
                              href={`/doctors/${doctorObj._id}`}
                              className="inline-flex items-center gap-2 group/doc max-w-[200px]"
                              title={`${doctorObj.name} (${doctorObj.specialization})`}
                            >
                              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300 group-hover/doc:bg-blue-100 dark:group-hover/doc:bg-blue-950/60 group-hover/doc:text-blue-700 dark:group-hover/doc:text-blue-300">
                                {getInitials(doctorObj.name)}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-xs font-medium text-slate-900 dark:text-slate-100 group-hover/doc:text-blue-600 dark:group-hover/doc:text-blue-400">
                                  {doctorObj.name}
                                </p>
                                <p className="truncate text-[10px] text-slate-400 dark:text-slate-500">
                                  {doctorObj.specialization}
                                </p>
                              </div>
                            </Link>
                          ) : (
                            <span className="text-xs text-slate-400 dark:text-slate-500 italic">
                              Unassigned
                            </span>
                          )}
                        </TableCell>
                      )}

                      {/* Contact */}
                      {columns.contact && (
                        <TableCell className="w-[200px] px-4">
                          <div className="space-y-1 text-xs">
                            <p
                              className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300"
                              title={patient.email}
                            >
                              <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                              <span className="truncate max-w-[170px]">{patient.email}</span>
                            </p>
                            <p
                              className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400"
                              title={patient.phone}
                            >
                              <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                              <span className="truncate max-w-[170px]">{patient.phone}</span>
                            </p>
                          </div>
                        </TableCell>
                      )}

                      {/* Registration Date */}
                      {columns.createdAt && (
                        <TableCell className="w-[140px] px-4 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {formatDate(patient.createdAt)}
                        </TableCell>
                      )}

                      {/* Actions */}
                      <TableCell className="w-[120px] px-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            asChild
                            title="View patient profile"
                            className="text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40"
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
                            className="text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setDeletingPatient(patient)}
                            title="Delete patient"
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
