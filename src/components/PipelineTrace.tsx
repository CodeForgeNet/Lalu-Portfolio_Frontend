import { CheckCircle2, Loader2 } from "lucide-react";
export type TraceStep = {
  id: string;
  label: string;
  status: "complete" | "skipped" | "pending" | "running" | "failed";
  durationMs?: number;
};
export type TraceData = {
  steps: TraceStep[];
  totalDurationMs?: number;
  isCached?: boolean;
};
export default function PipelineTrace({
  trace,
  isLoading,
}: {
  trace: TraceData | null;
  isLoading?: boolean;
}) {
  if (!trace?.steps.length)
    return isLoading ? (
      <p className="chat-status" role="status">
        Waiting for the server…
      </p>
    ) : null;
  return (
    <details className="border border-border p-3 mb-4">
      <summary className="text-xs text-text-muted">
        Execution trace ·{" "}
        {trace.isCached
          ? "cached response"
          : `${trace.steps.length} reported stages`}
      </summary>
      <ol className="list-none p-0 mt-3 flex flex-col gap-2">
        {trace.steps.map((step) => (
          <li
            key={step.id}
            className="flex items-center justify-between gap-3 text-xs"
          >
            <span className="flex gap-2 items-center">
              {step.status === "complete" ? (
                <CheckCircle2 size={13} aria-hidden="true" />
              ) : step.status === "running" ? (
                <Loader2
                  size={13}
                  className="animate-spin"
                  aria-hidden="true"
                />
              ) : null}
              {step.label}
            </span>
            <span className="text-text-muted">
              {step.status}
              {step.durationMs !== undefined ? ` · ${step.durationMs} ms` : ""}
            </span>
          </li>
        ))}
      </ol>
    </details>
  );
}
