"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { Button as ActionButton } from "@/components/ui/ActionButton";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/Alert";
import { Field, inputClassLg } from "@/components/ui/Field";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { createTeacherAccount } from "@/lib/actions/auth";
import type { ActionResult } from "@/lib/actions/auth";

export function CreateTeacherForm() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [state, setState] = useState<ActionResult>({});
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = () => {
    startTransition(async () => {
      const res = await createTeacherAccount(
        form.firstName,
        form.lastName,
        form.email,
        form.password
      );
      setState(res);
      if (!res.error) {
        setOpen(false);
        setForm({ firstName: "", lastName: "", email: "", password: "" });
        router.refresh();
      }
    });
  };

  return (
    <>
      <div className="md:self-end">
        <Button onClick={() => setOpen(true)}>Ajouter un enseignant</Button>
      </div>
      {open && (
        <Modal
          title="Nouvel enseignant"
          onClose={() => setOpen(false)}
          footer={
            <>
              <ActionButton variant="secondary" onClick={() => setOpen(false)}>
                Annuler
              </ActionButton>
              <ActionButton onClick={submit} disabled={pending}>
                {pending ? "Création…" : "Créer le compte"}
              </ActionButton>
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
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Nom">
                <input
                  type="text"
                  required
                  value={form.lastName}
                  onChange={set("lastName")}
                  placeholder="Dr. Ouedraogo"
                  className={inputClassLg}
                />
              </Field>
              <Field label="Prénom">
                <input
                  type="text"
                  required
                  value={form.firstName}
                  onChange={set("firstName")}
                  placeholder="Paul"
                  className={inputClassLg}
                />
              </Field>
            </div>
            <Field label="Adresse email">
              <input
                type="email"
                required
                value={form.email}
                onChange={set("email")}
                placeholder="Ex. paul@ujkz.com"
                className={inputClassLg}
              />
            </Field>
            <Field label="Mot de passe (min. 8 caractères)">
              <PasswordInput
                required
                minLength={8}
                autoComplete="new-password"
                value={form.password}
                onChange={set("password")}
                placeholder="Choisir un mot de passe"
              />
            </Field>
          </form>
        </Modal>
      )}
    </>
  );
}