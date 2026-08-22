import { db } from "@/lib/db";
import type { SchoolClass, Slot, Subject, Teacher, TeacherSubject, User } from "@/lib/types";

export async function getClassesForUser(user: User): Promise<SchoolClass[]> {
  if (user.role === "director") {
    const { rows } = await db.query<SchoolClass>(
      "SELECT id, name, level FROM classes ORDER BY name"
    );
    return rows;
  }
  const { rows } = await db.query<SchoolClass>(
    `SELECT DISTINCT c.id, c.name, c.level
     FROM teacher_subjects ts
     JOIN classes c ON c.id = ts.class_id
     WHERE ts.teacher_id = $1
     ORDER BY c.name`,
    [user.id]
  );
  return rows;
}

export async function getSubjectsForClass(user: User, classId: string): Promise<Subject[]> {
  if (user.role === "director") {
    const { rows } = await db.query<Subject>(
      `SELECT su.id, su.name
       FROM class_subjects cs
       JOIN subjects su ON su.id = cs.subject_id
       WHERE cs.class_id = $1
       ORDER BY su.name`,
      [classId]
    );
    return rows;
  }
  const { rows } = await db.query<Subject>(
    `SELECT DISTINCT su.id, su.name
     FROM teacher_subjects ts
     JOIN subjects su ON su.id = ts.subject_id
     WHERE ts.teacher_id = $1 AND ts.class_id = $2
     ORDER BY su.name`,
    [user.id, classId]
  );
  return rows;
}

export async function getSlotsForClass(classId: string): Promise<Slot[]> {
  const { rows } = await db.query(
    `SELECT s.id, s.class_id, s.subject_id, s.type, s.day_of_week, s.start_time, s.end_time, s.creator_teacher_id,
            su.name AS subject_name, c.name AS class_name
     FROM slots s
     JOIN subjects su ON su.id = s.subject_id
     JOIN classes c ON c.id = s.class_id
     WHERE s.class_id = $1
     ORDER BY s.day_of_week, s.start_time`,
    [classId]
  );

  if (rows.length === 0) return [];

  const slotIds = rows.map((r) => r.id);
  const { rows: profRows } = await db.query(
    `SELECT sp.slot_id, u.id, u.name
     FROM slot_professors sp
     JOIN users u ON u.id = sp.teacher_id
     WHERE sp.slot_id = ANY($1)
     ORDER BY u.name`,
    [slotIds]
  );

  const bySlot = new Map<string, { id: string; name: string }[]>();
  for (const p of profRows) {
    const list = bySlot.get(p.slot_id) ?? [];
    list.push({ id: p.id, name: p.name });
    bySlot.set(p.slot_id, list);
  }

  return rows.map((r) => ({
    id: r.id,
    class_id: r.class_id,
    subject_id: r.subject_id,
    type: r.type,
    day_of_week: r.day_of_week,
    start_time: r.start_time,
    end_time: r.end_time,
    creator_teacher_id: r.creator_teacher_id,
    subject_name: r.subject_name,
    class_name: r.class_name,
    professors: bySlot.get(r.id) ?? [],
  }));
}

export async function getAllTeachers(): Promise<Teacher[]> {
  const { rows } = await db.query<Teacher>(
    "SELECT id, name, email, first_name, last_name, is_active FROM users WHERE role = 'teacher' ORDER BY name"
  );
  return rows;
}

export async function getTeacherById(userId: string): Promise<
  | (Teacher & {
      assignments: {
        id: string;
        subjectName: string;
        className: string;
        level: string;
      }[];
    })
  | null
> {
  const { rows } = await db.query<Teacher>(
    "SELECT id, name, email, first_name, last_name, is_active FROM users WHERE id = $1 AND role = 'teacher'",
    [userId]
  );
  const teacher = rows[0];
  if (!teacher) return null;

  const { rows: assignmentRows } = await db.query(
    `SELECT ts.id, su.name AS subject_name, c.name AS class_name, c.level
     FROM teacher_subjects ts
     JOIN subjects su ON su.id = ts.subject_id
     JOIN classes c ON c.id = ts.class_id
     WHERE ts.teacher_id = $1
     ORDER BY c.name, su.name`,
    [userId]
  );

  return {
    ...teacher,
    assignments: assignmentRows.map((r) => ({
      id: r.id,
      subjectName: r.subject_name,
      className: r.class_name,
      level: r.level,
    })),
  };
}

