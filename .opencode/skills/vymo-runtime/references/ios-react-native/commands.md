# Vymo Runtime: iOS React Native Commands

## Workspace

- App root: `/Users/vinaykumar/vymo/react-app`
- iOS native dir: `/Users/vinaykumar/vymo/react-app/iOS`
- Preferred package manager: `yarn`

## Repo Scripts

Run these from `/Users/vinaykumar/vymo/react-app`.

- Install JS deps: `yarn install`
- Start Metro: `yarn start`
- Install pods: `yarn pod-install`
- Run iOS app: `yarn ios --target "Vymo"`
- Run tests: `yarn test`
- Run lint: `yarn lint`
- Fix lint: `yarn lint:fix`
- Format: `yarn format`

Relevant package scripts:

- `yarn start` runs `react-native start --reset-cache --experimental-debugger`
- `yarn ios` runs `react-native run-ios`
- `yarn config-prepare <DEBUG|STAGING|PROD>` runs `tasks/scripts/prepare.sh` and refreshes `iOS/Config/...` assets used by the selected environment
- `yarn pod-install` runs `cd iOS && bundle exec pod install`

## Ticket Temp Layout

Use one repo-local ticket root per Jira issue:

- `./tmp/<ticket-key>/ios/`

Use these subfolders:

- `logs/` for command output and runner logs
- `evidence/` for screenshots and captured artifacts
- `runtime/` for ticket-scoped service metadata
- `reports/` for optional local handoff files

Create them with the helper before writing ticket artifacts:

```sh
export PLATFORM=ios
export TICKET_KEY=<jira-ticket-key>
/Users/vinaykumar/vymo/workiq/oncall-ai-agent-open-code/.opencode/skills/vymo-runtime/scripts/create-session-dirs.sh
```

## Shared Metro Runtime Layout

Metro is a shared workspace service for `/Users/vinaykumar/vymo/react-app`, not a ticket-owned process.

The helper scripts keep shared Metro state under:

- `./tmp/_workspace/react-native-runtime/logs/metro.log`
- `./tmp/_workspace/react-native-runtime/runtime/metro.pid`
- `./tmp/_workspace/react-native-runtime/runtime/metro.env`

Ticket temp trees are still used for screenshots, logs, and reports that belong to the current Jira issue.

Export these variables before running the Metro helper scripts when possible:

```sh
export PLATFORM=ios
export TICKET_KEY=<jira-ticket-key>
export APP_ROOT=/Users/vinaykumar/vymo/react-app
```

Optional override:

```sh
export REPO_ROOT=/Users/vinaykumar/vymo/workiq/oncall-ai-agent-open-code
```

## Shared Metro Pattern

Prefer the bundled helper scripts:

```sh
/Users/vinaykumar/vymo/workiq/oncall-ai-agent-open-code/.opencode/skills/vymo-runtime/scripts/create-session-dirs.sh
/Users/vinaykumar/vymo/workiq/oncall-ai-agent-open-code/.opencode/skills/vymo-runtime/scripts/check-metro.sh
```

If shared Metro is not healthy, start it with:

```sh
/Users/vinaykumar/vymo/workiq/oncall-ai-agent-open-code/.opencode/skills/vymo-runtime/scripts/start-metro.sh
```

Stop it only for explicit cleanup or recovery:

```sh
/Users/vinaykumar/vymo/workiq/oncall-ai-agent-open-code/.opencode/skills/vymo-runtime/scripts/stop-metro.sh
```

The helper scripts manage:

- ticket root creation for `./tmp/{ticketKey}/{platform}/`
- subdirectory creation for `logs/`, `evidence/`, `runtime/`, and `reports/`
- React Native app root selection when `APP_ROOT` is unset
- shared runtime pidfile: `./tmp/_workspace/react-native-runtime/runtime/metro.pid`
- shared runtime log: `./tmp/_workspace/react-native-runtime/logs/metro.log`
- shared metadata file: `./tmp/_workspace/react-native-runtime/runtime/metro.env`
- health checks against port `8081`
- lock-safe reuse versus new start decision for the shared workspace

If needed, inspect readiness or errors with:

```sh
tail -n 50 ./tmp/_workspace/react-native-runtime/logs/metro.log
```

## Launch Pattern

Prefer Maestro MCP for launch and verification flows whenever it can replace direct `xcrun` or `xcodebuild` usage reliably.
When the steps are already known up front, prefer Maestro MCP `runFlow` to execute the full iOS path in one pass.

## Environment Config Preparation

Before launching iOS, make sure the repo config matches the intended environment:

- Run `yarn config-prepare DEBUG` before `Vymo` or `ABC Stellar`
- Run `yarn config-prepare STAGING` before `Vymo-Staging` or `ABC Stellar - Staging`
- Run `yarn config-prepare PROD` only for production/release-oriented flows that explicitly need it
- Re-run `yarn config-prepare ...` whenever you switch between debug/staging/prod or change scheme family in a way that changes the expected iOS config set
- This is important in `react-app` because the iOS build copies `GoogleService-Info.plist` from `iOS/Config/<Env>/...`; stale or missing config can break launch/build when switching schemes or environments

From the app root:

```sh
export PLATFORM=ios
yarn config-prepare DEBUG
yarn ios --target "Vymo"
```

Always pass the explicit Xcode target in the launch command. Do not rely on bare `yarn ios`, because the default target resolution has been unreliable and can lead to crashes or the wrong app target being selected.

Use a scheme-specific launch when the ticket identifies the app kind:

```sh
export PLATFORM=ios
yarn config-prepare DEBUG
yarn ios --target "Vymo" --scheme "Vymo"

yarn config-prepare DEBUG
yarn ios --target "ABC Stellar" --scheme "ABC Stellar"

yarn config-prepare STAGING
yarn ios --target "Vymo" --scheme "Vymo-Staging"

yarn config-prepare STAGING
yarn ios --target "ABC Stellar" --scheme "ABC Stellar - Staging"
```

When launching on a specific simulator/device, keep the same explicit target rule:

```sh
export PLATFORM=ios
yarn config-prepare DEBUG
yarn ios --udid <simulator-udid> --target "Vymo" --scheme "Vymo"
```

If local native state looks stale:

```sh
export PLATFORM=ios
yarn pod-install
```

## App Identity Clues

- Preferred first choice for reproduction and validation: the matching debug scheme for the identified app kind
- Preferred first choice for reproduction and validation launch command for default Vymo iOS: `yarn ios --target "Vymo" --scheme "Vymo"`
- Default Vymo debug scheme: `Vymo`
- Default Vymo staging scheme: `Vymo-Staging`
- Default ABC debug scheme: `ABC Stellar`
- Default ABC staging scheme: `ABC Stellar - Staging`
- Vymo target name: `Vymo`
- ABC target name: `ABC Stellar`
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
- ticket key
- temp ticket root
- shared workspace runtime root when Metro mattered
- Metro status: reused or started
- app launch command
- scheme and bundle context used
- pod-install command if used
- simulator/device context
- any iOS-specific local blocker that affects confidence
