"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Field, inputClassLg } from "@/components/ui/Field";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { deleteAssignment, createAssignment } from "@/lib/actions/assignments";
import type { ActionResult } from "@/lib/actions/auth";
import type { SchoolClass, Subject } from "@/lib/types";

type TeacherAssignmentItem = {
  id: string;
  subjectName: string;
  className: string;
  level: string;
};

type TeacherAssignmentsProps = {
  teacherId: string;
  assignments: TeacherAssignmentItem[];
  subjectsByClass: Record<string, Subject[]>;
  classes: SchoolClass[];
};

export function TeacherAssignments({
  teacherId,
  assignments,
  subjectsByClass,
  classes,
}: TeacherAssignmentsProps) {
  const router = useRouter();
  const [classId, setClassId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const classSubjects = subjectsByClass[classId] ?? [];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res: ActionResult = await createAssignment({
        teacherId,
        subjectId,
        classId,
      });
      setError(res.error ?? null);
      setSuccess(res.success ?? null);
      if (!res.error) {
        setSubjectId("");
        router.refresh();
      }
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <p className="font-body-sm text-body-sm text-error">{error}</p>
      )}
      {success && (
        <p className="font-body-sm text-body-sm text-on-success">{success}</p>
      )}

      {assignments.length === 0 ? (
        <p className="font-body-sm text-body-sm text-secondary">
          Aucune matière assignée pour le moment.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {assignments.map((a) => (
            <li
              key={a.id}
              className="flex items-center gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-3"
            >
              <span className="inline-flex items-center justify-center size-9 rounded-lg bg-surface-container text-secondary shrink-0 font-label-caps text-label-caps font-semibold">
                {a.level ?? "–"}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-body-sm text-body-sm font-medium text-on-surface truncate">
                  {a.subjectName}
                </p>
                <p className="font-body-sm text-body-sm text-secondary truncate">
                  {a.className}
                </p>
              </div>
              <ConfirmButton
                action={() => deleteAssignment(a.id)}
                confirmText={`Supprimer ${a.subjectName} (${a.className})`}
              />
            </li>
          ))}
        </ul>
      )}

      <form
        onSubmit={submit}
        className="flex flex-col gap-3 rounded-xl border border-dashed border-outline-variant bg-surface-container-lowest/50 p-4"
      >
        <p className="font-body-sm text-body-sm font-medium text-on-surface">
          Ajouter une matière à cet enseignant
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Classe">
            <select
              required
              value={classId}
              onChange={(e) => {
                setClassId(e.target.value);
                setSubjectId("");
              }}
              className={inputClassLg}
            >
              <option value="" disabled>
                Choisir une classe…
              </option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {c.level ? ` (${c.level})` : ""}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Matière de cette classe">
            <select
              required
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className={inputClassLg}
              disabled={!classId}
            >
              <option value="" disabled>
                {classId ? "Choisir une matière…" : "Choisissez d'abord une classe…"}
              </option>
              {classSubjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div>
          <Button type="submit" disabled={pending}>
            {pending ? "Ajout…" : "Assigner cette matière"}
          </Button>
        </div>
      </form>
    </div>
  );
}
