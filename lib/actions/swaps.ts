"use server";

import { db, transaction } from "@/lib/db";
import { revalidatePaths } from "@/lib/revalidate";
import { requireUser } from "@/lib/auth";
import type { SwapRequest } from "@/lib/types";
import type { ActionResult } from "./auth";

export type SwapRequestInput = {
  slotId: string;
  message: string;
  proposedSubjectId: string;
  proposedStart: string;
  proposedEnd: string;
};

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export async function createSwapRequest(input: SwapRequestInput): Promise<ActionResult> {
  const user = await requireUser();
  const { slotId, message, proposedSubjectId } = input;
  const start = input.proposedStart?.trim();
  const end = input.proposedEnd?.trim();

  if (!slotId || !proposedSubjectId) {
    return { error: "Créneau et matière proposée requis." };
  }
  if (!message.trim()) return { error: "Un message est requis." };
  if (!TIME_RE.test(start) || !TIME_RE.test(end)) {
    return { error: "Horaires invalides." };
  }

  const { rows } = await db.query<{
    creator_teacher_id: string;
    class_id: string;
    day_of_week: number;
    start_time: string;
    end_time: string;
  }>(
    "SELECT creator_teacher_id, class_id, day_of_week, start_time::text AS start_time, end_time::text AS end_time FROM slots WHERE id = $1",
    [slotId]
  );
  const slot = rows[0];
  if (!slot) return { error: "Créneau introuvable." };
  if (slot.creator_teacher_id === user.id) {
    return { error: "Ce créneau vous appartient déjà." };
  }

  if (toMinutes(end) <= toMinutes(start)) {
    return { error: "L'heure de fin doit être après l'heure de début." };
  }

  // La plage demandée doit chevaucher le créneau ciblé (une demande = un créneau)
  const overlapsTarget =
    toMinutes(start) < toMinutes(slot.end_time) &&
    toMinutes(slot.start_time) < toMinutes(end);
  if (!overlapsTarget) {
    return {
      error:
        "La plage demandée doit chevaucher ce créneau. Pour un autre moment, faites une nouvelle demande sur le créneau concerné.",
    };
  }

  // Pas de chevauchement avec les autres créneaux de la classe ce jour-là
  const { rows: daySlots } = await db.query<{ start_time: string; end_time: string }>(
    `SELECT start_time::text AS start_time, end_time::text AS end_time
     FROM slots
     WHERE class_id = $1 AND day_of_week = $2 AND id <> $3`,
    [slot.class_id, slot.day_of_week, slotId]
  );
  const conflicting = daySlots.some(
    (s) => toMinutes(start) < toMinutes(s.end_time) && toMinutes(s.start_time) < toMinutes(end)
  );
  if (conflicting) {
    return { error: "La plage demandée chevauche un autre cours de cette classe." };
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
    `INSERT INTO swap_requests
       (slot_id, requesting_teacher_id, message, proposed_subject_id, proposed_start_time, proposed_end_time)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [slotId, user.id, message.trim(), proposedSubjectId, start, end]
  );
  revalidatePaths(["/timetable", "/teacher", "/director/swaps"]);
  return { success: "Demande envoyée." };
}

export async function getDecidableSwapRequest(requestId: string): Promise<
  | { error: string; request?: undefined }
  | {
      error?: undefined;
      request: {
        slotId: string;
        requestingTeacherId: string;
        proposedSubjectId: string;
        proposedStart: string;
        proposedEnd: string;
        originalOwnerId: string;
        originalStart: string;
        originalEnd: string;
        originalSubjectId: string;
        professorIds: string[];
      };
    }
> {
  const user = await requireUser();
  const { rows } = await db.query<{
    creator_teacher_id: string;
    slot_id: string;
    requesting_teacher_id: string;
    proposed_subject_id: string;
    proposed_start_time: string;
    proposed_end_time: string;
    subject_id: string;
    start_time: string;
    end_time: string;
  }>(
    `SELECT s.creator_teacher_id, r.slot_id, r.requesting_teacher_id,
            r.proposed_subject_id, r.proposed_start_time::text AS proposed_start_time,
            r.proposed_end_time::text AS proposed_end_time,
            s.subject_id, s.start_time::text AS start_time, s.end_time::text AS end_time
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

  const { rows: profRows } = await db.query<{ teacher_id: string }>(
    "SELECT teacher_id FROM slot_professors WHERE slot_id = $1",
    [row.slot_id]
  );

  return {
    request: {
      slotId: row.slot_id,
      requestingTeacherId: row.requesting_teacher_id,
      proposedSubjectId: row.proposed_subject_id,
      proposedStart: row.proposed_start_time.slice(0, 5),
      proposedEnd: row.proposed_end_time.slice(0, 5),
      originalOwnerId: row.creator_teacher_id,
      originalStart: row.start_time.slice(0, 5),
      originalEnd: row.end_time.slice(0, 5),
      originalSubjectId: row.subject_id,
      professorIds: profRows.map((p) => p.teacher_id),
    },
  };
}

export type RemainderChoice = "before" | "after" | "none";

export async function approveSwapRequest(
  requestId: string,
  remainder: RemainderChoice
): Promise<ActionResult> {
  const { error, request } = await getDecidableSwapRequest(requestId);
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

      const takesAll =
        request.proposedStart <= request.originalStart &&
        request.proposedEnd >= request.originalEnd;

      let remainderStart: string | null = null;
      let remainderEnd: string | null = null;

      if (!takesAll) {
        const before =
          request.proposedStart > request.originalStart
            ? [request.originalStart, request.proposedStart]
            : null;
        const after =
          request.proposedEnd < request.originalEnd
            ? [request.proposedEnd, request.originalEnd]
            : null;
        if (remainder === "before" && before) [remainderStart, remainderEnd] = before;
        if (remainder === "after" && after) [remainderStart, remainderEnd] = after;
      }

      if (remainderStart && remainderEnd) {
        // Le créneau existant reste au prof d'origine, réduit au segment choisi.
        await client.query(
          "UPDATE slots SET start_time = $1, end_time = $2 WHERE id = $3",
          [remainderStart, remainderEnd, request.slotId]
        );
        // Nouveau créneau pour le prof demandeur sur sa plage.
        const { rows: inserted } = await client.query<{ id: string }>(
          `INSERT INTO slots (class_id, subject_id, type, day_of_week, start_time, end_time, creator_teacher_id)
           SELECT class_id, $1, type, day_of_week, $2, $3, $4 FROM slots WHERE id = $5
           RETURNING id`,
          [
            request.proposedSubjectId,
            request.proposedStart,
            request.proposedEnd,
            request.requestingTeacherId,
            request.slotId,
          ]
        );
        await client.query(
          "INSERT INTO slot_professors (slot_id, teacher_id) VALUES ($1, $2)",
          [inserted[0].id, request.requestingTeacherId]
        );
      } else {
        // Rachat total : le créneau change de propriétaire, de matière et d'horaires.
        await client.query(
          "UPDATE slots SET creator_teacher_id = $1, subject_id = $2, start_time = $3, end_time = $4 WHERE id = $5",
          [
            request.requestingTeacherId,
            request.proposedSubjectId,
            request.proposedStart,
            request.proposedEnd,
            request.slotId,
          ]
        );
        await client.query("DELETE FROM slot_professors WHERE slot_id = $1", [
          request.slotId,
        ]);
        await client.query(
          "INSERT INTO slot_professors (slot_id, teacher_id) VALUES ($1, $2)",
          [request.slotId, request.requestingTeacherId]
        );
      }

      // Les autres demandes pending sur ce créneau n'ont plus de sens : rejetées.
      await client.query(
        "UPDATE swap_requests SET status = 'rejected' WHERE slot_id = $1 AND status = 'pending' AND id <> $2",
        [request.slotId, requestId]
      );
    });
  } catch {
    return { error: "Impossible de traiter la demande. Veuillez réessayer." };
  }

  if (alreadyDecided) return { error: "Cette demande n'est plus en attente." };

  revalidatePaths(["/timetable", "/teacher", "/director/swaps"]);
  return { success: "Demande approuvée : l'emploi du temps a été mis à jour." };
}

