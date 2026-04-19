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

- Prefer repo-documented assemble or bundle tasks for the requested flavor/build type.
- Use module-aware Gradle commands for targeted verification when full variant builds are unnecessary.

## Native Build Examples

Documented examples from the repo README:

```sh
/Users/vinaykumar/vymo/android-base/gradlew assembleVymo_2_0MasterFeature_testing
/Users/vinaykumar/vymo/android-base/gradlew assembleVymo_2_0MasterRelease
/Users/vinaykumar/vymo/android-base/gradlew bundleVymo_2_0MasterRelease
/Users/vinaykumar/vymo/android-base/gradlew assembleAbcMasterRelease
/Users/vinaykumar/vymo/android-base/gradlew bundleAbcMasterRelease
```

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
- device or emulator context
- any Android-specific local blocker that affects confidence
