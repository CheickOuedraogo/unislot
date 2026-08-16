"use client";

import { useActionState } from "react";
import { changePassword, type ActionResult } from "@/lib/actions/auth";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Field, inputClass } from "@/components/ui/Field";

export function ChangePasswordForm() {
  const [state, action, pending] = useActionState<ActionResult, FormData>(
    changePassword,
    {}
  );

  return (
    <form action={action} className="flex flex-col gap-4">
      <Alert state={state} variant="soft" />
      <Field label="Mot de passe actuel">
        <input
          name="current"
          type="password"
          required
          autoComplete="current-password"
          className={inputClass}
        />
      </Field>
      <Field label="Nouveau mot de passe (min. 8 caractères)">
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className={inputClass}
        />
      </Field>
      <Field label="Confirmer le nouveau mot de passe">
        <input
          name="confirm"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className={inputClass}
        />
      </Field>
      <Button type="submit" disabled={pending} className="w-full justify-center">
        {pending ? "Enregistrement..." : "Changer le mot de passe"}
      </Button>
    </form>
  );
}
