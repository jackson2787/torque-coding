---
name: frontend-mobile-secure-coding
description: Use when planning, building, reviewing, or QA-ing Expo or React Native code that handles auth tokens, local storage, deep links, device permissions, WebViews, uploads, or sensitive user data. Helps keep mobile work aligned to a secure client posture and avoid token leakage, unsafe storage, over-broad permissions, and trust-boundary mistakes.
---

# Frontend Mobile Secure Coding

This skill is a reusable mobile security helper.

It defines stable mobile guardrails. Repo-specific exceptions, storage choices,
or local policies belong in the Memory Bank or project-local skills.

## What This Skill Does

- Surfaces mobile security risks before they become "temporary" shortcuts
- Keeps token storage, permissions, deep links, and native capability use
  explicit
- Helps review React Native and Expo changes for trust-boundary mistakes

## What This Skill Does Not Do

- It does not replace `AGENTS.md`
- It does not replace `react-native-skills` or `expo-native-data-fetching`
- It does not replace backend authorization or API security
- It does not replace legal/compliance review for regulated data

## First Move

Before changing mobile behavior, inspect:

- how auth tokens or sessions are stored and refreshed
- which environment variables are compiled into the app bundle
- how deep links and external URLs are handled
- which permissions the feature requests and when
- what gets cached locally, logged, or sent to crash reporting
- whether any WebView, file upload, or background sync path is involved

## Main Security Surfaces

Pay special attention when the task involves:

- auth tokens, refresh flows, or credential caching
- `SecureStore`, Keychain, Keystore, AsyncStorage, or SQLite caches
- deep links, universal links, and external browser handoffs
- camera, photo library, microphone, contacts, location, or notification
  permissions
- WebViews, injected JavaScript, or app-to-web bridges
- uploads, downloads, file sharing, or media previews
- analytics, crash reporting, or debug logging

## Non-Negotiables

- No secrets, admin keys, or privileged backend credentials in the mobile app
  bundle.
- No auth tokens, refresh tokens, or session secrets in plain AsyncStorage when
  a secure OS-backed store should be used.
- No logging of tokens, PII, full user objects, or sensitive API payloads to
  console, analytics, or crash-reporting tools.
- No direct database or privileged backend bypass from mobile code when the app
  is meant to go through the API layer.
- No deep-link or external-URL handling without validating destination, action,
  and trust assumptions.
- No WebView pointed at untrusted content with broad bridge privileges.
- No permission request before the feature needs it and before the user has
  enough context to understand why.
- No long-lived local cache of highly sensitive data without explicit human
  approval and clear justification.

## Review Questions

Before calling the mobile change secure enough for QA or approval, check:

- Where does the secret live on-device?
- What happens if the phone is lost, debug logging is enabled, or telemetry is
  inspected?
- Can a deep link or external intent trigger a privileged action?
- Is the app trusting client state for authorization that only the backend can
  decide?
- Did the feature introduce a new permissions, WebView, upload, or local-cache
  risk?

## Companion Skills

Load companion guidance when needed:

- `react-native-skills` for implementation patterns and platform behavior
- `expo-native-data-fetching` for API, auth refresh, offline, and caching flows
- `legal-compliance-checker` for regulated data or privacy-sensitive features

## If You Feel Lost

Do not guess your way through device trust.

Pause and make these things explicit:

- storage boundary
- deep-link boundary
- permission boundary
- WebView boundary
- logging and telemetry boundary
