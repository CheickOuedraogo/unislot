"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { courseTypeLabels } from "@/lib/constants";
import type { CourseType, Role, Slot, Subject } from "@/lib/types";
import { Modal } from "@/components/ui/Modal";
import { Field, inputClass } from "@/components/ui/Field";
import { Alert } from "@/components/ui/Alert";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/ActionButton";
import { createSlot, updateSlot, type SlotInput } from "@/lib/actions/slots";
import type { ActionResult } from "@/lib/actions/auth";

type ConfigModalProps = {
  onClose: () => void;
  mode: "create" | "edit";
  classId: string;
  subjects: Subject[];
  teachers: { id: string; name: string }[];
  subjectTeachers: Record<string, { id: string; name: string }[]>;
  dayOfWeek: number;
  defaultStart: string;
  defaultEnd: string;
  slot?: Slot;
  currentUserId: string;
  role: Role;
};

export function ConfigModal({
  onClose,
  mode,
  classId,
  subjects,
  teachers,
  subjectTeachers,
  dayOfWeek,
  defaultStart,
  defaultEnd,
  slot,
  currentUserId,
  role,
}: ConfigModalProps) {
  const [type, setType] = useState<CourseType>(slot?.type ?? "cours");
  const [subjectId, setSubjectId] = useState(
    slot?.subject_id ?? subjects[0]?.id ?? ""
  );
  const [start, setStart] = useState(slot?.start_time ?? defaultStart);
  const [end, setEnd] = useState(slot?.end_time ?? defaultEnd);
  const [professorIds, setProfessorIds] = useState<string[]>(
    slot ? slot.professors.map((p) => p.id) : [currentUserId]
  );
  const [profQuery, setProfQuery] = useState("");
  const [state, setState] = useState<ActionResult>({});
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const submit = () => {
    if (!subjectId) {
      setState({ error: "Choisissez une matière." });
      return;
    }
    const input: SlotInput = {
      classId,
      subjectId,
      type,
      dayOfWeek,
      startTime: start,
      endTime: end,
      professorIds,
    };
    startTransition(async () => {
      const res = slot
        ? await updateSlot(slot.id, input)
        : await createSlot(input);
      setState(res);
      if (!res.error) {
        onClose();
        router.refresh();
      }
    });
  };

  const toggleProfessor = (id: string) => {
    if (isLockedProfessor(id)) return;
    setProfessorIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const isTeacher = role === "teacher";
  const isLockedProfessor = (id: string) => isTeacher && id === currentUserId;

  const assignedTeachers = subjectTeachers[subjectId] ?? [];
  const available = assignedTeachers.filter(
    (t) =>
      !professorIds.includes(t.id) &&
      t.name.toLowerCase().includes(profQuery.trim().toLowerCase())
  );

  const canAddProfessor = assignedTeachers.length > 0;
  const otherTeachers = assignedTeachers.filter(
    (t) => !isLockedProfessor(t.id) && !professorIds.includes(t.id)
  );
  const canAddMore = otherTeachers.length > 0;

  return (
    <Modal
      title={
        mode === "edit" ? "Modifier le créneau" : "Configurer le créneau"
      }
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" form="config-modal-form" disabled={pending}>
            {pending ? "Enregistrement…" : mode === "edit" ? "Enregistrer" : "Valider"}
          </Button>
        </>
      }
    >
      <form id="config-modal-form" onSubmit={(e) => { e.preventDefault(); submit(); }}>
        <Alert state={state} />
        <div className="grid grid-cols-2 gap-4">
        <Field label="Type">
          <select
            className={inputClass}
            value={type}
            onChange={(e) => setType(e.target.value as CourseType)}
          >
            {Object.entries(courseTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Matière">
          <select
            className={inputClass}
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
          >
            {subjects.length === 0 && <option value="">Aucune matière</option>}
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Heure de début">
          <input
            type="time"
            className={inputClass}
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
        </Field>
        <Field label="Heure de fin">
          <input
            type="time"
            className={inputClass}
            value={end}
            onChange={(e) => setEnd(e.target.value)}
          />
        </Field>
      </div>

      <div className="h-px bg-outline-variant w-full my-2" />

      <div>
        <label className="font-label-caps text-label-caps text-secondary">
          Professeurs
        </label>
        <div className="flex flex-wrap gap-2 mt-2 mb-3">
          {professorIds.map((id) => {
            const teacher = teachers.find((t) => t.id === id);
            if (!teacher) return null;
            return (
              <span
                key={id}
                className="flex items-center gap-1 bg-surface-container border border-outline-variant rounded-full px-3 py-1 font-body-sm text-body-sm text-on-surface-variant"
              >
                <span>{teacher.name}</span>
                {!isLockedProfessor(id) && (
                  <button
                    aria-label={`Retirer ${teacher.name}`}
                    className="hover:text-error transition-colors ml-1 mt-0.5"
                    onClick={() => toggleProfessor(id)}
                  >
                    <Icon name="cancel" size={14} />
                  </button>
                )}
              </span>
            );
          })}
          {professorIds.length === 0 && (
            <span className="font-body-sm text-body-sm text-secondary">
              Aucun professeur sélectionné.
            </span>
          )}
        </div>
        {canAddProfessor && canAddMore && (
          <>
            <div className="relative">
              <Icon
                name="search"
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-outline"
              />
              <input
                type="text"
                placeholder="Rechercher un professeur…"
                className={`${inputClass} pl-9`}
                value={profQuery}
                onChange={(e) => setProfQuery(e.target.value)}
              />
            </div>
            {available.length > 0 && (
              <div className="mt-2 border border-outline-variant rounded max-h-40 overflow-y-auto">
                {available.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => toggleProfessor(t.id)}
                    className="w-full text-left px-3 py-2 font-body-sm text-body-sm text-on-surface hover:bg-surface-container-low flex items-center justify-between"
                  >
                    <span>{t.name}</span>
                    <Icon name="add" size={16} className="text-secondary" />
                  </button>
                ))}
              </div>
            )}
          </>
        )}
        {!canAddProfessor && (
          <p className="font-body-sm text-body-sm text-secondary mt-2">
            Aucun enseignant n&apos;est assigné à cette matière dans cette classe.
          </p>
        )}
      </div>
      </form>
    </Modal>
  );
}
