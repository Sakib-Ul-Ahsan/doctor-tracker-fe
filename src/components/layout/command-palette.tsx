"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Command,
  LayoutDashboard,
  Loader2,
  Plus,
  Search,
  Stethoscope,
  User,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useDoctors } from "@/hooks/use-doctors";
import { usePatients } from "@/hooks/use-patients";
import { useDebounce } from "@/hooks/use-debounce";
import { getConditionBadgeVariant } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenDoctorModal?: () => void;
  onOpenPatientModal?: () => void;
}

interface PaletteAction {
  id: string;
  title: string;
  subtitle?: string;
  category: "Navigation" | "Quick Actions" | "Physicians" | "Patients";
  icon: typeof LayoutDashboard;
  onSelect: () => void;
  badge?: string;
}

export function CommandPalette({
  open,
  onOpenChange,
  onOpenDoctorModal,
  onOpenPatientModal,
}: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(query, 250);

  // Queries for live doctors & patients search
  const doctorsQuery = useDoctors({
    search: debouncedQuery.trim() || undefined,
    limit: 5,
  });

  const patientsQuery = usePatients({
    search: debouncedQuery.trim() || undefined,
    limit: 5,
  });

  const handleClose = useCallback(() => {
    setQuery("");
    setSelectedIndex(0);
    onOpenChange(false);
  }, [onOpenChange]);

  // Global keydown listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (open) {
          handleClose();
        } else {
          onOpenChange(true);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange, handleClose]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Build items list based on query
  const items: PaletteAction[] = useMemo(() => {
    const list: PaletteAction[] = [];
    const trimmed = query.trim().toLowerCase();

    // Default Navigation items
    if (!trimmed || "dashboard overview".includes(trimmed)) {
      list.push({
        id: "nav-dashboard",
        title: "Go to Dashboard",
        subtitle: "Operations analytics and clinical metrics",
        category: "Navigation",
        icon: LayoutDashboard,
        onSelect: () => {
          router.push("/");
          handleClose();
        },
      });
    }

    if (!trimmed || "physicians doctors directory".includes(trimmed)) {
      list.push({
        id: "nav-doctors",
        title: "Go to Physicians Directory",
        subtitle: "Manage medical staff and specializations",
        category: "Navigation",
        icon: Stethoscope,
        onSelect: () => {
          router.push("/doctors");
          handleClose();
        },
      });
    }

    if (!trimmed || "patients registry medical records".includes(trimmed)) {
      list.push({
        id: "nav-patients",
        title: "Go to Patients Registry",
        subtitle: "Review patient intakes and medical conditions",
        category: "Navigation",
        icon: Users,
        onSelect: () => {
          router.push("/patients");
          handleClose();
        },
      });
    }

    // Quick Actions
    if (!trimmed || "add new create physician doctor".includes(trimmed)) {
      list.push({
        id: "action-add-doctor",
        title: "Add New Physician",
        subtitle: "Onboard a new medical doctor to clinical staff",
        category: "Quick Actions",
        icon: Plus,
        onSelect: () => {
          handleClose();
          onOpenDoctorModal?.();
        },
      });
    }

    if (!trimmed || "register new add patient intake".includes(trimmed)) {
      list.push({
        id: "action-add-patient",
        title: "Register New Patient",
        subtitle: "Intake admission and doctor assignment",
        category: "Quick Actions",
        icon: UserPlus,
        onSelect: () => {
          handleClose();
          onOpenPatientModal?.();
        },
      });
    }

    // Doctors Search Results
    if (trimmed && doctorsQuery.data?.doctors) {
      for (const doctor of doctorsQuery.data.doctors) {
        list.push({
          id: `doc-${doctor._id}`,
          title: doctor.name,
          subtitle: `${doctor.specialization} • ${doctor.hospital}`,
          category: "Physicians",
          icon: Stethoscope,
          badge: `${doctor.patientCount ?? 0} patients`,
          onSelect: () => {
            router.push(`/doctors/${doctor._id}`);
            handleClose();
          },
        });
      }
    }

    // Patients Search Results
    if (trimmed && patientsQuery.data?.patients) {
      for (const patient of patientsQuery.data.patients) {
        const doc =
          typeof patient.doctorId === "object" && patient.doctorId !== null
            ? patient.doctorId
            : null;
        list.push({
          id: `pat-${patient._id}`,
          title: patient.name,
          subtitle: `${patient.condition} • ${patient.age} yrs (${patient.gender}) • Attending: ${
            doc?.name || "Unassigned"
          }`,
          category: "Patients",
          icon: User,
          badge: patient.condition,
          onSelect: () => {
            router.push(`/patients/${patient._id}`);
            handleClose();
          },
        });
      }
    }

    return list;
  }, [
    query,
    doctorsQuery.data,
    patientsQuery.data,
    router,
    handleClose,
    onOpenDoctorModal,
    onOpenPatientModal,
  ]);

  const activeIndex = Math.min(selectedIndex, Math.max(0, items.length - 1));

  // Handle arrow navigation & enter
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, items.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + items.length) % Math.max(1, items.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (items[activeIndex]) {
        items[activeIndex].onSelect();
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleClose();
    }
  };

  if (!open) return null;

  const isSearching =
    query.trim().length > 0 && (doctorsQuery.isFetching || patientsQuery.isFetching);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm animate-in fade-in-0 duration-150"
        onClick={handleClose}
      />

      {/* Palette Modal */}
      <div
        className="relative z-50 w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in fade-in-0 zoom-in-95 duration-150"
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center border-b border-slate-100 px-4 py-3.5 dark:border-slate-800">
          <Search className="h-5 w-5 text-slate-400 dark:text-slate-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command or search doctors, patients..."
            className="flex-1 bg-transparent px-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-slate-100 dark:placeholder:text-slate-500"
          />
          {isSearching && <Loader2 className="h-4 w-4 animate-spin text-blue-600 mr-2 shrink-0" />}
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setSelectedIndex(0);
              }}
              className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
              ESC
            </kbd>
          )}
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          className="max-h-[380px] overflow-y-auto p-2 divide-y divide-slate-100 dark:divide-slate-800/60"
        >
          {items.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 dark:text-slate-500">
              <Search className="mx-auto mb-2 h-6 w-6 text-slate-300 dark:text-slate-600" />
              <p className="font-semibold text-slate-700 dark:text-slate-300">
                No matching results found
              </p>
              <p className="mt-1">Try searching by doctor name, specialty, or patient diagnosis.</p>
            </div>
          ) : (
            items.map((item, index) => {
              const Icon = item.icon;
              const isSelected = index === activeIndex;
              return (
                <div
                  key={item.id}
                  onClick={item.onSelect}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`group flex items-center justify-between rounded-xl px-3 py-2.5 cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-blue-50 text-blue-900 dark:bg-blue-950/60 dark:text-blue-100"
                      : "text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                        isSelected
                          ? "bg-blue-600 text-white shadow-xs"
                          : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-xs font-bold">{item.title}</span>
                        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                          {item.category}
                        </span>
                      </div>
                      {item.subtitle && (
                        <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    {item.badge && (
                      <Badge
                        variant={
                          item.category === "Patients"
                            ? getConditionBadgeVariant(item.badge)
                            : "default"
                        }
                        className="text-[10px]"
                      >
                        {item.badge}
                      </Badge>
                    )}
                    <ArrowRight
                      className={`h-3.5 w-3.5 transition-transform ${
                        isSelected ? "translate-x-0.5 text-blue-600 dark:text-blue-400" : "opacity-0"
                      }`}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer with keyboard navigation cues */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/70 px-4 py-2.5 text-[11px] text-slate-500 dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-400">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <kbd className="rounded border border-slate-200 bg-white px-1 font-mono text-[10px] dark:border-slate-700 dark:bg-slate-800">
                ↑
              </kbd>
              <kbd className="rounded border border-slate-200 bg-white px-1 font-mono text-[10px] dark:border-slate-700 dark:bg-slate-800">
                ↓
              </kbd>
              <span>Navigate</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="rounded border border-slate-200 bg-white px-1.5 font-mono text-[10px] dark:border-slate-700 dark:bg-slate-800">
                ↵
              </kbd>
              <span>Select</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="rounded border border-slate-200 bg-white px-1 font-mono text-[10px] dark:border-slate-700 dark:bg-slate-800">
                ESC
              </kbd>
              <span>Close</span>
            </span>
          </div>

          <div className="flex items-center gap-1 text-[10px] font-medium text-slate-400">
            <Command className="h-3 w-3" />
            <span>Doctor Tracker Command Menu</span>
          </div>
        </div>
      </div>
    </div>
  );
}
