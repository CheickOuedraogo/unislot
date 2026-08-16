"use server";

import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { revalidatePaths } from "@/lib/revalidate";
import type { ActionResult } from "./auth";

export async function createSubject(
  _state: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  await requireRole("director");
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Le nom de la matière est requis." };

  const { rowCount } = await db.query("SELECT 1 FROM subjects WHERE name = $1", [name]);
  if (rowCount) return { error: "Cette matière existe déjà." };

  await db.query("INSERT INTO subjects (name) VALUES ($1)", [name]);
  revalidatePaths(["/director/subjects"]);
  return { success: "Matière créée." };
}

export async function updateSubject(
  subjectId: string,
  name: string
): Promise<ActionResult> {
  await requireRole("director");
  const clean = name.trim();
  if (!clean) return { error: "Le nom de la matière est requis." };

  const { rowCount } = await db.query(
    "SELECT 1 FROM subjects WHERE name = $1 AND id <> $2",
    [clean, subjectId]
  );
  if (rowCount) return { error: "Cette matière existe déjà." };

  await db.query("UPDATE subjects SET name = $1 WHERE id = $2", [clean, subjectId]);
  revalidatePaths(["/director/subjects"]);
  return { success: "Matière modifiée." };
}

export async function deleteSubject(subjectId: string): Promise<ActionResult> {
  await requireRole("director");
  await db.query("DELETE FROM subjects WHERE id = $1", [subjectId]);
  revalidatePaths(["/director/subjects"]);
  return { success: "Matière supprimée." };
}
