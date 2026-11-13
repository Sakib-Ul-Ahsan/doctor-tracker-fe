"use client";

import {
  ArrowRightLeft,
  Clock,
  FileEdit,
  History,
  Pencil,
  UserCheck,
  UserMinus,
  UserPlus,
  UserX,
} from "lucide-react";
import { ActivityItem, ActivityType } from "@/types/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ActivityTimelineProps {
  activities?: ActivityItem[];
}

function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;

    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  } catch {
    return dateString;
  }
}

function getActivityConfig(type: ActivityType) {
  switch (type) {
    case "doctor_created":
      return {
        icon: UserCheck,
        color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
        label: "Doctor Created",
      };
    case "doctor_updated":
      return {
        icon: Pencil,
        color: "text-blue-600 bg-blue-50 dark:bg-blue-950/50 dark:text-blue-400 border-blue-200 dark:border-blue-800",
        label: "Doctor Updated",
      };
    case "doctor_deleted":
      return {
        icon: UserMinus,
        color: "text-rose-600 bg-rose-50 dark:bg-rose-950/50 dark:text-rose-400 border-rose-200 dark:border-rose-800",
        label: "Doctor Deleted",
      };
    case "patient_created":
      return {
        icon: UserPlus,
        color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
        label: "Patient Intake",
      };
    case "patient_updated":
      return {
        icon: FileEdit,
        color: "text-sky-600 bg-sky-50 dark:bg-sky-950/50 dark:text-sky-400 border-sky-200 dark:border-sky-800",
        label: "Patient Updated",
      };
    case "patient_reassigned":
      return {
        icon: ArrowRightLeft,
        color: "text-amber-600 bg-amber-50 dark:bg-amber-950/50 dark:text-amber-400 border-amber-200 dark:border-amber-800",
        label: "Patient Reassigned",
      };
    case "patient_deleted":
      return {
        icon: UserX,
        color: "text-rose-600 bg-rose-50 dark:bg-rose-950/50 dark:text-rose-400 border-rose-200 dark:border-rose-800",
        label: "Patient Deleted",
      };
    default:
      return {
        icon: History,
        color: "text-slate-600 bg-slate-50 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700",
        label: "Audit Event",
      };
  }
}

export function ActivityTimeline({ activities = [] }: ActivityTimelineProps) {
  return (
    <Card className="shadow-2xs border-slate-200/90 dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
              Administrative Activity Timeline
            </CardTitle>
            <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Audit Log
            </span>
          </div>
          <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time chronological events for doctors, patients, and assignments
          </CardDescription>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
          <Clock className="h-3.5 w-3.5" />
          <span>MongoDB Persisted</span>
        </div>
      </CardHeader>

      <CardContent className="pt-4 pb-4">
        {activities.length === 0 ? (
          <div className="flex h-[200px] flex-col items-center justify-center gap-2.5 text-center text-xs text-slate-400 dark:text-slate-500">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400">
              <History className="h-5 w-5" />
            </div>
            <p className="font-semibold text-slate-700 dark:text-slate-300">
              No Administrative Activities Recorded
            </p>
            <p className="max-w-sm text-slate-400 dark:text-slate-500">
              Events such as creating, updating, reassigning, or deleting physicians and patients will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
            {activities.map((item) => {
              const config = getActivityConfig(item.type);
              const Icon = config.icon;

              return (
                <div key={item._id} className="relative group">
                  {/* Timeline dot/icon */}
                  <div
                    className={`absolute -left-6 top-0.5 flex h-5 w-5 items-center justify-center rounded-full border shadow-2xs ${config.color}`}
                  >
                    <Icon className="h-2.5 w-2.5" />
                  </div>

                  {/* Content */}
                  <div className="rounded-lg border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 p-3 shadow-2xs transition-colors hover:border-slate-200 dark:hover:border-slate-700">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                            {config.label}
                          </span>
                          <span className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase">
                            {item.entityType}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300">
                          {item.description}
                        </p>
                      </div>
                      <time
                        dateTime={item.createdAt}
                        title={new Date(item.createdAt).toLocaleString()}
                        className="shrink-0 text-[11px] font-medium text-slate-400 dark:text-slate-500"
                      >
                        {formatRelativeTime(item.createdAt)}
                      </time>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
