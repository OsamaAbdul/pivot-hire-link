# About Us Page — Style Guide

This guide documents the visual specifications and design decisions used to replicate the provided “About Us” UI.

## Layout Structure
- Overall page padding: `container mx-auto px-6` with section spacing `py-10–16`.
- Hero card: full-width within container, `rounded-2xl`, gradient background, centered text.
- Mission section: center-aligned header and paragraph with max width `max-w-3xl`.
- Pillars: grid of three cards on `md:grid-cols-3`, `gap-6` between cards.
- CTA banner: gradient card with centered content and button.
- Footer: simple row with copyright and links.

## Responsive Behavior
- Mobile: stacked sections; pillars render as a single column.
- Tablet (`md`): pillars switch to a 3‑column grid; headings scale to `md:text-2xl`.
- Desktop (`lg`): hero heading scales to `lg:text-6xl`; copy remains `max-w-3xl`.

## Color Scheme
- Background: `bg-background` (dark theme).
- Text: `text-foreground`; subdued copy uses `text-muted-foreground`.
- Accent: `text-accent` for key emphasis and icons.
- Gradient blocks: `bg-gradient-to-br from #0f2536 via #132c43 to #0f1f2e`.
- Cards: `bg-card` with `border border-border`.

## Typography
- Headings: font family `font-serif`, heavy weights for hero (`font-extrabold`).
- Sizes: hero `text-3xl md:text-5xl lg:text-6xl`; section headings `text-xl md:text-2xl`.
- Body: `text-sm` default, `text-xs` for fine print.

## Components & Spacing
- Hero card padding: `px-6 md:px-10 py-10 md:py-14`.
- Mission paragraph margin: `mt-4`.
- Pillars grid margin: `mt-8`.
- CTA button margin: `mt-6`.

## Interactions
- Pillar cards: subtle lift on hover `hover:-translate-y-[2px]` with `transition-transform duration-200`.
- Buttons: standard hover via ShadCN `Button`; CTA routes to `/auth?mode=signup`.

## Icons
- Pillars: `Share2`, `GraduationCap`, `Rocket` (Lucide), size `h-5 w-5`, accent tint.

## Measurements (key)
- Card border radius: `rounded-2xl`.
- Pillar card padding: `p-6`.
- Icon container: `p-3 rounded-md bg-muted`.
- Content max width: `max-w-3xl`.

## Notes
- All values chosen to match screenshot intent and existing design tokens for consistency.