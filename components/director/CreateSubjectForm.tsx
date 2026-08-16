"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { inputClassLg } from "@/components/ui/Field";
import { createSubject } from "@/lib/actions/subjects";
import type { ActionResult } from "@/lib/actions/auth";

export function CreateSubjectForm() {
  const [state, action, pending] = useActionState<ActionResult, FormData>(
    createSubject,
    {}
  );

  return (
    <form
      action={action}
      className="flex flex-col gap-4 border border-outline-variant rounded-xl bg-surface-container-lowest p-5"
    >
      <h2 className="font-title-md text-title-md text-on-surface">
        Nouvelle matière
      </h2>
      <Alert state={state} />
      <div>
        <input
          name="name"
          type="text"
          required
          placeholder="Nom de la matière"
          className={inputClassLg}
        />
      </div>
      <div>
        <Button disabled={pending}>
          {pending ? "Création…" : "Créer la matière"}
        </Button>
      </div>
    </form>
  );
}
