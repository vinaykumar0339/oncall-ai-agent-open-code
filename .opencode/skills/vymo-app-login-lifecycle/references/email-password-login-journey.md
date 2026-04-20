# Vymo App Email/Password Login Journey

This reference explains the classic email/password sign-in lifecycle in user-facing terms.

It is intended for device-control flows, especially Maestro-based automation, that need to understand what the user should see and what the app can do next.

## Scope

- Protocol in focus: `VYMO_LOGIN`
- Journey in focus: classic email-first sign-in
- Platform scope:
  - iOS
  - Android
- Apps in scope:
  - `Vymo`
  - `ABC` (Aditya Birla Capital white-label app)

## Product Truth

This is the classic sign-in journey that begins with user identity and then moves into password.

In practice, the user may arrive here in two ways:
- directly
- after stepper redirects into the classic login path

It is broader than a single password screen.

The full journey includes:
- identity lookup
- pre-password verification branches
- password authentication
- recovery or reset branches
- session completion
- in-session reset-password and logout behavior

## User Journey Overview

1. User lands on the classic sign-in journey
2. User enters email or login id
3. App validates that identity and determines the login type
4. If the login type is `VYMO_LOGIN`, the app moves into the password journey
5. The happy path may still be interrupted by:
   - device verification before the user reaches normal password sign-in
   - first-time OTP verification
   - password creation or reset
   - 2FA
   - expired-password reset
   - account restart
6. Login is only truly complete after session initialization succeeds
7. After login, logout can appear from user-visible menus or happen automatically from auth or security failures

## App Variant Awareness

The same product model supports two white-label apps:

### Vymo

- Default branded app
- Standard Vymo app journey expectations

### ABC

- Aditya Birla Capital white-label app
- Same overall journey model can apply, but device-control should always record that the visible app is ABC, not Vymo

For Maestro or device-control automation:
- always identify whether the device is currently driving `Vymo` or `ABC`
- do not collapse both into one unnamed app journey

Platform note:
- this reference is for the app journey on both iOS and Android
- implementation details can vary by platform, but the login, reset, recovery, and logout model should be treated as an app-level lifecycle

## How The Classic Journey Starts

### 1. User lands on sign-in

What the user experiences:
- the app is already in the classic login experience
- if stepper was involved earlier, that handoff has already happened

### 2. User enters identity first

What the user experiences:
- user enters email or login id
- app validates that identity before deciding what login method applies

This matters because:
- the password stage is not the first step
- the app first needs enough information to decide the correct login path

### 3. App identifies `VYMO_LOGIN`

What the user experiences:
- once identity is validated, the app determines the login type
- if the login type is `VYMO_LOGIN`, the user is routed into the password-based path

This is the key journey decision point.

Important device-control detail:
- if the app does not resolve to `VYMO_LOGIN`, this reference is no longer the active journey
- if the app does resolve to `VYMO_LOGIN`, the user is now on the classic password family of flows

## Pre-Password Verification Branches

These can appear before the user reaches normal password entry.

### A. Device verification before normal sign-in

What happens:
- after identity lookup, the app can require device verification or whitelisting
- the user may be sent to a device OTP screen instead of going straight to password
- only after this device step is satisfied can the user continue normally

For Maestro:
- do not treat a device OTP screen as a post-login step
- it is still part of login

### B. First-time identity validation

What happens:
- the app can recognize that the user has not completed the first-time password setup path yet
- instead of showing ordinary password sign-in, it sends the user into OTP and then password setup

## Password Journey

### 1. User reaches the password stage

From the user’s point of view, this stage can mean one of three things:

1. Returning user password login
   - user sees the normal password entry path
2. First-time verification path
   - user must complete OTP before continuing
3. Password setup path
   - user must create or reset a password before completing sign-in

### 2. Password stage expectations

What the user may see or do here:
- continue with password entry
- use forgot password
- switch back and use a different account
- continue with biometric assistance when enabled and supported
- be pushed into a forced expired-password reset
- continue into a second-factor verification stage after password acceptance

This means the password stage is not just a single action screen. It is also the launch point for recovery and convenience flows.

