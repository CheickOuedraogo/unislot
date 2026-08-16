"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { inputClassLg } from "@/components/ui/Field";
import { createTeacherAccount } from "@/lib/actions/auth";
import type { ActionResult } from "@/lib/actions/auth";
import { DEFAULT_TEACHER_PASSWORD } from "@/lib/constants";

export function CreateTeacherForm() {
  const [state, action, pending] = useActionState<ActionResult, FormData>(
    createTeacherAccount,
    {}
  );

  return (
    <form
      action={action}
      className="flex flex-col gap-4 border border-outline-variant rounded-xl bg-surface-container-lowest p-5"
    >
      <h2 className="font-title-md text-title-md text-on-surface">
        Nouvel enseignant
      </h2>
      <Alert state={state} />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-4">
          <input
            name="firstName"
            type="text"
            required
            placeholder="Prénom"
            className={inputClassLg}
          />
          <input
            name="lastName"
            type="text"
            required
            placeholder="Nom"
            className={inputClassLg}
          />
        </div>
        <input
          name="email"
          type="email"
          required
          placeholder="Adresse email"
          className={inputClassLg}
        />
      </div>
      <div className="flex items-center gap-4">
        <Button disabled={pending}>
          {pending ? "Création…" : "Créer le compte"}
        </Button>
        <span className="font-body-sm text-body-sm text-secondary">
          Mot de passe par défaut : <strong>{DEFAULT_TEACHER_PASSWORD}</strong>
        </span>
      </div>
    </form>
  );
}
