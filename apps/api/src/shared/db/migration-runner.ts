import SQL from "@nearform/sql";
import Postgrator from "postgrator";
import { dirname, join } from "path";
import pg from "pg";
import { fileURLToPath } from "url";

export const MIGRATION_SCHEMA_TABLE = "schemaversion";

function databaseNameFromConnectionString(connectionString: string): string {
  const normalized = connectionString.startsWith("postgres://")
    ? `postgresql://${connectionString.slice("postgres://".length)}`
    : connectionString;
  const url = new URL(normalized);
  const path = url.pathname.replace(/^\//, "");
  const name = path.split("/")[0];
  if (!name) {
    throw new Error("DATABASE_URL must include a database name in the path");
  }
  return decodeURIComponent(name);
}

export function getMigrationsGlob(): string {
  const here = dirname(fileURLToPath(import.meta.url));
  const packageRoot = join(here, "..", "..", "..");
  return join(packageRoot, "migrations", "*.sql");
}

export async function runMigrations(): Promise<void> {
  const connectionString = process.env.DATABASE_URL?.trim();
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set; migrations require a Postgres connection string"
    );
  }

  const database = databaseNameFromConnectionString(connectionString);
  const client = new pg.Client({
    connectionString,
    connectionTimeoutMillis: 5000,
  });

  await client.connect();

  const statement = SQL`SELECT 1 AS one`;
  await client.query({ text: statement.text, values: statement.values });

  const postgrator = new Postgrator({
    migrationPattern: getMigrationsGlob(),
    driver: "pg",
    database,
    schemaTable: MIGRATION_SCHEMA_TABLE,
    execQuery: async (query) => {
      const result = await client.query(query);
      return { rows: result.rows };
    },
    execSqlScript: async (sqlScript) => {
      await client.query(sqlScript);
    },
  });

  try {
    await postgrator.migrate();
  } catch (err) {
    const applied =
      err &&
      typeof err === "object" &&
      "appliedMigrations" in err &&
      Array.isArray((err as { appliedMigrations: unknown }).appliedMigrations)
        ? (err as { appliedMigrations: unknown[] }).appliedMigrations
        : [];
    console.error(
      JSON.stringify({
        msg: "database migration failed",
        cause: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
        appliedMigrations: applied,
      })
    );
    throw err;
  } finally {
    await client.end().catch(() => {});
  }
}