### 3. User submits password

What happens from the user’s point of view:
- user enters password and attempts sign-in
- app may refresh account context if needed
- app may either continue the happy path or divert the user into another required step

Possible visible outcomes after password submission:
- login completes
- 2FA starts
- expired-password reset starts
- an error returns the user to password entry

## Alternate Paths That Interrupt The Happy Path

### A. First-time OTP flow

What happens:
- user is recognized as first-time or not-yet-validated for password login
- app sends the user through OTP verification
- after OTP succeeds, the user continues into password setup

### B. Password creation or reset

What happens:
- after OTP, or after a recovery path, the user sets a password
- once the password is set, the user returns to the password sign-in stage

### C. Expired-password reset

What happens:
- a normal password attempt may shift into a mandatory password reset
- the user is not simply shown a generic failure
- after the user sets the new password, the app returns the user to the sign-in path instead of silently treating the old session as valid

### D. 2FA

What happens:
- even after primary authentication succeeds, the user may still need a second factor
- password success alone does not always equal login success
- 2FA verification itself can also include resend behavior and failure exhaustion states

### E. Device verification resend and exhaustion states

What happens:
- when device verification is required, the user may get a dedicated device OTP journey
- that journey can include resend timing, resend attempt limits, OTP expiry, and lock-style failures

For Maestro:
- treat this as a real verification branch with its own retry rules
- do not assume a single OTP failure returns the user directly to ordinary password login

### F. Account restart

What happens:
- user decides not to continue with the currently identified account
- app returns the user to the earlier identity stage
- user can begin again with another email or login id

This behaves like a local reset flow and is part of the visible login lifecycle.

## When Login Is Actually Complete

This is the most important distinction:

Login is not complete just because the email and password were accepted.

Login is only complete after:
1. primary authentication succeeds
2. any extra verification branch succeeds
3. session initialization succeeds
4. authenticated app state is ready and the user enters the signed-in shell

If session initialization fails, the user should not be treated as successfully logged in.

## Forgot Password Journey

Typical user journey:

1. User is on the password stage
2. User taps forgot password
3. App sends OTP
4. User verifies OTP
5. User sets a new password
6. User returns to password sign-in
7. User logs in with the new password

Forgot password is not separate from login. It is a branch of the same lifecycle.

Important variation:
- some clients can keep forgot password inside the in-app OTP and reset journey
- other clients can redirect the user to an external password recovery link instead of finishing recovery inside the app

So for device-control:
- do not assume forgot password always remains inside the same in-app flow

## Biometric Lifecycle

Biometric behavior spans more than one moment in the app lifecycle.

### A. Biometric sign-in on the password stage

What happens:
- if biometric login is enabled and allowed for the current login type, the password stage can prompt the user for Face ID, Touch ID, or device biometric authentication
- the user may authenticate biometrically instead of typing the saved password or MPIN again
- on some devices, the prompt can be suppressed temporarily and retried manually

Important device-control detail:
- this is still part of the sign-in journey, not a separate post-login feature

### B. Biometric setup after successful login

What happens:
- after the user reaches the signed-in app, the app can prompt them to enable biometric login
- the user can enable it immediately or choose to set it up later
- if they postpone setup, the app can suppress the prompt for later instead of asking every time

This means biometric can appear after login success as a registration decision, not only before login completion.

### C. In-app biometric re-authentication

What happens:
- after login, some sensitive or protected app states can show a biometric block or biometric re-authentication screen
- the user must authenticate with the device biometric to continue
- if biometric is unavailable or not enrolled, the app can bypass or fall back depending on the situation

This is not the same as logging in again.

It is a post-login access-control step inside the signed-in app.

### D. Biometric and credential updates

What happens:
- when the user changes password or MPIN, the app can refresh the saved secret used for biometric sign-in
- when the user chooses sign in with a different account, the app clears biometric state tied to the previous account

This is why biometric belongs in the full login lifecycle, not only in settings

## In-Session Reset Password

There is also a separate reset-password journey after the user is already signed in.

Typical user journey:

1. User opens settings
2. User finds reset password or reset MPIN in account settings
3. User submits current password plus new password
4. App confirms the change
5. App logs the user out
6. User must sign in again with the new password or MPIN

Important device-control detail:
- this is not the same as forgot password on the login screen
- it is an authenticated account-management action that ends by forcing a fresh login

## Logout Journey

### A. Where logout can appear

Logout placement is configuration-driven.

Possible user-visible locations:
- hamburger or more menu
- settings screen under account settings
- top navigation on some deep screens or onboarding-style screens when that screen exposes a logout action

Important placement rule:
- if menu configuration enables logout in the hamburger menu, logout appears there
- when logout is shown in the menu, it may be omitted from the settings account section
- when logout is not shown in the menu, the settings screen becomes the main visible logout surface

### B. Scrolling behavior matters

Both major logout surfaces are scrollable:
- the hamburger menu is scrollable when there is a lot of content
- the settings screen is also scrollable

Practical implication:
- logout can be below the fold
- users may have to scroll to reach it, especially when many menu items, modules, links, support items, or settings entries are present

For Maestro or device-control:
- never assume logout is immediately visible without scrolling
- confirm whether the current app configuration places logout in menu or settings

### C. Normal menu or settings logout

What happens:
- user taps logout from the visible logout entry point
- app may warn or block logout if drafts or offline work exist
- if the user confirms or there is nothing pending, logout proceeds

Important product detail:
- logout is not always immediate
- pending drafts or offline items can change the logout experience
- offline state itself can block server logout with an explicit error instead of logging the user out silently
- on Android, a forced security or session logout can still clear local state even if the server logout request fails

### D. Change-account flow

What happens:
- user chooses to sign in with a different account
- app clears local identity-specific state
- user returns to the earlier identity stage

This is effectively a local logout or reset flow even if the user does not think of it as logout.

### E. Biometric setup flow

What happens:
- enabling biometric login can force the user through a logout and clean re-login journey
- this helps the app register biometric state on a clean authenticated path
- the same practical pattern can appear when the app asks the user to re-authenticate for biometric-assisted login behavior

### F. Forced logout from auth failure

What happens:
- if backend responses indicate authentication failure, the app can log the user out automatically
- local session state is cleared
- app returns to a logged-out state

From the user’s point of view, this can feel like:
- session expired
- unauthorized
- sudden bounce back to login

This can happen even when the user did not explicitly press a logout button.

### G. Forced logout from security or device policy

This confirms that logout is a broad app lifecycle behavior, not just a menu action.

Examples include:
- security or integrity failures
- fake-location or rooted-device handling
- time-change or session-expiry handling
- push-triggered logout flows
- developer-options or ADB-enabled handling
- device tamper checks
- untrusted keyboard checks
- session-expired-after-boot handling

### H. Reset-password-triggered logout

What happens:
- user successfully changes password from the signed-in settings area
- app then logs the user out
- the next valid path is to sign in again with the updated credential

## Cross-Platform Product Truth

The iOS and Android implementations do not need to look identical for the user journey to be the same.

The shared product model is:
- identify user
- decide protocol
- route to password or another auth style
- complete extra verification if required
- initialize session
- enter signed-in app
- allow user-triggered or forced logout later

Use platform-specific code only to verify details when needed. The primary truth this skill should describe is the app journey seen by the user on iOS and Android.

## Practical Summary

If you need to explain the classic journey briefly:

1. User starts in the classic sign-in flow, either directly or after stepper hands off.
2. User enters email or login id first.
3. App identifies the login protocol.
4. If the login type is `VYMO_LOGIN`, the user moves into the password journey.
5. The user may still need OTP, password setup, 2FA, device verification, or an account restart before finishing.
6. Login completes only after session initialization succeeds.
7. Logout can appear in hamburger or settings depending on configuration, and either surface may require scrolling.
8. Biometric can appear during sign-in, as a post-login setup prompt, or as a post-login re-authentication gate.
9. Logout can also happen from account-switching flows, in-session reset-password, biometric setup flows, or forced auth or security failures.
