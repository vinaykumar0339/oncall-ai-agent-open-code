export type Platform = "ios" | "android" | "unknown";

export interface AppConfig {
  port: number;
  redisUrl: string;
  postgresUrl: string;
  opencodeServerUrl: string;
  opencodeAgent: string;
  opencodeModel: string;
  jiraWebhookSecret: string;
  jiraPublicGroup: string;
  deliveryCommentMarker: string;
  botAuthorAccountIds: Set<string>;
  botAuthorNames: Set<string>;
  defaultBranchBase: string;
  redisLockTtlSec: number;
  processingPollMs: number;
  workerId: string;
}

export interface BranchContext {
  branchType: string;
  sourceBranch: string;
  branchReason: string;
  branchName: string;
}

export interface IssueSnapshot {
  status: string;
  priority: string;
  assignee: string;
  labels: string[];
}

export interface JiraUpdate {
  deliveryId: string;
  eventType: string;
  actionable: boolean;
  ignoredReason: string | null;
  ticketKey: string;
  issueSummary: string;
  issueType: string;
  description: string;
  labels: string[];
  commentId: string | null;
  commentBody: string;
  authorName: string;
  visibility: string;
  timestamp: string;
  isControl: boolean;
  issueSnapshot: IssueSnapshot;
}

export interface TicketThread {
  ticket_key: string;
  issue_summary: string;
  opencode_session_id: string | null;
  session_title: string | null;
  run_state: string;
  platform: Platform | null;
  branch_type: string | null;
  branch_name: string | null;
  source_branch: string | null;
  branch_reason: string | null;
  last_processed_comment_id: string | null;
}

export interface PendingUpdateRow {
  id: number;
  ticket_key: string;
  event_type: string;
  comment_id: string | null;
  author_name: string | null;
  visibility: string;
  is_control: boolean;
  payload: JiraUpdate;
  created_at: string;
}

export interface OpenCodeSession {
  id: string;
  title: string;
}

export interface WorkerIngestResult {
  ignored: boolean;
  reason?: string;
  ticketKey?: string;
  opencodeSessionId?: string | null;
}
