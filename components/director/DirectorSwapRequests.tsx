"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  approveSwapRequest,
  rejectSwapRequest,
  type RemainderChoice,
} from "@/lib/actions/swaps";
import { Button } from "@/components/ui/ActionButton";
import type { SwapRequest } from "@/lib/types";
import {
  formatDayOfWeek,
  formatDayDate,
  isDayInPast,
} from "@/lib/utils";

export type DaySlots = {
  day: number;
  slots: {
    id: string;
    subjectName: string;
    ownerName: string;
    startTime: string;
    endTime: string;
  }[];
};

type Props = {
  requests: SwapRequest[];
  daySlotsByClass: Record<string, Record<number, DaySlots>>;
  weekStart?: string;
};

const toMin = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

function DayTimeline({
  daySlots,
  request,
  weekStart,
}: {
  daySlots?: DaySlots;
  request: SwapRequest;
  weekStart?: string;
}) {
  const items = useMemo(() => {
    if (!daySlots) return [];
    return daySlots.slots.filter((s) => s.id !== request.slot_id);
  }, [daySlots, request.slot_id]);

  const window = useMemo(() => {
    const bounds = [
      ...items.map((s) => toMin(s.startTime)),
      ...items.map((s) => toMin(s.endTime)),
      toMin(request.proposed_start_time),
      toMin(request.proposed_end_time),
      toMin(request.slot_start),
      toMin(request.slot_end),
    ];
    const min = Math.min(...bounds);
    const max = Math.max(...bounds);
    const pad = 30;
    return { start: min - pad, end: max + pad };
  }, [items, request]);

  const pct = (t: string) =>
    ((toMin(t) - window.start) / (window.end - window.start)) * 100;

  if (!daySlots) return null;

  return (
    <div className="flex flex-col gap-1.5 rounded-lg bg-surface-container-low p-3">
      <span className="font-label-caps text-label-caps text-secondary uppercase">
        Journée — {formatDayOfWeek(request.slot_day)}{" "}
        {formatDayDate(request.slot_day, weekStart ? new Date(`${weekStart}T00:00:00`) : undefined)}
      </span>
      <div className="relative h-14">
        {/* Créneaux existants */}
        {items.map((s) => (
          <div
            key={s.id}
            className="absolute h-7 top-0 bg-surface-variant border border-outline-variant rounded-md px-2 flex items-center overflow-hidden"
            style={{ left: `${pct(s.startTime)}%`, width: `${pct(s.endTime) - pct(s.startTime)}%` }}
          >
            <span className="font-label-caps text-[10px] text-on-surface-variant truncate">
              {s.subjectName} · {s.ownerName}
            </span>
          </div>
        ))}
        {/* Créneau ciblé */}
        <div
          className="absolute bottom-0 h-6 bg-error/20 border-2 border-dashed border-error rounded-md px-2 flex items-center overflow-hidden"
          style={{
            left: `${pct(request.slot_start)}%`,
            width: `${pct(request.slot_end) - pct(request.slot_start)}%`,
          }}
        >
          <span className="font-label-caps text-[10px] text-error truncate">
            {request.slot_subject_name} · {request.owner_name}
          </span>
        </div>
        {/* Plage demandée */}
        <div
          className="absolute -bottom-1.5 h-2 rounded-full bg-primary"
          style={{
            left: `${pct(request.proposed_start_time)}%`,
            width: `${pct(request.proposed_end_time) - pct(request.proposed_start_time)}%`,
          }}
        />
      </div>
    </div>
  );
}

