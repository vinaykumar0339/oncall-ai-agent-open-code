import { Prisma, PrismaClient } from "@prisma/client";
import type { AppConfig, BranchContext, JiraUpdate, PendingUpdateRow, Platform, TicketThread } from "../types.js";

function mapTicketThread(row: {
  ticketKey: string;
  issueSummary: string;
  opencodeSessionId: string | null;
  sessionTitle: string | null;
  runState: string;
  platform: string | null;
  branchType: string | null;
  branchName: string | null;
  sourceBranch: string | null;
  branchReason: string | null;
  lastProcessedCommentId: string | null;
}): TicketThread {
  return {
    ticket_key: row.ticketKey,
    issue_summary: row.issueSummary,
    opencode_session_id: row.opencodeSessionId,
    session_title: row.sessionTitle,
    run_state: row.runState,
    platform: (row.platform as Platform | null) ?? null,
    branch_type: row.branchType,
    branch_name: row.branchName,
    source_branch: row.sourceBranch,
    branch_reason: row.branchReason,
    last_processed_comment_id: row.lastProcessedCommentId
  };
}

function mapPendingUpdate(row: {
  id: number;
  ticketKey: string;
  eventType: string;
  commentId: string | null;
  authorName: string | null;
  visibility: string;
  isControl: boolean;
  payload: Prisma.JsonValue;
  createdAt: Date;
}): PendingUpdateRow {
  return {
    id: row.id,
    ticket_key: row.ticketKey,
    event_type: row.eventType,
    comment_id: row.commentId,
    author_name: row.authorName,
    visibility: row.visibility,
    is_control: row.isControl,
    payload: row.payload as unknown as JiraUpdate,
    created_at: row.createdAt.toISOString()
  };
}

export class Persistence {
  private readonly prisma: PrismaClient;

  constructor(_config: AppConfig) {
    this.prisma = new PrismaClient();
  }

  async close(): Promise<void> {
    await this.prisma.$disconnect();
  }

  async persistWebhookUpdate(input: {
    update: JiraUpdate;
    platform: Platform | null;
    opencodeSessionId: string | null;
    sessionTitle: string | null;
  }): Promise<{ duplicate: true } | { duplicate: false; thread: TicketThread; row: PendingUpdateRow }> {
    try {
      const result = await this.prisma.$transaction(async (tx) => {
        await tx.processedEvent.create({
          data: {
            deliveryId: input.update.deliveryId,
            ticketKey: input.update.ticketKey,
            commentId: input.update.commentId,
            eventType: input.update.eventType,
            dedupeStatus: "processed"
          }
        });

        const thread = await tx.ticketThread.upsert({
          where: { ticketKey: input.update.ticketKey },
          create: {
            ticketKey: input.update.ticketKey,
            issueSummary: input.update.issueSummary,
            platform: input.platform,
            opencodeSessionId: input.opencodeSessionId,
            sessionTitle: input.sessionTitle,
            runState: "queued"
          },
          update: {
            issueSummary: input.update.issueSummary,
            platform: input.platform ?? undefined,
            opencodeSessionId: input.opencodeSessionId ?? undefined,
            sessionTitle: input.sessionTitle ?? undefined
          }
        });

        const pending = await tx.pendingUpdate.create({
          data: {
            ticketKey: input.update.ticketKey,
            eventType: input.update.eventType,
            commentId: input.update.commentId,
            authorName: input.update.authorName,
            visibility: input.update.visibility,
            isControl: input.update.isControl,
            payload: input.update as unknown as Prisma.InputJsonValue
          }
        });

        return {
          thread: mapTicketThread(thread),
          row: mapPendingUpdate(pending)
        };
      });

      return {
        duplicate: false,
        thread: result.thread,
        row: result.row
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        return { duplicate: true };
      }
      throw error;
    }
  }

  async getThread(ticketKey: string): Promise<TicketThread | null> {
    const row = await this.prisma.ticketThread.findUnique({
      where: { ticketKey }
    });
    return row ? mapTicketThread(row) : null;
  }

  async upsertThread(input: {
    ticketKey: string;
    issueSummary: string;
    platform: Platform | null;
    opencodeSessionId: string | null;
    sessionTitle: string | null;
  }): Promise<TicketThread> {
    const row = await this.prisma.ticketThread.upsert({
      where: { ticketKey: input.ticketKey },
      create: {
        ticketKey: input.ticketKey,
        issueSummary: input.issueSummary,
        platform: input.platform,
        opencodeSessionId: input.opencodeSessionId,
        sessionTitle: input.sessionTitle,
        runState: "queued"
      },
      update: {
        issueSummary: input.issueSummary,
        platform: input.platform ?? undefined,
        opencodeSessionId: input.opencodeSessionId ?? undefined,
        sessionTitle: input.sessionTitle ?? undefined
      }
    });
    return mapTicketThread(row);
  }

  async updateThreadSession(ticketKey: string, sessionId: string, sessionTitle: string | null): Promise<void> {
    await this.prisma.ticketThread.update({
      where: { ticketKey },
      data: {
        opencodeSessionId: sessionId,
        sessionTitle: sessionTitle ?? undefined
      }
    });
  }

  async updateThreadBranch(ticketKey: string, branch: BranchContext): Promise<void> {
    await this.prisma.ticketThread.update({
      where: { ticketKey },
      data: {
        branchType: branch.branchType,
        branchName: branch.branchName,
        sourceBranch: branch.sourceBranch,
        branchReason: branch.branchReason
      }
    });
  }

  async updateThreadRunState(ticketKey: string, runState: string, lastProcessedCommentId: string | null = null): Promise<void> {
    await this.prisma.ticketThread.update({
      where: { ticketKey },
      data: {
        runState,
        lastProcessedCommentId: lastProcessedCommentId ?? undefined
      }
    });
  }

  async listUnmergedUpdates(ticketKey: string): Promise<PendingUpdateRow[]> {
    const rows = await this.prisma.pendingUpdate.findMany({
      where: {
        ticketKey,
        mergedAt: null
      },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }]
    });
    return rows.map(mapPendingUpdate);
  }

  async markUpdatesMerged(ticketKey: string, ids: number[], runId: string): Promise<void> {
    if (!ids.length) {
      return;
    }
    await this.prisma.pendingUpdate.updateMany({
      where: {
        ticketKey,
        id: { in: ids }
      },
      data: {
        mergedAt: new Date(),
        mergedIntoRunId: runId
      }
    });
  }

  async startRun(input: { runId: string; ticketKey: string; opencodeSessionId: string; lockOwner: string }): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.run.create({
        data: {
          runId: input.runId,
          ticketKey: input.ticketKey,
          opencodeSessionId: input.opencodeSessionId,
          status: "running",
          lockOwner: input.lockOwner
        }
      }),
      this.prisma.ticketThread.update({
        where: { ticketKey: input.ticketKey },
        data: { runState: "running" }
      })
    ]);
  }

  async finishRun(input: {
    runId: string;
    ticketKey: string;
    status: string;
    workflowStatus: string;
    checkpoint: string;
    failureReason: string | null;
    lastProcessedCommentId: string | null;
  }): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.run.update({
        where: { runId: input.runId },
        data: {
          status: input.status,
          workflowStatus: input.workflowStatus,
          lastCheckpoint: input.checkpoint,
          failureReason: input.failureReason,
          finishedAt: new Date()
        }
      }),
      this.prisma.ticketThread.update({
        where: { ticketKey: input.ticketKey },
        data: {
          runState: input.status,
          lastProcessedCommentId: input.lastProcessedCommentId ?? undefined
        }
      })
    ]);
  }
}
