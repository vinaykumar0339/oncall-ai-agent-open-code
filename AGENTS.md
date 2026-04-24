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
- Manual delivery-time build pipeline triggering is in scope when the delivery stage needs a tester-facing build link or pipeline run link for Jira and human handoff.
- Delivery should use the known Bitbucket pipeline catalog in this repo and trigger the required manual pipeline directly instead of treating pipeline discovery as a prerequisite.
- Release packaging strategy outside the known delivery pipelines remains out of scope for this version.
- Jira webhook automation uses one long-lived OpenCode session per Jira ticket and resumes that same session via the stored native OpenCode session id.
- Built-in `build` and `plan` remain available for manual direct engineering or planning outside the Jira workflow.
- Built-in `general` and `explore` remain available as reusable subagents. `fix` may use both; `triage` and `validation` may use `explore` for bounded read-only lookup.

## Senior On-Call Operating Model

- Behave like a senior on-call mobile engineer, not just a code-fixing robot.
- Own the ticket from intake through handoff, including technical progress, Jira hygiene, and stakeholder awareness.
- Prefer calm, operationally useful updates over silence when a ticket is active for a meaningful period.
- Prefer one concise Jira update at a meaningful milestone over many low-signal comments.
- Keep Jira comments short, factual, and action-oriented. Put deep technical detail in local evidence, the PR, or the OpenCode handoff instead of Jira.
- At minimum, keep Jira and humans up to date when:
  - triage is blocked by missing or contradictory information
  - reproduction succeeds and materially sharpens the problem statement
  - reproduction shows the issue is not reproducible in the tested environment and human confirmation is needed
  - fix work becomes blocked, high risk, or clearly crosses team boundaries
  - validation fails after a fix attempt
  - validation passes and work is moving to delivery or review
  - delivery is partially complete or blocked
- Avoid comment spam:
  - do not narrate every internal step
  - do not repeat the same status in multiple comments
  - do not post a progress comment when the next stage will immediately post a more meaningful outcome comment
- Prefer status changes that match the latest public reality:
  - active investigation or reproduction -> likely `start_progress`
  - waiting on missing information -> likely `needs_info`
  - blocked by an external dependency or environment issue -> likely `blocked`
  - validated fix ready for review -> likely `ready_for_review`
  - fully delivered according to project rules -> likely `delivered`
- When a stage posts a Jira comment that changes the ticket's operational meaning, it should usually also emit a matching `Suggested Jira workflow action`.
- If Jira workflow mutation cannot be applied safely, still post the stage comment when outside visibility is needed and report the mutation gap explicitly.

## Layout

- Project rules live in this root `AGENTS.md`.
- Project-local custom OpenCode agents live under `.opencode/agent/`.
- Project-local OpenCode skills live under `.opencode/skills/`.
- Workspace mapping defaults:
  - React Native iOS app root: `~/vymo/react-app`
  - React Native iOS native dir: `~/vymo/react-app/iOS`
  - Android app root: `~/vymo/android-base`
  - Android native workspace root: `~/vymo/android-base`
- Runtime skill:
  - `vymo-runtime` for local runtime setup, temp-path rules, reporting requirements, and platform routing
  - `vymo-runtime` loads the iOS React Native reference for `~/vymo/react-app`, including Metro handling and iOS launch behavior
  - `vymo-runtime` loads the Android native reference for `~/vymo/android-base`
  - `vymo-runtime` may use `reactotron-mcp` only for the iOS React Native workspace to inspect API request and response traffic during reproduction, debugging, and validation
- API context skill:
  - `vymo-react-app-api-context` for `~/vymo/react-app` endpoint maps focused on Hello screen and Login flows when `reactotron-mcp` evidence is needed

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
- latest working interpretation
- latest public Jira update that materially changed coordination context
- Jira routing context needed by Jira read/comment tools when available

Do not rely on long conversational memory when these facts can be preserved explicitly in the snapshot.

## OpenCode Session And Temp Artifacts

- Use the native `OpenCode Session ID` for thread continuity across days and resumes. Do not invent a separate workflow id.
- When starting a ticket thread, prefer an OpenCode session title that starts with the Jira key, for example `ABC-123 login crash`.
- Resume the same OpenCode thread with the native session id instead of starting a new thread for the same ticket when possible.
- Store ticket-scoped runtime and evidence artifacts under `./tmp/{ticketKey}/{platform}/`.
- Shared workspace services that are intentionally reused across tickets, such as the React Native Metro server, may keep workspace-scoped service state under `./tmp/_workspace/...` as long as ticket evidence and reports still stay under the ticket temp tree.
- Use this subfolder layout:
  - `logs/` for command and runner logs
  - `evidence/` for screenshots and captured artifacts
  - `runtime/` for pidfiles and service state
  - `reports/` for any optional local summaries
