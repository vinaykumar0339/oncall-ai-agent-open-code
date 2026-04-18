# On-Call OpenCode Webhook Worker

This repository contains the OpenCode agent definitions plus a host-run webhook worker that keeps one long-lived OpenCode session per Jira ticket.

## Local Stack

- `docker compose up -d redis postgres`
- Run `opencode serve` on the host using the project root
- Run the worker on the host with `pnpm start`

Redis and Postgres run in Docker. The worker and OpenCode server stay on the host so they can use local MCP/tooling and the existing mobile workspace paths directly.

## Environment

Start from `.env.example` and provide:

- `REDIS_URL`
- `POSTGRES_URL`
- `OPENCODE_SERVER_URL`
- `JIRA_WEBHOOK_SECRET`
- optional bot/filter settings

## Database

This project uses Prisma for schema management and the generated Prisma client for persistence.

Generate the client:

```sh
pnpm prisma:generate
```

Create and apply a local migration during development:

```sh
pnpm prisma:migrate -- --name init
```

Apply checked-in migrations in a deployed/shared environment:

```sh
pnpm prisma:deploy
```

## Webhook Endpoint

The worker exposes:

- `GET /healthz`
- `POST /webhooks/jira`

The webhook pipeline:

1. validates the Jira signature when `JIRA_WEBHOOK_SECRET` is set
2. normalizes issue/comment events into a single internal shape
3. deduplicates via Redis and Postgres
4. persists durable state in Postgres
5. queues pending updates in Redis
6. resumes or creates the OpenCode session tied to the ticket
7. posts consolidated updates into the same session

## Branch Rules

- Branches always use `type/ticket-id-description`
- Default base is latest remote `master`
- If the ticket or actionable comment explicitly identifies a source branch, that branch wins and the reason is persisted
- Type mapping:
  - bug/defect -> `bugfix`
  - urgent prod incident -> `hotfix`
  - enhancement/new work -> `feature`
  - fallback -> `other`
