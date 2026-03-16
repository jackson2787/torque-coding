---
name: accessible-ui
description: Use when creating, editing, reviewing, or refactoring ANY UI component, screen, page, form, modal, dialog, popover, tooltip, navigation element, or interactive widget in React Native (Expo + Tamagui) or Web (Next.js + Shadcn UI). Trigger whenever adding images, icons, color tokens, typography scales, or theme configurations. Applies to any task touching JSX or TSX that renders to a screen.
---

# Accessible UI — Non-Negotiable Component Rules

These rules are **absolute constraints**, not suggestions. Every component you produce or modify
must satisfy every applicable rule before the task is considered complete. When a rule conflicts
with a visual design request, satisfy the rule first and flag the conflict to the user — never
silently drop an accessibility requirement.

## Red Flags - STOP and Start Over

Watch out for these common rationalizations that violate accessibility and UI constraints:
- "The design doesn't show a focus ring, so I removed it."
- "I'll attach the onClick to this div because it's easier to style than a button."
- "We don't need aria labels here, it's just an internal dashboard."
- "I'll use fixed pixel sizes for this font to make sure it fits the container exactly."
- "Let's skip the error association on this input to save time."

**Violating the letter of these rules is violating the spirit of an accessible UI. All of the above excuses mean: Delete the code. Start over. Consult the platform rules.**

**Platform context**
- **Mobile**: React Native · Expo · Tamagui
- **Web**: React · Next.js · Shadcn UI (Radix primitives)

When a rule applies to only one platform it is marked `[WEB]` or `[MOBILE]`. Unmarked rules
apply to both.

---

## 1 · Semantic HTML & Screen Reader Contract

### Native elements are mandatory

1. Every clickable action that triggers an in-page behavior MUST use `<button>` `[WEB]` or
   `<Pressable>` / Tamagui `<Button>` `[MOBILE]`. Never attach `onClick`/`onPress` to a `<div>`,
   `<span>`, `<View>`, or `<Text>`.
2. Every clickable action that navigates to a URL MUST use `<a href>` `[WEB]` or the router's
   `<Link>` component. Never use `<button>` with `router.push` as the sole navigation mechanism.
3. `[WEB]` Lists of related items MUST use `<ul>`/`<ol>` + `<li>`. Never use a stack of `<div>`s
   for list semantics.
4. `[WEB]` Data grids MUST use `<table>`, `<thead>`, `<th scope>`, `<tbody>`, `<tr>`, `<td>`.
   Never build tables from flex/grid divs without ARIA grid roles.
5. Never add `role="button"` or `role="link"` to a non-interactive element when the native
   element is available. The only acceptable use of ARIA roles is when no native HTML equivalent
   exists (e.g., `role="tablist"`, `role="feed"`).

### Heading hierarchy

6. Every page/screen MUST have exactly one `<h1>` `[WEB]` or one element with
   `accessibilityRole="header"` and `aria-level={1}` `[MOBILE]`.
7. Heading levels MUST NOT skip (no `<h1>` → `<h3>`). Each nesting level increments by exactly 1.
8. Never choose a heading level for its visual size. Use CSS / Tamagui tokens to style headings
   independently of their semantic level.

### Images & icons

9. **Meaningful images** — images that convey information — MUST have a non-empty `alt` text
   `[WEB]` or `accessibilityLabel` `[MOBILE]` that describes the content, not the file name.
10. **Decorative images** — images that add no information — MUST be hidden from assistive tech:
    `alt=""` and `aria-hidden="true"` `[WEB]`, or `accessible={false}` `[MOBILE]`.
    Never leave `alt` undefined; an undefined `alt` exposes the file path.
11. Inline SVG icons used as interactive affordances MUST be wrapped in the interactive element
    (the `<button>`) and the button MUST have an `aria-label` / `accessibilityLabel`.
    The SVG itself MUST have `aria-hidden="true"` / `accessible={false}`.
12. Icon-only buttons MUST always have a text label available to assistive tech via `aria-label`
    `[WEB]` or `accessibilityLabel` `[MOBILE]`. Visible text is preferred; if hidden, the label
    must describe the action (e.g., "Close dialog"), not the icon (e.g., "X icon").

