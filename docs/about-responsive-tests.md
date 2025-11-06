# About Us Page — Responsive & Cross-Browser Tests

## Viewports
- 360×640 (mobile): Sections stack; hero text uses `text-3xl`; pillars render one per row.
- 768×1024 (tablet): Pillars switch to a 3‑column grid; headings move to `md:text-2xl`.
- 1440×900 (desktop): Hero heading `lg:text-6xl`; `max-w-3xl` copy remains centered.

## Behavior
- Hover on pillar cards lifts by 2px; no layout shift.
- CTA button remains centered and routes to `/auth?mode=signup`.

## Cross-Browser Verification
- Chrome 128+, Edge 128+: Layout and gradients are consistent; hover/focus states match.
- Firefox 131+: Typography and spacing render identically; gradient colors closely match.
- Safari 17+: Rounded corners and grid alignments consistent; transitions are smooth.

## Accessibility Checks
- Headings hierarchy verified; focus ring visible on interactive elements.
- Color contrast meets AA on dark backgrounds.

## Performance
- No heavy images; icon-only design reduces payload.
- Minimal reflow: hover transform avoids box-model changes.