"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { Button as ActionButton } from "@/components/ui/ActionButton";
import { Button } from "@/components/ui/button";
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
      <Button
        type="button"
        variant="outline"
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
        className="text-destructive hover:bg-destructive/10"
      >
        <Icon name="delete" size={16} />
        Supprimer cet enseignant
      </Button>

      {open && (
        <Modal
          title="Supprimer l'enseignant"
          onClose={() => setOpen(false)}
          footer={
            <>
              <ActionButton
                variant="secondary"
                onClick={() => setOpen(false)}
                disabled={pending}
              >
                Annuler
              </ActionButton>
              <ActionButton variant="dangerSolid" onClick={confirm} disabled={pending}>
                {pending ? "Suppression…" : "Supprimer"}
              </ActionButton>
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