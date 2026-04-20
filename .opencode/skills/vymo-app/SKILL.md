---
name: vymo-app
description: Use when a Maestro or device-control flow needs to understand the Vymo app's user-visible journey on iOS or Android. Load only the relevant feature reference. Current coverage: login.
---

# Vymo App

Use this skill when the task is about the real user-facing app journey on device.

Platform scope:
- iOS app journey
- Android app journey

App variants:
- `Vymo`: default branded app
- `ABC`: Aditya Birla Capital white-label app

This skill is intended for device-control and Maestro-driven agents that need to understand the visible app journey before interacting with app screens.

## Structure

Keep the top-level skill generic.

Load only the feature subtree needed for the current task.

Current feature coverage:
- `login`

Current references:
- `references/login/stepper-login-journey.md`
- `references/login/email-password-login-journey.md`

## Workflow

1. Describe the journey from the user’s point of view first.
2. Always identify which app the device is running:
   - `Vymo`
   - `ABC`
3. Decide which platform is under control:
   - `iOS`
   - `Android`
4. Decide which feature area is currently active.
5. Load only the matching feature reference.
6. Explain only the visible user journey for that feature.

## Login Feature

Use the login references only when the current task is about authentication.

Login references:
- for stepper entry and stepper handoff behavior, read [references/login/stepper-login-journey.md](references/login/stepper-login-journey.md)
- for classic email/password, OTP, session completion, logout placement, and biometric lifecycle, read [references/login/email-password-login-journey.md](references/login/email-password-login-journey.md)

## Guardrails

- Do not center the explanation around code paths or filenames.
- Do not load unrelated feature references when one focused subtree is enough.
- Do not ignore app branding. Vymo and ABC are different visible apps even when the journey logic is shared.
- Keep feature-specific detail in the feature reference, not in the top-level skill.
