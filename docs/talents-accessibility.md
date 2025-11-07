# Talents Page Accessibility Report

Scope: `src/pages/Talents.tsx` and shared UI components.

## Landmarks & Semantics

- Page sections use semantic containers; pagination `nav[aria-label="pagination"]` is provided by component.
- Filter controls grouped under a `Card` with clear section headings.

## Labels

- Search input labeled via `aria-label` and visible label.
- Checkboxes include `aria-label` and adjacent text labels.
- Experience `SelectTrigger` includes `aria-label`.
- Skills input labeled with visible text.

## Keyboard Navigation

- All inputs are keyboard-focusable; focus rings rely on shadcn styles.
- Pagination links are keyboard navigable and announce current page via `aria-current="page"`.

## Contrast

- Dark theme tokens provide contrast above WCAG AA for primary text vs background.
- Secondary text uses `text-muted-foreground` with sufficient contrast on deep navy.

## Motion & Animations

- Only lightweight menu transitions; no auto-play or parallax.
- No content that flashes or blinks.

## Alt Text

- Avatars include descriptive `alt` built from the talent’s full name.
- Fallback initials used when images don’t load.

## Known Limitations / Justified Deviations

- Work arrangement mapping relies on free-text `availability` field. If terms differ, filters may not match perfectly; defaults provide graceful degradation.
- "View Profile" links are placeholders pending profile route. They are clearly indicated and keyboard-accessible.

## Recommendations

- Add a dedicated profile route and ensure headings hierarchy follows H1 → section titles → card titles.
- Consider `role="region"` with `aria-labelledby` for the filter sidebar for additional clarity.