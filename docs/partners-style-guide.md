# Partners Page Style Guide

Visual specs replicating the provided UI exactly.

## Layout
- Top sticky navbar from shared `Navbar`.
- Centered header: H1 `text-5xl md:text-6xl`, bold, tight tracking.
- Subheading paragraph: `text-sm md:text-base`, `text-muted-foreground`, max width 768px.
- Grid: `md:grid-cols-3`, `gap-6`, consistent padding `px-6`, vertical `py-10 md:py-16`.

## Cards
- Surface: `Card` with default dark panel tokens.
- Padding: `p-8` content, center alignment.
- Logo mark: white-bordered square with mint inner square (`bg-accent`).
- Title: `font-semibold`; description: `text-sm text-muted-foreground`, `leading-relaxed`.

## Colors/Theme
- Scoped `.dark` container using `src/index.css` dark tokens.
- Background deep navy, foreground high-contrast light, accent mint.

## Interactions
- Subtle elevation on hover (`hover:shadow-lg` available for future enhancements).
- Navbar links change color on hover.

## Accessibility
- Logical headings hierarchy (H1 then card titles).
- Sufficient contrast for text on dark panels.
-