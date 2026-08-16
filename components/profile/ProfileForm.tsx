"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Field, inputClassLg } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { updatePassword, updateProfile } from "@/lib/actions/auth";
import type { ActionResult } from "@/lib/actions/auth";
import type { Role } from "@/lib/types";
import { ROLE_LABELS } from "@/lib/constants";

export function ProfileForm({
  firstName,
  lastName,
  email,
  role,
}: {
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
}) {
  const [profileState, profileAction, profilePending] = useActionState<
    ActionResult,
    FormData
  >(updateProfile, {});

  const [passwordState, passwordAction, passwordPending] = useActionState<
    ActionResult,
    FormData
  >(updatePassword, {});

  return (
    <div className="grid gap-6 lg:grid-cols-2 items-start">
      <form
        action={profileAction}
        className="flex flex-col gap-4 border border-outline-variant rounded-xl bg-surface-container-lowest p-5"
      >
        <h2 className="font-title-md text-title-md text-on-surface">
          Informations personnelles
        </h2>
        <Alert state={profileState} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Prénom">
            <input
              name="firstName"
              type="text"
              required
              defaultValue={firstName}
              className={inputClassLg}
            />
          </Field>
          <Field label="Nom">
            <input
              name="lastName"
              type="text"
              required
              defaultValue={lastName}
              className={inputClassLg}
            />
          </Field>
        </div>
        <Field label="Email">
          <input
            type="email"
            value={email}
            disabled
            className={`${inputClassLg} opacity-60`}
          />
        </Field>
        <div>
          <label className="block font-label-caps text-label-caps text-secondary mb-1">
            Rôle
          </label>
          <span className="inline-flex items-center gap-2 font-body-sm text-body-sm text-secondary">
            <Icon name="badge" size={16} />
            {ROLE_LABELS[role]}
          </span>
        </div>
        <div>
          <Button type="submit" disabled={profilePending}>
            {profilePending ? "Enregistrement…" : "Enregistrer les modifications"}
          </Button>
        </div>
      </form>

      <form
        action={passwordAction}
        className="flex flex-col gap-4 border border-outline-variant rounded-xl bg-surface-container-lowest p-5"
      >
        <h2 className="font-title-md text-title-md text-on-surface">
          Mot de passe
        </h2>
        <Alert state={passwordState} />
        <Field label="Mot de passe actuel">
          <input
            name="current"
            type="password"
            required
            autoComplete="current-password"
            className={inputClassLg}
          />
        </Field>
        <Field label="Nouveau mot de passe (min. 8 caractères)">
          <input
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className={inputClassLg}
          />
        </Field>
        <Field label="Confirmer le nouveau mot de passe">
          <input
            name="confirm"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className={inputClassLg}
          />
        </Field>
        <div>
          <Button type="submit" disabled={passwordPending}>
            {passwordPending ? "Enregistrement…" : "Changer le mot de passe"}
          </Button>
        </div>
      </form>
    </div>
  );
}
