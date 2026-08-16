"use client";

import { ConfirmButton } from "@/components/ui/ConfirmButton";
import type { ActionResult } from "@/lib/actions/auth";

type DeleteActionButtonProps = {
  id: string;
  action: (id: string) => Promise<ActionResult>;
  label?: string;
  confirmText?: string;
};

export function DeleteActionButton({
  id,
  action,
  label,
  confirmText = "Confirmer la suppression",
}: DeleteActionButtonProps) {
  return (
    <ConfirmButton
      action={() => action(id)}
      confirmText={confirmText}
      aria-label={label}
    />
  );
}
