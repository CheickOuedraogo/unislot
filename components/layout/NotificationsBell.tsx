"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import {
  approveSwapRequest,
  getPendingSwapRequests,
  rejectSwapRequest,
} from "@/lib/actions/swaps";
import type { SwapRequest } from "@/lib/types";
import { formatDayOfWeek, formatTime } from "@/lib/utils";

export function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const [requests, setRequests] = useState<SwapRequest[]>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const load = useCallback(async () => {
    try {
      setRequests(await getPendingSwapRequests());
      setError(null);
    } catch {
      setRequests([]);
    }
  }, []);

  useEffect(() => {
    let active = true;
    getPendingSwapRequests()
      .then((requests) => {
        if (active) {
          setRequests(requests);
          setError(null);
        }
      })
      .catch(() => {
        if (active) setRequests([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const decide = async (
    action: (id: string) => Promise<{ error?: string }>,
    id: string
  ) => {
    const res = await action(id);
    if (res.error) {
      setError(res.error);
    } else {
      await load();
      router.refresh();
    }
  };

  return (
    <div className="relative">
      <button
        aria-label="Notifications"
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 text-secondary hover:text-primary transition-colors hover:bg-surface-container rounded-full"
      >
        <Icon name="notifications" fill />
        {requests.length > 0 && (
          <span className="absolute top-0 right-0 bg-error text-on-error text-[10px] font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center">
            {requests.length}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-[22rem] bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg z-50 p-3 flex flex-col gap-2 max-h-[70vh] overflow-y-auto">
          <h3 className="font-label-caps text-label-caps text-secondary uppercase tracking-wider">
            Demandes d&apos;urgence
          </h3>
          {error && (
            <p className="font-body-sm text-body-sm text-error bg-error-container px-2 py-1 rounded">
              {error}
            </p>
          )}
          {requests.length === 0 && (
            <p className="font-body-sm text-body-sm text-secondary">
              Aucune demande en attente.
            </p>
          )}
          {requests.map((r) => (
            <div
              key={r.id}
              className="border border-outline-variant rounded-lg p-3 flex flex-col gap-2"
            >
              <p className="font-body-sm text-body-sm">
                <span className="font-semibold">{r.requesting_teacher_name}</span>{" "}
                propose la matière{" "}
                <span className="font-semibold">{r.proposed_subject_name}</span>{" "}
                pour le créneau{" "}
                <span className="font-semibold">{r.slot_subject_name}</span> (
                {formatDayOfWeek(r.slot_day)} {formatTime(r.slot_start)} -{" "}
                {formatTime(r.slot_end)}).
              </p>
              {r.message && (
                <p className="font-body-sm text-body-sm text-secondary italic">
                  « {r.message} »
                </p>
              )}
              <div className="flex gap-2 mt-1">
                <Button
                  className="flex-1"
                  onClick={() => decide(approveSwapRequest, r.id)}
                >
                  Accepter
                </Button>
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => decide(rejectSwapRequest, r.id)}
                >
                  Refuser
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
