"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { setTeacherActive } from "@/lib/actions/auth";
import type { ActionResult } from "@/lib/actions/auth";

type TeacherStatusButtonProps = {
  id: string;
  isActive: boolean;
};

export function TeacherStatusButton({
  id,
  isActive,
}: TeacherStatusButtonProps) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const run = () => {
    if (isActive && !confirming) {
      setConfirming(true);
      return;
    }
    startTransition(async () => {
      const res: ActionResult = await setTeacherActive(id, !isActive);
      if (res?.error) {
        setError(res.error);
        setConfirming(false);
      } else {
        setError(null);
        setConfirming(false);
        router.refresh();
      }
    });
  };

  if (isActive) {
    return (
      <span className="inline-flex items-center gap-2">
        {error && (
          <span className="font-body-sm text-body-sm text-error">{error}</span>
        )}
        <button
          type="button"
          onClick={run}
          disabled={pending}
          className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 font-body-sm text-body-sm text-on-error bg-error hover:brightness-110 transition-all active:scale-95 disabled:opacity-50"
        >
          <Icon name={confirming ? "check" : "block"} size={16} />
          {confirming ? "Confirmer" : "Désactiver"}
        </button>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2">
      {error && (
        <span className="font-body-sm text-body-sm text-error">{error}</span>
      )}
      <button
        type="button"
        onClick={run}
        disabled={pending}
        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 font-body-sm text-body-sm text-on-success bg-success hover:brightness-110 transition-all active:scale-95 disabled:opacity-50"
      >
        <Icon name="person_check" size={16} />
        {pending ? "Enregistrement…" : "Activer"}
      </button>
    </span>
  );
}
