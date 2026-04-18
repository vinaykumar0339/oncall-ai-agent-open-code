---
name: vymo-react-native-runtime
description: Use when working on the Vymo React Native workspace for shared JavaScript setup, Metro management, temp artifact layout, runtime reporting, or common local verification behavior for the React Native app.
---

# Vymo React Native Runtime

Use this skill whenever a task touches the React Native workspace at `/Users/vinaykumar/vymo/react-app`.

Validated workspace:
- React Native app root: `/Users/vinaykumar/vymo/react-app`
- Native iOS dir inside that workspace: `/Users/vinaykumar/vymo/react-app/iOS`

Do not use this skill as the default Android runtime for `/Users/vinaykumar/vymo/android-base`. That repo is a native Android Gradle workspace and should use `vymo-android-runtime` directly.

Load [references/commands.md](references/commands.md) before running workspace commands.

## Workflow

1. Treat `/Users/vinaykumar/vymo/react-app` as the default app root unless a validated override is provided.
2. If a caller provides `APP_ROOT`, trust it only when it still points to the React Native workspace.
2. Prefer repo-provided `yarn` scripts over ad-hoc commands.
3. Use the native `OpenCode Session ID` for thread continuity and pass it unchanged through triage, reproduction, fix, validation, and delivery.
4. Store runtime artifacts only under `./tmp/{platform}/{opencodeSessionId}/`.
5. Before writing any artifact files, create the session temp tree with `scripts/create-session-dirs.sh`.
6. Before launching the app, check whether Metro is already running.
7. Use the bundled Metro helper scripts instead of handwritten background shell when possible.
8. If Metro is not running, start it in the background and keep all logs and pidfiles inside the repo-local session temp tree.
9. If the app closes immediately after launch, do not treat that as product behavior until Metro, dependency state, and launch logs are checked.
10. In final output, always report:
   - platform
   - app root
   - OpenCode session id
   - temp session root
   - whether Metro was reused or started
   - background command and log path
   - any runtime issue that could have invalidated reproduction or verification

## Temp Artifact Rules

- Use `./tmp/ios/{opencodeSessionId}/...` for iOS runs.
- Use `./tmp/android/{opencodeSessionId}/...` for Android runs.
- Use these subfolders consistently:
  - `logs/`
  - `evidence/`
  - `runtime/`
  - `reports/`
- Do not create new workflow artifacts in `/tmp` unless a tool forces it and there is no safe repo-local alternative.
- Prefer the bundled temp-dir helper over ad hoc `mkdir` calls when creating the session tree.

## Background Process Rules

- First check existing Metro state with `scripts/check-metro.sh`.
- First ensure the temp session tree exists with `scripts/create-session-dirs.sh`.
- Reuse a healthy Metro process instead of starting duplicates.
- Start Metro with `scripts/start-metro.sh`.
- Stop Metro with `scripts/stop-metro.sh` only when cleanup is explicitly needed.
- Export or pass `OPENCODE_SESSION_ID` and `PLATFORM` before invoking the scripts so the temp path and app root land in the correct session tree.
- Set `APP_ROOT` explicitly when a task already knows the platform workspace and you want the command output to be unambiguous.
- After starting Metro, verify readiness from the log before launching the app.
- If Metro logs show bundling errors, fix or report that before trusting app behavior.

## When To Stop

Stop and report a runtime blocker if:
- the expected React Native app root is missing
- Metro cannot be started or stays unhealthy
- the app launch fails for local environment reasons
- the task requires a different workspace mapping than the validated React Native root
