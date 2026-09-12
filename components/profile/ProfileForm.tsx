"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/ActionButton";
import { Alert } from "@/components/ui/Alert";
import { Field, inputClassLg } from "@/components/ui/Field";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Icon } from "@/components/ui/Icon";
import { updatePassword, updateProfile } from "@/lib/actions/auth";
import type { ActionResult } from "@/lib/actions/auth";
import type { Role } from "@/lib/types";
import { ROLE_LABELS } from "@/lib/constants";

export function ProfileForm({
  firstName,
  lastName,
  role,
}: {
  firstName: string;
  lastName: string;
  role: Role;
}) {
  const [state, action, pending] = useActionState<ActionResult, FormData>(
    async (prev, formData) => {
      const profileResult = await updateProfile(prev, formData);
      if (profileResult.error) return profileResult;

      const password = String(formData.get("password") ?? "");
      const confirm = String(formData.get("confirm") ?? "");
      if (password || confirm) {
        const passwordResult = await updatePassword({}, formData);
        if (passwordResult.error) return passwordResult;
        return { success: "Profil et mot de passe mis à jour." };
      }
      return profileResult;
    },
    {}
  );

  return (
    <form
      action={action}
      className="flex flex-col gap-4 border border-outline-variant rounded-xl bg-surface-container-lowest p-5 max-w-2xl"
    >
      <h2 className="font-title-md text-title-md text-on-surface">
        Mon profil
      </h2>
      <Alert state={state} />
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
      <div>
        <span className="block font-label-caps text-label-caps text-secondary mb-1">
          Rôle
        </span>
        <span className="inline-flex items-center gap-2 font-body-sm text-body-sm text-secondary">
          <Icon name="badge" size={16} />
          {ROLE_LABELS[role]}
        </span>
      </div>
      <hr className="border-outline-variant" />
      <Field label="Nouveau mot de passe (min. 8 caractères)">
        <PasswordInput
          name="password"
          minLength={8}
          autoComplete="new-password"
          placeholder="Laisser vide pour conserver"
        />
      </Field>
      <Field label="Confirmer le nouveau mot de passe">
        <PasswordInput
          name="confirm"
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