export async function getAllClasses(): Promise<SchoolClass[]> {
  const { rows } = await db.query<SchoolClass>(
    "SELECT id, name, level FROM classes ORDER BY name"
  );
  return rows;
}

export type ClassWithStats = {
  id: string;
  name: string;
  level: string;
  subjectCount: number;
  teacherCount: number;
};

export async function getClassesWithStats(): Promise<ClassWithStats[]> {
  const { rows } = await db.query<{
    id: string;
    name: string;
    level: string;
    subject_count: number;
    teacher_count: number;
  }>(
     `SELECT c.id, c.name, c.level,
       (SELECT count(*) FROM class_subjects cs WHERE cs.class_id = c.id) AS subject_count,
       (SELECT count(DISTINCT ts.teacher_id) FROM teacher_subjects ts WHERE ts.class_id = c.id) AS teacher_count
     FROM classes c
     ORDER BY c.name`
  );
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    level: r.level,
    subjectCount: Number(r.subject_count),
    teacherCount: Number(r.teacher_count),
  }));
}

export async function getAllAssignments(): Promise<TeacherSubject[]> {
  const { rows } = await db.query<TeacherSubject>(
    `SELECT ts.id, ts.teacher_id, ts.subject_id, ts.class_id,
            u.name AS teacher_name, su.name AS subject_name, c.name AS class_name, c.level AS class_level
     FROM teacher_subjects ts
     JOIN users u ON u.id = ts.teacher_id
     JOIN subjects su ON su.id = ts.subject_id
     JOIN classes c ON c.id = ts.class_id
     ORDER BY c.name, u.name, su.name`
  );
  return rows;
}

export async function getDirectorStats(): Promise<{
  teachers: number;
  classes: number;
  subjects: number;
}> {
  const { rows } = await db.query(
    `SELECT
       (SELECT count(*) FROM users WHERE role = 'teacher') AS teachers,
       (SELECT count(*) FROM classes) AS classes,
       (SELECT count(*) FROM subjects) AS subjects`
  );
  return {
    teachers: Number(rows[0].teachers),
    classes: Number(rows[0].classes),
    subjects: Number(rows[0].subjects),
  };
}

export type TeacherAssignment = {
  classId: string;
  className: string;
  level: string;
  subjects: { id: string; name: string }[];
};

export async function getTeacherAssignments(userId: string): Promise<TeacherAssignment[]> {
  const { rows } = await db.query(
    `SELECT ts.class_id, c.name AS class_name, c.level, su.id AS subject_id, su.name AS subject_name
     FROM teacher_subjects ts
     JOIN classes c ON c.id = ts.class_id
     JOIN subjects su ON su.id = ts.subject_id
     WHERE ts.teacher_id = $1
     ORDER BY c.name, su.name`,
    [userId]
  );

  const map = new Map<string, TeacherAssignment>();
  for (const r of rows) {
    let entry = map.get(r.class_id);
    if (!entry) {
      entry = { classId: r.class_id, className: r.class_name, level: r.level, subjects: [] };
      map.set(r.class_id, entry);
    }
    entry.subjects.push({ id: r.subject_id, name: r.subject_name });
  }
  return [...map.values()];
}

export type TeacherStats = {
  totalHours: number;
  subjects: { subject: string; hours: number }[];
  classes: { className: string; hours: number }[];
};