### ARIA usage discipline

13. Never use `aria-label` on a non-interactive, non-landmark element. If you need to label a
    region, use `aria-labelledby` pointing to a visible heading.
14. Live regions (`aria-live`) MUST be mounted in the DOM before their content changes. Never
    dynamically inject a live region and immediately populate it — the first announcement will
    be missed.
15. `[MOBILE]` Use `accessibilityRole`, `accessibilityState`, and `accessibilityValue` instead
    of raw ARIA strings whenever React Native provides a typed equivalent.

---

## 2 · Keyboard Navigation & Focus Management

### Tab order

16. `tabindex="0"` is the ONLY acceptable value for making a custom element focusable in normal
    tab order `[WEB]`. Never use a positive `tabindex` (`tabindex="1"`, etc.) — it breaks the
    natural document order.
17. `tabindex="-1"` is ONLY for elements that receive programmatic focus (e.g., the dialog
    container after opening). It MUST NOT be used to "remove" an element from tab order while
    keeping it visible and interactive.
18. Every interactive element MUST be reachable by keyboard alone (Tab / Shift+Tab, arrow keys
    inside composite widgets). If it cannot be reached without a mouse or touch, it ships broken.

### Visible focus indicators

19. `[WEB]` Focus outlines MUST NEVER be removed (`outline: none`, `outline: 0`) without
    providing an equally visible replacement. Use `focus-visible` to hide outlines for mouse
    users, but always show them for keyboard users.
20. Focus indicators MUST have ≥ 3:1 contrast against adjacent colors per WCAG 2.2 SC 2.4.13.
21. `[WEB]` The focus ring must enclose or adjoin the entire component — never only underline
    text or highlight a child element.

### Focus traps & restoration

22. Modals, dialogs, drawers, bottom sheets, and any overlay that obscures the page MUST trap
    focus: Tab must cycle within the overlay, and no element behind it may be reachable.
23. `[WEB]` Use Radix Dialog / Shadcn `<Dialog>` which provides focus trapping out-of-the-box.
    Never build a custom modal with plain `<div>` and manual `keydown` handlers.
24. `[MOBILE]` Use `accessibilityViewIsModal={true}` on the modal container so the platform
    screen reader ignores content behind it.
25. When an overlay closes, focus MUST return to the element that opened it. Never let focus
    fall to `<body>` or the top of the page/screen.
26. `[WEB]` On dialog open, focus MUST move to the first focusable element inside — or to the
    dialog container itself (with `tabindex="-1"`) if there is no safe initial focus target.
    Never leave focus on the trigger behind the overlay.
27. `Escape` key MUST close any overlay (dialog, popover, dropdown, bottom sheet) that the user
    opened. No exceptions.

---

## 3 · Color Contrast & Responsive Typography

### Contrast ratios (WCAG 2.2 AA)

28. **Normal text** (< 18pt / < 14pt bold): foreground-to-background contrast ≥ **4.5:1**.
29. **Large text** (≥ 18pt or ≥ 14pt bold): foreground-to-background contrast ≥ **3:1**.
30. **UI components & graphical objects** (icons, input borders, focus rings, chart segments):
    contrast against adjacent color ≥ **3:1**.
31. These ratios MUST be met in BOTH light and dark modes. Never assume a dark mode palette is
    "close enough" — measure it.
32. Never rely on color alone to convey meaning (error states, status indicators, chart series).
    Always pair color with a secondary cue: icon, pattern, underline, text label.

### Token-driven color system

33. All colors MUST come from the theme token system (Shadcn CSS variables `[WEB]`, Tamagui
    theme tokens `[MOBILE]`). Never hard-code hex/rgb/hsl values in component files.
34. Semantic token names MUST describe purpose, not hue: `destructive`, `muted-foreground`,
    `ring` — not `red-500` or `gray-400`.

### Typography scale & accessibility

35. `[WEB]` Root font sizes MUST use relative units (`rem` or `em`). Never set root or body
    `font-size` in `px` — this overrides the user's browser font-size preferences.
