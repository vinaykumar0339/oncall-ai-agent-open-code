---
name: vymo-react-native-runtime
description: Use when working on the Vymo React Native mobile app for shared repo setup, Metro management, temp artifact layout, runtime reporting, or common local verification behavior across iOS and Android.
---

# Vymo React Native Runtime

Use this skill whenever a task touches the Vymo React Native app workspace at `/Users/vinaykumar/vymo/react-app`.

Load [references/commands.md](references/commands.md) before running workspace commands.

## Workflow

1. Treat `/Users/vinaykumar/vymo/react-app` as the default app root unless a validated override is provided.
2. Prefer repo-provided `yarn` scripts over ad-hoc commands.
3. Generate or reuse a single workflow `Session ID` and pass it unchanged through triage, reproduction, fix, validation, and delivery.
4. Store runtime artifacts only under `./tmp/{platform}/{sessionId}/`.
5. Before launching the app, check whether Metro is already running.
6. Use the bundled Metro helper scripts instead of handwritten background shell when possible.
7. If Metro is not running, start it in the background and keep all logs and pidfiles inside the repo-local session temp tree.
8. If the app closes immediately after launch, do not treat that as product behavior until Metro, dependency state, and launch logs are checked.
9. In final output, always report:
   - platform
   - session id
   - temp session root
   - whether Metro was reused or started
   - background command and log path
   - any runtime issue that could have invalidated reproduction or verification

## Temp Artifact Rules

- Use `./tmp/ios/{sessionId}/...` for iOS runs.
- Use `./tmp/android/{sessionId}/...` for Android runs.
- Use these subfolders consistently:
  - `logs/`
  - `evidence/`
  - `runtime/`
  - `reports/`
- Do not create new workflow artifacts in `/tmp` unless a tool forces it and there is no safe repo-local alternative.

## Background Process Rules

- First check existing Metro state with `scripts/check-metro.sh`.
- Reuse a healthy Metro process instead of starting duplicates.
- Start Metro with `scripts/start-metro.sh`.
- Stop Metro with `scripts/stop-metro.sh` only when cleanup is explicitly needed.
- Export or pass `SESSION_ID` and `PLATFORM` before invoking the scripts so the temp path lands in the correct session tree.
- After starting Metro, verify readiness from the log before launching the app.
- If Metro logs show bundling errors, fix or report that before trusting app behavior.

## When To Stop

Stop and report a runtime blocker if:
- the expected app root is missing
- Metro cannot be started or stays unhealthy
- the app launch fails for local environment reasons
- the task requires a different workspace mapping than the validated app root
