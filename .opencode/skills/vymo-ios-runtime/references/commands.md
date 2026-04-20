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
export PLATFORM=ios
yarn ios
```

Use a scheme-specific launch when the ticket identifies the app kind:

```sh
export PLATFORM=ios
yarn ios --scheme "Vymo"
yarn ios --scheme "ABC Stellar"
yarn ios --scheme "Vymo-Staging"
yarn ios --scheme "ABC Stellar - Staging"
```

If local native state looks stale:

```sh
export PLATFORM=ios
yarn pod-install
```

## App Identity Clues

- Default Vymo debug scheme: `Vymo`
- Default Vymo staging scheme: `Vymo-Staging`
- Default ABC debug scheme: `ABC Stellar`
- Default ABC staging scheme: `ABC Stellar - Staging`
- Vymo debug bundle id in project: `com.getvymo.ios`
- Vymo staging bundle id in project: `com.getvymo.ios.enterprise`
- ABC debug bundle id in project: `com.getvymo.iosabc`
- ABC staging bundle id in project: `com.getvymo.iosabc.enterprise`
- Debug product name in project file: `Vymo Debug`
- Primary Xcode workspace path: `/Users/vinaykumar/vymo/react-app/iOS/Vymo.xcworkspace`
- Xcode project path: `/Users/vinaykumar/vymo/react-app/iOS/Vymo.xcodeproj`

## Reporting Requirements

Whenever iOS runtime setup mattered, report:

- platform
- app root
- app launch command
- scheme and bundle context used
- pod-install command if used
- simulator/device context
- any iOS-specific local blocker that affects confidence
