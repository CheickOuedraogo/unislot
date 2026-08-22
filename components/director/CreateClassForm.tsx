"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { inputClassLg } from "@/components/ui/Field";
import { createClass } from "@/lib/actions/classes";
import type { ActionResult } from "@/lib/actions/auth";
import { LEVELS } from "@/lib/constants";

export function CreateClassForm() {
  const [state, action, pending] = useActionState<ActionResult, FormData>(
    createClass,
    {}
  );

  return (
    <form
      action={action}
      className="flex flex-col gap-4 border border-outline-variant rounded-xl bg-surface-container-lowest p-5"
    >
      <h2 className="font-title-md text-title-md text-on-surface">
        Nouvelle classe
      </h2>
      <Alert state={state} />
      <div className="grid gap-4 md:grid-cols-2">
        <input
          name="name"
          type="text"
          required
          placeholder="Nom de la classe"
          className={inputClassLg}
        />
        <select
          name="level"
          required
          defaultValue=""
          className={inputClassLg}
        >
          <option value="" disabled>
            Niveau…
          </option>
          {LEVELS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Création…" : "Créer la classe"}
        </Button>
      </div>
    </form>
  );
}
