# Vymo Runtime: Android Native Commands

## Workspace

- App root: `~/vymo/android-base`
- Native Android workspace root: `~/vymo/android-base`
- Preferred command runner: `./gradlew`

## Ticket Temp Layout

Use one repo-local ticket root per Jira issue:

- `./tmp/<ticket-key>/android/`

Use these subfolders:

- `logs/` for command output and runner logs
- `evidence/` for screenshots and captured artifacts
- `runtime/` for ticket-scoped service metadata
- `reports/` for optional local handoff files

Create the repo-local temp ticket tree before writing artifacts:

```sh
export PLATFORM=android
export TICKET_KEY=<jira-ticket-key>
~/vymo/workiq/oncall-ai-agent-open-code/.opencode/skills/vymo-runtime/scripts/create-session-dirs.sh
```

That helper is shared for repo-local ticket artifacts only. It does not imply that Android uses Metro or the React Native runtime model.

## Preferred Command Order

Prefer Maestro MCP for launch and verification flows whenever it can replace direct `adb` usage reliably.
When the steps are already known up front, prefer Maestro MCP `runFlow` to execute the full Android path in one pass.

Run these from `~/vymo/android-base`.

- Inspect available Gradle tasks first:

```sh
./gradlew tasks
```

- Determine the Android app kind from verified flavor, client, or application id context before choosing a build target.
- Prefer the matching debug variant first after the app kind is identified, unless the ticket or verified runtime context explicitly requires another variant.
- Use `betaMasterDebug` for the default Vymo app debug flow.
- Use `abcMasterDebug` for the ABC white-label debug flow.
- `android-base` does not expose an iOS-style `config-prepare` scheme-switch command in this repo. Android runtime selection is done through the chosen Gradle variant plus the required local environment file mentioned in the repo README.
- Only use another Android variant when the ticket explicitly calls for a different verified target.
- Prefer repo-documented assemble or bundle tasks for the requested flavor/build type.
- Use module-aware Gradle commands for targeted verification when full variant builds are unnecessary.

## Native Build Examples

Documented examples from the repo README:

```sh
./gradlew assembleBetaMasterDebug
./gradlew assembleAbcMasterDebug
./gradlew assembleVymo_2_0MasterFeature_testing
./gradlew assembleVymo_2_0MasterRelease
./gradlew bundleVymo_2_0MasterRelease
./gradlew assembleAbcMasterRelease
./gradlew bundleAbcMasterRelease
```

## Variant Selection

Use these app-target defaults unless the ticket or verified runtime context says otherwise:

- Preferred first choice for reproduction and validation: the matching debug variant for the identified app kind
- No extra repo-local runtime config-switch command is required before changing Android variants; switch by selecting the correct verified Gradle variant directly
- Default Vymo debug variant: `betaMasterDebug`
- Default Vymo release variant: `vymo_2_0MasterRelease`
- Default Vymo feature-testing variant: `vymo_2_0MasterFeature_testing`
- Default ABC debug variant: `abcMasterDebug`
- Default ABC release variant: `abcMasterRelease`
- Default ABC feature-testing variant: `abcMasterFeature_testing`
- Intune debug variant: `vymo_2_0IntuneDebug`
- Intune release variant: `vymo_2_0IntuneRelease`
- Intune feature-testing variant: `vymo_2_0IntuneFeature_testing`

Variant-specific build commands:

```sh
./gradlew assembleBetaMasterDebug
./gradlew assembleBetaMasterRelease
./gradlew assembleBetaMasterFeature_testing
./gradlew assembleVymo_2_0MasterDebug
./gradlew assembleVymo_2_0MasterRelease
./gradlew assembleVymo_2_0MasterFeature_testing
./gradlew assembleWith_call_logMasterDebug
./gradlew assembleWith_call_logMasterRelease
./gradlew assembleWith_call_logMasterFeature_testing
./gradlew assembleWith_incoming_call_logMasterDebug
./gradlew assembleWith_incoming_call_logMasterRelease
./gradlew assembleWith_incoming_call_logMasterFeature_testing
./gradlew assembleAbcMasterDebug
./gradlew assembleAbcMasterRelease
./gradlew assembleAbcMasterFeature_testing
./gradlew assembleVymo_2_0IntuneDebug
./gradlew assembleVymo_2_0IntuneRelease
./gradlew assembleVymo_2_0IntuneFeature_testing
```

## Package Identity Clues

- Default Vymo debug package: `com.getvymo.android.debug`
- Default Vymo release and feature-testing package: `com.getvymo.android`
- ABC debug package: `com.abc.android.debug`
- ABC release and feature-testing package: `com.abc.android`
- Intune debug package: `com.getvymo.android.intune.debug`
- Intune release package: `com.getvymo.android.intune`
- Intune feature-testing package: `com.getvymo.android.intune.uat`

## Variant Availability Notes

- `debug`, `release`, and `feature_testing` are the meaningful app build types to use here.
- `uat_signed` and `ame_testing` are defined in the build logic but disabled by variant pruning.
- Intune variants are only kept for `vymo_2_0`; other `*Intune*` combinations should not be assumed to exist.

## Native Fallbacks

If targeted native Android verification is required, inspect the workspace before choosing a command. Common fallbacks include:

```sh
./gradlew tasks
./gradlew :library:assembleDebug
./gradlew :library:lint
```

## Architecture Clues

- Root settings file: `~/vymo/android-base/settings.gradle.kts`
- Root build file: `~/vymo/android-base/build.gradle.kts`
- Primary app module path: `~/vymo/android-base/library`
- Main app namespace in `library/build.gradle.kts`: `in.vymo.android.base`
- Major module groups: `core`, `features`, `library`, `mediator`, `shared`

## Reporting Requirements

Whenever Android runtime setup mattered, report:

- platform
- app root
- ticket key
- temp ticket root
- gradle task or module command used
- app launch command
- package or application id context used
- device or emulator context
- any Android-specific local blocker that affects confidence
