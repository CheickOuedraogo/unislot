"use server";

import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { revalidatePaths } from "@/lib/revalidate";
import type { ActionResult } from "./auth";

export async function createClass(
  _state: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  await requireRole("director");
  const name = String(formData.get("name") ?? "").trim();
  const level = String(formData.get("level") ?? "").trim();
  if (!name) return { error: "Le nom de la classe est requis." };

  await db.query("INSERT INTO classes (name, level) VALUES ($1, $2)", [name, level]);
  revalidatePaths(["/director", "/director/classes"]);
  return { success: "Classe créée." };
}

export async function updateClass(
  classId: string,
  name: string,
  level: string
): Promise<ActionResult> {
  await requireRole("director");
  const cleanName = name.trim();
  const cleanLevel = level.trim();
  if (!cleanName) return { error: "Le nom de la classe est requis." };

  await db.query("UPDATE classes SET name = $1, level = $2 WHERE id = $3", [
    cleanName,
    cleanLevel,
    classId,
  ]);
  revalidatePaths(["/director", "/director/classes"]);
  return { success: "Classe modifiée." };
}

export async function deleteClass(classId: string): Promise<ActionResult> {
  await requireRole("director");
  await db.query("DELETE FROM classes WHERE id = $1", [classId]);
  revalidatePaths(["/director", "/director/classes"]);
  return { success: "Classe supprimée." };
}
