import pg from "pg";

const DATABASE_URL =
  process.env.DATABASE_URL ?? "postgresql://postgres@127.0.0.1:5432/unislot";

async function main() {
  const db = new pg.Client({ connectionString: DATABASE_URL });
  await db.connect();

  await db.query(`
    ALTER TABLE users DROP COLUMN IF EXISTS must_change_password
  `);

  await db.end();
  console.log("Migration drop must_change_password terminée.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});