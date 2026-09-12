"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cancelSwapRequest } from "@/lib/actions/swaps";
import { Button } from "@/components/ui/ActionButton";
import type { SwapRequest } from "@/lib/types";
import { formatDayOfWeek, formatDayDate, isDayInPast } from "@/lib/utils";

const STATUS_BADGES: Record<SwapRequest["status"], { label: string; className: string }> = {
  pending: { label: "En attente", className: "bg-primary/10 text-primary" },
  approved: { label: "Acceptée", className: "bg-success/10 text-success" },
  rejected: { label: "Refusée", className: "bg-error/10 text-error" },
};

export function MySwapRequests({
  requests,
  weekStart,
}: {
  requests: SwapRequest[];
  weekStart?: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (requests.length === 0) {
    return (
      <p className="font-body-sm text-body-sm text-secondary">
        Vous n&apos;avez fait aucune demande. Cliquez sur le créneau d&apos;un autre
        professeur dans l&apos;emploi du temps pour en créer une.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {error && (
        <p className="font-body-sm text-body-sm text-error bg-error-container px-3 py-2 rounded">
          {error}
        </p>
      )}
      {requests.map((r) => {
        const badge = STATUS_BADGES[r.status];
        const past = isDayInPast(r.slot_day, weekStart ? new Date(`${weekStart}T00:00:00`) : undefined);
        return (
          <li
            key={r.id}
            className="card bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3"
          >
            <div className="min-w-0 flex-1">
              <p className="font-body-sm text-body-sm">
                <span className="font-semibold">{r.proposed_subject_name}</span> de{" "}
                <span className="font-semibold">
                  {r.proposed_start_time} à {r.proposed_end_time}
                </span>{" "}
                — {formatDayOfWeek(r.slot_day)}{" "}
                {formatDayDate(r.slot_day, weekStart ? new Date(`${weekStart}T00:00:00`) : undefined)}
              </p>
              <p className="font-label-caps text-label-caps text-secondary mt-1">
                Créneau « {r.slot_subject_name} » de {r.owner_name} · {r.class_name}
                {r.class_level ? ` (${r.class_level})` : ""}
              </p>
            </div>
            <span
              className={`inline-flex self-start px-2 py-0.5 rounded-md font-label-caps text-label-caps uppercase ${badge.className}`}
            >
              {badge.label}
            </span>
            {r.status === "pending" && !past && (
              <Button
                variant="danger"
                disabled={pending}
                onClick={() => {
                  setError(null);
                  startTransition(async () => {
                    const res = await cancelSwapRequest(r.id);
                    if (res.error) setError(res.error);
                    else router.refresh();
                  });
                }}
              >
                Annuler
              </Button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
