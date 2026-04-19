# Vymo On-Call Workflow Project

This repository defines an end-to-end OpenCode workflow for an on-call mobile engineer. The primary goal is to take a Jira issue from intake through triage, reproduction, fix, validation, pull request delivery, and Jira delivery update.

## Workflow

- `oncall` is the primary orchestrator. It delegates to `triage`, `reproducible`, `fix`, `validation`, and `delivery`.
- `jira-context` is the canonical Jira fact normalizer. It should produce the `Jira Context Snapshot` that every later stage preserves.
- `jira-workflow` is the only specialist that should mutate actual Jira workflow fields such as status, priority, labels, assignee, resolution, or similar project state.
- `oncall` stays the default primary workflow agent for this repository.
- Triage is mandatory unless the user explicitly asks to skip it.
- Validation is a release gate. Do not treat a plausible fix as shippable until validation passes.
- Delivery includes both the PR action and the Jira delivery comment. If the PR succeeds but the Jira delivery comment fails, the workflow is only partially complete.
- Build generation, AppCenter upload, and release packaging are intentionally out of scope for this version.
- Jira webhook automation uses one long-lived OpenCode session per Jira ticket and resumes that same session via the stored native OpenCode session id.
- Built-in `build` and `plan` remain available for manual direct engineering or planning outside the Jira workflow.
- Built-in `general` and `explore` remain available as reusable subagents. `fix` may use both; `triage` and `validation` may use `explore` for bounded read-only lookup.

## Layout

- Project rules live in this root `AGENTS.md`.
- Project-local custom OpenCode agents live under `.opencode/agent/`.
- Project-local OpenCode skills live under `.opencode/skills/`.
- Workspace mapping defaults:
  - React Native iOS app root: `/Users/vinaykumar/vymo/react-app`
  - React Native iOS native dir: `/Users/vinaykumar/vymo/react-app/iOS`
  - Android app root: `/Users/vinaykumar/vymo/android-base`
  - Android native workspace root: `/Users/vinaykumar/vymo/android-base`
- Runtime skills are split by concern:
  - `vymo-react-native-runtime` for the React Native workspace in `/Users/vinaykumar/vymo/react-app`, including Metro handling, temp-path rules, and reporting requirements
  - `vymo-ios-runtime` for iOS-specific setup and launch behavior inside the React Native workspace
  - `vymo-android-runtime` for the native Android workspace in `/Users/vinaykumar/vymo/android-base`

## Handoff Contract

Every workflow stage must preserve these keys in its output and downstream handoff:

- `Status`
- `Issue key`
- `Issue summary`
- `Branch context`
- `Platform`
- `OpenCode Session ID`
- `Jira Context Snapshot`
- `Runtime context`
- `Evidence`
- `Jira action`
- `Next handoff`

When a stage adds more detail, keep the required keys and append stage-specific sections instead of replacing them.

`fix` should also preserve these implementation-oriented fields whenever they are relevant:

- `Discovery actions`
- `Delegations`
- `Implementation owner`
- `Human handoff recommendation`

`Jira Context Snapshot` is the canonical cross-stage memory for:

- login and access details
- credentials availability
- test account labels
- repro contract
- branch hints
- people context
- open questions

Do not rely on long conversational memory when these facts can be preserved explicitly in the snapshot.

## OpenCode Session And Temp Artifacts

- Use the native `OpenCode Session ID` for thread continuity across days and resumes. Do not invent a separate workflow id.
- When starting a ticket thread, prefer an OpenCode session title that starts with the Jira key, for example `ABC-123 login crash`.
- Resume the same OpenCode thread with the native session id instead of starting a new thread for the same ticket when possible.
- Store runtime and evidence artifacts only under `./tmp/{ticketKey}/{platform}/`.
- Use this subfolder layout:
  - `logs/` for command and runner logs
  - `evidence/` for screenshots and captured artifacts
  - `runtime/` for pidfiles and service state
  - `reports/` for any optional local summaries
