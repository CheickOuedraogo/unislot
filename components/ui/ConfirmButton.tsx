"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "./Icon";
import { Modal } from "./Modal";
import { Button } from "./Button";
import type { ActionResult } from "@/lib/actions/auth";

type ConfirmButtonProps = {
  action: () => Promise<ActionResult>;
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  children?: React.ReactNode;
  icon?: string;
  className?: string;
  ariaLabel?: string;
  onSuccess?: () => void;
  redirectTo?: string;
};

export function ConfirmButton({
  action,
  title,
  message,
  confirmLabel = "Confirmer",
  children,
  icon = "delete",
  className = "",
  ariaLabel,
  onSuccess,
  redirectTo,
}: ConfirmButtonProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const run = () => {
    startTransition(async () => {
      const res = await action();
      if (res?.error) {
        setError(res.error);
      } else {
        setOpen(false);
        setError(null);
        onSuccess?.();
        if (redirectTo) router.push(redirectTo);
        else router.refresh();
      }
    });
  };

  return (
    <>
      <button
        type="button"
        aria-label={ariaLabel}
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
        className={`inline-flex items-center gap-1 rounded p-1.5 text-secondary hover:text-error hover:bg-error-container transition-colors active:scale-95 ${className}`}
      >
        <Icon name={icon} size={16} />
        {children}
      </button>

      {open && (
        <Modal
          title={title}
          onClose={() => setOpen(false)}
          footer={
            <>
              <Button
                variant="secondary"
                onClick={() => setOpen(false)}
                disabled={pending}
              >
                Annuler
              </Button>
              <Button type="submit" form="confirm-modal-form" variant="dangerSolid" disabled={pending}>
                {pending ? "Suppression…" : confirmLabel}
              </Button>
            </>
          }
        >
          <form id="confirm-modal-form" onSubmit={(e) => { e.preventDefault(); run(); }}>
            <div className="flex flex-col gap-4">
              <p className="font-body-sm text-body-sm text-secondary">{message}</p>
              {error && (
                <p className="font-body-sm text-body-sm text-error">{error}</p>
              )}
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}