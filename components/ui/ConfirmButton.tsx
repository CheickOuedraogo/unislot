"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "./Icon";
import type { ActionResult } from "@/lib/actions/auth";

type ConfirmButtonProps = {
  action: () => Promise<ActionResult>;
  confirmText?: string;
  children?: React.ReactNode;
  icon?: string;
  className?: string;
};

export function ConfirmButton({
  action,
  confirmText = "Confirmer",
  children,
  icon = "delete",
  className = "",
}: ConfirmButtonProps) {
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
      const res = await action();
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

  return (
    <span className="inline-flex items-center gap-2">
      {error && <span className="font-body-sm text-body-sm text-error">{error}</span>}
      <button
        type="button"
        onClick={run}
        disabled={pending}
        className={`inline-flex items-center gap-1 rounded p-1.5 transition-colors active:scale-95 ${
          confirming
            ? "bg-error text-on-error"
            : "text-secondary hover:text-error hover:bg-error-container"
        } ${className}`}
      >
        <Icon name={confirming ? "check" : icon} size={16} />
        {confirming ? confirmText : children}
      </button>
    </span>
  );
}