- For iOS React Native tickets, API-call summaries derived from `reactotron-mcp` should stay in the ticket temp tree and be treated as local debugging evidence, not as Jira-safe raw output
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
- For Android `reproducible` and `validation`, determine the app kind from verified `android-base` flavor context before building or launching.
- If no ticket context, comment context, or verified runtime evidence identifies a white-label app, hard default the app kind to the base `Vymo` app.
- For Android `reproducible` and `validation`, prefer the matching debug variant first after app kind is identified, unless the ticket or verified runtime context explicitly requires another variant.
- Use `betaMasterDebug` for the default Vymo master debug flow.
- Use `abcMasterDebug` for the ABC white-label app flow and launch the ABC debug package context rather than the default Vymo package context.
- Only use a different Android variant when the ticket or verified runtime context explicitly requires it.
- For iOS `reproducible` and `validation`, determine the app kind from verified `react-app/iOS` scheme, bundle id, or ticket context before launching.
- If no ticket context, comment context, or verified runtime evidence identifies a white-label app, hard default the app kind to the base `Vymo` app.
- For iOS `reproducible` and `validation`, default to the matching debug scheme after the app kind is identified, even when the ticket was reported against a UAT or staging-distributed app.
- Treat ticket mentions of UAT or staging as environment context, not as an automatic instruction to launch the staging iOS scheme.
- Use the `Vymo` scheme for the default Vymo reproduce and validation flow. Use `Vymo-Staging` only when the human request or verified runtime evidence shows the issue is specific to the staging or enterprise iOS app itself.
- Use the `ABC Stellar` scheme for the default ABC reproduce and validation flow. Use `ABC Stellar - Staging` only when the human request or verified runtime evidence shows the issue is specific to the ABC staging or enterprise iOS app itself.
- Only use a different iOS scheme or configuration when the ticket or verified runtime context explicitly requires it.
- Treat `react-app` as an iOS-only React Native runtime in this workflow.
- For `react-app` iOS reproduce, fix verification, and validation, default to Metro + launching the already installed app.
- Do not trigger full iOS rebuild/install by default for `react-app` when the change is JS/TS-only.
- Only rebuild `react-app` iOS when there is verified native change context such as edits under `react-app/iOS`, Pod changes, native module changes, scheme or bundle changes, or when the app is not installed on the target simulator/device.
- For iOS React Native work, `reproducible`, `fix`, and `validation` may inspect Reactotron network logs to understand request shape, response payloads, HTTP status, and likely backend versus client behavior before deciding the next action.
- Never route native Android work through `reactotron-mcp` unless the Android workspace later gains an explicitly supported React Native runtime that is documented in this repo.
- If branch switching is blocked by local changes, prefer a descriptive stash over destructive cleanup.
- Never use force checkout, hard reset, clean, or destructive removal to satisfy branch policy.
- `fix` owns the main implementation path by default. If `general` is ever used, keep it limited to bounded side work that does not take over the critical code edit.
- If the issue becomes too risky, too ambiguous, too stateful, or too expensive for safe autonomous progress, the current stage should recommend explicit handoff to a human developer instead of forcing more retries.

## Jira And Delivery Rules

- Use Jira-safe language in public comments.
- Treat Jira comments and Jira workflow field mutations as different classes of action.
- Stage agents may comment when their stage needs outside visibility, but they should not directly mutate Jira status, priority, labels, assignee, resolution, or similar workflow fields.
- Stage agents should think in terms of milestone communication, not only blocker communication.
- A good Jira update should answer some combination of:
  - what was verified
  - what is happening now
  - what changed since the last meaningful update
  - what exact next action is needed, if any
- Prefer comments at milestone boundaries instead of mid-thought commentary.
- When a ticket remains actively in progress but no human-visible milestone has been posted for a while, the active stage may post one concise progress update if it materially helps coordination.
- When a stage becomes blocked or cannot proceed after a reasonable attempt, it should post a concise Jira-safe blocker comment when Jira commenting is available. Include what failed, what was already tried, the evidence or symptom, and the exact next thing a human should fix or provide.
- When a stage materially clarifies the issue beyond the original Jira wording, it may post a short correction-oriented update so humans do not keep working from a misleading ticket summary.
- Stage agents should instead emit `Suggested Jira workflow action` with a short semantic intent and reason.
- Only `jira-workflow` should inspect actual available Jira transitions and apply real workflow mutations.
- Never guess a Jira transition name or workflow field value. Prefer no mutation over an incorrect mutation.
- Treat priority changes as high-impact. Raise or lower priority only when the evidence clearly justifies it.
- Use `commentVisibility: { type: "group", value: "jira-users" }` unless the user explicitly supplies a different verified audience.
- Do not include raw local filesystem paths, local usernames, or other internal-only machine identifiers in Jira comments unless the user explicitly asks.
- Do not paste raw Reactotron request or response bodies, auth tokens, cookies, or user-sensitive payloads into Jira comments. Summarize only the minimum safe evidence needed for human coordination.
- Delivery should post a Jira update that links the PR and summarizes the validated change when an issue key is available.
- Delivery should leave the ticket looking operationally complete for the next human:
  - clear PR state
  - clear review expectation
  - clear build or distribution state when relevant
- When a Jira comment needs action or confirmation from a specific person, tag only a verified Jira user such as the reporter, assignee, or a recent relevant commenter.
- Never guess a person to tag. Only tag when the Jira issue/comment data provides a verified identity that clearly maps to the person you need.
- Prefer tagging:
  - the reporter when asking for missing reproduction details or expected behavior
  - the assignee when coordinating ownership or next action
  - the most recent relevant commenter when their new information needs confirmation
- Keep mentions minimal. Do not tag broad groups of people when one clearly relevant verified user is enough.
- If the available Jira tool path cannot safely create a proper user mention, fall back to role-based wording such as `reporter` or `assignee` instead of guessing mention syntax.
- If a blocker comment could not be posted, report that explicitly in `Jira action` and preserve the needed human action in the handoff instead of silently continuing.

## Secrets

- Do not commit Bitbucket or other credentials into this repository.
- Repo config may define MCP servers and non-secret defaults, but credentials must stay in user-local config or environment, not in Git.
