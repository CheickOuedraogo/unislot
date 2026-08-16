"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { inputClassLg } from "@/components/ui/Field";
import { createAssignment } from "@/lib/actions/assignments";
import type { ActionResult } from "@/lib/actions/auth";
import type { SchoolClass, Subject, Teacher } from "@/lib/types";

type CreateAssignmentFormProps = {
  teachers: Teacher[];
  subjects: Subject[];
  classes: SchoolClass[];
};

export function CreateAssignmentForm({
  teachers,
  subjects,
  classes,
}: CreateAssignmentFormProps) {
  const [teacherId, setTeacherId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [classId, setClassId] = useState("");
  const [state, setState] = useState<ActionResult>({});
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await createAssignment({ teacherId, subjectId, classId });
      setState(res);
      if (!res.error) {
        setTeacherId("");
        setSubjectId("");
        setClassId("");
        router.refresh();
      }
    });
  };

  return (
    <form
      onSubmit={submit}
      className="flex flex-col gap-4 border border-outline-variant rounded-xl bg-surface-container-lowest p-5"
    >
      <h2 className="font-title-md text-title-md text-on-surface">
        Nouvelle assignation
      </h2>
      <Alert state={state} />
      <div className="grid gap-4 md:grid-cols-3">
        <select
          required
          value={teacherId}
          onChange={(e) => setTeacherId(e.target.value)}
          className={inputClassLg}
        >
          <option value="" disabled>
            Enseignant…
          </option>
          {teachers.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <select
          required
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
          className={inputClassLg}
        >
          <option value="" disabled>
            Matière…
          </option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <select
          required
          value={classId}
          onChange={(e) => setClassId(e.target.value)}
          className={inputClassLg}
        >
          <option value="" disabled>
            Classe…
          </option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Button disabled={pending}>
          {pending ? "Création…" : "Assigner"}
        </Button>
      </div>
    </form>
  );
}