- If the caller or webhook layer knows the current OpenCode session id, it should pass that exact value into the workflow handoff and runtime environment.
- If the native session id is unavailable in a given entrypoint, preserve `OpenCode Session ID: Unknown` rather than generating a surrogate id in the agent prompts.
- Do not write new workflow artifacts to `/tmp` when a repo-local temp path is possible.
- When reporting evidence or runtime state, prefer repo-relative paths rooted at `./tmp/...`.

## Webhook Runtime

- Local webhook infrastructure uses Docker Compose for Redis and Postgres.
- The webhook worker and `opencode serve` run on the host, not in Docker, so they can use local MCP/device/tooling access directly.
- Redis is for per-ticket run locks, pending update queues, interrupt flags, and short-lived dedupe coordination.
- Postgres is the durable source of truth for ticket-to-session mapping, processed webhook events, pending updates, run history, and branch metadata.
- Actionable webhook events are:
  - new ticket created
  - new human public comment
  - selected issue updates that materially change reproduction or fix context
- Ignore workflow-generated delivery comments and other bot noise by default so the system does not recursively trigger itself.
- If multiple comments arrive while a ticket run is already in progress, queue them and merge them into the same OpenCode ticket thread after the current run finishes unless the comment is a narrow control signal such as `stop`, `wrong ticket`, `use this branch`, `prod hotfix`, or `cannot reproduce anymore`.

## Branch And Safety Rules

- Branches must always use `type/ticket-id-description`.
- Default source branch is the latest remote `master`, not stale local state.
- If the ticket or an actionable comment explicitly identifies the source branch where the bug exists, use that branch and preserve the reason in `Branch context`.
- Branch type mapping:
  - defect or bug -> `bugfix`
  - urgent production issue -> `hotfix`
  - feature or enhancement -> `feature`
  - fallback -> `other`
- Reproduction uses the ticket branch when specified, otherwise the validated default branch source policy above.
- Fix, validation, and delivery must run on the dedicated ticket branch, not the default branch.
- If branch switching is blocked by local changes, prefer a descriptive stash over destructive cleanup.
- Never use force checkout, hard reset, clean, or destructive removal to satisfy branch policy.
- `fix` owns the main implementation path by default. If `general` is ever used, keep it limited to bounded side work that does not take over the critical code edit.
- If the issue becomes too risky, too ambiguous, too stateful, or too expensive for safe autonomous progress, the current stage should recommend explicit handoff to a human developer instead of forcing more retries.

## Jira And Delivery Rules

- Use Jira-safe language in public comments.
- Treat Jira comments and Jira workflow field mutations as different classes of action.
- Stage agents may comment when their stage needs outside visibility, but they should not directly mutate Jira status, priority, labels, assignee, resolution, or similar workflow fields.
- Stage agents should instead emit `Suggested Jira workflow action` with a short semantic intent and reason.
- Only `jira-workflow` should inspect actual available Jira transitions and apply real workflow mutations.
- Never guess a Jira transition name or workflow field value. Prefer no mutation over an incorrect mutation.
- Treat priority changes as high-impact. Raise or lower priority only when the evidence clearly justifies it.
- Use `commentVisibility: { type: "group", value: "jira-vymo" }` unless the user explicitly supplies a different verified audience.
- Do not include raw local filesystem paths, local usernames, or other internal-only machine identifiers in Jira comments unless the user explicitly asks.
- Delivery should post a Jira update that links the PR and summarizes the validated change when an issue key is available.
- When a Jira comment needs action or confirmation from a specific person, tag only a verified Jira user such as the reporter, assignee, or a recent relevant commenter.
- Never guess a person to tag. Only tag when the Jira issue/comment data provides a verified identity that clearly maps to the person you need.
- Prefer tagging:
  - the reporter when asking for missing reproduction details or expected behavior
  - the assignee when coordinating ownership or next action
  - the most recent relevant commenter when their new information needs confirmation
- Keep mentions minimal. Do not tag broad groups of people when one clearly relevant verified user is enough.
- If the available Jira tool path cannot safely create a proper user mention, fall back to role-based wording such as `reporter` or `assignee` instead of guessing mention syntax.

## Secrets

- Do not commit Bitbucket or other credentials into this repository.
- Repo config may define MCP servers and non-secret defaults, but credentials must stay in user-local config or environment, not in Git.
