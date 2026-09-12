"use client";

import { ConfirmButton } from "@/components/ui/ConfirmButton";
import type { ActionResult } from "@/lib/actions/auth";

type DeleteActionButtonProps = {
  id: string;
  name: string;
  action: (id: string) => Promise<ActionResult>;
  label?: string;
  redirectTo?: string;
};

export function DeleteActionButton({
  id,
  name,
  action,
  label,
  redirectTo,
}: DeleteActionButtonProps) {
  return (
    <ConfirmButton
      action={() => action(id)}
      title="Supprimer la classe"
      message={
        <>
          Supprimer définitivement la classe <strong>{name}</strong> ainsi que son
          emploi du temps, ses matières et tous les enseignements associés ?
        </>
      }
      confirmLabel="Supprimer"
      ariaLabel={label}
      redirectTo={redirectTo}
    />
  );
}