export async function rejectSwapRequest(requestId: string): Promise<ActionResult> {
  const { error } = await getDecidableSwapRequest(requestId);
  if (error) return { error };

  const { rowCount } = await db.query(
    "UPDATE swap_requests SET status = 'rejected' WHERE id = $1 AND status = 'pending'",
    [requestId]
  );
  if (!rowCount) return { error: "Cette demande n'est plus en attente." };

  revalidatePaths(["/timetable", "/teacher", "/director/swaps"]);
  return { success: "Demande refusée." };
}

/** Le demandeur peut annuler sa propre demande en attente. */
export async function cancelSwapRequest(requestId: string): Promise<ActionResult> {
  const user = await requireUser();
  const { rowCount } = await db.query(
    "UPDATE swap_requests SET status = 'rejected' WHERE id = $1 AND status = 'pending' AND requesting_teacher_id = $2",
    [requestId, user.id]
  );
  if (!rowCount) return { error: "Cette demande n'est plus en attente." };

  revalidatePaths(["/timetable", "/teacher", "/director/swaps"]);
  return { success: "Demande annulée." };
}

const SWAP_SELECT = `
  SELECT r.id, r.slot_id, r.requesting_teacher_id, r.message,
         r.proposed_subject_id, r.status, r.created_at,
         r.proposed_start_time::text AS proposed_start_time,
         r.proposed_end_time::text AS proposed_end_time,
         rt.name AS requesting_teacher_name,
         ps.name AS proposed_subject_name,
         s.day_of_week AS slot_day,
         s.start_time::text AS slot_start,
         s.end_time::text AS slot_end,
         su.name AS slot_subject_name,
         c.name AS class_name, c.level AS class_level, c.id AS class_id,
         owner.name AS owner_name
  FROM swap_requests r
  JOIN users rt ON rt.id = r.requesting_teacher_id
  JOIN subjects ps ON ps.id = r.proposed_subject_id
  JOIN slots s ON s.id = r.slot_id
  JOIN subjects su ON su.id = s.subject_id
  JOIN classes c ON c.id = s.class_id
  JOIN users owner ON owner.id = s.creator_teacher_id`;

