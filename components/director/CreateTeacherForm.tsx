"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Field, inputClassLg } from "@/components/ui/Field";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { createTeacherAccount } from "@/lib/actions/auth";
import type { ActionResult } from "@/lib/actions/auth";

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
          <Field label="Nom">
            <input
              name="lastName"
              type="text"
              required
              placeholder="Dr. Ouedraogo"
              className={inputClassLg}
            />
          </Field>
          <Field label="Prénom">
            <input
              name="firstName"
              type="text"
              required
              placeholder="Paul"
              className={inputClassLg}
            />
          </Field>
        </div>
        <div className="grid gap-4">
          <Field label="Adresse email">
            <input
              name="email"
              type="email"
              required
              placeholder="Ex. paul@ujkz.com"
              className={inputClassLg}
            />
          </Field>
          <Field label="Mot de passe (min. 8 caractères)">
            <PasswordInput
              name="password"
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="Choisir un mot de passe"
            />
          </Field>
        </div>
      </div>
      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Création…" : "Créer le compte"}
        </Button>
      </div>
    </form>
  );
}
