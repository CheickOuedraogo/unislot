import { Pool, type QueryResultRow, type PoolClient } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on("error", (err) => {
  console.error("Erreur inattendue sur un client idle de la base de données", err);
});

export const db = {
  query<R extends QueryResultRow = QueryResultRow>(
    text: string,
    params?: unknown[]
  ) {
    return pool.query<R, unknown[]>(text, params);
  },
};

export async function transaction<T>(
  fn: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export type TransactionClient = PoolClient;
