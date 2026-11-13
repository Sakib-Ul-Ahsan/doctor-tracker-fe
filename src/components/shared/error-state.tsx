import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Unable to load clinical records",
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-rose-200/90 bg-rose-50/50 px-6 py-12 text-center">
      <div className="mb-3.5 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 shadow-2xs">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <h3 className="text-sm font-bold text-slate-900">{title}</h3>
      <p className="mt-1.5 max-w-md text-xs leading-relaxed text-slate-600 font-medium">
        {message}
      </p>
      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-5 gap-2 bg-white">
          <RefreshCw className="h-3.5 w-3.5" />
          Retry Request
        </Button>
      ) : null}
    </div>
  );
}
