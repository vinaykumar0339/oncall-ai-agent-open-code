# Hello API Context (`react-app`)

Use this map when debugging Hello-screen behavior with `reactotron-mcp`.

Primary source chain:

- `vymo/hello/hello.js` builds params and dispatches `FETCH_HELLO_SCREEN_DATA`
- `vymo/saga/hello.screen.saga.js` calls `DataController.getContainerObject(..., BaseUrls.getHelloCardsUrl(), ...)`

Refresh and lazy-load triggers from code:

- screen pull-to-refresh in `vymo/hello/hello.js` calls `_refresh(true)`
- `_refresh(...)` always dispatches `FETCH_HELLO_SCREEN_DATA` with `pages=true` and `backlog_limit=true`
- the same refresh path also resets KRA metrics via `resetKraMetricsApi(true, false)`
- swipe-driven page changes inside some Hello cards call a card-level `_refreshData(index)`
- card-level `_refreshData(index)` fetches page data only when `page.computed` is falsy
- this lazy fetch behavior exists in:
  - `vymo/hello/activities.card.js`
  - `vymo/hello/leads.card.v2.js`
  - `vymo/hello/targets.card.js`

## Core Hello Calls

- `GET /hello/cards`
  - primary Hello API
  - common params: `filters`, `pages=true`, `backlog_limit=true`, `request_version`, `no_filters`, `tz`, `v`
- `GET /v1/manager/cards`
  - optional manager cards fetch when manager/coach features are enabled

## Hello Card-Level Calls

- `GET /hello/cards/page`
  - module/card page data (`fetchModulePageData`)
  - most relevant for swipeable Hello cards such as activities, tasks, leads, workflow, and users
  - usually triggered after card page swipe when the selected page has `computed !== true`
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
  - in `targets.card.js`, swipe to a target page can lazily call `DataController.fetchTargetPageData(...)` when `page.computed` is falsy
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
- `/target`
- `/hello/v2/quickUpdates`
- `/hello/card/disposition`
- `/v2/ess/suggestions`
- `/v2/snapshot/`

When the repro requires an explicit user action:

- pull down on the Hello dashboard to force the main `/hello/cards` refresh path
- swipe horizontally inside a multi-page Hello card and watch for `/hello/cards/page` or `/target`
- if a page is already computed, a swipe alone may not produce a network call

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
- A swipe on a card is not itself proof of a bug or missing API activity. The code intentionally skips the page fetch when page data is already marked computed.
- For swipe-related repros, verify whether the failing page was uncomputed before expecting `/hello/cards/page` or `/target` traffic.
