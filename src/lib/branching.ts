import type { BranchContext } from "../types.js";

function slugify(input: string, maxLength = 48): string {
  return (
    input
      .normalize("NFKD")
      .replace(/[^\x00-\x7F]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, maxLength)
      .replace(/-+$/g, "") || "work"
  );
}

function firstDefined(...values: Array<string | null | undefined>): string | undefined {
  return values.find((value) => value !== undefined && value !== null && value !== "");
}

export function detectBranchHint(...texts: Array<string | null | undefined>): string | null {
  const regex = /(?:source\s+branch|bug\s+branch|branch)\s*[:=~-]\s*([A-Za-z0-9._/-]+)/i;
  for (const text of texts.filter(Boolean) as string[]) {
    const match = regex.exec(text);
    if (match) {
      return match[1];
    }
  }
  return null;
}

export function detectBranchType(input: {
  issueSummary: string;
  issueType: string;
  labels: string[];
  commentText: string;
}): string {
  const blob = [input.issueSummary, input.issueType, ...input.labels, input.commentText]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  if (/(sev1|critical|urgent|hotfix|production|prod issue|incident)/.test(blob)) {
    return "hotfix";
  }
  if (/(feature|enhancement|improvement|story|epic)/.test(blob)) {
    return "feature";
  }
  if (/(bug|defect|fix|issue|crash|error|regression)/.test(blob)) {
    return "bugfix";
  }
  return "other";
}

export function buildBranchContext(input: {
  ticketKey: string;
  issueSummary: string;
  issueType: string;
  labels: string[];
  explicitSourceBranch: string | null;
  commentText: string;
  defaultBranchBase: string;
}): BranchContext {
  const branchType = detectBranchType({
    issueSummary: input.issueSummary,
    issueType: input.issueType,
    labels: input.labels,
    commentText: input.commentText
  });
  const sourceBranch = firstDefined(input.explicitSourceBranch, input.defaultBranchBase) ?? input.defaultBranchBase;
  const branchReason = input.explicitSourceBranch
    ? "Ticket or actionable comment explicitly identified the source branch."
    : `Defaulted to latest remote ${input.defaultBranchBase}.`;
  const ticketSlug = slugify(input.ticketKey, 32);
  const summarySlug = slugify(input.issueSummary, 48);
  return {
    branchType,
    sourceBranch,
    branchReason,
    branchName: `${branchType}/${ticketSlug}-${summarySlug}`
  };
}
