import pg from "pg";
import { randomBytes, scryptSync } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ADMIN_URL =
  process.env.ADMIN_DATABASE_URL ?? "postgresql://postgres@127.0.0.1:5432/postgres";
const DB_NAME = "unislot";
const DATABASE_URL =
  process.env.DATABASE_URL ?? `postgresql://postgres@127.0.0.1:5432/${DB_NAME}`;

const DEFAULT_PASSWORD = "12345678";
const DIRECTOR_EMAIL = "hcheick75@gmail.com";

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64);
  return `scrypt:${salt}:${derived.toString("hex")}`;
}

async function ensureDatabase() {
  const admin = new pg.Client({ connectionString: ADMIN_URL });
  await admin.connect();
  const { rowCount } = await admin.query(
    "SELECT 1 FROM pg_database WHERE datname = $1",
    [DB_NAME]
  );
  if (rowCount === 0) {
    await admin.query(`CREATE DATABASE "${DB_NAME}"`);
    console.log(`Database "${DB_NAME}" created.`);
  } else {
    console.log(`Database "${DB_NAME}" already exists.`);
  }
  await admin.end();
}

async function seed(db) {
  const { rowCount: userCount } = await db.query("SELECT 1 FROM users");
  if (userCount > 0) {
    console.log("Users already seeded, skipping.");
    return;
  }

  await db.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, 'director')`,
    ["Directeur", DIRECTOR_EMAIL, hashPassword(DEFAULT_PASSWORD)]
  );

  const teacherRows = [
    ["Pr Ouedraogo", "ouedraogo@unislot.fr"],
    ["Pr Traoré", "traore@unislot.fr"],
    ["Dr. Smith", "smith@unislot.fr"],
  ];
  const teacherIds = {};
  for (const [name, email] of teacherRows) {
    const { rows } = await db.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, 'teacher')
       RETURNING id`,
      [name, email, hashPassword(DEFAULT_PASSWORD)]
    );
    teacherIds[name] = rows[0].id;
  }

  const { rows: classRows } = await db.query(
    `INSERT INTO classes (name, level) VALUES
     ('Informatique', 'L1'),
     ('Mathématiques', 'L2'),
     ('Data Science', 'M1')
     RETURNING id, name`
  );
  const classIds = Object.fromEntries(classRows.map((c) => [c.name, c.id]));

  const { rows: subjectRows } = await db.query(
    `INSERT INTO subjects (name) VALUES
     ('Mathématiques'), ('Physique'), ('Programmation'),
     ('Bases de données'), ('Algorithmique')
     RETURNING id, name`
  );
  const subjectIds = Object.fromEntries(subjectRows.map((s) => [s.name, s.id]));

  const assignments = [
    ["Pr Ouedraogo", "Programmation", "Informatique"],
    ["Pr Ouedraogo", "Algorithmique", "Informatique"],
    ["Pr Ouedraogo", "Mathématiques", "Mathématiques"],
    ["Pr Traoré", "Mathématiques", "Mathématiques"],
    ["Pr Traoré", "Physique", "Mathématiques"],
    ["Dr. Smith", "Bases de données", "Data Science"],
  ];
  const pairs = new Set(assignments.map(([, subject, cls]) => `${subject}|${cls}`));
  for (const pair of pairs) {
    const [subject, cls] = pair.split("|");
    await db.query(
      `INSERT INTO class_subjects (class_id, subject_id) VALUES ($1, $2)`,
      [classIds[cls], subjectIds[subject]]
    );
  }

  for (const [teacher, subject, cls] of assignments) {
    await db.query(
      `INSERT INTO teacher_subjects (teacher_id, subject_id, class_id)
       VALUES ($1, $2, $3)`,
      [teacherIds[teacher], subjectIds[subject], classIds[cls]]
    );
  }

  const slots = [
    {
      class: "Informatique",
      subject: "Programmation",
      type: "cours",
      day: 0,
      start: "08:00",
      end: "10:00",
      creator: "Pr Ouedraogo",
      profs: ["Pr Ouedraogo"],
    },
    {
      class: "Informatique",
      subject: "Algorithmique",
      type: "tp",
      day: 0,
      start: "10:00",
      end: "12:00",
      creator: "Pr Ouedraogo",
      profs: ["Pr Ouedraogo", "Pr Traoré"],
    },
    {
      class: "Mathématiques",
      subject: "Mathématiques",
      type: "cours",
      day: 1,
      start: "08:00",
      end: "10:00",
      creator: "Pr Traoré",
      profs: ["Pr Traoré"],
    },
    {
      class: "Informatique",
      subject: "Programmation",
      type: "td",
      day: 2,
      start: "14:00",
      end: "16:00",
      creator: "Pr Ouedraogo",
      profs: ["Pr Ouedraogo"],
    },
    {
      class: "Data Science",
      subject: "Bases de données",
      type: "cours",
      day: 5,
      start: "09:00",
      end: "11:00",
      creator: "Dr. Smith",
      profs: ["Dr. Smith"],
    },
    {
      class: "Mathématiques",
      subject: "Physique",
      type: "devoir",
      day: 6,
      start: "09:00",
      end: "11:00",
      creator: "Pr Traoré",
      profs: ["Pr Traoré"],
    },
  ];

  for (const slot of slots) {
    const { rows } = await db.query(
      `INSERT INTO slots (class_id, subject_id, type, day_of_week, start_time, end_time, creator_teacher_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [
        classIds[slot.class],
        subjectIds[slot.subject],
        slot.type,
        slot.day,
        slot.start,
        slot.end,
        teacherIds[slot.creator],
      ]
    );
    for (const prof of slot.profs) {
      await db.query(
        `INSERT INTO slot_professors (slot_id, teacher_id) VALUES ($1, $2)`,
        [rows[0].id, teacherIds[prof]]
      );
    }
  }

  console.log(
    `Seed OK — directeur: ${DIRECTOR_EMAIL} / ${DEFAULT_PASSWORD}`
  );
}

async function main() {
  await ensureDatabase();
  const db = new pg.Client({ connectionString: DATABASE_URL });
  await db.connect();
  const schema = readFileSync(join(__dirname, "..", "lib", "schema.sql"), "utf8");
  await db.query(schema);
  console.log("Schema applied.");
  await seed(db);
  await db.end();
  console.log("Setup terminé.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
