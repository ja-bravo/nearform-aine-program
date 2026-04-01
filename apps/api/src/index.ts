import { createServer } from "./server.js";

const port = Number(process.env.API_PORT ?? "3001");
const host = process.env.API_HOST ?? "0.0.0.0";

async function main() {
  const app = createServer();
  await app.listen({ port, host });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
