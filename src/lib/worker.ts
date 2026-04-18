import { randomUUID } from "node:crypto";
import { buildBranchContext, detectBranchHint } from "./branching.js";
import type { AppConfig, BranchContext, JiraUpdate, OpenCodeSession, PendingUpdateRow, Platform, TicketThread, WorkerIngestResult } from "../types.js";
import type { Persistence } from "./persistence.js";
import type { Queue } from "./queue.js";
import type { OpenCodeClient } from "./opencode.js";

function normalizePlatform(update: JiraUpdate): Platform {
  const blob = [update.issueSummary, update.issueType, update.description, update.commentBody, ...update.labels]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (/\bandroid\b/.test(blob)) {
    return "android";
  }
  if (/\bios\b|\biphone\b|\bipad\b/.test(blob)) {
    return "ios";
  }
  return "unknown";
}

function mergeUpdates(thread: TicketThread, updates: PendingUpdateRow[], branchContext: BranchContext): { ticketKey: string; issueSummary: string; message: string } {
  const summaries = updates.map((update, index) => {
    const payload = update.payload;
    const header = `${index + 1}. ${payload.eventType} at ${payload.timestamp} by ${payload.authorName}`;
    const body = payload.commentBody || payload.description || payload.issueSummary;
    return `${header}\n${body}`.trim();
  });

  const latest = updates[updates.length - 1]?.payload;
  const ticketKey = thread.ticket_key || latest.ticketKey;
  const issueSummary = thread.issue_summary || latest.issueSummary;

  return {
    ticketKey,
    issueSummary,
    message: [
      `Ticket update for ${ticketKey}: ${issueSummary}`,
      ``,
      `Preserve the existing OpenCode session for this ticket.`,
      `OpenCode Session ID: ${thread.opencode_session_id || "Unknown"}`,
      `Platform: ${thread.platform || normalizePlatform(latest)}`,
      `Branch context:`,
      `- Branch name: ${branchContext.branchName}`,
      `- Branch type: ${branchContext.branchType}`,
      `- Source branch: ${branchContext.sourceBranch}`,
      `- Branch reason: ${branchContext.branchReason}`,
      ``,
      `Pending Jira updates merged in chronological order:`,
      summaries.join("\n\n"),
      ``,
      `If the new Jira updates invalidate the current workflow path, reroute back to triage before continuing.`,
      `Ignore delivery comments that contain the system marker and do not create a new session.`
    ].join("\n")
  };
}

function parseWorkflowStatus(text: string): string {
  const match = /Workflow status:\s*([A-Z_]+)/i.exec(text);
  return match ? match[1].toUpperCase() : "UNKNOWN";
}

function mapRunState(workflowStatus: string): string {
  switch (workflowStatus) {
    case "DELIVERY_COMPLETE":
      return "completed";
    case "DELIVERY_PARTIAL":
    case "VALIDATION_FAILED":
    case "VALIDATION_BLOCKED":
    case "FIX_BLOCKED":
    case "BLOCKED":
      return "blocked";
    default:
      return "idle";
  }
}

export class WorkflowWorker {
  private readonly processing = new Set<string>();

  constructor(
    private readonly deps: {
      config: AppConfig;
      db: Persistence;
      queue: Queue;
      opencode: OpenCodeClient;
    }
  ) {}

  async ingest(update: JiraUpdate): Promise<WorkerIngestResult> {
    const seenInRedis = await this.deps.queue.rememberDelivery(update.deliveryId);
    if (!seenInRedis) {
      return { ignored: true, reason: "Duplicate webhook delivery detected in Redis." };
    }

    if (!update.actionable) {
      return { ignored: true, reason: update.ignoredReason ?? "Ignored non-actionable webhook event." };
    }

    const platform = normalizePlatform(update);
    let thread = await this.deps.db.getThread(update.ticketKey);

    if (!thread) {
      const session = await this.deps.opencode.ensureSession(update.ticketKey, update.issueSummary, null);
      thread = await this.deps.db.upsertThread({
        ticketKey: update.ticketKey,
        issueSummary: update.issueSummary,
        platform,
        opencodeSessionId: session.id,
        sessionTitle: session.title
      });
    } else if (!thread.opencode_session_id) {
      const session = await this.deps.opencode.ensureSession(update.ticketKey, update.issueSummary, null);
      await this.deps.db.updateThreadSession(update.ticketKey, session.id, session.title);
      thread = await this.deps.db.getThread(update.ticketKey);
      if (!thread) {
        throw new Error(`Thread for ${update.ticketKey} disappeared after session update.`);
      }
    }

    const persisted = await this.deps.db.persistWebhookUpdate({
      update,
      platform,
      opencodeSessionId: thread.opencode_session_id,
      sessionTitle: thread.session_title
    });
    if (persisted.duplicate) {
      return { ignored: true, reason: "Duplicate webhook delivery detected in Postgres." };
    }

    const row = persisted.row;
    thread = persisted.thread;
    await this.deps.queue.enqueueUpdate(update.ticketKey, row.id);
    if (update.isControl) {
      await this.deps.queue.requestInterrupt(update.ticketKey);
    }
    this.schedule(update.ticketKey);
    return {
      ignored: false,
      ticketKey: update.ticketKey,
      opencodeSessionId: thread.opencode_session_id
    };
  }

