import { createClient } from "redis";
import { config } from "./config.js";
import { OpenCodeClient } from "./lib/opencode.js";
import { Persistence } from "./lib/persistence.js";
import { Queue } from "./lib/queue.js";
import { WorkflowWorker } from "./lib/worker.js";
import { createServer } from "./server.js";

const db = new Persistence(config);

const redis = createClient({ url: config.redisUrl });
redis.on("error", (error: unknown) => {
  console.error("[redis] Client error:", error);
});
await redis.connect();

const queue = new Queue(redis, config);
const opencode = new OpenCodeClient(config);
const worker = new WorkflowWorker({ config, db, queue, opencode });
const app = createServer({ config, worker });
const server = app.listen(config.port, () => {
  console.log(`[server] Jira webhook worker listening on http://127.0.0.1:${config.port}`);
});

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, async () => {
    console.log(`[server] Received ${signal}, shutting down.`);
    server.close();
    await redis.quit();
    await db.close();
    process.exit(0);
  });
}
