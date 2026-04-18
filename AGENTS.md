# Vymo On-Call Workflow Project

This repository defines an end-to-end OpenCode workflow for an on-call mobile engineer. The primary goal is to take a Jira issue from intake through triage, reproduction, fix, validation, pull request delivery, and Jira delivery update.

## Workflow

- `oncall` is the primary orchestrator. It delegates to `triage`, `reproducible`, `fix`, `validation`, and `delivery`.
- Triage is mandatory unless the user explicitly asks to skip it.
- Validation is a release gate. Do not treat a plausible fix as shippable until validation passes.
- Delivery includes both the PR action and the Jira delivery comment. If the PR succeeds but the Jira delivery comment fails, the workflow is only partially complete.
- Build generation, AppCenter upload, and release packaging are intentionally out of scope for this version.

## Layout

- Project rules live in this root `AGENTS.md`.
- OpenCode agents must live under `.opencode/agents/`.
- OpenCode skills must live under `.opencode/skills/`.
- Workspace mapping defaults:
  - React Native iOS app root: `/Users/vinaykumar/vymo/react-app`
  - React Native iOS native dir: `/Users/vinaykumar/vymo/react-app/iOS`
  - Android app root: `/Users/vinaykumar/vymo/android-base`
- Runtime skills are split by concern:
  - `vymo-react-native-runtime` for shared React Native setup, Metro handling, temp-path rules, and reporting requirements
  - `vymo-ios-runtime` for iOS-specific setup and launch behavior
  - `vymo-android-runtime` for Android-specific setup and launch behavior

## Handoff Contract

Every workflow stage must preserve these keys in its output and downstream handoff:

- `Status`
- `Issue key`
- `Issue summary`
- `Branch context`
- `Platform`
- `Session ID`
- `Runtime context`
- `Evidence`
- `Jira action`
- `Next handoff`

When a stage adds more detail, keep the required keys and append stage-specific sections instead of replacing them.

## Session And Temp Artifacts

- Generate one `Session ID` per workflow run and carry it across all stages.
- Store runtime and evidence artifacts only under `./tmp/{platform}/{sessionId}/`.
- Use this subfolder layout:
  - `logs/` for command and runner logs
  - `evidence/` for screenshots and captured artifacts
  - `runtime/` for pidfiles and service state
  - `reports/` for any optional local summaries
- Do not write new workflow artifacts to `/tmp` when a repo-local temp path is possible.
- When reporting evidence or runtime state, prefer repo-relative paths rooted at `./tmp/...`.

## Branch And Safety Rules

- Reproduction uses the ticket branch when specified, otherwise the repo default branch by preferring `main` and then `master`.
- Fix, validation, and delivery must run on the dedicated ticket branch, not the default branch.
- If branch switching is blocked by local changes, prefer a descriptive stash over destructive cleanup.
- Never use force checkout, hard reset, clean, or destructive removal to satisfy branch policy.

## Jira And Delivery Rules

- Use Jira-safe language in public comments.
- Use `commentVisibility: { type: "group", value: "jira-vymo" }` unless the user explicitly supplies a different verified audience.
- Do not include raw local filesystem paths, local usernames, or other internal-only machine identifiers in Jira comments unless the user explicitly asks.
- Delivery should post a Jira update that links the PR and summarizes the validated change when an issue key is available.

## Secrets

- Do not commit Bitbucket or other credentials into this repository.
- Repo config may define MCP servers and non-secret defaults, but credentials must stay in user-local config or environment, not in Git.
