"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { EditModal } from "@/components/director/EditModal";
import { Field, inputClassLg } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { updateAssignment, type AssignmentInput } from "@/lib/actions/assignments";
import type { ActionResult } from "@/lib/actions/auth";
import type { SchoolClass, Subject, Teacher, TeacherSubject } from "@/lib/types";

type EditAssignmentModalProps = {
  assignment: TeacherSubject;
  teachers: Teacher[];
  subjects: Subject[];
  classes: SchoolClass[];
};

export function EditAssignmentModal({
  assignment,
  teachers,
  subjects,
  classes,
}: EditAssignmentModalProps) {
  const [open, setOpen] = useState(false);
  const [teacherId, setTeacherId] = useState(assignment.teacher_id);
  const [subjectId, setSubjectId] = useState(assignment.subject_id);
  const [classId, setClassId] = useState(assignment.class_id);
  const [state, setState] = useState<ActionResult>({});
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const save = () => {
    const input: AssignmentInput = { teacherId, subjectId, classId };
    startTransition(async () => {
      const res = await updateAssignment(assignment.id, input);
      setState(res);
      if (!res.error) {
        setOpen(false);
        router.refresh();
      }
    });
  };

  return (
    <>
      <button
        type="button"
        aria-label="Modifier l'assignation"
        title="Modifier"
        onClick={() => {
          setTeacherId(assignment.teacher_id);
          setSubjectId(assignment.subject_id);
          setClassId(assignment.class_id);
          setState({});
          setOpen(true);
        }}
        className="p-2 rounded-lg text-secondary hover:text-primary hover:bg-surface-container transition-colors"
      >
        <Icon name="edit" size={18} />
      </button>
      {open && (
        <EditModal
          title="Modifier l'assignation"
          onClose={() => setOpen(false)}
          onSave={save}
          pending={pending}
          error={state.error}
        >
          <Field label="Enseignant">
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
          </Field>
          <Field label="Matière">
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
          </Field>
          <Field label="Classe">
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
          </Field>
        </EditModal>
      )}
    </>
  );
}
