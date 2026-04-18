import process from "node:process";
import type { AppConfig } from "./types.js";

function env(name: string, fallback = ""): string {
  const value = process.env[name];
  return value === undefined ? fallback : value;
}

function envInt(name: string, fallback: number): number {
  const raw = env(name, String(fallback));
  const value = Number.parseInt(raw, 10);
  if (Number.isNaN(value)) {
    throw new Error(`Invalid integer for ${name}: ${raw}`);
  }
  return value;
}

function csv(name: string): string[] {
  return env(name)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export const config: AppConfig = {
  port: envInt("PORT", 8080),
  redisUrl: env("REDIS_URL", "redis://127.0.0.1:6379"),
  postgresUrl: env("POSTGRES_URL", "postgresql://opencode:opencode@127.0.0.1:5432/opencode_oncall"),
  opencodeServerUrl: env("OPENCODE_SERVER_URL", "http://127.0.0.1:4096"),
  opencodeAgent: env("OPENCODE_AGENT", "oncall"),
  opencodeModel: env("OPENCODE_MODEL", ""),
  jiraWebhookSecret: env("JIRA_WEBHOOK_SECRET", ""),
  jiraPublicGroup: env("JIRA_PUBLIC_GROUP", "jira-vymo"),
  deliveryCommentMarker: env("DELIVERY_COMMENT_MARKER", "[opencode-delivery-comment]"),
  botAuthorAccountIds: new Set(csv("BOT_AUTHOR_ACCOUNT_IDS")),
  botAuthorNames: new Set(csv("BOT_AUTHOR_NAMES")),
  defaultBranchBase: env("DEFAULT_BRANCH_BASE", "master"),
  redisLockTtlSec: envInt("REDIS_LOCK_TTL_SEC", 900),
  processingPollMs: envInt("PROCESSING_POLL_MS", 2000),
  workerId: env("WORKER_ID", `worker-${process.pid}`)
};
