"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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
      <span className="flex items-center gap-2">
        {error && (
          <span className="text-sm text-destructive">{error}</span>
        )}
        <Button
          type="button"
          variant="outline"
          onClick={run}
          disabled={pending}
          className="text-destructive hover:bg-destructive/10"
        >
          <Icon name={confirming ? "check" : "block"} size={16} />
          {confirming ? "Confirmer" : "Désactiver"}
        </Button>
      </span>
    );
  }

  return (
    <span className="flex items-center gap-2">
      {error && (
        <span className="text-sm text-destructive">{error}</span>
      )}
      <Button
        type="button"
        variant="outline"
        onClick={run}
        disabled={pending}
        className="text-success hover:bg-success/10"
      >
        <Icon name="person_check" size={16} />
        {pending ? "Enregistrement…" : "Activer"}
      </Button>
    </span>
  );
}