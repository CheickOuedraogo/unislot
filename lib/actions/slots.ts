"use server";

import { db, transaction, type TransactionClient } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { minutesOfDay } from "@/lib/utils";
import { revalidatePaths } from "@/lib/revalidate";
import type { CourseType, User } from "@/lib/types";
import type { ActionResult } from "./auth";

export type SlotInput = {
  classId: string;
  subjectId: string;
  type: CourseType;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  professorIds: string[];
};

const TYPES: CourseType[] = ["cours", "td", "tp", "devoir"];
const TIME_RE = /^\d{2}:\d{2}$/;

function validate(input: SlotInput): string | null {
  if (!TYPES.includes(input.type)) return "Type de séance invalide.";
  if (!input.classId || !input.subjectId) return "Classe et matière requises.";
  if (!Number.isInteger(input.dayOfWeek) || input.dayOfWeek < 0 || input.dayOfWeek > 6) {
    return "Jour de la semaine invalide.";
  }
  if (!TIME_RE.test(input.startTime) || !TIME_RE.test(input.endTime)) {
    return "Horaires invalides.";
  }
  if (minutesOfDay(input.startTime) >= minutesOfDay(input.endTime)) {
    return "L'heure de fin doit être après l'heure de début.";
  }
  if (!input.professorIds.length) return "Ajoutez au moins un professeur.";
  return null;
}

async function assertCanCreate(
  user: User,
  classId: string,
  subjectId: string
): Promise<string | null> {
  if (user.role === "director") return null;
  const { rowCount } = await db.query(
    "SELECT 1 FROM teacher_subjects WHERE teacher_id = $1 AND subject_id = $2 AND class_id = $3",
    [user.id, classId, subjectId]
  );
  return rowCount ? null : "Vous n'êtes pas assigné à cette matière dans cette classe.";
}

async function assertSlotEditable(
  user: User,
  slotId: string
): Promise<string | null> {
  if (user.role === "director") return null;
  const { rows } = await db.query<{ creator_teacher_id: string }>(
    "SELECT creator_teacher_id FROM slots WHERE id = $1",
    [slotId]
  );
  const slot = rows[0];
  if (!slot) return "Créneau introuvable.";
  return slot.creator_teacher_id === user.id
    ? null
    : "Vous ne pouvez modifier que vos propres créneaux.";
}

async function findOverlap(
  classId: string,
  dayOfWeek: number,
  startTime: string,
  endTime: string,
  excludeSlotId?: string
): Promise<boolean> {
  const { rows } = await db.query(
    `SELECT id FROM slots
     WHERE class_id = $1 AND day_of_week = $2
       AND start_time < $4 AND end_time > $3
       ${excludeSlotId ? "AND id <> $5" : ""}
     LIMIT 1`,
    excludeSlotId
      ? [classId, dayOfWeek, startTime, endTime, excludeSlotId]
      : [classId, dayOfWeek, startTime, endTime]
  );
  return rows.length > 0;
}

async function replaceProfessors(
  client: TransactionClient,
  slotId: string,
  professorIds: string[]
): Promise<void> {
  await client.query("DELETE FROM slot_professors WHERE slot_id = $1", [slotId]);
  if (professorIds.length === 0) return;
  const values = professorIds
    .map((_, i) => `($1, $${i + 2})`)
    .join(", ");
  await client.query(
    `INSERT INTO slot_professors (slot_id, teacher_id) VALUES ${values}`,
    [slotId, ...professorIds]
  );
}

export async function createSlot(input: SlotInput): Promise<ActionResult> {
  const error = validate(input);
  if (error) return { error };
  const user = await requireUser();

  const canCreateError = await assertCanCreate(user, input.classId, input.subjectId);
  if (canCreateError) return { error: canCreateError };

  if (await findOverlap(input.classId, input.dayOfWeek, input.startTime, input.endTime)) {
    return { error: "Conflit : un autre créneau occupe déjà cet horaire dans cette classe." };
  }

  const professorIds = [...new Set([...input.professorIds, user.id])];
  try {
    await transaction(async (client) => {
      const { rows } = await client.query<{ id: string }>(
        `INSERT INTO slots (class_id, subject_id, type, day_of_week, start_time, end_time, creator_teacher_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        [input.classId, input.subjectId, input.type, input.dayOfWeek, input.startTime, input.endTime, user.id]
      );
      await replaceProfessors(client, rows[0].id, professorIds);
    });
  } catch {
    return { error: "Impossible de créer le créneau. Veuillez réessayer." };
  }

  revalidatePaths(["/timetable", "/teacher"]);
  return { success: "Créneau créé." };
}

export async function updateSlot(slotId: string, input: SlotInput): Promise<ActionResult> {
  const error = validate(input);
  if (error) return { error };
  const user = await requireUser();

  const editError = await assertSlotEditable(user, slotId);
  if (editError) return { error: editError };

  if (await findOverlap(input.classId, input.dayOfWeek, input.startTime, input.endTime, slotId)) {
    return { error: "Conflit : un autre créneau occupe déjà cet horaire dans cette classe." };
  }

  const professorIds = [...new Set([...input.professorIds, user.id])];
  try {
    await transaction(async (client) => {
      await client.query(
        `UPDATE slots SET class_id = $1, subject_id = $2, type = $3, day_of_week = $4, start_time = $5, end_time = $6
         WHERE id = $7`,
        [input.classId, input.subjectId, input.type, input.dayOfWeek, input.startTime, input.endTime, slotId]
      );
      await replaceProfessors(client, slotId, professorIds);
    });
  } catch {
    return { error: "Impossible de modifier le créneau. Veuillez réessayer." };
  }

  revalidatePaths(["/timetable", "/teacher"]);
  return { success: "Créneau modifié." };
}

export async function deleteSlot(slotId: string): Promise<ActionResult> {
  const user = await requireUser();
  const editError = await assertSlotEditable(user, slotId);
  if (editError) return { error: editError };
  await db.query("DELETE FROM slots WHERE id = $1", [slotId]);
  revalidatePaths(["/timetable", "/teacher"]);
  return { success: "Créneau supprimé." };
}
