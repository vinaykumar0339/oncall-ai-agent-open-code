---
name: vymo-android-runtime
description: Use when an on-call workflow needs Android-specific setup, emulator or device launch behavior, Gradle troubleshooting, or Android runtime guidance for the native Vymo Android app.
---

# Vymo Android Runtime

Use this skill for the native Android workspace at `/Users/vinaykumar/vymo/android-base`.

Load [references/commands.md](references/commands.md) before running Android workspace commands.

## Workflow

1. Treat `/Users/vinaykumar/vymo/android-base` as the default Android app root unless a validated override is provided.
2. Treat the repo root as the native Android workspace. There is no nested `/android` directory in this repo.
3. Prefer the Gradle wrapper and repo-documented tasks over JavaScript package scripts.
4. Use root-level Gradle tasks, module-specific Gradle tasks, and emulator/device flows that match this native Android repo.
5. Report Android-specific blockers separately from React Native / Metro blockers in the iOS workspace.
6. Before writing any local logs, screenshots, or reports, create the repo-local temp ticket tree with `../vymo-react-native-runtime/scripts/create-session-dirs.sh`.

## Android Rules

- Prefer a healthy emulator or attached device before declaring the issue blocked.
- Prefer Maestro MCP for launch, navigation, and verification flows whenever it can replace direct `adb` usage reliably.
- When the Android steps are already known up front, prefer Maestro MCP `runFlow` to execute the full path in one pass.
- If Gradle, emulator, or Android SDK state is broken locally, report that as an environment blocker instead of a product conclusion.
- Do not assume Metro or `yarn start` is part of this Android repo.
- Determine the Android app kind from verified flavor, client, or application id context before choosing a debug variant.
- Default Vymo app reproduction and validation to the `betaMasterDebug` variant.
- Use the `abcMasterDebug` variant for the ABC white-label app flow.
- Only override those defaults when a ticket-specific verified requirement requires a different variant.
- Prefer native Gradle verification such as `./gradlew tasks`, targeted assemble tasks, or module-specific checks before concluding the issue is blocked.
- Key modules live under `library`, `core`, `features`, `shared`, and `mediator`.
