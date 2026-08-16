"use server";

import { revalidatePath } from "next/cache";
import { db, transaction } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import type { SwapRequest } from "@/lib/types";
import type { ActionResult } from "./auth";

export type SwapRequestInput = {
  slotId: string;
  message: string;
  proposedSubjectId: string;
};

export async function createSwapRequest(input: SwapRequestInput): Promise<ActionResult> {
  const user = await requireUser();
  const { slotId, message, proposedSubjectId } = input;
  if (!slotId || !proposedSubjectId) return { error: "Créneau et matière proposée requis." };
  if (!message.trim()) return { error: "Un message est requis." };

  const { rows } = await db.query<{ creator_teacher_id: string; class_id: string }>(
    "SELECT creator_teacher_id, class_id FROM slots WHERE id = $1",
    [slotId]
  );
  const slot = rows[0];
  if (!slot) return { error: "Créneau introuvable." };
  if (slot.creator_teacher_id === user.id) {
    return { error: "Ce créneau vous appartient déjà." };
  }

  const { rowCount: assigned } = await db.query(
    "SELECT 1 FROM teacher_subjects WHERE teacher_id = $1 AND subject_id = $2 AND class_id = $3",
    [user.id, proposedSubjectId, slot.class_id]
  );
  if (!assigned) {
    return { error: "Vous n'enseignez pas cette matière dans cette classe." };
  }

  const { rowCount } = await db.query(
    "SELECT 1 FROM swap_requests WHERE slot_id = $1 AND requesting_teacher_id = $2 AND status = 'pending'",
    [slotId, user.id]
  );
  if (rowCount) return { error: "Une demande est déjà en attente pour ce créneau." };

  await db.query(
    `INSERT INTO swap_requests (slot_id, requesting_teacher_id, message, proposed_subject_id)
     VALUES ($1, $2, $3, $4)`,
    [slotId, user.id, message.trim(), proposedSubjectId]
  );
  revalidatePath("/timetable");
  return { success: "Demande envoyée." };
}

type DecidableRequest = {
  slotId: string;
  requestingTeacherId: string;
  proposedSubjectId: string;
};

async function getDecidableRequest(
  requestId: string
): Promise<{ error?: string; request?: DecidableRequest }> {
  const user = await requireUser();
  const { rows } = await db.query<{
    creator_teacher_id: string;
    slot_id: string;
    requesting_teacher_id: string;
    proposed_subject_id: string;
  }>(
    `SELECT s.creator_teacher_id, r.slot_id, r.requesting_teacher_id, r.proposed_subject_id
     FROM swap_requests r
     JOIN slots s ON s.id = r.slot_id
     WHERE r.id = $1`,
    [requestId]
  );
  const row = rows[0];
  if (!row) return { error: "Demande introuvable." };
  if (user.role !== "director" && row.creator_teacher_id !== user.id) {
    return { error: "Vous ne pouvez pas traiter cette demande." };
  }
  return {
    request: {
      slotId: row.slot_id,
      requestingTeacherId: row.requesting_teacher_id,
      proposedSubjectId: row.proposed_subject_id,
    },
  };
}

export async function approveSwapRequest(requestId: string): Promise<ActionResult> {
  const { error, request } = await getDecidableRequest(requestId);
  if (error || !request) return { error };

  let alreadyDecided = false;
  try {
    await transaction(async (client) => {
      const { rowCount } = await client.query(
        "UPDATE swap_requests SET status = 'approved' WHERE id = $1 AND status = 'pending'",
        [requestId]
      );
      if (!rowCount) {
        alreadyDecided = true;
        return;
      }
      await client.query("UPDATE slots SET creator_teacher_id = $1, subject_id = $2 WHERE id = $3", [
        request.requestingTeacherId,
        request.proposedSubjectId,
        request.slotId,
      ]);
      await client.query("DELETE FROM slot_professors WHERE slot_id = $1", [request.slotId]);
      await client.query("INSERT INTO slot_professors (slot_id, teacher_id) VALUES ($1, $2)", [
        request.slotId,
        request.requestingTeacherId,
      ]);
      await client.query(
        "UPDATE swap_requests SET status = 'rejected' WHERE slot_id = $1 AND status = 'pending' AND id <> $2",
        [request.slotId, requestId]
      );
    });
  } catch {
    return { error: "Impossible de traiter la demande. Veuillez réessayer." };
  }

  if (alreadyDecided) return { error: "Cette demande n'est plus en attente." };

  revalidatePath("/timetable");
  return { success: "Demande approuvée : le créneau a changé de propriétaire et de matière." };
}

export async function rejectSwapRequest(requestId: string): Promise<ActionResult> {
  const { error } = await getDecidableRequest(requestId);
  if (error) return { error };

  const { rowCount } = await db.query(
    "UPDATE swap_requests SET status = 'rejected' WHERE id = $1 AND status = 'pending'",
    [requestId]
  );
  if (!rowCount) return { error: "Cette demande n'est plus en attente." };

  revalidatePath("/timetable");
  return { success: "Demande refusée." };
}

export async function getPendingSwapRequests(): Promise<SwapRequest[]> {
  const user = await requireUser();
  const { rows } = await db.query<SwapRequest>(
    `SELECT r.id, r.slot_id, r.requesting_teacher_id, r.message, r.proposed_subject_id,
            r.status, r.created_at,
            rt.name AS requesting_teacher_name,
            ps.name AS proposed_subject_name,
            s.day_of_week AS slot_day,
            s.start_time AS slot_start,
            s.end_time AS slot_end,
            su.name AS slot_subject_name
     FROM swap_requests r
     JOIN users rt ON rt.id = r.requesting_teacher_id
     JOIN subjects ps ON ps.id = r.proposed_subject_id
     JOIN slots s ON s.id = r.slot_id
     JOIN subjects su ON su.id = s.subject_id
     WHERE r.status = 'pending'
       AND ($1::boolean OR s.creator_teacher_id = $2)
     ORDER BY r.created_at DESC`,
    [user.role === "director", user.id]
  );
  return rows;
}
