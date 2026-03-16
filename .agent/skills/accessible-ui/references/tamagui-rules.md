# Tamagui / Expo / React Native — Forbidden Anti-Patterns

These rules supplement the core SKILL.md. Every rule here is a non-negotiable constraint
when the target platform is Mobile.

---

## T1 · Interactive element rules

- **T1.1** Never use `<View onPress={...}>` or `<Text onPress={...}>` for buttons.
  Always use `<Button>` from Tamagui, or `<Pressable>` from React Native. These components
  emit the correct `accessibilityRole="button"` and handle press-state feedback.
- **T1.2** Never attach `onPress` and `onLongPress` to the same element without providing
  distinct `accessibilityLabel` and `accessibilityHint` that explain both actions.
  Screen-reader users have no discoverability for long-press; provide an alternative
  action path (e.g., a context menu).
- **T1.3** Every `<Pressable>` or Tamagui `<Button>` MUST have an `accessibilityLabel`
  unless it contains a `<Text>` child that fully describes the action. If the button
  contains only an icon, `accessibilityLabel` is mandatory.
- **T1.4** Never use `accessible={false}` on an interactive element. This removes it from
  the accessibility tree entirely. If you need to combine children into a single
  accessible unit, set `accessible={true}` on the parent and `accessible={false}` only
  on the child text/image elements that are part of the same semantic group.

## T2 · Tamagui styling hazards

- **T2.1** Never use raw numeric values for colors in Tamagui styled components. Always use
  theme tokens: `color="$color"`, `backgroundColor="$background"`. Raw values bypass theme
  switching and break dark mode contrast guarantees.
- **T2.2** Never set `height` on a `<Text>` component or any container whose sole purpose
  is to wrap text. Text must be free to grow when the user's platform font scale increases.
  Use `minHeight` if a minimum dimension is needed.
- **T2.3** Never set `numberOfLines` on critical content (error messages, form labels,
  navigation items). `numberOfLines` truncates content, which is invisible to sighted
  users at large font scales. Acceptable only for preview/summary text where a "read more"
  action exists.
- **T2.4** Never use Tamagui's `opacity={0}` to "hide" elements while keeping them
  interactive. This creates invisible tap targets. To visually hide while keeping in the
  accessibility tree, use platform-appropriate off-screen positioning. To remove from
  interaction, unmount the component or set `pointerEvents="none"` and `accessible={false}`.
- **T2.5** When using Tamagui's `Theme` component to switch sub-trees to a different theme,
  verify that the nested theme's text/background tokens still meet 4.5:1 contrast.
  Theme nesting can silently produce low-contrast combinations that look fine in one
  parent theme but fail in another.

## T3 · Screen reader & navigation patterns

- **T3.1** Every screen MUST set a descriptive title. In Expo Router, use
  `<Stack.Screen options={{ headerTitle: "Descriptive Title" }} />` or set the title
  via the `title` property in the route's layout export. Screen readers announce the
  screen title on navigation — a missing title produces silence.
- **T3.2** Use `accessibilityRole` for every component with a semantic meaning that
  differs from its visual appearance. Key roles: `header`, `link`, `search`, `image`,
  `button`, `checkbox`, `radio`, `switch`, `tab`, `alert`, `summary`.
- **T3.3** Grouped content that should be read as a single unit (e.g., a card with
  title + subtitle + badge) MUST wrap the group in a `<View accessible={true}
  accessibilityLabel="...">` that provides a composed label. Otherwise, VoiceOver/TalkBack
  will focus on each child independently, creating a noisy, disorienting experience.
- **T3.4** `accessibilityHint` is for *what happens next*, not *what the element is*.
  Bad: `accessibilityHint="Settings button"`. Good: `accessibilityHint="Opens the
  settings screen"`. If the label already implies the action, omit the hint entirely.
- **T3.5** After an async action (e.g., form submission, data refresh), announce the
  result to screen readers via `AccessibilityInfo.announceForAccessibility("...")`.
  Never leave screen-reader users in silence after triggering an action that produces
  no visible focus change.

## T4 · Forms in React Native / Tamagui

- **T4.1** Tamagui `<Input>` MUST always be paired with a `<Label htmlFor={id}>` from
  Tamagui, where `id` is passed as the `id` prop on `<Input>`. Never rely on placeholder
  text as the accessible name.
- **T4.2** Error messages for inputs MUST be associated via `accessibilityLabelledBy` or
  by composing the error text into the input's `accessibilityLabel` when the error state
  is active. React Native has no native `aria-describedby` — you must build the
  association explicitly.
- **T4.3** Never use a `<TextInput>` / Tamagui `<Input>` with `editable={false}` as a
  display element. Read-only display values should use `<Text>` with the appropriate
  `accessibilityRole`. A non-editable input is confusing to screen-reader users who
  expect to type into it.
- **T4.4** Keyboard type MUST match the expected input: `keyboardType="email-address"` for
  email, `keyboardType="phone-pad"` for phone, `keyboardType="numeric"` for numbers,
  `autoComplete` props for autofill support. This is an accessibility AND usability
  requirement — incorrect keyboards force users to switch manually.
- **T4.5** When a keyboard is open and the user submits via the return key
  (`onSubmitEditing`), focus MUST move to the next input or to the result. Never leave
  focus stranded on a now-irrelevant input. Chain inputs with `ref` and
  `onSubmitEditing={() => nextInputRef.current?.focus()}`.

## T5 · Expo Router / navigation

- **T5.1** Tab bar items MUST have `accessibilityLabel` set to a descriptive name. The
  default icon-only tab bar with no labels is insufficient. If using Expo Router tabs,
  pass `tabBarAccessibilityLabel` in screen options.
- **T5.2** After programmatic navigation (`router.push`, `router.replace`), the new
  screen's first meaningful element should receive focus. If the new screen has a
  header, the header title is the expected focus target (Expo Router handles this by
  default — do not override it with custom focus logic that skips the header).
- **T5.3** Gesture-based navigation (swipe to go back, swipe to dismiss) MUST always
  have a visible, tappable alternative (a back button, a close button). Never rely on
  gestures as the sole dismissal mechanism — switch control and keyboard users cannot
  perform swipe gestures.

## T6 · Animation & motion

- **T6.1** Respect `useReducedMotion()` from `react-native-reanimated` or Expo. When
  the user has enabled "Reduce Motion" at the OS level, all non-essential animations
  MUST be disabled or replaced with instant transitions. Essential animations (e.g.,
  a progress indicator) may remain but should be simplified.
- **T6.2** Never use animation as the only indicator of a state change. If a component
  animates from red to green to signal success, the state must also be communicated
  through a label change, icon swap, or screen-reader announcement.
