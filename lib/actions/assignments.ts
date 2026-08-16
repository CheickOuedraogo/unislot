"use server";

import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { revalidatePaths } from "@/lib/revalidate";
import type { ActionResult } from "./auth";

export type AssignmentInput = {
  teacherId: string;
  subjectId: string;
  classId: string;
};

function validateInput(input: AssignmentInput): string | null {
  const { teacherId, subjectId, classId } = input;
  if (!teacherId || !subjectId || !classId) {
    return "Enseignant, matière et classe requis.";
  }
  return null;
}

export async function createAssignment(input: AssignmentInput): Promise<ActionResult> {
  await requireRole("director");
  const error = validateInput(input);
  if (error) return { error };

  const { teacherId, subjectId, classId } = input;
  const { rowCount } = await db.query(
    "SELECT 1 FROM teacher_subjects WHERE teacher_id = $1 AND subject_id = $2 AND class_id = $3",
    [teacherId, subjectId, classId]
  );
  if (rowCount) return { error: "Cette assignation existe déjà." };

  await db.query(
    "INSERT INTO teacher_subjects (teacher_id, subject_id, class_id) VALUES ($1, $2, $3)",
    [teacherId, subjectId, classId]
  );
  revalidatePaths(["/director/assignments"]);
  return { success: "Assignation créée." };
}

export async function updateAssignment(
  assignmentId: string,
  input: AssignmentInput
): Promise<ActionResult> {
  await requireRole("director");
  const error = validateInput(input);
  if (error) return { error };

  const { teacherId, subjectId, classId } = input;
  const { rowCount } = await db.query(
    "SELECT 1 FROM teacher_subjects WHERE teacher_id = $1 AND subject_id = $2 AND class_id = $3 AND id <> $4",
    [teacherId, subjectId, classId, assignmentId]
  );
  if (rowCount) return { error: "Cette assignation existe déjà." };

  await db.query(
    "UPDATE teacher_subjects SET teacher_id = $1, subject_id = $2, class_id = $3 WHERE id = $4",
    [teacherId, subjectId, classId, assignmentId]
  );
  revalidatePaths(["/director/assignments"]);
  return { success: "Assignation modifiée." };
}

export async function deleteAssignment(assignmentId: string): Promise<ActionResult> {
  await requireRole("director");
  await db.query("DELETE FROM teacher_subjects WHERE id = $1", [assignmentId]);
  revalidatePaths(["/director/assignments"]);
  return { success: "Assignation supprimée." };
}
