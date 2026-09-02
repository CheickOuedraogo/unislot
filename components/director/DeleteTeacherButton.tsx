"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { deleteTeacher } from "@/lib/actions/auth";
import type { ActionResult } from "@/lib/actions/auth";

export function DeleteTeacherButton({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const confirm = () => {
    startTransition(async () => {
      const res: ActionResult = await deleteTeacher(id);
      if (res?.error) {
        setError(res.error);
      } else {
        router.push("/director/teachers");
      }
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
        className="inline-flex items-center gap-2 rounded-lg px-4 py-2 font-body-sm text-body-sm font-medium border border-error text-error hover:bg-error hover:text-on-error transition-all active:scale-95"
      >
        <Icon name="delete" size={18} />
        Supprimer cet enseignant
      </button>

      {open && (
        <Modal
          title="Supprimer l'enseignant"
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
              <Button variant="dangerSolid" onClick={confirm} disabled={pending}>
                {pending ? "Suppression…" : "Supprimer"}
              </Button>
            </>
          }
        >
          <div className="flex flex-col gap-4">
            <p className="font-body-sm text-body-sm text-secondary">
              Supprimer définitivement <strong>{name}</strong> ainsi que toutes ses
              données associées ? Cette action est irréversible.
            </p>
            {error && (
              <p className="font-body-sm text-body-sm text-error">{error}</p>
            )}
          </div>
        </Modal>
      )}
    </>
  );
}