function RequestCard({ request, daySlots, weekStart }: { request: SwapRequest; daySlots?: DaySlots; weekStart?: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const past = isDayInPast(
    request.slot_day,
    weekStart ? new Date(`${weekStart}T00:00:00`) : undefined
  );

  // Segments que le prof d'origine pourrait garder.
  const before =
    request.proposed_start_time > request.slot_start
      ? [request.slot_start, request.proposed_start_time]
      : null;
  const after =
    request.proposed_end_time < request.slot_end
      ? [request.proposed_end_time, request.slot_end]
      : null;

  const options = useMemo(() => {
    const list: { value: RemainderChoice; label: string; minutes: number }[] = [];
    if (before)
      list.push({
        value: "before",
        label: `${request.owner_name} garde ${before[0]} - ${before[1]}`,
        minutes: toMin(before[1]) - toMin(before[0]),
      });
    if (after)
      list.push({
        value: "after",
        label: `${request.owner_name} garde ${after[0]} - ${after[1]}`,
        minutes: toMin(after[1]) - toMin(after[0]),
      });
    list.push({ value: "none", label: `${request.owner_name} ne garde rien`, minutes: 0 });
    return list.sort((a, b) => b.minutes - a.minutes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request.id]);

  const [remainder, setRemainder] = useState<RemainderChoice>(options[0].value);

  const act = (action: () => Promise<{ error?: string }>) => {
    setError(null);
    startTransition(async () => {
      const res = await action();
      if (res.error) setError(res.error);
      else router.refresh();
    });
  };

  return (
    <article className="card bg-surface-container-lowest border border-outline-variant rounded-xl p-5 flex flex-col gap-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-body-sm text-body-sm">
            <span className="font-semibold">{request.requesting_teacher_name}</span>{" "}
            demande <span className="font-semibold">{request.proposed_subject_name}</span> de{" "}
            <span className="font-semibold">
              {request.proposed_start_time} à {request.proposed_end_time}
            </span>
          </p>
          <p className="font-label-caps text-label-caps text-secondary mt-1">
            Sur le créneau « {request.slot_subject_name} » de{" "}
            {request.owner_name} ({request.slot_start} - {request.slot_end}) ·{" "}
            {request.class_name}
            {request.class_level ? ` (${request.class_level})` : ""} ·{" "}
            {formatDayOfWeek(request.slot_day)}{" "}
            {formatDayDate(request.slot_day, weekStart ? new Date(`${weekStart}T00:00:00`) : undefined)}
          </p>
        </div>
        <span
          className={`inline-flex self-start px-2 py-0.5 rounded-md font-label-caps text-label-caps uppercase ${
            request.status === "approved"
              ? "bg-success/10 text-success"
              : request.status === "rejected"
                ? "bg-error/10 text-error"
                : "bg-primary/10 text-primary"
          }`}
        >
          {request.status === "approved"
            ? "Acceptée"
            : request.status === "rejected"
              ? "Refusée"
              : "En attente"}
        </span>
      </header>

      <DayTimeline daySlots={daySlots} request={request} weekStart={weekStart} />

      {request.message && (
        <p className="font-body-sm text-body-sm text-secondary italic">
          « {request.message} »
        </p>
      )}

      {error && (
        <p className="font-body-sm text-body-sm text-error bg-error-container px-3 py-2 rounded">
          {error}
        </p>
      )}

      {past ? (
        <p className="font-body-sm text-body-sm text-secondary">
          Cette demande concerne un jour déjà passé, elle ne peut plus être traitée.
        </p>
      ) : (
      <footer className="flex flex-col gap-3">
        {(before || after) && (
          <fieldset className="flex flex-col gap-1.5">
            <legend className="font-label-caps text-label-caps text-secondary mb-1">
              Répartition du créneau lors de l&apos;approbation
            </legend>
            {options.map((opt) => (
              <label
                key={opt.value}
                className="inline-flex items-center gap-2 font-body-sm text-body-sm text-on-surface cursor-pointer rounded-lg hover:bg-surface-container-low px-2 py-1"
              >
                <input
                  type="radio"
                  name={`remainder-${request.id}`}
                  checked={remainder === opt.value}
                  onChange={() => setRemainder(opt.value)}
                />
                {opt.label}
              </label>
            ))}
          </fieldset>
        )}
        <div className="flex gap-2 justify-end">
          <Button variant="secondary" disabled={pending} onClick={() => act(() => rejectSwapRequest(request.id))}>
            Refuser
          </Button>
          <Button disabled={pending} onClick={() => act(() => approveSwapRequest(request.id, remainder))}>
            {pending ? "Traitement…" : "Accepter"}
          </Button>
        </div>
      </footer>
      )}
    </article>
  );
}

export function DirectorSwapRequests({ requests, daySlotsByClass, weekStart }: Props) {
  const [tab, setTab] = useState<"pending" | "history">("pending");

  const daysPast = (r: SwapRequest) =>
    isDayInPast(r.slot_day, weekStart ? new Date(`${weekStart}T00:00:00`) : undefined);
  const pending = requests.filter((r) => r.status === "pending" && !daysPast(r));
  const history = requests.filter((r) => r.status !== "pending" || daysPast(r));
  const shown = tab === "pending" ? pending : history;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center gap-1 p-1 bg-surface-container-lowest border border-outline-variant rounded-lg w-fit">
        {(
          [
            ["pending", `En attente (${pending.length})`],
            ["history", `Historique (${history.length})`],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            className={`px-3 py-1.5 rounded-md font-body-sm text-body-sm transition-colors ${
              tab === value
                ? "bg-primary text-on-primary"
                : "text-secondary hover:text-on-surface hover:bg-surface-container"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="font-body-sm text-body-sm text-secondary">
          {tab === "pending"
            ? "Aucune demande en attente."
            : "Aucune demande traitée pour le moment."}
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {shown.map((r) => (
            <RequestCard
              key={r.id}
              request={r}
              weekStart={weekStart}
              daySlots={
                r.status === "pending"
                  ? daySlotsByClass[r.class_name]?.[r.slot_day]
                  : undefined
              }
            />
          ))}
        </div>
      )}
    </section>
  );
}
