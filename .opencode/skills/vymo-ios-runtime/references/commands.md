# Vymo iOS Runtime Commands

## Workspace

- App root: `/Users/vinaykumar/vymo/react-app`
- iOS native dir: `/Users/vinaykumar/vymo/react-app/iOS`
- Preferred package manager: `yarn`

## Repo Scripts

Run these from `/Users/vinaykumar/vymo/react-app`.

- Install pods: `yarn pod-install`
- Run iOS app: `yarn ios`

Relevant package scripts:

- `yarn ios` runs `react-native run-ios`
- `yarn pod-install` runs `cd iOS && bundle exec pod install`

## Launch Pattern

From the app root:

```sh
yarn ios
```

If local native state looks stale:

```sh
yarn pod-install
```

## App Identity Clues

- Main iOS bundle id seen in project: `com.getvymo.ios`
- Debug product name in project file: `Vymo Debug`
- Primary Xcode workspace path: `/Users/vinaykumar/vymo/react-app/iOS/Vymo.xcworkspace`
- Xcode project path: `/Users/vinaykumar/vymo/react-app/iOS/Vymo.xcodeproj`

## Reporting Requirements

Whenever iOS runtime setup mattered, report:

- app launch command
- pod-install command if used
- simulator/device context
- any iOS-specific local blocker that affects confidence
