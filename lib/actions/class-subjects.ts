"use server";

import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { revalidatePaths } from "@/lib/revalidate";
import type { ActionResult } from "./auth";

const REVALIDATED = [
  "/director",
  "/director/classes",
  "/timetable",
  "/teacher",
];

function revalidateClass(classId: string): void {
  revalidatePaths([...REVALIDATED, `/director/classes/${classId}`]);
}

export async function addSubjectToClass(
  classId: string,
  subjectId: string
): Promise<ActionResult> {
  await requireRole("director");
  if (!classId || !subjectId) return { error: "Classe et matière requises." };

  const { rowCount } = await db.query(
    "SELECT 1 FROM class_subjects WHERE class_id = $1 AND subject_id = $2",
    [classId, subjectId]
  );
  if (rowCount) return { error: "Cette matière est déjà dans la classe." };

  await db.query(
    "INSERT INTO class_subjects (class_id, subject_id) VALUES ($1, $2)",
    [classId, subjectId]
  );
  revalidateClass(classId);
  return { success: "Matière ajoutée à la classe." };
}

export async function createSubjectForClass(
  classId: string,
  name: string
): Promise<ActionResult> {
  await requireRole("director");
  const clean = name.trim();
  if (!clean) return { error: "Le nom de la matière est requis." };

  const { rows } = await db.query<{ id: string }>(
    "SELECT id FROM subjects WHERE name = $1",
    [clean]
  );
  let subjectId: string;
  if (rows.length > 0) {
    subjectId = rows[0].id;
  } else {
    const inserted = await db.query<{ id: string }>(
      "INSERT INTO subjects (name) VALUES ($1) RETURNING id",
      [clean]
    );
    subjectId = inserted.rows[0].id;
  }

  const res = await addSubjectToClass(classId, subjectId);
  if (res.error) return res;
  revalidateClass(classId);
  return { success: "Matière créée et ajoutée à la classe." };
}

export async function removeSubjectFromClass(
  classId: string,
  subjectId: string
): Promise<ActionResult> {
  await requireRole("director");
  if (!classId || !subjectId) return { error: "Classe et matière requises." };

  const { rowCount: slotsCount } = await db.query(
    "SELECT 1 FROM slots WHERE class_id = $1 AND subject_id = $2 LIMIT 1",
    [classId, subjectId]
  );
  if (slotsCount) {
    return {
      error:
        "Impossible de retirer cette matière : des cours existent dans l'emploi du temps.",
    };
  }

  await db.query(
    "DELETE FROM teacher_subjects WHERE class_id = $1 AND subject_id = $2",
    [classId, subjectId]
  );
  await db.query(
    "DELETE FROM class_subjects WHERE class_id = $1 AND subject_id = $2",
    [classId, subjectId]
  );
  revalidateClass(classId);
  return { success: "Matière retirée de la classe." };
}

export async function assignTeacherToClassSubject(
  classId: string,
  subjectId: string,
  teacherId: string
): Promise<ActionResult> {
  await requireRole("director");
  if (!teacherId || !subjectId || !classId) {
    return { error: "Enseignant, matière et classe requis." };
  }
  if (
    !(await hasAccess("SELECT 1 FROM class_subjects WHERE class_id = $1 AND subject_id = $2", [
      classId,
      subjectId,
    ]))
  ) {
    return { error: "Cette matière n'appartient pas à la classe." };
  }

  const { rowCount } = await db.query(
    "SELECT 1 FROM teacher_subjects WHERE teacher_id = $1 AND subject_id = $2 AND class_id = $3",
    [teacherId, subjectId, classId]
  );
  if (rowCount) return { error: "Cet enseignant est déjà assigné." };

  await db.query(
    "INSERT INTO teacher_subjects (teacher_id, subject_id, class_id) VALUES ($1, $2, $3)",
    [teacherId, subjectId, classId]
  );
  revalidateClass(classId);
  return { success: "Enseignant assigné." };
}

async function hasAccess(query: string, params: string[]): Promise<boolean> {
  const { rowCount } = await db.query(query, params);
  return rowCount !== 0;
}
