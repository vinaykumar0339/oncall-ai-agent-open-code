---
name: vymo-app-login-lifecycle
description: Use when a Maestro or device-control flow needs to understand the actual Vymo app login journey on both iOS and Android, including stepper entry, classic email/password (`VYMO_LOGIN`) sign-in, reset and recovery branches, biometric setup and re-authentication, logout placement, and differences between the Vymo app and the ABC (Aditya Birla Capital) white-label app.
---

# Vymo App Login Lifecycle

Use this skill when the task is about the real user-facing login or logout journey on device.

Platform scope:
- iOS app journey
- Android app journey

App variants:
- `Vymo`: default branded app
- `ABC`: Aditya Birla Capital white-label app

This skill is intended for device-control and Maestro-driven agents that need to understand the visible app journey before interacting with login screens.

## Workflow

1. Describe the journey from the user’s point of view first.
2. Always identify which app the device is running:
   - `Vymo`
   - `ABC`
3. Decide which login stage is currently active:
   - stepper entry experience
   - classic email-first sign-in journey
4. Load the matching reference:
   - for stepper entry and stepper handoff behavior, read [references/stepper-login-journey.md](references/stepper-login-journey.md)
   - for classic email/password, OTP, session completion, and logout placement, read [references/email-password-login-journey.md](references/email-password-login-journey.md)
5. Explain:
   - how the user lands on login
   - what the user sees first
   - what can interrupt the happy path
   - where reset or recovery can happen
   - where biometric can appear during or after login
   - what marks login as truly complete
   - where logout can appear
   - whether logout may be hidden behind scrolling or configuration

## Guardrails

- Do not center the explanation around code paths or filenames.
- Do not ignore app branding. Vymo and ABC are different visible apps even when the journey logic is shared.
- Do not assume stepper is always the full login experience.
- Do not reduce `VYMO_LOGIN` to just a password screen. The classic journey includes identity entry, possible interruptions, session completion, and logout behavior.
