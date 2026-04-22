---
name: vymo-runtime
description: Use when a task needs local runtime setup, app launch guidance, shared Metro handling, temp artifact layout, or runtime reporting for the Vymo mobile workspaces.
---

# Vymo Runtime

Use this skill when a task needs local runtime setup or runtime troubleshooting for the app workspaces.

Workspace scope:
- iOS React Native workspace: `~/vymo/react-app`
- iOS native dir inside that workspace: `~/vymo/react-app/iOS`
- Android native workspace: `~/vymo/android-base`

Platform coverage:
- `ios`: React Native workspace with iOS-specific launch behavior
- `android`: native Android Gradle workspace

## Workflow

1. Identify the platform first:
   - `ios`
   - `android`
2. Keep ticket artifacts under `./tmp/{ticketKey}/{platform}/...`.
3. Before writing ticket artifacts, create the ticket temp tree with [scripts/create-session-dirs.sh](scripts/create-session-dirs.sh).
4. Load the matching platform reference:
   - `ios` -> [references/ios-react-native/commands.md](references/ios-react-native/commands.md)
   - `android` -> [references/android-native/commands.md](references/android-native/commands.md)
5. For iOS work:
   - treat Metro as a shared workspace service
   - reuse healthy Metro before starting a new one
   - stop Metro only for explicit cleanup or recovery
   - default to using Metro with an already installed app for `~/vymo/react-app`
   - do not trigger full iOS rebuild/install for JS/TS-only changes
   - only rebuild when native changes are verified (for example `~/vymo/react-app/iOS` edits, Pod/native dependency changes, scheme or bundle changes, or app-not-installed state)
   - default launch and validation work to the debug app, not staging
   - treat ticket mentions of UAT or staging as report context, not as an automatic instruction to launch the staging app
   - only choose a staging scheme when a human instruction or verified runtime evidence shows the issue is specific to the staging app, enterprise app, staging scheme, or enterprise bundle id
   - use `reactotron-mcp` when request and response inspection would help determine whether an issue is caused by client behavior, API behavior, auth, or environment data
   - keep Reactotron usage scoped to the iOS React Native workspace only
6. For Android work:
   - do not assume Metro or `yarn start` is part of the repo
   - use native Gradle and device/emulator flows
   - do not use `reactotron-mcp` for the native Android workspace
7. In runtime reporting, always include:
   - platform
   - app root
   - OpenCode session id when available
   - temp ticket root
   - any shared runtime state that mattered
   - whether Reactotron network evidence was used and what high-level conclusion it supported
   - any local runtime blocker that could affect confidence

## Guardrails

- Do not frame Android as a React Native runtime.
- Do not frame `react-app` support as a generic cross-platform React Native runtime when current runtime automation is specifically for iOS work in that workspace.
- Do not treat Metro as ticket-owned background state.
- Do not write ticket evidence or reports into `./tmp/_workspace/...`.
- Do not load both platform references unless a task genuinely spans both workspaces.
- Do not expose raw request or response payloads from Reactotron in Jira comments or other public-facing summaries. Prefer sanitized conclusions plus ticket-local evidence paths.