function mapRow(r: Record<string, unknown>): SwapRequest {
  return {
    id: r.id as string,
    slot_id: r.slot_id as string,
    requesting_teacher_id: r.requesting_teacher_id as string,
    message: r.message as string,
    proposed_subject_id: r.proposed_subject_id as string,
    status: r.status as SwapRequest["status"],
    created_at: (r.created_at as Date).toISOString(),
    requesting_teacher_name: r.requesting_teacher_name as string,
    proposed_subject_name: r.proposed_subject_name as string,
    slot_day: r.slot_day as number,
    slot_start: r.slot_start as string,
    slot_end: r.slot_end as string,
    slot_subject_name: r.slot_subject_name as string,
    proposed_start_time: (r.proposed_start_time as string).slice(0, 5),
    proposed_end_time: (r.proposed_end_time as string).slice(0, 5),
    class_name: r.class_name as string,
    class_level: r.class_level as string,
    class_id: r.class_id as string,
    owner_name: r.owner_name as string,
  };
}

export async function getSwapRequestsForDirector(): Promise<SwapRequest[]> {
  const user = await requireUser();
  if (user.role !== "director") return [];
  const { rows } = await db.query(`${SWAP_SELECT} ORDER BY r.created_at DESC`);
  return rows.map(mapRow);
}

export async function getMySwapRequests(): Promise<SwapRequest[]> {
  const user = await requireUser();
  const { rows } = await db.query(
    `${SWAP_SELECT} WHERE r.requesting_teacher_id = $1 ORDER BY r.created_at DESC LIMIT 20`,
    [user.id]
  );
  return rows.map(mapRow);
}
