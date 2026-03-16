# Shadcn UI / Radix / Next.js — Forbidden Anti-Patterns

These rules supplement the core SKILL.md. Every rule here is a non-negotiable constraint
when the target platform is Web.

---

## S1 · Never re-implement what Radix already provides

Shadcn components are thin wrappers around Radix primitives. Radix handles focus management,
ARIA attributes, and keyboard interactions internally. Violating this boundary introduces bugs.

- **S1.1** Never add manual `onKeyDown` handlers for `Enter`/`Space` on Shadcn `<Button>`.
  Radix and native `<button>` already handle this. Extra handlers cause double-fires.
- **S1.2** Never add `role`, `aria-haspopup`, `aria-expanded`, or `aria-controls` to Shadcn
  `<DropdownMenu>`, `<Dialog>`, `<Popover>`, `<Select>`, `<Tooltip>`, or `<AlertDialog>`
  trigger/content components. Radix injects these automatically. Duplicate ARIA causes
  screen readers to announce elements twice or with conflicting states.
- **S1.3** Never add manual focus-trap logic (e.g., `focus-trap-react`, custom `keydown`
  Tab cycling) inside a Shadcn `<Dialog>` or `<AlertDialog>`. Radix already traps focus.
  Adding a second trap causes infinite focus loops or breaks `Escape` dismissal.
- **S1.4** Never set `tabIndex` on Radix-managed sub-components (`DropdownMenuItem`,
  `SelectItem`, `TabsTrigger`, etc.). Radix uses roving `tabindex` internally and external
  overrides break arrow-key navigation.

## S2 · Shadcn composition rules

- **S2.1** Always compose Shadcn components using the documented slot pattern. Never
  wrap a Shadcn component inside another interactive element. Example:
  ```tsx
  // FORBIDDEN — button inside a link
  <Link href="/foo"><Button>Go</Button></Link>

  // CORRECT — use asChild to merge into a single element
  <Button asChild><Link href="/foo">Go</Link></Button>
  ```
- **S2.2** When using `asChild`, the child MUST be a single React element. Never pass
  a fragment or multiple children — Radix `Slot` merges props onto one child only.
- **S2.3** Never override Shadcn's `data-state` based styling with conditional className
  toggling that duplicates state. Radix exposes `data-[state=open]`, `data-[state=closed]`,
  `data-[disabled]` etc. Use these selectors in Tailwind via the `data-` modifier:
  `data-[state=open]:bg-accent`.

## S3 · Accessible labeling in Shadcn forms

- **S3.1** Always use Shadcn's `<FormField>`, `<FormItem>`, `<FormLabel>`, `<FormControl>`,
  `<FormDescription>`, and `<FormMessage>` together. Never use a raw `<input>` beside a
  raw `<label>` inside a Shadcn form — the wiring of `id`, `htmlFor`, `aria-describedby`,
  and `aria-invalid` is handled by these components as a unit.
- **S3.2** Never omit `<FormLabel>` even when the design shows no visible label. Use the
  `sr-only` Tailwind class on `<FormLabel>` to keep it accessible but visually hidden.
  Never replace it with `placeholder` alone.
- **S3.3** Never suppress Shadcn's `<FormMessage>` error display by conditionally
  rendering it. It should always be mounted; it will render nothing when there is no error
  and automatically populate `aria-describedby` on the input when an error exists.

## S4 · Next.js specific

- **S4.1** The `<Image>` component from `next/image` MUST always receive an explicit `alt`
  prop. Passing `alt=""` for decorative images is correct and required. Never omit the prop.
- **S4.2** Route changes in Next.js App Router do not inherently announce to screen readers.
  Add a route-change announcer (a visually-hidden `aria-live="polite"` region that updates
  with the new page title on navigation). Do not rely on the browser default — SPAs break
  the native navigation announcement model.
- **S4.3** Never use `<a>` without `href` in Next.js. If you need a button that looks like
  a link, style a `<button>` — never leave an anchor without a destination.
- **S4.4** When using Next.js `<Link>`, ensure the rendered anchor includes visible,
  descriptive link text. Never use "click here" or "read more" as the sole link text.
  If context is needed, use `aria-label` or `aria-describedby` to provide the full action:
  `<Link href="/report" aria-label="Read the Q3 financial report">Read more</Link>`.

## S5 · Tailwind / styling hazards

- **S5.1** Never use `hidden` or `display: none` on content that must remain accessible.
  Use the `sr-only` class for visually-hidden but screen-reader-visible content.
- **S5.2** Never rely on `hover:` styles as the only way to reveal interactive content.
  Always pair with `focus-visible:` and ensure the content is accessible to keyboard and
  touch users without hovering.
- **S5.3** Never use Tailwind's `text-xs` (0.75rem / 12px) as the smallest body text.
  Minimum body text size is `text-sm` (0.875rem / 14px). `text-xs` is acceptable only
  for non-essential captions or legal footnotes, never for form labels, error messages,
  or primary content.
- **S5.4** Never apply `truncate` or `line-clamp-*` to text that a screen reader must
  read in full. If visual truncation is necessary, ensure the full text is available via
  `aria-label` or an expandable mechanism (tooltip, "Show more" button).

## S6 · Toast / notification rules

- **S6.1** Shadcn `<Toast>` (via Radix Toast) MUST use `role="status"` for informational
  toasts and `role="alert"` for error/warning toasts. Never leave the default if it does
  not match the urgency.
- **S6.2** Toasts MUST NOT be the only channel for communicating errors. If a form
  submission fails, an inline error summary or per-field error MUST also be shown.
  Toast-only errors are invisible to screen-reader users who dismiss them before reading.
- **S6.3** Auto-dismissing toasts MUST remain visible for at least 5 seconds and MUST be
  pausable on hover/focus. Never set a duration below 5000ms.
