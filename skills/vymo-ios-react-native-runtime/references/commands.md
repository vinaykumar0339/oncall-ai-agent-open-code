# Vymo iOS React Native Commands

## Workspace

- App root: `/Users/vinaykumar/vymo/react-app`
- iOS native dir: `/Users/vinaykumar/vymo/react-app/iOS`
- Preferred package manager: `yarn`
- Native folder name is `iOS`, not `ios`

## Environment Hints

- Node: `v18.19.1`
- Ruby: `v3.1.1`
- Yarn: `v3.6.4`

## Repo Scripts

Run these from `/Users/vinaykumar/vymo/react-app`.

- Install JS deps: `yarn install`
- Install pods: `yarn pod-install`
- Start Metro: `yarn start`
- Run iOS app: `yarn ios`
- Run tests: `yarn test`
- Run lint: `yarn lint`
- Fix lint: `yarn lint:fix`
- Format: `yarn format`

Relevant package scripts:

- `yarn start` runs `react-native start --reset-cache --experimental-debugger`
- `yarn ios` runs `react-native run-ios`
- `yarn pod-install` runs `cd iOS && bundle exec pod install`

## Background Metro Pattern

Prefer the bundled helper scripts:

```sh
/Users/vinaykumar/.config/opencode/skills/vymo-ios-react-native-runtime/scripts/check-metro.sh
```

If Metro is not healthy, start it with:

```sh
/Users/vinaykumar/.config/opencode/skills/vymo-ios-react-native-runtime/scripts/start-metro.sh
```

To stop it explicitly:

```sh
/Users/vinaykumar/.config/opencode/skills/vymo-ios-react-native-runtime/scripts/stop-metro.sh
```

The helper scripts manage:

- pidfile: `/tmp/opencode-vymo-metro.pid`
- log file: `/tmp/opencode-vymo-metro.log`
- health checks against port `8081`
- reuse versus new start decision

If needed, inspect readiness or errors with:

```sh
tail -n 50 /tmp/opencode-vymo-metro.log
```

## iOS Launch Pattern

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

## Runtime Troubleshooting

If the app launches and closes immediately:

1. Check Metro health first.
2. Recheck `yarn pod-install` status if native setup changed.
3. Retry launch only after runtime prerequisites look healthy.
4. Do not confuse local startup failure with product reproduction.

If you need local environment pointing or other iOS app-specific setup, the repo README references an internal guide:

- `Pointing to local environment from apps`

## Reporting Requirements

Whenever you started or reused runtime infrastructure, report:

- Metro status: reused or started
- Background command used
- Log path, typically `/tmp/opencode-vymo-metro.log`
- App launch command
- Any local runtime issue that could affect confidence
