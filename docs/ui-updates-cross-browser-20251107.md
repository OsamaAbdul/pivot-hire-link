# Cross-Browser Verification — Jobs & Notifications (2025-11-07)

Test Matrix: Chrome 129, Firefox 131, Safari 17, Edge 129, iOS Safari 17, Android Chrome 129.

## Visual Consistency
- Sidebar labels show "Jobs" with briefcase icon (no wrapping).
- Header displays bell + sign out; unread badge aligns correctly.
- Search input shows "Search jobs..." across browsers.

## Interactions
- Bell trigger opens dropdown; ESC closes; tab cycles items.
- "Mark all read" updates badge to 0; items reflect read state.
- Jobs tab navigation and content switching works without layout shifts.

## Responsiveness
- Header utilities maintain spacing from `md` down to `sm`; at `xs` the button reduces width without overflow.
- Sidebar remains hidden on small screens and visible from `md`.

## Accessibility Checks
- `aria-label` present on bell and search input.
- Focus ring visible on interactive elements.
- Dropdown navigable with keyboard in all tested browsers.

## Noted Nuances
- Safari: subpixel rendering slightly alters badge border radius; acceptable.
- Firefox: dropdown shadow appears lighter; matches theme token usage.

## Suggested Manual Checks
- High contrast mode on Windows: verify badge text legibility.
- Reduced motion: dropdown animates minimally; no blocking issues.