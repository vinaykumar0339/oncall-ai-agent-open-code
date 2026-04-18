import express, { type Request, type Response } from "express";
import { normalizeJiraWebhook, validateJiraSignature } from "./lib/jira.js";
import type { AppConfig } from "./types.js";
import type { WorkflowWorker } from "./lib/worker.js";

type RawBodyRequest = Request & {
  rawBody?: Buffer;
};

function sendJson(res: Response, statusCode: number, payload: Record<string, unknown>): void {
  res.status(statusCode).json(payload);
}

export function createServer(input: { config: AppConfig; worker: WorkflowWorker }) {
  const app = express();

  app.use(
    express.json({
      verify: (req, _res, buf) => {
        (req as RawBodyRequest).rawBody = Buffer.from(buf);
      }
    })
  );

  app.get("/healthz", (_req, res) => {
    sendJson(res, 200, { ok: true });
  });

  app.post("/webhooks/jira", async (req: RawBodyRequest, res: Response) => {
    try {
      const signatureHeader = req.header("x-hub-signature-256") || req.header("x-jira-webhook-signature") || undefined;
      const rawBody = req.rawBody ?? Buffer.from(JSON.stringify(req.body ?? {}), "utf8");
      if (!validateJiraSignature(rawBody, signatureHeader, input.config.jiraWebhookSecret)) {
        return sendJson(res, 401, { ok: false, error: "Invalid webhook signature" });
      }

      const normalized = normalizeJiraWebhook(req.body as Record<string, unknown>, req.headers, input.config);
      const result = await input.worker.ingest(normalized);
      return sendJson(res, 202, {
        ok: true,
        ticketKey: normalized.ticketKey,
        actionable: normalized.actionable,
        ...result
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("[server] Unhandled error:", error);
      return sendJson(res, 500, { ok: false, error: message });
    }
  });

  app.use((_req, res) => {
    sendJson(res, 404, { ok: false, error: "Not found" });
  });

  return app;
}
