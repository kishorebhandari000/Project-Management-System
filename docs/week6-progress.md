# ICT302 — Week 6 Progress (2026-08-10)

## Goal

UI usability improvement: contextual hint tooltips across the site so a
first-time user can tell what each section/nav item does without asking.
Alongside that, a full site health check (console errors, build, broken
links, responsive layout, security hygiene) since the feature touches
navigation used on every page.

## Approach

Built one reusable `SectionHint` component instead of hardcoding tooltips
per page, so the whole team edits copy in a single file
(`src/app/lib/sectionHints.ts`) rather than hunting through components.

The codebase already depends on Radix UI's tooltip/popover/hover-card
primitives (`src/app/components/ui/tooltip.tsx` etc.), but nothing in the
actual app used them — every real page is hand-rolled Tailwind with a
hardcoded colour palette (`#2563a8` blue, `#1e3a5f` navy, `#f4f6f8`
background), not the Radix components' CSS-variable tokens. Building a
small self-contained component (no new dependency) let the hint match
what users actually see, instead of pulling in an unused design system
with a mismatched look.

Requirements driving the design:
- **Accessibility**: keyboard `:focus-visible` opens it, `Esc` closes it,
  `role="tooltip"` + `aria-describedby` wiring, respects
  `prefers-reduced-motion`.
- **Mobile**: hover doesn't exist on touch devices, so the same small
  ⓘ icon also opens/closes on tap.
- **Positioning**: a `document.body` portal with viewport-edge flip logic,
  so the bubble is never clipped by a parent's `overflow: hidden`.

## Sections with hints

| Location | Text shown |
|---|---|
| Nav — Dashboard (all roles) | Your at-a-glance overview: key stats and recent activity. |
| Nav — Forum (all roles) | Browse and post open discussions visible to everyone in the unit. |
| Nav — Discussions (all roles) | Threaded conversations tied to a project. Reply to keep everything in one place. |
| Nav — Messages (all roles) | Private one-to-one chats with your teammates, supervisor, or admin. |
| Nav — Assessments (all roles) | View assessments, track due dates, and see grades once released. |
| Nav — Browse Projects (student) | Browse open projects and apply, solo or as a group. |
| Nav — Manage Projects (supervisor) | Manage the projects you supervise and review student applications. |
| Nav — Manage Users (admin) | Create, search, and edit student and supervisor accounts. |
| Nav — Manage Projects (admin) | Create and edit projects, and manage their attached files. |
| Nav — Manage Allocation (admin) | See which students are assigned to which projects, and approve or reassign them. |
| Nav — Reports (admin) | System-wide stats: completion rates, average grades, and pending reviews. |
| Admin dashboard — Pending Allocations stat | Allocation requests waiting for your approval or rejection. |
| Admin dashboard — Quick Actions | Shortcuts to the most common admin tasks. |
| Supervisor dashboard — Pending Requests stat | Students who have applied to your projects and are awaiting a decision. |
| Supervisor dashboard — To Review stat | Submitted work that hasn't been graded yet. |
| Supervisor dashboard — My Students | Progress of each student currently assigned to you, based on graded work. |
| Student dashboard — Current Project | The project you're currently working on, including your group and supervisor. |

Deliberately skipped: the Logout link, form field labels, the
notification bell / profile avatar icons (self-explanatory), and the
student dashboard's "Upcoming Deadlines" card (an unbuilt placeholder —
a hint there would describe a feature that doesn't exist yet).

## Issues found during the health check, and how each was resolved

Testing method: logged in as all three roles (admin/supervisor/student)
in a headless Chromium session (Playwright), crawled all 35 static
routes plus several dynamic sub-routes (project edit, discussion
thread, forum post), checked browser console for errors, checked for
failed network requests (4xx/5xx) and broken images, and checked
`document.documentElement.scrollWidth` against the viewport at
375px/768px/1280px.

1. **SectionHint closed itself instantly when tapped inside the mobile
   nav drawer.** The drawer is only 256px wide, so a right-aligned
   bubble had nowhere to fit; the viewport clamp slid it back on top of
   its own trigger button, and the browser fired a synthetic
   `mouseleave` on the trigger the instant the bubble covered it —
   closing what the tap had just opened. Fixed by making the component
   fall back to stacking the bubble above/below the trigger when there
   isn't enough horizontal room on either side, and by removing an
   over-eager scroll-based auto-close (not actually required by spec)
   that had the same failure mode when a scrollable ancestor
   auto-scrolled the focused trigger into view.
2. **Manage Allocation page overflowed horizontally at 375px.** The
   Force-Assign form's Student/Project `<select>` elements had a fixed
   `min-w-[220px]` with no responsive fallback, pushing the whole page
   wider than the screen. Fixed by making the selects and submit button
   full-width below the `sm` breakpoint.
3. Full crawl of all 35 routes, all three roles: zero console errors,
   zero failed requests, zero broken images, zero missing `alt`
   attributes on the pages sampled.
4. Security: grepped the repo for API keys/tokens/hardcoded credentials
   — none found. `.env` is properly gitignored in both the frontend and
   `Backend_PMS`.

## Known issues / deferred (not fixed this week)

- `Backend_PMS` has 5 pre-existing `npm audit` findings (1 low, 4 high).
  Pre-existing before this branch, not something this UI change should
  silently "fix" — flagging for a team decision since upgrading could
  be a breaking change.
- Production JS bundle is ~552kB (one chunk); Vite's build warns about
  it. Pre-existing, not something a tooltip feature should take on —
  would need route-level code-splitting as its own piece of work.
- The Radix `ui/tooltip.tsx` / `ui/popover.tsx` / `ui/hover-card.tsx`
  components remain unused by the app. Worth a team conversation on
  whether to adopt them project-wide or remove them — out of scope
  here.
- Dark mode CSS variables exist (`src/styles/theme.css`) but nothing in
  the app toggles a `.dark` class; `next-themes` is an installed but
  unused dependency. Not touched.

## Next week

- Get team sign-off on the hint copy wording (table above).
- Consider hints on a few more admin-only controls if the team wants
  broader coverage (e.g. individual "Approve/Reject" buttons).
- Revisit the bundle-size warning if it becomes a real problem.

## Branch / commits

Branch: `feature/week6-section-hints` (pushed, PR not yet opened by
end of this session — link was handed to the repo owner to open from
the browser since `gh` CLI wasn't available in this environment).

- `a6f5b87` — feat(ui): add reusable SectionHint tooltip component
- `35b896b` — fix(ui): SectionHint tooltip self-closing when opened by tap/click
- `fc5652a` — feat(ui): wire SectionHint into nav and dashboard cards
- `53a135a` — fix: resolve horizontal overflow on Manage Allocation at mobile width
