export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  meta?: PaginationMeta;
}

export interface ApiErrorPayload {
  success: false;
  message: string;
  code?: string;
  details?: Record<string, unknown>;
  errors?: Array<{ field?: string; message: string }>;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "admin";
}

export interface Doctor {
  _id: string;
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
  patientCount?: number;
  createdAt: string;
  updatedAt: string;
}

export type PatientGender = "Male" | "Female" | "Other";

export interface PopulatedDoctorSummary {
  _id: string;
  name: string;
  specialization: string;
  hospital?: string;
  phone?: string;
  email?: string;
}

export interface Patient {
  _id: string;
  name: string;
  age: number;
  gender: PatientGender;
  phone: string;
  email: string;
  condition: string;
  doctorId: PopulatedDoctorSummary | string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardSummary {
  totalDoctors: number;
  totalPatients: number;
  avgPatientsPerDoctor: number;
  specializationsCount: number;
}

export interface RegistrationTrendPoint {
  date: string;
  label: string;
  count: number;
}

export interface DoctorDistributionPoint {
  doctorId: string;
  name: string;
  specialization: string;
  hospital: string;
  patientCount: number;
}

export interface MonthlyStatPoint {
  month: string;
  label: string;
  patients: number;
  doctors: number;
}

export type ActivityType =
  | "doctor_created"
  | "doctor_updated"
  | "doctor_deleted"
  | "patient_created"
  | "patient_updated"
  | "patient_deleted"
  | "patient_reassigned";

export interface ActivityItem {
  _id: string;
  type: ActivityType;
  description: string;
  entityId?: string;
  entityType: "doctor" | "patient";
  meta?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  summary: DashboardSummary;
  recentDoctors: Doctor[];
  recentPatients: Patient[];
  registrationTrends: RegistrationTrendPoint[];
  doctorDistribution: DoctorDistributionPoint[];
  monthlyStats: MonthlyStatPoint[];
  activities?: ActivityItem[];
}
