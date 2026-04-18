---
name: vymo-ios-react-native-runtime
description: Use when working on the Vymo iOS React Native app at /Users/vinaykumar/vymo/react-app for reproduction, local app startup, Metro management, pod install, build/test commands, or fix verification. Covers the supported workspace paths, preferred commands, long-running background process handling, and common iOS runtime troubleshooting.
---

# Vymo iOS React Native Runtime

Use this skill whenever a task touches the Vymo iOS React Native workspace at `/Users/vinaykumar/vymo/react-app`.

Load [references/commands.md](references/commands.md) before running workspace commands.

## Workflow

1. Treat `/Users/vinaykumar/vymo/react-app` as the app root and `/Users/vinaykumar/vymo/react-app/iOS` as the native iOS directory.
2. Prefer repo-provided `yarn` scripts over ad-hoc commands.
3. Before launching the app, check whether Metro is already running.
4. Use the bundled Metro helper scripts instead of handwritten background shell when possible.
5. If Metro is not running, start it in the background and keep logs in `/tmp`.
6. If iOS dependencies are stale or missing, use the repo pod-install script from the app root.
7. If the app closes immediately after launch, do not treat that as product behavior until Metro, pods, and launch logs are checked.
8. In final output, always report:
   - whether Metro was reused or started
   - background command and log path
   - app launch command used
   - any runtime issue that could have invalidated reproduction or verification

## Background Process Rules

- First check existing Metro state with `scripts/check-metro.sh`.
- Reuse a healthy Metro process instead of starting duplicates.
- Start Metro with `scripts/start-metro.sh`.
- Stop Metro with `scripts/stop-metro.sh` only when cleanup is explicitly needed.
- After starting Metro, verify readiness from the log before launching the app.
- If Metro logs show bundling errors, fix or report that before trusting app behavior.

## App Launch Rules

- Prefer `yarn ios` from the app root for simulator launches.
- Use `yarn pod-install` before retrying if native dependency state looks broken.
- If direct React Native launch is needed, prefer the repo root and avoid inventing custom paths.
- For product behavior claims, make sure the runtime was healthy enough that the app was not failing because of local setup.

## When To Stop

Stop and report a runtime blocker if:
- Metro cannot be started or stays unhealthy
- pod install fails
- the simulator/app launch fails for local environment reasons
- the task requires a different workspace mapping than the current iOS app root
