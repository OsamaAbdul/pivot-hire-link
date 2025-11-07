# UI Updates — Jobs, Mentorship Removal, Notifications (2025-11-07)

## Summary
- Replaced all visible references to "challenges" with "job" across the dashboard UI and related links.
- Removed mentorship banner and related call-to-action from the developer dashboard home.
- Added a notification bell icon with dropdown to the dashboard header, including unread indicators.

## Affected Areas
- `Sidebar` navigation: "Challenges" → "Jobs".
- `DeveloperDashboard` section key: `challenges` → `job`.
- Search bar placeholder: "Search jobs...".
- `RecommendedJobs` CTA link: now routes to `?section=job`.
- `TalentProfile` highlight copy updated to use "job" terminology.
- Dashboard Home mentorship banner removed.
- Header: new notification bell with dropdown.

## Behavior & UX
- Notifications dropdown shows recent alerts (sample data). Unread count displays as a badge; users can mark all as read.
- Jobs tab continues to expose "Browse Jobs" and "My Applications".
- Layout spacing remains consistent after mentorship banner removal.

## Accessibility
- Bell button has `aria-label="Notifications"` and badge announces unread count.
- Dropdown list labeled; items expose semantic structure.
- Updated search input `aria-label` to "Search jobs".

## Responsiveness
- Header: bell and sign out keep horizontal spacing; stack naturally on narrow screens.
- Sidebar remains hidden on small screens (`md:block`).

## Implementation References
- `src/components/dashboard/talent/Sidebar.tsx`
- `src/components/dashboard/DeveloperDashboard.tsx`
- `src/components/dashboard/talent/DashboardShell.tsx`
- `src/components/dashboard/developer/RecommendedJobs.tsx`
- `src/pages/TalentProfile.tsx`
- `src/components/dashboard/talent/DashboardHome.tsx`
- `src/components/header/NotificationBell.tsx`

## QA Notes
- Verify navigation to jobs section via sidebar and Recommended Jobs card.
- Confirm unread badge appears when there are unread notifications.
- Validate keyboard navigation: trigger bell with Enter/Space, tab through dropdown items.