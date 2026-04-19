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

## Ticket Temp Layout

Use one repo-local ticket root per Jira issue:

- `./tmp/<ticket-key>/ios/`
- `./tmp/<ticket-key>/android/`

Use these subfolders:

- `logs/` for command output and runner logs
- `evidence/` for screenshots and captured artifacts
- `runtime/` for pidfiles and service metadata
- `reports/` for optional local handoff files

Create them with the helper before writing artifacts:

```sh
export PLATFORM=ios
export TICKET_KEY=<jira-ticket-key>
/Users/vinaykumar/vymo/workiq/oncall-ai-agent-open-code/.opencode/skills/vymo-react-native-runtime/scripts/create-session-dirs.sh
```

Export these variables before running the Metro helper scripts when possible:

```sh
export PLATFORM=ios
export TICKET_KEY=<jira-ticket-key>
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

- ticket root: `./tmp/{ticketKey}/{platform}/`
- subdirectory creation for `logs/`, `evidence/`, `runtime/`, and `reports/`
- React Native app root selection when `APP_ROOT` is unset
- runtime pidfile: `./tmp/{ticketKey}/{platform}/runtime/metro.pid`
- runtime log: `./tmp/{ticketKey}/{platform}/runtime/metro.log`
- health checks against port `8081`
- reuse versus new start decision

If needed, inspect readiness or errors with:

```sh
tail -n 50 ./tmp/<ticket-key>/<platform>/runtime/metro.log
```

## Reporting Requirements

Whenever you started or reused runtime infrastructure, report:

- platform
- app root
- ticket key
- temp ticket root
- Metro status: reused or started
- background command used
- log path
- any local runtime issue that could affect confidence

## Android Note

Do not point these Metro helpers at `/Users/vinaykumar/vymo/android-base` by default. That repo is a native Android Gradle workspace and should use `vymo-android-runtime` commands instead of Metro.
