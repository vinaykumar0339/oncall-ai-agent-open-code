# Vymo App Stepper Login Journey

This reference explains the stepper login journey in user-facing terms.

It is written for device-control flows, especially Maestro-based navigation, where the agent needs to know what the user should see and what the app is likely to do next.

## Scope

- Entry experience in focus: stepper login
- Platform scope:
  - iOS
  - Android
- Apps in scope:
  - `Vymo`
  - `ABC` (Aditya Birla Capital white-label app)

## Product Truth

Stepper is a guided login entry experience.

It helps the app decide the next login action, but it is not always the full sign-in journey by itself.

From a device-control point of view, stepper is important because:
- it is often the first login surface the user sees
- it may continue as a guided login experience
- it may finish login inside stepper
- it may hand the user off into the classic email-first sign-in journey

## User Journey Overview

1. User launches the app
2. User may land in the stepper login experience
3. Stepper determines the next login action
4. One of three things happens:
   - user continues inside stepper
   - stepper reaches session initialization and login completes
   - user is redirected into the classic login journey
5. If stepper redirects into email-first sign-in, the email/password journey becomes the active login path

## What Stepper Means For Device Control

For Maestro or similar device-control agents:

- Do not assume that seeing stepper means all login actions will stay inside stepper.
- After stepper loads, the agent should observe whether the next user-visible state is:
  - another stepper page
  - a stepper OTP or MPIN screen
  - a stepper portal or consent page
  - the classic email identification screen
  - a password stage
  - another verification stage
  - the signed-in app after session initialization

This is the main reason stepper needs its own reference.

## App Variant Awareness

The same login model supports two white-label apps:

### Vymo

- Default branded app
- Standard Vymo app journey expectations

### ABC

- Aditya Birla Capital white-label app
- Same overall product logic can apply, but device-control should still be aware that the visible app identity is different

For device-control flows, always confirm which app is being driven before interpreting screens or recording evidence.

Platform note:
- this reference describes the visible app journey on both iOS and Android
- screen structure or native wrappers may differ slightly by platform, but the stepper journey should be understood as an app-level flow

## Stepper Journey In Plain Language

### 1. Landing

What the user experiences:
- app opens
- login starts in a stepper-style guided flow
- the app is deciding what the next required login action should be for this user and app variant

### 2. Stepper decides what comes next

What the user experiences:
- the app evaluates the next required login action
- the user may see another stepper page, may complete login inside stepper, or may be taken into the classic sign-in journey

### 3. Guided stepper stages

Common user-visible stages inside stepper can include:
- identity collection
- OTP entry and resend OTP behavior
- MPIN entry
- MPIN setup or confirmation
- forgot MPIN branch
- biometric-assisted MPIN entry
- portal or consent-style stepper screens

For Maestro usage:
- treat these as real login steps, not as decorative intermediate screens
- wait for the next rendered step before assuming the path changed

### 4. Retry, reload, and change-id behavior

From the user’s point of view:
- a retry can restart stepper initialization
- a change-id style action resets the current stepper attempt
- the user may be taken back to an earlier point instead of continuing forward

Practical implication:
- stepper can intentionally clear the current guided state and start fresh
- after such a reset, the next visible screen may look like a fresh login start

### 5. Logout is usually not the stepper concept

Normal logout is usually not a user-visible stepper action.

Why:
- stepper is usually part of pre-login or login-in-progress behavior
- the user often has not fully entered the signed-in app shell yet

What device-control should expect instead:
- retry
- change-id
- clear current stepper state
- handoff into another login stage

So for practical documentation:
- normal logout belongs mainly to the classic email/password lifecycle and the signed-in app lifecycle
- stepper should only mention reset-like pre-login actions when they affect the visible journey

### 6. Direct completion inside stepper

What the user experiences:
- some stepper paths can reach session initialization directly
- the user may not need to see the classic email-first sign-in screen at all

For device-control:
- do not assume classic sign-in must appear after every stepper journey
- if the app transitions into the signed-in shell, treat login as complete only after that post-authenticated state is visible

### 7. Redirection into classic sign-in

What the user experiences:
- stepper effectively hands off the journey
- user now proceeds through the classic identification and sign-in flow

For practical use:
- once this handoff happens, the email/password reference becomes the right reference for device-control understanding

## Maestro Guidance

For device-control usage:

1. Confirm whether the running app is `Vymo` or `ABC`.
2. Confirm whether the first visible login experience is stepper.
3. Watch whether the active step is identity, OTP, MPIN, consent, retry, or completion.
4. Wait for the next visible state before deciding how to navigate.
5. If stepper redirects into classic sign-in, stop treating stepper as the active journey.
6. Continue with the email/password reference when that becomes the visible path.

## Practical Summary

If you need to explain stepper briefly:

1. Stepper is the app’s guided login entry experience.
2. It can continue inside stepper, complete login directly, or redirect the user into the classic sign-in flow.
3. It can include OTP, MPIN, forgot MPIN, resend OTP, biometric, and retry-style states.
4. For Maestro and device-control agents, the key job is to detect which outcome actually happened next.
5. The app identity must always be tracked as either `Vymo` or `ABC`.
