import pg from "pg";

const DATABASE_URL =
  process.env.DATABASE_URL ?? "postgresql://postgres@127.0.0.1:5432/unislot";

async function main() {
  const db = new pg.Client({ connectionString: DATABASE_URL });
  await db.connect();

  // Plage horaire demandée dans les demandes de modification de créneau
  await db.query(`
    ALTER TABLE swap_requests
      ADD COLUMN IF NOT EXISTS proposed_start_time time,
      ADD COLUMN IF NOT EXISTS proposed_end_time time
  `);

  // Backfill : les demandes existantes reprennent les heures du créneau ciblé (rachat total)
  await db.query(`
    UPDATE swap_requests r
    SET proposed_start_time = s.start_time,
        proposed_end_time = s.end_time
    FROM slots s
    WHERE s.id = r.slot_id
      AND (r.proposed_start_time IS NULL OR r.proposed_end_time IS NULL)
  `);

  await db.query(`
    ALTER TABLE swap_requests
      ALTER COLUMN proposed_start_time SET NOT NULL,
      ALTER COLUMN proposed_end_time SET NOT NULL
  `);

  await db.end();
  console.log("Migration swap_requests terminée.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
