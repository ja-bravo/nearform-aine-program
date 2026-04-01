import { runMigrations } from "./shared/db/migration-runner.js";

async function main() {
  await runMigrations();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
