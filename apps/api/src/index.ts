import { createServer } from "./server.js";
import { runMigrations } from "./shared/db/migration-runner.js";

const port = Number(process.env.API_PORT ?? "3001");
const host = process.env.API_HOST ?? "0.0.0.0";

async function main() {
  await runMigrations();
  const app = await createServer();
  await app.listen({ port, host });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
