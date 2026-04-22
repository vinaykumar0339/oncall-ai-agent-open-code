# Login API Context (`react-app`)

Use this map when debugging login/authentication with `reactotron-mcp`.

## Canonical Login Chains

### 1) Standard account discovery + auth + session

1. `POST /sso/users/account`
2. one of:
   - `POST /sso/authenticate` (SSO path)
   - `POST /users/session` (legacy password path)
   - `POST /sso/onboarding-users/authenticate` (onboarding path)
3. one of:
   - `POST /session/init`
   - `POST /onboarding-users/config`

### 2) Stepper login flow

1. `GET /login/app/init`
2. `POST /portal/login/v2/action/{templateCode}`
3. optional:
   - `POST portal/otp`
   - `GET /login/app/init/action/{actionCode}` (back navigation)
4. if flow indicates session init:
   - `POST /session/init`

### 3) Two-factor authentication

1. `POST /sso/verify`
2. optional retry:
   - `POST /sso/resend-otp`
3. then:
   - `POST /session/init`

### 4) Password and reset flows

- `POST /users/generateOTP`
- `POST /sso/verifyOtp`
- `POST /users/resetPass`
- `POST /change-password`
- `POST /sso/resetPassword`

### 5) External/token login

1. `POST /sso/authByToken`
2. `POST /session/init`

### 6) Device registration gates

- `POST /devices/v1/registration/init`
- `POST /devices/v1/registration/verifyOTP`
- `POST /devices/v1/registration/resendOTP`

## Reactotron Filter Hints

Start with these path substrings:

- `/sso/users/account`
- `/sso/authenticate`
- `/users/session`
- `/session/init`
- `/login/app/init`
- `/portal/login/v2/action/`
- `/sso/verify`
- `/sso/resend-otp`
- `/users/generateOTP`
- `/sso/verifyOtp`

## High-Signal Request/Response Fields

- account discovery:
  - request: `enc_login_id`
  - response: `protocol`, `client_id`, `login_url`
- auth response:
  - headers: `x-vymo-auth-token`, `access_token`
  - body: `two_fa_enabled`, `two_fa_context`, `device_registration_allowed`
- stepper:
  - response: `result.loginInfo.nextAction`, `result.template`, `result.legacyLogin`
- password path:
  - response: `set_otp_flow`

## Header and Token Notes

- auth/session APIs rely on `X-Vymo-Auth-Token`.
- stepper APIs can use:
  - `X-Vymo-User-Token`
  - `visitor_token` cookie fallback
- do not copy token values into Jira or shared comments.

## Known Behavior Notes

- many credential fields are encrypted (`enc_*`) by design.
- some auth failures can still return HTTP 200 with `authentication_error` in body; inspect payload, not just status code.
- onboarding protocols use different endpoints than regular SSO.

