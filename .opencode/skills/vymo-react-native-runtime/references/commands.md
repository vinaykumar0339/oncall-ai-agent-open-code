# Vymo React Native Runtime Commands

## Workspace

- React Native app root: `/Users/vinaykumar/vymo/react-app`
- Native iOS dir inside that workspace: `/Users/vinaykumar/vymo/react-app/iOS`
- Preferred package manager: `yarn`

## Shared Repo Scripts

Run these from `/Users/vinaykumar/vymo/react-app`.

- Install JS deps: `yarn install`
- Start Metro: `yarn start`
- Run tests: `yarn test`
- Run lint: `yarn lint`
- Fix lint: `yarn lint:fix`
- Format: `yarn format`

Relevant package scripts:

- `yarn start` runs `react-native start --reset-cache --experimental-debugger`

## OpenCode Session Temp Layout

Use one repo-local session root per OpenCode thread:

- `./tmp/ios/<opencode-session-id>/`
- `./tmp/android/<opencode-session-id>/`

Use these subfolders:

- `logs/` for command output and runner logs
- `evidence/` for screenshots and captured artifacts
- `runtime/` for pidfiles and service metadata
- `reports/` for optional local handoff files

Create them with the helper before writing artifacts:

```sh
export PLATFORM=ios
export OPENCODE_SESSION_ID=<opencode-session-id>
/Users/vinaykumar/vymo/workiq/oncall-ai-agent-open-code/.opencode/skills/vymo-react-native-runtime/scripts/create-session-dirs.sh
```

Export these variables before running the Metro helper scripts when possible:

```sh
export PLATFORM=ios
export OPENCODE_SESSION_ID=<opencode-session-id>
```

React Native workspace root:

```sh
export APP_ROOT=/Users/vinaykumar/vymo/react-app
```

Optional overrides:

```sh
export REPO_ROOT=/Users/vinaykumar/vymo/workiq/oncall-ai-agent-open-code
```

## Background Metro Pattern

Prefer the bundled helper scripts:

```sh
/Users/vinaykumar/vymo/workiq/oncall-ai-agent-open-code/.opencode/skills/vymo-react-native-runtime/scripts/create-session-dirs.sh
```

Then:

```sh
/Users/vinaykumar/vymo/workiq/oncall-ai-agent-open-code/.opencode/skills/vymo-react-native-runtime/scripts/check-metro.sh
```

If Metro is not healthy, start it with:

```sh
/Users/vinaykumar/vymo/workiq/oncall-ai-agent-open-code/.opencode/skills/vymo-react-native-runtime/scripts/start-metro.sh
```

To stop it explicitly:

```sh
/Users/vinaykumar/vymo/workiq/oncall-ai-agent-open-code/.opencode/skills/vymo-react-native-runtime/scripts/stop-metro.sh
```

The helper scripts manage:

- session root: `./tmp/{platform}/{opencodeSessionId}/`
- subdirectory creation for `logs/`, `evidence/`, `runtime/`, and `reports/`
- React Native app root selection when `APP_ROOT` is unset
- runtime pidfile: `./tmp/{platform}/{opencodeSessionId}/runtime/metro.pid`
- runtime log: `./tmp/{platform}/{opencodeSessionId}/runtime/metro.log`
- health checks against port `8081`
- reuse versus new start decision

If needed, inspect readiness or errors with:

```sh
tail -n 50 ./tmp/<platform>/<opencode-session-id>/runtime/metro.log
```

## Reporting Requirements

Whenever you started or reused runtime infrastructure, report:

- platform
- app root
- OpenCode session id
- temp session root
- Metro status: reused or started
- background command used
- log path
- any local runtime issue that could affect confidence

## Android Note

Do not point these Metro helpers at `/Users/vinaykumar/vymo/android-base` by default. That repo is a native Android Gradle workspace and should use `vymo-android-runtime` commands instead of Metro.
