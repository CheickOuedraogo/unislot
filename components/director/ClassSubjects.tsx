"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/ActionButton";
import { Modal } from "@/components/ui/Modal";
import { Field, inputClassLg } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { Alert } from "@/components/ui/Alert";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import {
  createSubjectForClass,
  assignTeacherToClassSubject,
  removeSubjectFromClass,
} from "@/lib/actions/class-subjects";
import { deleteAssignment } from "@/lib/actions/assignments";
import { randomId } from "@/lib/utils";
import type { ActionResult } from "@/lib/actions/auth";

export type ClassSubjectItem = {
  subjectId: string;
  name: string;
  teachers: { assignmentId: string; teacherName: string }[];
};

type TeacherOption = { id: string; name: string };

type Props = {
  classId: string;
  subjects: ClassSubjectItem[];
  teachers: TeacherOption[];
};

const CARD_ACCENTS = [
  "bg-primary",
  "bg-tertiary",
  "bg-secondary",
  "bg-error",
];

function accentFor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return CARD_ACCENTS[hash % CARD_ACCENTS.length];
}

function initialsOf(name: string): string {
  return name.charAt(0).toUpperCase();
}

export function ClassSubjects({
  classId,
  subjects,
  teachers,
}: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState<ClassSubjectItem | null>(null);
  const [teacherId, setTeacherId] = useState("");
  const [assignError, setAssignError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // Formulaire d'ajout de matière
  const [newName, setNewName] = useState("");
  const [formState, setFormState] = useState<ActionResult>({});
  const [formPending, startFormTransition] = useTransition();

  const openSubject = (s: ClassSubjectItem) => {
    setSelected(s);
    setTeacherId("");
    setAssignError(null);
  };

  const submitAssign = () => {
    if (!selected || !teacherId) return;
    startTransition(async () => {
      const res = await assignTeacherToClassSubject(classId, selected.subjectId, teacherId);
      setAssignError(res.error ?? null);
      if (!res.error) {
        setSelected({
          ...selected,
          teachers: [
            ...selected.teachers,
            {
              assignmentId: randomId(),
              teacherName:
                teachers.find((t) => t.id === teacherId)?.name ?? "",
            },
          ],
        });
        setTeacherId("");
        router.refresh();
      }
    });
  };

  const submitAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    startFormTransition(async () => {
      const res = await createSubjectForClass(classId, newName);
      setFormState(res);
      if (!res.error) {
        setNewName("");
        router.refresh();
      }
    });
  };

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-headline-md text-headline-md text-on-background">
          Matières de la classe
        </h2>
        <span className="font-body-sm text-body-sm text-secondary">
          Cliquez sur une matière pour gérer les enseignants
        </span>
      </div>

      {subjects.length === 0 ? (
        <p className="font-body-sm text-body-sm text-secondary">
          Aucune matière dans cette classe. Ajoutez-en une ci-dessous.
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((s) => (
            <button
              key={s.subjectId}
              type="button"
              onClick={() => openSubject(s)}
              className="card bg-surface-container-lowest border border-outline-variant rounded-xl p-5 flex items-center gap-3 text-left hover:border-primary hover:shadow-md transition-all duration-150"
            >
              <span
                className={`w-11 h-11 shrink-0 rounded-xl flex items-center justify-center font-title-md font-bold text-white ${accentFor(s.name)}`}
                aria-hidden="true"
              >
                {initialsOf(s.name)}
              </span>
              <div className="min-w-0 flex-1">
                <span className="font-body-sm text-body-sm font-semibold text-on-surface block truncate">
                  {s.name}
                </span>
                <span className="font-label-caps text-label-caps text-secondary">
                  {s.teachers.length === 0
                    ? "Aucun enseignant"
                    : `${s.teachers.length} enseignant${s.teachers.length > 1 ? "s" : ""}`}
                </span>
              </div>
              <Icon name="chevron_right" size={20} className="text-secondary shrink-0" />
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={submitAddSubject}
        className="flex flex-col gap-3 rounded-xl border border-dashed border-outline-variant bg-surface-container-lowest/50 p-4"
      >
        <p className="font-body-sm text-body-sm font-medium text-on-surface">
          Ajouter une matière à cette classe
        </p>
        <Alert state={formState} />
        <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
          <Field label="Nom de la matière">
            <input
              type="text"
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Ex. Statistiques"
              className={`${inputClassLg} min-w-56`}
            />
          </Field>
          <Button type="submit" disabled={formPending}>
            {formPending ? "Ajout…" : "Ajouter"}
          </Button>
        </div>
      </form>

      {selected && (
        <Modal
          title={`Enseignants — ${selected.name}`}
          onClose={() => setSelected(null)}
        >
          <div className="flex flex-col gap-4">
            <Alert state={{ error: assignError ?? undefined }} />

            {selected.teachers.length === 0 ? (
              <p className="font-body-sm text-body-sm text-secondary">
                Aucun enseignant assigné à cette matière.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {selected.teachers.map((t) => (
                  <li
                    key={t.assignmentId}
                    className="flex items-center gap-3 rounded-lg border border-outline-variant bg-surface-container-lowest p-3"
                  >
                    <span
                      className="inline-flex items-center justify-center size-9 rounded-full bg-primary-container text-on-primary-container font-label-caps text-label-caps font-bold shrink-0"
                      aria-hidden="true"
                    >
                      {t.teacherName.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("")}
                    </span>
                    <span className="min-w-0 flex-1 font-body-sm text-body-sm text-on-surface truncate">
                      {t.teacherName}
                    </span>
                    <ConfirmButton
                      action={async () => {
                        const res = await deleteAssignment(t.assignmentId);
                        if (!res.error) {
                          setSelected((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  teachers: prev.teachers.filter(
                                    (x) => x.assignmentId !== t.assignmentId
                                  ),
                                }
                              : prev
                          );
                        }
                        return res;
                      }}
                      title="Retirer l'enseignant"
                      message={`Retirer ${t.teacherName} de la matière « ${selected.name} » ?`}
                      confirmLabel="Retirer"
                    />
                  </li>
                ))}
              </ul>
            )}

            <form onSubmit={(e) => { e.preventDefault(); submitAssign(); }} className="border-t border-outline-variant pt-4 flex flex-col gap-3">
              <Field label="Assigner un enseignant">
                <select
                  value={teacherId}
                  onChange={(e) => setTeacherId(e.target.value)}
                  className={inputClassLg}
                >
                  <option value="" disabled>
                    Choisir un enseignant…
                  </option>
                  {teachers
                    .filter((t) => !selected.teachers.some((x) => x.teacherName === t.name))
                    .map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                </select>
              </Field>
              <Button type="submit" disabled={!teacherId || pending}>
                {pending ? "Assignation…" : "Assigner"}
              </Button>
            </form>

            <div className="border-t border-outline-variant pt-4">
              <ConfirmButton
                action={async () => {
                  const res = await removeSubjectFromClass(classId, selected.subjectId);
                  if (!res.error) {
                    setSelected(null);
                    router.refresh();
                  } else {
                    setAssignError(res.error);
                  }
                  return res;
                }}
                title="Retirer la matière"
                message={`Retirer « ${selected.name} » de la classe ainsi que tous les enseignements associés ?`}
                confirmLabel="Retirer"
                className="text-error hover:bg-error-container"
              >
                Retirer cette matière de la classe
              </ConfirmButton>
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
}
