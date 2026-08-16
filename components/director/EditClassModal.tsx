"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { EditModal } from "@/components/director/EditModal";
import { Field, inputClassLg } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { updateClass } from "@/lib/actions/classes";
import type { ActionResult } from "@/lib/actions/auth";
import type { SchoolClass } from "@/lib/types";

export function EditClassModal({ schoolClass }: { schoolClass: SchoolClass }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(schoolClass.name);
  const [level, setLevel] = useState(schoolClass.level);
  const [state, setState] = useState<ActionResult>({});
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const save = () => {
    startTransition(async () => {
      const res = await updateClass(schoolClass.id, name, level);
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
        aria-label={`Modifier ${schoolClass.name}`}
        title="Modifier"
        onClick={() => {
          setName(schoolClass.name);
          setLevel(schoolClass.level);
          setState({});
          setOpen(true);
        }}
        className="p-2 rounded-lg text-secondary hover:text-primary hover:bg-surface-container transition-colors"
      >
        <Icon name="edit" size={18} />
      </button>
      {open && (
        <EditModal
          title="Modifier la classe"
          onClose={() => setOpen(false)}
          onSave={save}
          pending={pending}
          error={state.error}
        >
          <Field label="Nom de la classe">
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClassLg}
            />
          </Field>
          <Field label="Niveau">
            <input
              type="text"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className={inputClassLg}
            />
          </Field>
        </EditModal>
      )}
    </>
  );
}