export async function getTeacherStats(userId: string): Promise<TeacherStats> {
  const { rows } = await db.query(
    `SELECT
       coalesce(sum(EXTRACT(EPOCH FROM (s.end_time - s.start_time)) / 3600), 0) AS total
     FROM slots s
     JOIN slot_professors sp ON sp.slot_id = s.id
     WHERE sp.teacher_id = $1`,
    [userId]
  );

  const { rows: subjectRows } = await db.query(
    `SELECT su.name AS subject, sum(EXTRACT(EPOCH FROM (s.end_time - s.start_time)) / 3600) AS hours
     FROM slots s
     JOIN slot_professors sp ON sp.slot_id = s.id
     JOIN subjects su ON su.id = s.subject_id
     WHERE sp.teacher_id = $1
     GROUP BY su.name
     ORDER BY hours DESC`,
    [userId]
  );

  const { rows: classRows } = await db.query(
    `SELECT c.name AS class_name, sum(EXTRACT(EPOCH FROM (s.end_time - s.start_time)) / 3600) AS hours
     FROM slots s
     JOIN slot_professors sp ON sp.slot_id = s.id
     JOIN classes c ON c.id = s.class_id
     WHERE sp.teacher_id = $1
     GROUP BY c.name
     ORDER BY c.name`,
    [userId]
  );

  return {
    totalHours: Number(rows[0].total),
    subjects: subjectRows.map((r) => ({ subject: r.subject, hours: Number(r.hours) })),
    classes: classRows.map((r) => ({ className: r.class_name, hours: Number(r.hours) })),
  };
}

export async function getClassById(classId: string): Promise<SchoolClass | null> {
  const { rows } = await db.query<SchoolClass>(
    "SELECT id, name, level FROM classes WHERE id = $1",
    [classId]
  );
  return rows[0] ?? null;
}

export type ClassSubjectDetail = {
  subjectId: string;
  name: string;
  teachers: { assignmentId: string; teacherId: string; teacherName: string }[];
};

export async function getSubjectsOfClass(
  classId: string
): Promise<ClassSubjectDetail[]> {
  const { rows } = await db.query<{ subject_id: string; name: string }>(
    `SELECT cs.subject_id, su.name
     FROM class_subjects cs
     JOIN subjects su ON su.id = cs.subject_id
     WHERE cs.class_id = $1
     ORDER BY su.name`,
    [classId]
  );

  const { rows: teacherRows } = await db.query<{
    subject_id: string;
    assignment_id: string;
    teacher_id: string;
    teacher_name: string;
  }>(
    `SELECT ts.subject_id, ts.id AS assignment_id, u.id AS teacher_id, u.name AS teacher_name
     FROM teacher_subjects ts
     JOIN users u ON u.id = ts.teacher_id
     WHERE ts.class_id = $1
     ORDER BY u.name`,
    [classId]
  );

  const bySubject = new Map<string, ClassSubjectDetail>();
  for (const r of rows) {
    bySubject.set(r.subject_id, { subjectId: r.subject_id, name: r.name, teachers: [] });
  }
  for (const t of teacherRows) {
    bySubject.get(t.subject_id)?.teachers.push({
      assignmentId: t.assignment_id,
      teacherId: t.teacher_id,
      teacherName: t.teacher_name,
    });
  }
  return [...bySubject.values()];
}

export async function getAvailableSubjectsForClass(
  classId: string
): Promise<Subject[]> {
  const { rows } = await db.query<Subject>(
    `SELECT su.id, su.name
     FROM subjects su
     WHERE NOT EXISTS (
       SELECT 1 FROM class_subjects cs WHERE cs.class_id = $1 AND cs.subject_id = su.id
     )
     ORDER BY su.name`,
    [classId]
  );
  return rows;
}

export type ClassSubjectPair = {
  classId: string;
  subjectId: string;
  name: string;
};

export async function getAllClassSubjects(): Promise<ClassSubjectPair[]> {
  const { rows } = await db.query<{
    class_id: string;
    subject_id: string;
    name: string;
  }>(
    `SELECT cs.class_id, cs.subject_id, su.name
     FROM class_subjects cs
     JOIN subjects su ON su.id = cs.subject_id
     ORDER BY su.name`
  );
  return rows.map((r) => ({
    classId: r.class_id,
    subjectId: r.subject_id,
    name: r.name,
  }));
}
