"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { EditModal } from "@/components/director/EditModal";
import { Field, inputClassLg } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { updateSubject } from "@/lib/actions/subjects";
import type { ActionResult } from "@/lib/actions/auth";
import type { Subject } from "@/lib/types";

export function EditSubjectModal({ subject }: { subject: Subject }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(subject.name);
  const [state, setState] = useState<ActionResult>({});
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const save = () => {
    startTransition(async () => {
      const res = await updateSubject(subject.id, name);
      setState(res);
      if (!res.error) {
        setOpen(false);
        router.refresh();
      }
    });
  };

  return (
    <>
      <button
        type="button"
        aria-label={`Modifier ${subject.name}`}
        title="Modifier"
        onClick={() => {
          setName(subject.name);
          setState({});
          setOpen(true);
        }}
        className="p-2 rounded-lg text-secondary hover:text-primary hover:bg-surface-container transition-colors"
      >
        <Icon name="edit" size={18} />
      </button>
      {open && (
        <EditModal
          title="Modifier la matière"
          onClose={() => setOpen(false)}
          onSave={save}
          pending={pending}
          error={state.error}
        >
          <Field label="Nom de la matière">
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClassLg}
            />
          </Field>
        </EditModal>
      )}
    </>
  );
}
