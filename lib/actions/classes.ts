"use server";

import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { revalidatePaths } from "@/lib/revalidate";
import type { ActionResult } from "./auth";

export async function createClass(name: string): Promise<ActionResult> {
  await requireRole("director");
  const cleanName = name.trim();
  if (!cleanName) return { error: "Le nom de la classe est requis." };

  await db.query("INSERT INTO classes (name, level) VALUES ($1, '')", [cleanName]);
  revalidatePaths(["/director", "/director/classes"]);
  return { success: "Classe créée." };
}

export async function updateClass(
  classId: string,
  name: string
): Promise<ActionResult> {
  await requireRole("director");
  const cleanName = name.trim();
  if (!cleanName) return { error: "Le nom de la classe est requis." };

  await db.query("UPDATE classes SET name = $1 WHERE id = $2", [
    cleanName,
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
