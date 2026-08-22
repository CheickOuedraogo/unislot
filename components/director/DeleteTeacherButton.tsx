"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { deleteTeacher } from "@/lib/actions/auth";
import type { ActionResult } from "@/lib/actions/auth";

export function DeleteTeacherButton({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const run = () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    startTransition(async () => {
      const res: ActionResult = await deleteTeacher(id);
      if (res?.error) {
        setError(res.error);
        setConfirming(false);
      } else {
        router.push("/director/teachers");
      }
    });
  };

  return (
    <div className="flex flex-col items-start gap-2">
      {error && (
        <p className="font-body-sm text-body-sm text-error">{error}</p>
      )}
      <button
        type="button"
        onClick={run}
        disabled={pending}
        className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 font-body-sm text-body-sm font-medium transition-all active:scale-95 disabled:opacity-50 ${
          confirming
            ? "bg-error text-on-error"
            : "border border-error text-error hover:bg-error hover:text-on-error"
        }`}
      >
        <Icon name={confirming ? "check" : "delete"} size={18} />
        {confirming ? "Confirmer la suppression" : "Supprimer cet enseignant"}
      </button>
      {confirming && (
        <p className="font-body-sm text-body-sm text-secondary">
          Supprimer définitivement {name} et toutes ses données associées ?
        </p>
      )}
    </div>
  );
}
