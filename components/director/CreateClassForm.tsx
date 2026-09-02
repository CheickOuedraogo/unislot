"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Field, inputClassLg } from "@/components/ui/Field";
import { createClass } from "@/lib/actions/classes";
import type { ActionResult } from "@/lib/actions/auth";

export function CreateClassForm() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [state, setState] = useState<ActionResult>({});
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const submit = () => {
    startTransition(async () => {
      const res = await createClass(name);
      setState(res);
      if (!res.error) {
        setOpen(false);
        setName("");
        router.refresh();
      }
    });
  };

  return (
    <>
      <div>
        <Button icon="add" onClick={() => setOpen(true)}>
          Ajouter une classe
        </Button>
      </div>
      {open && (
        <Modal
          title="Nouvelle classe"
          onClose={() => setOpen(false)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setOpen(false)}>
                Annuler
              </Button>
              <Button onClick={submit} disabled={pending}>
                {pending ? "Création…" : "Créer la classe"}
              </Button>
            </>
          }
        >
          <Alert state={state} />
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
            className="flex flex-col gap-4"
          >
            <Field label="Nom de la classe">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex. Mathe L1"
                className={inputClassLg}
              />
            </Field>
          </form>
        </Modal>
      )}
    </>
  );
}