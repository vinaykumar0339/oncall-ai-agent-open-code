# Hello Screen Journey

Use this reference when the task is about the app's Home surface, how to recognize it on device, or how to reach it from another app state.

## What The Hello Screen Is

- The hello screen is the app's main Home dashboard.
- Internally it is treated as `hello`, but user-facing navigation usually presents it as `Home`.
- It is the screen that aggregates the user's main cards, shortcuts, and status banners in one scrollable dashboard.

## How To Recognize The Hello Screen

Look for this pattern rather than one single label:

- a Home-level dashboard feel rather than a detail page
- a search header at the top
- a vertically scrollable feed of cards
- optional banners near the top such as offline, error, push-permission, or location-permission notices
- optional floating add button near the bottom-right
- pull-to-refresh behavior on the main content area

Common card families on hello:

- backlogs
- calendar
- activities or tasks
- leads or workflow cards
- metrics
- goals
- suggestions
- quick updates
- geo or map cards
- user profile cards
- performance snapshot cards
- my actions or broadcast-message cards

Do not rely on exact card order or exact card presence. The card mix changes by role, config, network state, feature flags, and customer setup.

## First-Land Behavior

Hello is the default authenticated landing surface in the normal app flow, but it is not guaranteed to be the first screen in every session.

Typical first-land behavior:

- normal signed-in flow: hello is the default Home landing
- manager flow with the manager dashboard enabled: the manager dashboard can take the Home landing slot instead of hello
- onboarding-user protocol: onboarding home can replace hello as the first screen
- performance landing override: performance can open first when that tab is configured as the landing page

So the correct rule is:

- hello is the default Home dashboard
- but first land can be overridden by app mode or config

## Primary Entry Points To Hello

These are the main practical ways a user or device-control flow can reach hello:

1. Normal authenticated app landing when no higher-priority landing override is active.
2. Tapping the bottom `Home` tab.
3. Choosing the `Home` item from the hamburger or More menu.
4. Opening a supported home deep link.
5. Returning to the Home stack after visiting another screen inside the app.

## Home Tab Behavior

- Hello lives inside the bottom `Home` tab stack.
- The Home tab does not blindly rebuild the stack every time.
- If the user previously moved within the Home stack, the app tries to resolve back to the latest meaningful Home landing state.
- If the manager dashboard is occupying the Home landing slot, the Home tab may return there instead of standard hello.
- If a modal-like More or bottom-sheet surface is open, the Home tap first dismisses that layer before resolving the Home stack.

## Hamburger And More Behavior

- The app treats hello as the Home destination in menu systems.
- If config does not already expose a Home entry, the menu layer can inject one.
- In some manager-related states the menu can expose a `hamburgerHello` style Home entry instead of only the plain `hello` item.
- The visible label is usually `Home`, not `hello`.

## Deep Link Behavior

- The app supports a home deep link path.
- Hello is also wrapped in deep-link handling, so saved or pending deep links can be triggered after the screen mounts.
- Because of that, a user can land on hello and then immediately be redirected onward if a saved deep-link action exists.

For device-control interpretation, this means:

- first visible hello does not always mean the user will stay on hello
- a transient loading state can appear while deep-link handling completes

## Visible Structure Of Hello

The hello screen usually has this shape:

- top search area
- top-level banners or notices if relevant
- one long scrollable dashboard body
- reusable cards separated by spacing rather than hard page boundaries
- optional floating action button if that feature is enabled

Hello is a dashboard screen, not a wizard, not a form-first screen, and not a tabbed detail module.

## What Can Change The Surface

The hello surface can look different across users or customers because of:

- manager mode
- app variant: `Vymo` or `ABC`
- feature flags
- available modules
- offline state
- permission state
- deep-link redirection
- role-based card visibility

So device-control flows should identify hello by layout pattern and navigation context, not by a single fixed card.

## Maestro And Device-Control Guidance

- If the app has just authenticated and no special landing override is active, expect hello to be the first main dashboard.
- If the app is already inside the signed-in shell, try the bottom `Home` tab first to return to hello.
- If Home tab behavior is ambiguous, open the hamburger or More menu and use the `Home` item.
- If the visible screen has a search header plus a scrollable dashboard of mixed cards, treat that as a strong hello signal.
- If the app opens to manager dashboard, onboarding home, or performance first, do not mark that as a hello failure until a Home-navigation attempt has been made.
