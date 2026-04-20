# Vymo Android Runtime Commands

## Workspace

- App root: `/Users/vinaykumar/vymo/android-base`
- Native Android workspace root: `/Users/vinaykumar/vymo/android-base`
- Preferred command runner: `./gradlew`

## Preferred Command Order

Run these from `/Users/vinaykumar/vymo/android-base`.

Create the repo-local temp ticket tree before writing artifacts:

```sh
export PLATFORM=android
export TICKET_KEY=<jira-ticket-key>
/Users/vinaykumar/vymo/workiq/oncall-ai-agent-open-code/.opencode/skills/vymo-react-native-runtime/scripts/create-session-dirs.sh
```

- Inspect available Gradle tasks first:

```sh
/Users/vinaykumar/vymo/android-base/gradlew tasks
```

- Determine the Android app kind from verified flavor, client, or application id context before choosing a build target.
- Use `betaMasterDebug` for the default Vymo app debug flow.
- Use `abcMasterDebug` for the ABC white-label debug flow.
- Only use another Android variant when the ticket explicitly calls for a different verified target.
- Prefer repo-documented assemble or bundle tasks for the requested flavor/build type.
- Use module-aware Gradle commands for targeted verification when full variant builds are unnecessary.

## Native Build Examples

Documented examples from the repo README:

```sh
/Users/vinaykumar/vymo/android-base/gradlew assembleBetaMasterDebug
/Users/vinaykumar/vymo/android-base/gradlew assembleAbcMasterDebug
/Users/vinaykumar/vymo/android-base/gradlew assembleVymo_2_0MasterFeature_testing
/Users/vinaykumar/vymo/android-base/gradlew assembleVymo_2_0MasterRelease
/Users/vinaykumar/vymo/android-base/gradlew bundleVymo_2_0MasterRelease
/Users/vinaykumar/vymo/android-base/gradlew assembleAbcMasterRelease
/Users/vinaykumar/vymo/android-base/gradlew bundleAbcMasterRelease
```

## Variant Selection

Use these app-target defaults unless the ticket or verified runtime context says otherwise:

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
/Users/vinaykumar/vymo/android-base/gradlew assembleBetaMasterDebug
/Users/vinaykumar/vymo/android-base/gradlew assembleBetaMasterRelease
/Users/vinaykumar/vymo/android-base/gradlew assembleBetaMasterFeature_testing
/Users/vinaykumar/vymo/android-base/gradlew assembleVymo_2_0MasterDebug
/Users/vinaykumar/vymo/android-base/gradlew assembleVymo_2_0MasterRelease
/Users/vinaykumar/vymo/android-base/gradlew assembleVymo_2_0MasterFeature_testing
/Users/vinaykumar/vymo/android-base/gradlew assembleWith_call_logMasterDebug
/Users/vinaykumar/vymo/android-base/gradlew assembleWith_call_logMasterRelease
/Users/vinaykumar/vymo/android-base/gradlew assembleWith_call_logMasterFeature_testing
/Users/vinaykumar/vymo/android-base/gradlew assembleWith_incoming_call_logMasterDebug
/Users/vinaykumar/vymo/android-base/gradlew assembleWith_incoming_call_logMasterRelease
/Users/vinaykumar/vymo/android-base/gradlew assembleWith_incoming_call_logMasterFeature_testing
/Users/vinaykumar/vymo/android-base/gradlew assembleAbcMasterDebug
/Users/vinaykumar/vymo/android-base/gradlew assembleAbcMasterRelease
/Users/vinaykumar/vymo/android-base/gradlew assembleAbcMasterFeature_testing
/Users/vinaykumar/vymo/android-base/gradlew assembleVymo_2_0IntuneDebug
/Users/vinaykumar/vymo/android-base/gradlew assembleVymo_2_0IntuneRelease
/Users/vinaykumar/vymo/android-base/gradlew assembleVymo_2_0IntuneFeature_testing
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
/Users/vinaykumar/vymo/android-base/gradlew tasks
/Users/vinaykumar/vymo/android-base/gradlew :library:assembleDebug
/Users/vinaykumar/vymo/android-base/gradlew :library:lint
```

## Architecture Clues

- Root settings file: `/Users/vinaykumar/vymo/android-base/settings.gradle.kts`
- Root build file: `/Users/vinaykumar/vymo/android-base/build.gradle.kts`
- Primary app module path: `/Users/vinaykumar/vymo/android-base/library`
- Main app namespace in `library/build.gradle.kts`: `in.vymo.android.base`
- Major module groups: `core`, `features`, `library`, `mediator`, `shared`

## Reporting Requirements

Whenever Android runtime setup mattered, report:

- platform
- app root
- gradle task or module command used
- app launch command
- package or application id context used
- device or emulator context
- any Android-specific local blocker that affects confidence