36. `[WEB]` All component font sizes MUST be in `rem`. Using `px` for font sizes is forbidden.
37. `[WEB]` Line height MUST be ≥ 1.5 for body text and ≥ 1.2 for headings.
38. `[MOBILE]` Respect the user's platform text-scale settings. Never set `allowFontScaling={false}`
    or `maxFontSizeMultiplier` to a value below `1.5` on a `<Text>` or Tamagui `<Text>`.
39. Text containers MUST NOT have a fixed height that clips content when text scales up. Use
    `min-height` instead of `height`, or allow the container to grow.

---

## 4 · Forms & Error Handling

### Labels

40. Every form input MUST have a visible `<label>` with a `htmlFor` attribute matching the
    input's `id` `[WEB]`, or an `accessibilityLabel` `[MOBILE]`.
41. Never use `placeholder` as the only label. Placeholder text disappears on input and fails
    as an accessible name in many assistive tech configurations.
42. `[WEB]` If a visible label is absolutely impossible (e.g., a search field with an icon),
    use `aria-label` on the `<input>` directly. Document the reason in a code comment.

### Required & optional fields

43. Required fields MUST be indicated in a way that does not depend solely on color.
    Acceptable patterns: the word "Required", an asterisk `*` with a form-level legend
    ("* = required"), or `aria-required="true"` paired with a visible indicator.
44. `[WEB]` Use the native `required` HTML attribute in addition to `aria-required` — it
    provides built-in browser validation as a baseline.

### Error messages

45. Inline error messages MUST be programmatically associated with their input via
    `aria-describedby` pointing to the error element's `id` `[WEB]`, or
    `accessibilityHint` / `accessibilityErrorMessage` `[MOBILE]`.
46. Error text MUST NOT disappear after a timeout. It remains visible until the error is
    resolved.
47. `[WEB]` On submission failure, move focus to the first invalid field or to a visible
    error summary at the top of the form. Never leave focus on the submit button with no
    indication of what went wrong.
48. Error messages MUST describe what went wrong AND how to fix it.
    Bad: "Invalid input." Good: "Email address must include an @ symbol."
49. `[WEB]` Error summary regions MUST use `role="alert"` or `aria-live="assertive"` so screen
    readers announce the errors immediately on form submission failure.

### Grouping

50. Related inputs (e.g., radio groups, date parts, address blocks) MUST be wrapped in
    `<fieldset>` with a `<legend>` `[WEB]`, or grouped with `accessibilityRole="radiogroup"`
    and an `accessibilityLabel` `[MOBILE]`.

---

## 5 · Library-Specific Rules

Platform-specific anti-patterns and enforcement rules are in separate reference files to keep
this document scannable. **Read the relevant file before writing any component code.**

- **Web (Shadcn UI / Radix / Next.js)** → `references/shadcn-rules.md`
- **Mobile (Tamagui / Expo / React Native)** → `references/tamagui-rules.md`

Always read the file matching the target platform. If the component ships on both platforms
(shared design system), read both files.

---

## Verification Checklist — Run Before Every Commit

Before declaring a component complete, confirm every applicable item:

- [ ] Only native interactive elements used (no clickable divs)
- [ ] Heading hierarchy increments by 1, single `h1` per page/screen
- [ ] All images categorized as meaningful (with `alt`) or decorative (with `alt=""`)
- [ ] Every icon-only button has a text label for assistive tech
- [ ] Tab order matches visual order, no positive `tabindex`
- [ ] Visible focus indicator on every interactive element with ≥ 3:1 contrast
- [ ] Modals trap focus, `Escape` closes, focus restores on close
- [ ] Text contrast ≥ 4.5:1 normal / 3:1 large, verified in both themes
- [ ] UI component contrast ≥ 3:1 against adjacent colors
- [ ] No hard-coded color values — all from theme tokens
- [ ] All font sizes in `rem` `[WEB]` / respecting `allowFontScaling` `[MOBILE]`
- [ ] Every input has a visible label + programmatic association
- [ ] Required fields marked visually + via `aria-required`
- [ ] Error messages associated via `aria-describedby`, describe the fix
- [ ] Library-specific rules from the relevant reference file satisfied
