"use client";

import { useActionState } from "react";
import { login, type ActionResult } from "@/lib/actions/auth";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Field, inputClass } from "@/components/ui/Field";
import { PasswordInput } from "@/components/ui/PasswordInput";

export function LoginForm() {
  const [state, action, pending] = useActionState<ActionResult, FormData>(
    login,
    {}
  );

  return (
    <form action={action} className="flex flex-col gap-4">
      <Alert state={state} variant="soft" />
      <Field label="Email">
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className={inputClass}
        />
      </Field>
      <Field label="Mot de passe">
        <PasswordInput
          name="password"
          required
          autoComplete="current-password"
          inputClassName={inputClass}
        />
      </Field>
      <Button type="submit" disabled={pending} className="w-full justify-center">
        {pending ? "Connexion..." : "Se connecter"}
      </Button>
    </form>
  );
}
