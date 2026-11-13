import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function getInitials(name: string): string {
  return name
    .replace(/^Dr\.?\s+/i, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/**
 * Returns consistent styling tokens based on common medical condition keywords
 */
export function getConditionBadgeVariant(condition: string): "default" | "secondary" | "indigo" | "amber" | "emerald" | "destructive" | "purple" | "sky" {
  const lower = condition.toLowerCase();
  if (lower.includes("hyper") || lower.includes("cardio") || lower.includes("arrhythmia")) {
    return "destructive";
  }
  if (lower.includes("diabet") || lower.includes("strain") || lower.includes("osteo")) {
    return "amber";
  }
  if (lower.includes("asthma") || lower.includes("respir") || lower.includes("migraine")) {
    return "indigo";
  }
  if (lower.includes("eczema") || lower.includes("derma") || lower.includes("skin")) {
    return "purple";
  }
  return "sky";
}
