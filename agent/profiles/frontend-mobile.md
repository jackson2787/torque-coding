**Active Profile**: `frontend-mobile`

Use this profile for Expo and React Native repositories where the primary
production surface is a mobile app running on device.

**Default Domain Skill Packs**:
- `.agent/skills/react-native-skills/SKILL.md`
- `.agent/skills/expo-native-data-fetching/SKILL.md`
- `.agent/skills/composition-patterns/SKILL.md`
- `.agent/skills/api-feature-request/SKILL.md` for any backend integration planning

**Primary Bias**:
- Optimize for device reality: permissions, offline tolerance, secure storage, performance on constrained hardware, and production-safe mobile data flows.

**PLAN Bias**:
- Treat navigation, data synchronization, auth token handling, and platform-specific behavior as first-class architecture concerns.
- Make backend/API dependencies explicit before UI work hardens around them.

**BUILD Bias**:
- Follow Expo/React Native platform constraints instead of web assumptions.
- Prefer stable mobile data-fetching patterns, resilient retry/offline behavior, and secure handling of tokens and secrets.
- Keep device permissions, native capabilities, and app lifecycle behavior explicit.

**QA Bias**:
- Check platform-specific flows, device performance, offline/poor-network behavior, permission prompts, and secure storage/session behavior.

**Red Flags**:
- Applying web-only assumptions to mobile navigation or storage.
- Ignoring offline/error states for important device workflows.
- Weak token storage or brittle permission handling.
