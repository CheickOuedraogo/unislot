"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Field, inputClassLg } from "@/components/ui/Field";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { updateTeacherAccount, updateTeacherPassword } from "@/lib/actions/auth";
import type { ActionResult } from "@/lib/actions/auth";

export function EditTeacherForm({
  userId,
  firstName,
  lastName,
  email,
}: {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
}) {
  const [state, action, pending] = useActionState<ActionResult, FormData>(
    async (prev, formData) => {
      const accountResult = await updateTeacherAccount(prev, formData);
      if (accountResult.error) return accountResult;

      const password = String(formData.get("password") ?? "");
      if (password) {
        const passwordResult = await updateTeacherPassword({}, formData);
        if (passwordResult.error) return passwordResult;
        return { success: "Informations et mot de passe mis à jour." };
      }
      return accountResult;
    },
    {}
  );

  return (
    <form
      action={action}
      className="flex flex-col gap-4 border border-outline-variant rounded-xl bg-surface-container-lowest p-5"
    >
      <h2 className="font-title-md text-title-md text-on-surface">
        Modifier les informations
      </h2>
      <Alert state={state} />
      <input type="hidden" name="userId" value={userId} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nom">
          <input
            name="lastName"
            type="text"
            required
            defaultValue={lastName}
            className={inputClassLg}
          />
        </Field>
        <Field label="Prénom">
          <input
            name="firstName"
            type="text"
            required
            defaultValue={firstName}
            className={inputClassLg}
          />
        </Field>
      </div>
      <Field label="Adresse email">
        <input
          name="email"
          type="email"
          required
          defaultValue={email}
          className={inputClassLg}
        />
      </Field>
      <Field label="Nouveau mot de passe (min. 8 caractères)">
        <PasswordInput
          name="password"
          minLength={8}
          autoComplete="new-password"
          placeholder="Laisser vide pour conserver"
        />
      </Field>
      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Enregistrement…" : "Enregistrer les modifications"}
        </Button>
      </div>
    </form>
  );
}
