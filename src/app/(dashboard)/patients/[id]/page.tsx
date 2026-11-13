"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Calendar,
  Clock,
  HeartPulse,
  Mail,
  Pencil,
  Phone,
  ShieldCheck,
  Stethoscope,
  Trash2,
  User,
} from "lucide-react";
import { usePatient } from "@/hooks/use-patients";
import { ApiClientError } from "@/lib/api";
import { formatDate, formatDateTime, getConditionBadgeVariant, getInitials } from "@/lib/utils";
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
          <Link href="/patients" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Patients Registry
          </Link>
        </Button>
        <ErrorState
          title="Patient Record Not Found"
          message={
            patientQuery.error instanceof ApiClientError
              ? patientQuery.error.message
              : "Could not load the requested patient record."
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
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Patients Registry
          </Link>
        }
        title={patient.name}
        description={`Clinical Record • MRN-${patient._id.slice(-6).toUpperCase()} • ${patient.age} years old • ${patient.gender}`}
        actions={
          <div className="flex items-center gap-2.5">
            <Button variant="outline" onClick={() => setEditOpen(true)} className="gap-2">
              <Pencil className="h-4 w-4" />
              Edit Record
            </Button>
            <Button
              variant="destructive"
              onClick={() => setDeleteOpen(true)}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete Record
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Details Section (2 cols) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Header Banner */}
          <Card className="shadow-2xs overflow-hidden border-slate-200/90">
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-900 px-6 py-6 text-white sm:px-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-xl font-bold text-white shadow-inner backdrop-blur-md ring-2 ring-white/20">
                    {getInitials(patient.name)}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-bold text-white">{patient.name}</h2>
                      <Badge variant="navy" className="border-white/30 text-white bg-white/20">
                        {patient.gender}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-slate-300">
                      Medical Record Number:{" "}
                      <span className="font-mono text-white font-semibold">
                        MRN-{patient._id.slice(-6).toUpperCase()}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="rounded-xl bg-white/10 px-4 py-2.5 backdrop-blur-xs border border-white/10">
                  <span className="block text-[10px] uppercase font-bold text-slate-300">
                    Primary Diagnosis
                  </span>
                  <Badge variant={getConditionBadgeVariant(patient.condition)} className="mt-1 text-xs">
                    {patient.condition}
                  </Badge>
                </div>
              </div>
            </div>

            <CardContent className="p-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                Personal &amp; Contact Information
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="block text-[11px] font-medium text-slate-400">Age &amp; Gender</span>
                    <span className="text-xs font-bold text-slate-800">
                      {patient.age} years old ({patient.gender})
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="block text-[11px] font-medium text-slate-400">Phone Number</span>
                    <span className="text-xs font-bold text-slate-800">
                      {patient.phone}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[11px] font-medium text-slate-400">Email Address</span>
                    <span className="truncate text-xs font-bold text-slate-800 block" title={patient.email}>
                      {patient.email}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="block text-[11px] font-medium text-slate-400">Intake Registration</span>
                    <span className="text-xs font-bold text-slate-800">
                      {formatDate(patient.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Clinical Status & Care Timeline Card */}
          <Card className="shadow-2xs border-slate-200/90">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base flex items-center gap-2">
                <HeartPulse className="h-4 w-4 text-blue-600" />
                Clinical Case Status &amp; Protocol
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="flex flex-col gap-3 rounded-xl bg-slate-50 p-4 border border-slate-100 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800">
                    Active Condition: {patient.condition}
                  </span>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Strict doctor-patient assignment enforced. Physician is actively monitoring treatment.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 self-start rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200/60">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active Monitoring
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  Last Updated: {formatDateTime(patient.updatedAt)}
                </span>
                <span className="flex items-center gap-1.5 font-medium text-slate-700">
                  <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
                  Verified Patient Record
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar: Attending Physician Card */}
        <div className="space-y-6">
          <Card className="shadow-2xs border-slate-200/90">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-blue-600" />
                Attending Physician
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5 space-y-5">
              {doctorObj ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white shadow-xs">
                      {getInitials(doctorObj.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 truncate">
                        {doctorObj.name}
                      </p>
                      <Badge variant="default" className="mt-1">
                        {doctorObj.specialization}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2.5 rounded-xl bg-slate-50 p-3.5 border border-slate-100 text-xs">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Building2 className="h-4 w-4 text-slate-400 shrink-0" />
                      <span className="truncate">{doctorObj.hospital}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                      <span className="truncate">{doctorObj.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                      <span>{doctorObj.phone}</span>
                    </div>
                  </div>

                  <Button asChild className="w-full gap-2 bg-blue-600 hover:bg-blue-700">
                    <Link href={`/doctors/${doctorObj._id}`}>
                      View Physician Profile
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-slate-400">
                  <Stethoscope className="mx-auto mb-2 h-8 w-8 text-slate-300" />
                  <p>No physician currently assigned.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditOpen(true)}
                    className="mt-3"
                  >
                    Assign a Doctor
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
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
        onDeleted={() => router.push("/patients")}
      />
    </div>
  );
}
