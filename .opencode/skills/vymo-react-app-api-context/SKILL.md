---
name: vymo-react-app-api-context
description: Use when `reactotron-mcp` is needed for `~/vymo/react-app` and the task is about Hello screen APIs or Login APIs. Provides concrete endpoint maps, call chains, and payload signals for faster triage.
---

# Vymo React-App API Context

Use this skill when network evidence is needed from `reactotron-mcp` for:

- Hello screen issues
- Login and authentication issues

Workspace scope:

- `~/vymo/react-app` only

Platform scope:

- iOS React Native runtime only

## Workflow

1. Confirm the issue is in `react-app` and not `android-base`.
2. Identify the journey area:
   - `hello`
   - `login`
3. Load only the matching reference:
   - `hello` -> [references/hello/hello-api-context.md](references/hello/hello-api-context.md)
   - `login` -> [references/login/login-api-context.md](references/login/login-api-context.md)
4. Use the endpoint map to focus Reactotron inspection on relevant calls first.
5. Capture only sanitized conclusions in Jira-facing output.

## Guardrails

- Do not use this skill for native Android workflows.
- Do not paste raw tokens, cookies, or sensitive payloads into Jira comments.
- Do not assume every endpoint appears in every client configuration; feature flags and roles can suppress specific calls.
- Keep evidence ticket-local under `./tmp/{ticketKey}/ios/...`.

