# Hello API Context (`react-app`)

Use this map when debugging Hello-screen behavior with `reactotron-mcp`.

Primary source chain:

- `vymo/hello/hello.js` builds params and dispatches `FETCH_HELLO_SCREEN_DATA`
- `vymo/saga/hello.screen.saga.js` calls `DataController.getContainerObject(..., BaseUrls.getHelloCardsUrl(), ...)`

## Core Hello Calls

- `GET /hello/cards`
  - primary Hello API
  - common params: `filters`, `pages=true`, `backlog_limit=true`, `request_version`, `no_filters`, `tz`, `v`
- `GET /v1/manager/cards`
  - optional manager cards fetch when manager/coach features are enabled

## Hello Card-Level Calls

- `GET /hello/cards/page`
  - module/card page data (`fetchModulePageData`)
- `GET /hello/getKraMetrics`
  - KRA metrics refresh
- `GET /v2/snapshot/cards`
  - performance snapshot card configuration
- `GET /v1/snapshot/data`
  - performance snapshot metric data
- `GET /hello/card/disposition`
  - disposition card data in Hello
- `GET /hello/v2/quickUpdates`
  - quick updates categories for Hello card
- `POST /v2/ess/suggestions`
  - fetch My Actions/Suggestions payload
- `POST /v2/ess/suggestions/actions/{suggestionId}/{actionType}`
  - accept/decline/dismiss suggestion action
- `GET /target`
  - targets card data
- `GET /reports/{userCode}/get-goal-charts`
  - goal reports card
- `GET /users/profile/{userCode}`
  - user profile card
- `GET /cs/completed`
  - calendar card completed list
- `GET /v2/bulk/leads`
  - lead/activity card details fetch
- `GET /api/walk-me-info`
  - walkthrough/shoutout info shown from Hello
- `GET /hello/backlogs`
  - backlog list fetch when backlog card is opened

## Reactotron Filter Hints

Start with these path substrings:

- `/hello/cards`
- `/hello/cards/page`
- `/hello/v2/quickUpdates`
- `/hello/card/disposition`
- `/v2/ess/suggestions`
- `/v2/snapshot/`
- `/target`

## High-Signal Response Fields

- `/hello/cards` response:
  - `results` (card list)
  - `filters`
- suggestions response:
  - `suggestions`
  - `valid_till`
- quick updates response:
  - `categories`

## Known Behavior Notes

- Hello can show fallback cards and an error banner when `/hello/cards` fails.
- Card visibility and ordering can change by feature flags and role config.
- Not all calls are guaranteed in every session; only inspect APIs relevant to the visible card set.

