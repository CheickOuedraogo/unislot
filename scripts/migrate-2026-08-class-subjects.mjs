import pg from "pg";

const DATABASE_URL =
  process.env.DATABASE_URL ?? "postgresql://postgres@127.0.0.1:5432/unislot";

async function main() {
  const db = new pg.Client({ connectionString: DATABASE_URL });
  await db.connect();

  // 1. Table class_subjects (matières rattachées aux classes, indépendamment des profs)
  await db.query(`
    CREATE TABLE IF NOT EXISTS class_subjects (
      class_id uuid NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
      subject_id uuid NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
      PRIMARY KEY (class_id, subject_id)
    )
  `);
  await db.query(
    "CREATE INDEX IF NOT EXISTS idx_class_subjects_subject ON class_subjects (subject_id)"
  );

  // 2. Alimenter depuis les assignations existantes
  const { rowCount } = await db.query(`
    INSERT INTO class_subjects (class_id, subject_id)
    SELECT DISTINCT ts.class_id, ts.subject_id
    FROM teacher_subjects ts
    ON CONFLICT DO NOTHING
  `);
  console.log(`class_subjects: ${rowCount ?? 0} ligne(s) créée(s).`);

  // 3. Noms au format « NOM Prénom »
  const { rowCount: renamed } = await db.query(`
    UPDATE users
    SET name = btrim(last_name || ' ' || first_name)
    WHERE role = 'teacher'
      AND first_name <> '' AND last_name <> ''
      AND name <> btrim(last_name || ' ' || first_name)
  `);
  console.log(`Noms reformatés « NOM Prénom »: ${renamed ?? 0} utilisateur(s).`);

  await db.end();
  console.log("Migration terminée.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
