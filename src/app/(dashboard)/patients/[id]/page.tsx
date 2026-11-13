"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Building2,
  Calendar,
  Clock,
  Mail,
  Pencil,
  Phone,
  Stethoscope,
  Trash2,
  User,
} from "lucide-react";
import { usePatient } from "@/hooks/use-patients";
import { ApiClientError } from "@/lib/api";
import { formatDate, formatDateTime, getInitials } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";
import { PatientFormDialog } from "@/components/patients/patient-form-dialog";
import { DeletePatientDialog } from "@/components/patients/delete-patient-dialog";
import { ErrorState } from "@/components/shared/error-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function PatientDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const patientId = params.id;

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const patientQuery = usePatient(patientId);

  if (patientQuery.isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Skeleton className="h-64 rounded-xl lg:col-span-2" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  if (patientQuery.isError || !patientQuery.data) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/patients">
            <ArrowLeft className="h-4 w-4" />
            Back to Patients
          </Link>
        </Button>
        <ErrorState
          title="Patient record not found"
          message={
            patientQuery.error instanceof ApiClientError
              ? patientQuery.error.message
              : "Could not load patient record."
          }
          onRetry={() => void patientQuery.refetch()}
        />
      </div>
    );
  }

  const patient = patientQuery.data;
  const doctorObj =
    typeof patient.doctorId === "object" && patient.doctorId !== null
      ? patient.doctorId
      : null;

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb={
          <Link
            href="/patients"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-teal-700 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Patients Registry
          </Link>
        }
        title={patient.name}
        description={`Patient Record • ${patient.age} years old • ${patient.gender}`}
        actions={
          <>
            <Button variant="outline" onClick={() => setEditOpen(true)}>
              <Pencil className="h-4 w-4" />
              Edit Patient
            </Button>
            <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="h-4 w-4" />
              Delete Patient
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Patient Profile Card */}
        <Card className="lg:col-span-2">
          <CardHeader className="border-b border-slate-100">
            <CardTitle>Clinical &amp; Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-lg font-bold text-white shadow-sm shadow-indigo-600/20">
                {getInitials(patient.name)}
              </div>
              <div className="space-y-1.5">
                <h2 className="text-lg font-semibold text-slate-900">{patient.name}</h2>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="indigo">{patient.condition}</Badge>
                  <Badge variant="secondary">
                    {patient.age} yrs &bull; {patient.gender}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-100 bg-slate-50/70 p-4 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                  Email Address
                </p>
                <p className="flex items-center gap-2 text-sm text-slate-800">
                  <Mail className="h-4 w-4 text-slate-400" />
                  {patient.email}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                  Phone Number
                </p>
                <p className="flex items-center gap-2 text-sm text-slate-800">
                  <Phone className="h-4 w-4 text-slate-400" />
                  {patient.phone}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                  Medical Condition
                </p>
                <p className="flex items-center gap-2 text-sm text-slate-800">
                  <Activity className="h-4 w-4 text-teal-600" />
                  {patient.condition}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                  Demographics
                </p>
                <p className="flex items-center gap-2 text-sm text-slate-800">
                  <User className="h-4 w-4 text-slate-400" />
                  {patient.age} years old, {patient.gender}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                  Registered Date
                </p>
                <p className="flex items-center gap-2 text-sm text-slate-600">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  {formatDate(patient.createdAt)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                  Last Updated
                </p>
                <p className="flex items-center gap-2 text-sm text-slate-600">
                  <Clock className="h-4 w-4 text-slate-400" />
                  {formatDateTime(patient.updatedAt)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assigned Doctor Card */}
        <Card>
          <CardHeader className="border-b border-slate-100">
            <CardTitle>Attending Physician</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {doctorObj ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-sm font-bold text-teal-700 ring-1 ring-teal-200/70">
                    {getInitials(doctorObj.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900">
                      {doctorObj.name}
                    </p>
                    <Badge variant="default" className="mt-1">
                      {doctorObj.specialization}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2.5 border-t border-slate-100 pt-4 text-xs text-slate-600">
                  {doctorObj.hospital ? (
                    <p className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-slate-400 shrink-0" />
                      <span>{doctorObj.hospital}</span>
                    </p>
                  ) : null}
                  {doctorObj.email ? (
                    <p className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                      <span>{doctorObj.email}</span>
                    </p>
                  ) : null}
                  {doctorObj.phone ? (
                    <p className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                      <span>{doctorObj.phone}</span>
                    </p>
                  ) : null}
                </div>

                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/doctors/${doctorObj._id}`}>
                    <Stethoscope className="h-4 w-4" />
                    View Doctor Profile
                    <ArrowRight className="h-4 w-4 ml-auto" />
                  </Link>
                </Button>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No physician assigned.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <PatientFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        patient={patient}
      />

      <DeletePatientDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        patient={patient}
        onDeleted={() => router.replace("/patients")}
      />
    </div>
  );
}

