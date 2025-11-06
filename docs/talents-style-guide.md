# Talents Page Style Guide

This guide documents the visual specifications used to replicate the reference UI.

## Layout

- Grid: two-column layout on large screens with a filter sidebar (3/12) and results grid (9/12).
- Cards Grid: 3 columns on `xl`, 2 on `sm`–`lg`, 1 on mobile; gap `1.5rem`.
- Page paddings: container `px-6`, vertical spacing `pt-12/16`, `py-8/12`.

## Colors and Tokens

- Enabled scoped dark theme via `.dark` class using tokens in `src/index.css`.
- Key tokens:
  - `--background`: deep navy, HSL `205 60% 12%`.
  - `--card`: panel navy, HSL `205 50% 16%`.
  - `--foreground`: high-contrast light, HSL `205 50% 91%`.
  - `--accent`/`--primary`: mint accent, HSL `160 70% 48%`.
  - Borders/inputs: HSL `205 45% 22%`.

## Typography

- Headline: `font-sans`, bold, tracking-tight.
- Title: `text-lg` within cards; description `text-sm text-muted-foreground`.

## Components

- Filter Sidebar: `Card` with sections for search, work arrangement, specialization, experience, skills.
- Inputs: `Input`, `Checkbox`, `Select` with focus rings (`focus:ring-ring`).
- Talent Cards: `CardHeader` with `Avatar`, `CardTitle`, specialization accent line; `CardContent` with bio, skills badges, and profile link.
- Badges: `variant="secondary"` as rounded chips.
- Pagination: centered, previous/next and page indicators.

## Spacing

- Card paddings: header `p-6`, content `p-6 pt-0`.
- Section spacing: `space-y-*` used consistently for vertical rhythm.

## Interactions & States

- Hover: cards `hover:shadow-lg`, links `hover:underline`.
- Focus: inputs follow shadcn focus styles; `SelectTrigger` uses ring; checkboxes use `data-[state=checked]`.
- Buttons: primary `Button` for Apply, outline for Reset.

## Animations

- Select menu uses Radix default enter/exit transitions (`data-[state=open]:zoom-in-95`, etc.).
- Page maintains smooth, subtle transitions without excessive motion.

## Accessibility

- All controls have labels or `aria-label`s.
- Color contrast adheres to dark theme tokens; accent against background exceeds WCAG AA.
- Pagination controls include `aria-label`s.

## Notes

- The sidebar options map to existing data fields. "Work Arrangement" maps to `availability` keywords (`remote`, `onsite`, `hybrid`).
- Where data is missing, cards show friendly fallbacks.