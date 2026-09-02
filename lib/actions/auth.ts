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
  next: string,
  confirm: string
): Promise<ActionResult> {
  const error = validateNewPassword(next, confirm);
  if (error) return { error };

  const passwordHash = await hashPassword(next);
  await db.query(
    "UPDATE users SET password_hash = $1 WHERE id = $2",
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
    role: "director" | "teacher";
    is_active: boolean;
  }>(
    "SELECT id, password_hash, role, is_active FROM users WHERE email = $1",
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

  redirect(roleHome(user));
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

export async function createTeacherAccount(
  firstName: string,
  lastName: string,
  email: string,
  password: string
): Promise<ActionResult> {
  await requireRole("director");

  const cleanFirst = firstName.trim();
  const cleanLast = lastName.trim();
  const cleanEmail = email.trim().toLowerCase();

  if (!cleanFirst || !cleanLast) return { error: "Nom et prénom requis." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) return { error: "Email invalide." };
  if (!password || password.length < MIN_PASSWORD_LENGTH) {
    return {
      error: `Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères.`,
    };
  }

  const { rowCount } = await db.query("SELECT 1 FROM users WHERE email = $1", [cleanEmail]);
  if (rowCount) return { error: "Un compte avec cet email existe déjà." };

  const name = `${cleanLast} ${cleanFirst}`.trim();
  const passwordHash = await hashPassword(password);
  await db.query(
    "INSERT INTO users (name, email, password_hash, role, first_name, last_name) VALUES ($1, $2, $3, 'teacher', $4, $5)",
    [name, cleanEmail, passwordHash, cleanFirst, cleanLast]
  );
  revalidatePaths(["/director", "/director/teachers"]);
  return { success: "Compte enseignant créé." };
}

export async function updateTeacherPassword(
  _state: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  await requireRole("director");

  const userId = String(formData.get("userId") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!userId) return { error: "Enseignant introuvable." };
  if (!password || password.length < MIN_PASSWORD_LENGTH) {
    return {
      error: `Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères.`,
    };
  }

  const passwordHash = await hashPassword(password);
  const { rowCount } = await db.query(
    "UPDATE users SET password_hash = $1 WHERE id = $2 AND role = 'teacher'",
    [passwordHash, userId]
  );
  if (!rowCount) return { error: "Enseignant introuvable." };
  revalidatePaths(["/director", `/director/teachers/${userId}`]);
  return { success: "Mot de passe mis à jour." };
}

export async function deleteTeacher(userId: string): Promise<ActionResult> {
  await requireRole("director");

  if (userId === (await getCurrentUser())?.id) {
    return { error: "Impossible de supprimer votre propre compte." };
  }
  await db.query("DELETE FROM slots WHERE creator_teacher_id = $1", [userId]);
  await db.query("DELETE FROM swap_requests WHERE requesting_teacher_id = $1", [userId]);
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

  const name = `${lastName} ${firstName}`.trim();
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
  const next = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  const result = await changeUserPassword(user, next, confirm);
  if (!result.error) result.success = "Mot de passe mis à jour.";
  return result;
}

export async function updateTeacherAccount(
  _state: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  await requireRole("director");

  const userId = String(formData.get("userId") ?? "");
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!userId) return { error: "Enseignant introuvable." };
  if (!firstName || !lastName) return { error: "Prénom et nom requis." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Email invalide." };

  const { rowCount: existing } = await db.query(
    "SELECT 1 FROM users WHERE email = $1 AND id != $2",
    [email, userId]
  );
  if (existing) return { error: "Un compte avec cet email existe déjà." };

  const { rowCount } = await db.query(
    "UPDATE users SET name = $1, email = $2, first_name = $3, last_name = $4 WHERE id = $5 AND role = 'teacher'",
    [`${lastName} ${firstName}`.trim(), email, firstName, lastName, userId]
  );
  if (!rowCount) return { error: "Enseignant introuvable." };
  revalidatePaths(["/director", "/director/teachers", `/director/teachers/${userId}`]);
  return { success: "Enseignant mis à jour." };
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
