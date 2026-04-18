---
name: vymo-ios-runtime
description: Use when an on-call workflow needs iOS-specific setup, pod install, simulator launch, Xcode clues, or iOS runtime troubleshooting for the Vymo React Native app.
---

# Vymo iOS Runtime

Load the shared `vymo-react-native-runtime` skill first, then use this skill for iOS-specific behavior.

Load [references/commands.md](references/commands.md) before running iOS workspace commands.

## Workflow

1. Treat `/Users/vinaykumar/vymo/react-app` as the app root and `/Users/vinaykumar/vymo/react-app/iOS` as the native iOS directory.
2. Prefer `yarn ios` for simulator launches from the app root.
3. If iOS dependencies are stale or missing, use the repo pod-install script from the app root.
4. If the app launches and closes immediately, verify shared runtime health before treating it as product behavior.
5. Report iOS-specific blockers separately from shared runtime blockers.

## iOS Rules

- Native folder name is `iOS`, not `ios`.
- Use `yarn pod-install` before retrying if native dependency state looks broken.
- If direct native inspection is required, prefer the checked-in workspace and project clues from the command reference.
- Stop and report a blocker if pods fail or if simulator launch fails for local environment reasons.