  private schedule(ticketKey: string): void {
    if (this.processing.has(ticketKey)) {
      return;
    }
    this.processing.add(ticketKey);
    setImmediate(async () => {
      try {
        await this.processTicket(ticketKey);
      } catch (error) {
        console.error(`[worker] Failed to process ${ticketKey}:`, error);
      } finally {
        this.processing.delete(ticketKey);
      }
    });
  }

  private async processTicket(ticketKey: string): Promise<void> {
    const hasLock = await this.deps.queue.acquireRunLock(ticketKey);
    if (!hasLock) {
      return;
    }

    try {
      for (;;) {
        const thread = await this.deps.db.getThread(ticketKey);
        if (!thread) {
          return;
        }

        const pendingUpdates = await this.deps.db.listUnmergedUpdates(ticketKey);
        if (!pendingUpdates.length) {
          await this.deps.db.updateThreadRunState(ticketKey, "idle");
          return;
        }

        const latestPayload = pendingUpdates[pendingUpdates.length - 1].payload;
        const explicitBranch = detectBranchHint(
          latestPayload.commentBody,
          latestPayload.description,
          thread.branch_reason
        );
        const branchContext = buildBranchContext({
          ticketKey,
          issueSummary: thread.issue_summary,
          issueType: latestPayload.issueType,
          labels: latestPayload.labels,
          explicitSourceBranch: explicitBranch,
          commentText: latestPayload.commentBody,
          defaultBranchBase: this.deps.config.defaultBranchBase
        });
        await this.deps.db.updateThreadBranch(ticketKey, branchContext);

        const session = await this.deps.opencode.ensureSession(
          ticketKey,
          thread.issue_summary,
          thread.opencode_session_id
        );
        await this.deps.db.updateThreadSession(ticketKey, session.id, session.title);

        const merged = mergeUpdates(
          {
            ...thread,
            opencode_session_id: session.id,
            platform: thread.platform || normalizePlatform(latestPayload)
          },
          pendingUpdates,
          branchContext
        );
        const runId = randomUUID();
        await this.deps.db.startRun({
          runId,
          ticketKey,
          opencodeSessionId: session.id,
          lockOwner: this.deps.config.workerId
        });

        let workflowStatus = "UNKNOWN";
        let runState = "idle";
        let responseText = "";
        try {
          const response = await this.deps.opencode.sendMessage(session.id, merged.message);
          responseText = response.text;
          workflowStatus = parseWorkflowStatus(response.text);
          runState = mapRunState(workflowStatus);
          await this.deps.db.markUpdatesMerged(
            ticketKey,
            pendingUpdates.map((row) => row.id),
            runId
          );
          await this.deps.db.finishRun({
            runId,
            ticketKey,
            status: runState,
            workflowStatus,
            checkpoint: "message_complete",
            failureReason: null,
            lastProcessedCommentId: latestPayload.commentId
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          await this.deps.db.finishRun({
            runId,
            ticketKey,
            status: "blocked",
            workflowStatus,
            checkpoint: "message_failed",
            failureReason: message,
            lastProcessedCommentId: latestPayload.commentId
          });
          throw error;
        }

        const interruptRequested = await this.deps.queue.consumeInterrupt(ticketKey);
        if (interruptRequested) {
          console.warn(`[worker] Control update requested attention for ${ticketKey}.`);
        }

        const remaining = await this.deps.db.listUnmergedUpdates(ticketKey);
        if (!remaining.length) {
          return;
        }

        if (responseText) {
          await new Promise((resolve) => setTimeout(resolve, this.deps.config.processingPollMs));
        }
      }
    } finally {
      await this.deps.queue.releaseRunLock(ticketKey);
    }
  }
}
