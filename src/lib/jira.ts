import crypto from "node:crypto";
import type { IncomingHttpHeaders } from "node:http";
import type { AppConfig, JiraUpdate } from "../types.js";

const COMMENT_CONTROL_REGEX = /\b(stop|wrong ticket|use this branch|prod hotfix|cannot reproduce anymore)\b/i;

type JsonValue = null | string | number | boolean | JsonValue[] | { [key: string]: JsonValue };

function readText(value: JsonValue | undefined): string {
  if (!value) {
    return "";
  }
  if (typeof value === "string") {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map(readText).join("\n");
  }
  if (typeof value === "object") {
    return Object.values(value).map(readText).join("\n");
  }
  return String(value);
}

function normalizeVisibility(comment: { visibility?: unknown } | null): string {
  if (!comment) {
    return "public";
  }
  return comment.visibility ? "restricted" : "public";
}

function isBotComment(comment: any, config: AppConfig): boolean {
  const accountId = comment?.author?.accountId as string | undefined;
  const accountType = comment?.author?.accountType as string | undefined;
  const displayName = comment?.author?.displayName as string | undefined;
  if (accountType && accountType !== "atlassian") {
    return true;
  }
  if (accountId && config.botAuthorAccountIds.has(accountId)) {
    return true;
  }
  if (displayName && config.botAuthorNames.has(displayName)) {
    return true;
  }
  return false;
}

function getHeader(headers: IncomingHttpHeaders, name: string): string | undefined {
  const value = headers[name];
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

export function validateJiraSignature(rawBody: Buffer, signature: string | undefined, secret: string): boolean {
  if (!secret) {
    return true;
  }
  if (!signature) {
    return false;
  }
  const digest = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const normalized = String(signature).replace(/^sha256=/i, "");
  if (digest.length !== normalized.length) {
    return false;
  }
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(normalized));
}

export function normalizeJiraWebhook(
  payload: Record<string, any>,
  headers: IncomingHttpHeaders,
  config: AppConfig
): JiraUpdate {
  const webhookEvent = (payload.webhookEvent || payload.issue_event_type_name || "unknown") as string;
  const issue = (payload.issue || {}) as Record<string, any>;
  const comment = (payload.comment || null) as Record<string, any> | null;
  const ticketKey = (issue.key || payload.ticket_key || "Unknown") as string;
  const issueSummary = (issue.fields?.summary || payload.issue_summary || "Unknown issue") as string;
  const issueType = (issue.fields?.issuetype?.name || "") as string;
  const description = readText(issue.fields?.description as JsonValue | undefined);
  const labels = Array.isArray(issue.fields?.labels) ? (issue.fields.labels as string[]) : [];
  const commentBody = readText(comment?.body as JsonValue | undefined);
  const deliveryId =
    getHeader(headers, "x-atlassian-webhook-identifier") ||
    getHeader(headers, "x-request-id") ||
    getHeader(headers, "x-b3-traceid") ||
    crypto.createHash("sha1").update(JSON.stringify(payload)).digest("hex");
  const commentId = comment?.id ? String(comment.id) : null;
  const visibility = normalizeVisibility(comment);
  const authorName = (comment?.author?.displayName || payload.user?.displayName || "Unknown") as string;
  const markerHit = commentBody.includes(config.deliveryCommentMarker);
  const humanPublicComment = Boolean(comment) && visibility === "public" && !isBotComment(comment, config) && !markerHit;
  const isIssueCreated = webhookEvent === "jira:issue_created";
  const isIssueUpdated = webhookEvent === "jira:issue_updated";
  const actionable =
    isIssueCreated || humanPublicComment || (isIssueUpdated && !comment && /branch|environment|steps|version/i.test(description));
  const control = COMMENT_CONTROL_REGEX.test(commentBody);

  return {
    deliveryId,
    eventType: webhookEvent,
    actionable,
    ignoredReason: actionable ? null : "Ignored non-actionable or bot/internal webhook event.",
    ticketKey,
    issueSummary,
    issueType,
    description,
    labels,
    commentId,
    commentBody,
    authorName,
    visibility,
    timestamp: (payload.timestamp || new Date().toISOString()) as string,
    isControl: control,
    issueSnapshot: {
      status: (issue.fields?.status?.name || "") as string,
      priority: (issue.fields?.priority?.name || "") as string,
      assignee: (issue.fields?.assignee?.displayName || "") as string,
      labels
    }
  };
}
