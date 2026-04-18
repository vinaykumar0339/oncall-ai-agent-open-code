# Vymo Android Runtime Commands

## Workspace

- App root: `/Users/vinaykumar/vymo/android-base`
- Default Android native dir: `/Users/vinaykumar/vymo/android-base/android`
- Preferred package manager: `yarn`

## Preferred Command Order

Run these from `/Users/vinaykumar/vymo/android-base`.

- Check package scripts before choosing an Android runner.
- Prefer `yarn android` when the workspace provides it.
- If no Android script exists, verify the workspace first and then use `npx react-native run-android` only when appropriate.

## Native Fallbacks

If native Android verification is required, inspect the Android workspace before choosing a command. Common fallbacks include:

```sh
cd /Users/vinaykumar/vymo/android-base/android && ./gradlew tasks
cd /Users/vinaykumar/vymo/android-base/android && ./gradlew assembleDebug
```

## Reporting Requirements

Whenever Android runtime setup mattered, report:

- app launch command
- device or emulator context
- any Android-specific local blocker that affects confidence
