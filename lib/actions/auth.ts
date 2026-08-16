"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import {
  createSession,
  getCurrentUser,
  hashPassword,
  requireRole,
  requireUser,
  roleHome,
  sha256,
  verifyPassword,
} from "@/lib/auth";
import {
  DEFAULT_TEACHER_PASSWORD,
  SESSION_COOKIE,
  SESSION_DURATION_DAYS,
} from "@/lib/constants";
import { revalidatePaths } from "@/lib/revalidate";

export type ActionResult = { error?: string; success?: string };

const MIN_PASSWORD_LENGTH = 8;

function validateNewPassword(next: string, confirm: string): string | null {
  if (!next || next.length < MIN_PASSWORD_LENGTH) {
    return `Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères.`;
  }
  if (next !== confirm) return "Les mots de passe ne correspondent pas.";
  return null;
}

async function changeUserPassword(
  user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>,
  current: string,
  next: string,
  confirm: string
): Promise<ActionResult> {
  const error = validateNewPassword(next, confirm);
  if (error) return { error };

  const { rows } = await db.query<{ password_hash: string }>(
    "SELECT password_hash FROM users WHERE id = $1",
    [user.id]
  );
  if (!rows[0] || !(await verifyPassword(current, rows[0].password_hash))) {
    return { error: "Mot de passe actuel incorrect." };
  }

  const passwordHash = await hashPassword(next);
  await db.query(
    "UPDATE users SET password_hash = $1, must_change_password = false WHERE id = $2",
    [passwordHash, user.id]
  );
  return {};
}

export async function login(
  _state: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) return { error: "Email et mot de passe requis." };

  const { rows } = await db.query<{
    id: string;
    password_hash: string;
    must_change_password: boolean;
    role: "director" | "teacher";
    is_active: boolean;
  }>(
    "SELECT id, password_hash, must_change_password, role, is_active FROM users WHERE email = $1",
    [email]
  );
  const user = rows[0];
  if (!user || !(await verifyPassword(password, user.password_hash))) {
    return { error: "Email ou mot de passe incorrect." };
  }
  if (!user.is_active) {
    return {
      error: "Ce compte a été désactivé. Contactez le directeur.",
    };
  }

  const token = await createSession(user.id);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DURATION_DAYS * 24 * 60 * 60,
  });

  redirect(user.must_change_password ? "/auth/change-password" : roleHome(user));
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.query("DELETE FROM sessions WHERE token_hash = $1", [sha256(token)]);
  }
  cookieStore.delete(SESSION_COOKIE);
  redirect("/login");
}

export async function changePassword(
  _state: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  const result = await changeUserPassword(user, current, next, confirm);
  if (result.error) return result;

  redirect(roleHome(user));
}

export async function createTeacherAccount(
  _state: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  await requireRole("director");

  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!firstName || !lastName) return { error: "Prénom et nom requis." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Email invalide." };

  const { rowCount } = await db.query("SELECT 1 FROM users WHERE email = $1", [email]);
  if (rowCount) return { error: "Un compte avec cet email existe déjà." };

  const name = `${firstName} ${lastName}`.trim();
  const passwordHash = await hashPassword(DEFAULT_TEACHER_PASSWORD);
  await db.query(
    "INSERT INTO users (name, email, password_hash, role, first_name, last_name, must_change_password) VALUES ($1, $2, $3, 'teacher', $4, $5, true)",
    [name, email, passwordHash, firstName, lastName]
  );
  revalidatePaths(["/director", "/director/teachers"]);
  return { success: `Compte créé. Mot de passe par défaut : ${DEFAULT_TEACHER_PASSWORD}` };
}

export async function deleteTeacher(userId: string): Promise<ActionResult> {
  await requireRole("director");

  if (userId === (await getCurrentUser())?.id) {
    return { error: "Impossible de supprimer votre propre compte." };
  }
  const { rows } = await db.query("SELECT id FROM slots WHERE creator_teacher_id = $1 LIMIT 1", [userId]);
  if (rows.length > 0) {
    return { error: "Cet enseignant possède des créneaux. Supprimez-les d'abord." };
  }
  await db.query("DELETE FROM users WHERE id = $1", [userId]);
  revalidatePaths(["/director", "/director/teachers"]);
  return { success: "Enseignant supprimé." };
}

export async function updateProfile(
  _state: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const user = await requireUser();
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  if (!firstName || !lastName) return { error: "Prénom et nom requis." };

  const name = `${firstName} ${lastName}`.trim();
  await db.query(
    "UPDATE users SET name = $1, first_name = $2, last_name = $3 WHERE id = $4",
    [name, firstName, lastName, user.id]
  );
  revalidatePaths(["/profile"]);
  return { success: "Profil mis à jour." };
}

export async function updatePassword(
  _state: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const user = await requireUser();
  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  return changeUserPassword(user, current, next, confirm);
}

export async function setTeacherActive(
  userId: string,
  active: boolean
): Promise<ActionResult> {
  await requireRole("director");

  if (userId === (await getCurrentUser())?.id) {
    return { error: "Impossible de désactiver votre propre compte." };
  }
  const { rowCount } = await db.query(
    "UPDATE users SET is_active = $1 WHERE id = $2 AND role = 'teacher'",
    [active, userId]
  );
  if (!rowCount) return { error: "Enseignant introuvable." };
  revalidatePaths(["/director", "/director/teachers"]);
  return {
    success: active ? "Compte activé." : "Compte désactivé.",
  };
}
