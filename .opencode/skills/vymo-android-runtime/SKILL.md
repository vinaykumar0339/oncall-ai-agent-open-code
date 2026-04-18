---
name: vymo-android-runtime
description: Use when an on-call workflow needs Android-specific setup, emulator or device launch behavior, Gradle troubleshooting, or Android runtime guidance for the Vymo React Native app.
---

# Vymo Android Runtime

Load the shared `vymo-react-native-runtime` skill first, then use this skill for Android-specific behavior.

Load [references/commands.md](references/commands.md) before running Android workspace commands.

## Workflow

1. Treat `/Users/vinaykumar/vymo/android-base` as the default Android app root unless a validated override is provided.
2. Treat `/Users/vinaykumar/vymo/android-base/android` as the default Android native directory unless the workspace proves otherwise.
3. Prefer repo-provided Android scripts when present.
4. If the repo does not define an Android runner script, verify package scripts before falling back to `npx react-native run-android`.
5. Report Android-specific blockers separately from shared runtime blockers.

## Android Rules

- Prefer a healthy emulator or attached device before declaring the issue blocked.
- If Gradle, emulator, or Android SDK state is broken locally, report that as an environment blocker instead of a product conclusion.
- Keep shared Metro handling inside the shared runtime skill instead of duplicating it here.
