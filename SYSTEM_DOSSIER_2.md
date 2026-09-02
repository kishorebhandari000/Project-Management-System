# System Dossier — Project Management System (PMS)
### Part 2 of 2: Sections G–M — see [SYSTEM_DOSSIER_1.md](SYSTEM_DOSSIER_1.md) for A–F

---

## G. END-TO-END FLOWS

### 1. Registration / login / token issue / logout / expired-token handling

There is **no self-registration page in the frontend**. `POST /api/auth/register`
exists and works ([authController.js:8-31](Backend_PMS/src/controllers/authController.js#L8-L31), role always defaults to `student`), but no
page anywhere in `src/app/pages` calls it (confirmed by search — zero matches for
`/auth/register` in `src/`). Accounts are created exclusively by an admin through
[ManageUsers.tsx](src/app/pages/admin/ManageUsers.tsx) → `POST /api/users`, which
auto-generates a student ID (`{year}{4-digit serial}`) and a `@pms.edu` login email
([userController.js:56-99](Backend_PMS/src/controllers/userController.js#L56-L99)) — the admin is shown these once, in a modal, and must
communicate them to the user out-of-band. This differs from what a plain "registration"
requirement implies — it's provisioning, not self-signup — and matches the plan's
"admin creates/manages user accounts" requirement more than a generic auth flow.

- **Login**: [Login.tsx](src/app/pages/Login.tsx) → `POST /auth/login` → server compares
  bcrypt hash ([authController.js:39-40](Backend_PMS/src/controllers/authController.js#L39-L40)) → issues a JWT (`generateToken`, 7-day expiry
  by default) → frontend stores `token`, `userId`, `userRole`, `userName`, `userEmail`
  in `localStorage` ([Login.tsx:25-29](src/app/pages/Login.tsx#L25-L29)) → redirects by role.
- **Every subsequent request**: [api.ts](src/app/lib/api.ts) attaches
  `Authorization: Bearer <token>` from `localStorage` unless `auth: false` is passed
  (used only for register/login/forgot-password/reset-password/public forum/contact).
- **Server-side verification**: `protect` middleware ([auth.js](Backend_PMS/src/middleware/auth.js)) verifies the JWT,
  loads the user fresh from Mongo (not just trusting the token payload), and attaches
  `req.user`.
- **Expired/invalid token**: any `401` response — from an expired JWT, a bad signature,
  or a deleted user — is caught globally by `handleResponse` in `api.ts`
  ([api.ts:24-26](src/app/lib/api.ts#L24-L26)), which clears all five `localStorage` keys and hard-redirects to
  `/login` (guarded so the login page itself doesn't loop). This is a real, working
  global 401 handler, not per-page boilerplate.
- **Logout**: [Sidebar.tsx:49-55](src/app/components/Sidebar.tsx#L49-L55) — clears the same five keys, navigates to `/login`. No
  server-side token invalidation exists (JWTs are stateless; a "logged out" token is
  still technically valid until it expires — see §H).
- **Forgot/reset password**: [ForgotPassword.tsx](src/app/pages/ForgotPassword.tsx) →
  `POST /auth/forgot-password` → server always returns the same message whether the
  email exists or not (anti-enumeration, [authController.js:63-66](Backend_PMS/src/controllers/authController.js#L63-L66)) → if it does,
  emails a link containing a raw 32-byte token (the DB only ever stores its SHA-256
  hash, 1-hour expiry) → [ResetPassword.tsx](src/app/pages/ResetPassword.tsx) →
  `POST /auth/reset-password/:token`.

### 2. Admin creates a project and allocates a supervisor

There's no separate "allocate a supervisor" step — supervisor assignment happens **at
project creation**, and can be changed later via edit. [CreateProject.tsx](src/app/pages/admin/CreateProject.tsx)
loads `GET /users?role=supervisor` for the dropdown, submits `POST /projects` with
`{title, description, category, supervisorId, maxStudents}` ([projectController.js:11-33](Backend_PMS/src/controllers/projectController.js#L11-L33)).
The **difficulty/duration/prerequisites fields visible in the original Figma design are
explicitly not sent or persisted** — the page itself says so ([CreateProject.tsx:153-155](src/app/pages/admin/CreateProject.tsx#L153-L155)).
Reassigning the supervisor later is a `PUT /projects/:id` from [EditProject.tsx](src/app/pages/admin/EditProject.tsx)
— admin-only in practice (§D/§F discrepancy).

### 3. Student browses projects and applies; supervisor or admin approves/rejects

**The direct solo-application endpoint (`POST /api/allocations`, `requestAllocation`) is
never called by the frontend** (confirmed by search — no `api.post('/allocations')`
anywhere in `src/`). Every application — solo or multi-student — now goes through the
**Group** flow: [BrowseProjects.tsx](src/app/pages/student/BrowseProjects.tsx) → "Apply
as a Group" opens a modal → `POST /groups` with `{project, name, memberIds}` (the
caller is auto-added as leader; a lone applicant is simply a group of one)
([groupController.js:72-141](Backend_PMS/src/controllers/groupController.js#L72-L141)). This creates a `Group` in status `pending` and notifies the
project's supervisor. From there:
1. **Supervisor** reviews it on [ManageProjects.tsx](src/app/pages/supervisor/ManageProjects.tsx)
   → `PUT /groups/:id/decision` with `{decision: 'approved'|'rejected', comment}`. A
   `rejected` decision ends it (students notified, can dismiss the reason banner). An
   `approved` decision (a *recommendation*, not final) moves status to
   `supervisor_approved` and notifies every admin.
2. **Admin** gives the final call on [ManageAllocation.tsx](src/app/pages/admin/ManageAllocation.tsx)
   → `PUT /groups/:id/decision` (`approved` → `finalizeGroupAllocation` creates one
   `Allocation` per member, all pre-approved, and flips the project to `allocated` if
   full — [groupController.js:183-217](Backend_PMS/src/controllers/groupController.js#L183-L217); `rejected` ends it). Admin can also short-circuit stage 1
   directly on a still-`pending` group as a fallback.
3. Either party can **undo** their own not-yet-finalized decision
   (`PUT /groups/:id/undo-decision`, supervisor only, own decisions only) or a finalized
   one (`PUT /groups/:id/undo`, admin only — releases the seats).
4. Students can **leave**/**withdraw**/**join another open group** at any point before
   finalization; a membership change on an already-`supervisor_approved` group resets it
   to `pending` (the roster the supervisor signed off on no longer matches reality).

A student is blocked from applying to a second project while "committed" — an approved
Allocation anywhere, or membership in any in-flight (`pending`/`supervisor_approved`)
group — via `getCommittedStudentIds` ([studentCommitment.js](Backend_PMS/src/utils/studentCommitment.js)), checked both when
starting a new group and when joining an existing one.

### 4. Admin creates an assessment against a project

Assessments are **not created "against a project"** — they're a shared template
([Assessment.js](Backend_PMS/src/models/Assessment.js)), created once via [CreateAssessment.tsx](src/app/pages/admin/CreateAssessment.tsx)
(`POST /assessments`, then per-file `POST /assessments/:id/files`) and started **hidden
from everyone**. Making it apply to a specific project is a separate, per-project step
each supervisor does themselves: [supervisor/Assessments.tsx](src/app/pages/supervisor/Assessments.tsx)
toggles `PUT /assessments/:id/visibility {projectId, visible: true}`, which
upserts an `AssessmentVisibility` row and notifies every approved student on that
project only at that moment. This is a deliberate one-template-many-projects design,
not a corner cut — see §I for how this differs from the plan's simpler phrasing.

### 5. Student uploads a submission file

[student/Assessments.tsx](src/app/pages/student/Assessments.tsx) → file input → `api.upload('/submissions', formData)`
(multipart, 25MB cap via multer) → `createSubmission` ([submissionController.js:14-85](Backend_PMS/src/controllers/submissionController.js#L14-L85)) verifies
the assessment is currently visible on the student's approved project, then either
creates a new `Submission` or **overwrites the existing one in place** if the student
had already submitted and it isn't graded yet (blocked entirely once graded). The
project's current supervisor is notified. **There is no version history** — a
resubmission destroys the previous file reference; see §I.

### 6. Supervisor grades it (marks + feedback) and the student sees it

[supervisor/Submissions.tsx](src/app/pages/supervisor/Submissions.tsx) → expand a row →
`PUT /submissions/:id/grade {marks, feedback}` → `gradeSubmission` verifies the grader
either is the student's current project's supervisor or is an admin, validates
`0 ≤ marks ≤ 100`, sets `status: 'graded'`, `gradedAt`, and notifies the student
(in-app + email, since every `createNotification` call also sends mail —
[notificationController.js:8-28](Backend_PMS/src/controllers/notificationController.js#L8-L28)). The student sees it on their own
[Assessments.tsx](src/app/pages/student/Assessments.tsx) — mark, a progress bar, and
the feedback text (or an explicit "No written feedback provided" if empty), plus a
link back to the originally-uploaded file.

### 7. Forum: admin creates a post, users comment, deletion rules

Despite the name, **any authenticated role** can start a forum thread, not just admin —
[Forum.tsx](src/app/pages/Forum.tsx)/[NewForumPost.tsx](src/app/pages/NewForumPost.tsx)
→ `POST /forum` (protected, no `roleGuard`). Reading posts/comments is fully public
(`GET /forum`, `GET /forum/:id`, `GET /forum/:id/comments` have no `protect` at all —
this is intentional, the homepage shows the 3 latest posts to anonymous visitors).
Deletion (post or comment) is **author-or-admin**, checked in the controller, not by
role — [forumController.js:85-104,106-123](Backend_PMS/src/controllers/forumController.js#L85-L123). This is a deliberate pivot from an
earlier admin-only "ManageForum" design (see §I, §J7 — the merge history shows a
literal `admin/ManageForum.tsx → Forum.tsx` rename as this generalization happened).

### 8. Discussions: project-scoped threads and replies, who can access

Distinct from the Forum: every `DiscussionThread` belongs to exactly one `Project`
([DiscussionThread.js](Backend_PMS/src/models/DiscussionThread.js)), and every route is behind both `protect` and a
per-project `assertProjectAccess` check ([discussionController.js:9-33](Backend_PMS/src/controllers/discussionController.js#L9-L33)): admin (any
project), that project's supervisor, or a student with a currently-`approved`
Allocation on it. The frontend never lets a user pick an inaccessible project — the
[useMyProjects](src/app/hooks/useMyProjects.ts) hook feeds the project dropdown from
`GET /allocations?status=approved` (student) or `GET /projects` (supervisor/admin,
already server-scoped) — but the *server* check is what actually blocks access if
someone crafts a request for a project they're not on. Deletion permissions are
layered: thread/post author, that project's supervisor, or admin.

### 9. Messaging / real-time chat

Real, not a UI shell. Contact lists are relationship-derived server-side (§D/§F), never
a free directory. [useMessages.ts](src/app/hooks/useMessages.ts) loads contacts +
history over REST, then opens a socket.io connection and calls `socket.emit('register',
userId)` ([realtime.js:8-11](Backend_PMS/src/utils/realtime.js#L8-L11) maps `userId → socketId` server-side, in-memory — not
persisted, so it's lost on server restart and doesn't scale past one Node process — see
§H). Sending a message (`POST /messages`) both persists it and does
`realtime.pushToUser(recipientId, 'message', message)` so an online recipient sees it
instantly without polling; `useNotifications.ts` does the same for the notification
bell. Each Messages page also has a separate "Email" tab (`POST /emails`, real SMTP,
distinct from the chat feature — students restricted to supervisor addresses).

### 10. Notifications (in-app bell and email)

**Every** `createNotification()` call does both at once — there is no
notification-type flag to send one without the other; it's unconditional
([notificationController.js:8-28](Backend_PMS/src/controllers/notificationController.js#L8-L28)): writes a `Notification` doc, pushes it live via
socket.io if the recipient is connected, and fires-and-forgets an SMTP email (errors
logged, never block the triggering action). Triggering events, all confirmed in code:
group created/decided/undone, allocation requested/decided, assessment released,
deadline extended, submission created, submission graded, direct email received, task
assigned (dead — no UI), and the hourly reminder job below. [NotificationBell.tsx](src/app/components/NotificationBell.tsx)
polls `GET /notifications` once on mount for the initial unread count, then increments
live on the `notification` socket event; opening the full [Notifications.tsx](src/app/pages/student/Notifications.tsx)
page marks everything read in the background (`PUT /notifications/read-all`) and
dispatches a same-tab custom event so the bell badge clears instantly.

**Deadline reminders** are a real background job, not just an on-demand notification:
[assessmentReminders.js](Backend_PMS/src/jobs/assessmentReminders.js), started once at server boot and then every hour
(`setInterval`, [assessmentReminders.js:88-93](Backend_PMS/src/jobs/assessmentReminders.js#L88-L93)). For every currently-visible assessment, it
notifies each approved-but-not-yet-submitted student once when the effective due date
is within 5 days (`due_soon`) and again once it's passed (`overdue`), deduped forever
per `(assessment, project, student, type)` via the `AssessmentReminder` collection so
re-running the hourly check never double-notifies. This is the newest feature in the
repo, added in the final commit (`8d98545`, 2026-08-25).

---

## H. NON-FUNCTIONAL EVIDENCE

### Security
- **Password hashing**: bcryptjs, cost factor **10**, in a Mongoose `pre('save')` hook
  that only re-hashes when `password` is actually modified ([User.js:21-24](Backend_PMS/src/models/User.js#L21-L24)) — safe
  against re-hashing an already-hashed value on unrelated saves.
- **JWT**: signed with `process.env.JWT_SECRET` (no fallback/default in code — a
  misconfigured deployment would crash rather than silently sign with a weak default,
  since `jwt.sign(..., undefined, ...)` throws), 7-day expiry by default
  ([generateToken.js](Backend_PMS/src/utils/generateToken.js)). No refresh-token mechanism and no server-side revocation
  list — a stolen token stays valid for up to 7 days regardless of "logout."
- **Route guards**: every sensitive route is `protect` + (where relevant) `roleGuard`,
  confirmed exhaustively in §D. The two known gaps are documented there explicitly:
  `PUT/DELETE /projects/:id` roleGuard lists `supervisor` but the controller 403s them
  anyway (over-restrictive, not a hole), and `PUT /submissions/:id/grade` roleGuard only
  lists `supervisor` while the controller body separately allows `admin` (under-declared
  at the route level, but still correctly enforced in the controller — not an actual
  hole either).
- **Global 401 handling**: real, in [api.ts:24-26](src/app/lib/api.ts#L24-L26) — see §G flow 1.
- **CORS**: any `localhost`/`127.0.0.1` port plus `CLIENT_ORIGIN` — appropriate for dev,
  would need tightening for a real deployment (`corsOrigin.js`).
- **Input validation**: hand-rolled per-endpoint required-field checks throughout
  controllers (not a schema-validation library like Joi/Zod); Mongoose schema
  constraints (`required`, `enum`, `min`/`max`) provide a second layer. Password
  strength is enforced both client-side ([validatePassword.ts](src/app/lib/validatePassword.ts)) and
  server-side ([validatePassword.js](Backend_PMS/src/utils/validatePassword.js), byte-for-byte mirrored logic, min 8 chars +
  upper/lower/digit/symbol) — server-side is the one that actually matters, and it's
  present, not just a UI nicety.
- **What is NOT protected**: the public forum's `GET` routes and the contact form are
  deliberately open (by design). `POST /auth/register` has no CAPTCHA/rate-limiting —
  low risk in practice since no UI exposes it, but it is a live, unrestricted endpoint
  anyone with the API URL could hit directly to create a `student` account. No
  rate-limiting anywhere in the API (login, forgot-password, register are all
  un-throttled) — a real gap for a production deployment, not flagged or mitigated
  anywhere in the code.
- **File uploads**: no server-side MIME/type allow-list — `multer` + Cloudinary's
  `resource_type: 'auto'` accepts anything up to 25MB; relies entirely on the size cap.

### Performance
- **No pagination anywhere** — every list endpoint (`getUsers`, `getProjects`,
  `getAllocations`, `getSubmissions`, `getAllAssessments`, `getGroups`, `getMyGroups`,
  `getPosts` for forum) returns its entire result set in one response. Fine at
  classroom/cohort scale, would not scale to a large multi-department deployment.
- **N+1-shaped patterns exist but are mostly guarded**: `getContacts` in
  `messageController.js` does one `Message.findOne` + one `Message.countDocuments` per
  contact inside a `Promise.all` ([messageController.js:52-81](Backend_PMS/src/controllers/messageController.js#L52-L81)) — genuinely N+1, though
  parallelized and bounded by a user's realistic contact count (never more than their
  students/supervisors/groupmates). `getProjects` avoids the equivalent trap by
  batching seat counts through one `Allocation.aggregate()` instead of per-project
  queries ([projectController.js:52-56](Backend_PMS/src/controllers/projectController.js#L52-L56)) — evidence of at least one deliberate
  optimization pass, not uniform carelessness.
- **`.populate()`** is used throughout for ref resolution (the Mongoose equivalent of a
  join) rather than raw ID plumbing — used consistently and, per the snapshot-vs-current
  pattern in §C, deliberately *avoided* in favor of a live lookup where staleness would
  matter (current project supervisor, not a cached one).
- **No caching layer** anywhere (no Redis, no in-memory cache, no HTTP cache headers
  beyond defaults) — [Reports.tsx](src/app/pages/admin/Reports.tsx) instead
  re-polls `GET /reports/summary` every 10 seconds plus on window focus, computing the
  full aggregate fresh server-side every time.
- **Build**: Vite 6 + `@vitejs/plugin-react` + `@tailwindcss/vite`; a custom
  `figmaAssetResolver` plugin resolves `figma:asset/...` imports back to
  `src/assets` ([vite.config.ts:7-17](vite.config.ts#L7-L17)) — a leftover of the Figma-scaffold origin, still
  load-bearing for whichever components still use that import style.

### Reliability
- **`asyncHandler`** ([asyncHandler.js](Backend_PMS/src/utils/asyncHandler.js)) wraps every controller function, forwarding
  any rejected promise to Express's `next(err)` — used with 100% consistency across all
  14 controllers, confirmed by direct reading of every one.
- **Centralized error handling**: `notFound` (404 catch-all) + `errorHandler`
  ([errorHandler.js](Backend_PMS/src/middleware/errorHandler.js)) mounted last in `app.js`; `errorHandler` only includes the stack
  trace when `NODE_ENV !== 'production'`.
- **Failure modes actually handled in code**: legacy-record self-healing on project edit
  ([projectController.js:126-131](Backend_PMS/src/controllers/projectController.js#L126-L131)); a project with no supervisor set no longer crashes
  reads ([679bf77](Backend_PMS/src/controllers/allocationController.js), see COMMIT_LOG); best-effort email/notification/Google-Sheets
  calls are wrapped in `.catch(() => {})` throughout so a downstream failure (e.g. SMTP
  misconfigured) never blocks the primary action that triggered it — this pattern is
  used consistently, not just in one place.
- **One real, unhandled failure mode**: the orphaned extra route in
  [taskRoutes.js:14-27](Backend_PMS/src/routes/taskRoutes.js#L14-L27) (§D) references undefined identifiers and will throw a raw
  `ReferenceError` (uncaught by `asyncHandler`, since it isn't wrapped in one) if ever
  hit — mitigated only by the fact that no frontend page calls it.

### Usability / accessibility
- **Component approach**: hand-rolled Tailwind utility classes on every real page, not
  the shadcn/Radix `components/ui/` library (§B, §K) — the one confirmed exception is
  `@radix-ui/react-tooltip`, used directly by [Sidebar.tsx](src/app/components/Sidebar.tsx) for the
  per-nav-item hint tooltips ([sectionHints.ts](src/app/lib/sectionHints.ts)).
- **Responsive design**: real, not just a media-query afterthought — `Sidebar.tsx`
  renders a fixed mobile top bar + slide-out drawer under `md:hidden` and a full desktop
  sidebar under `hidden md:flex` ([Sidebar.tsx:100-146](src/app/components/Sidebar.tsx#L100-L146)); tables that would overflow on
  mobile are wrapped in `overflow-x-auto` (e.g. admin ManageUsers, ManageAllocation).
- **Loading/empty/error states**: present as a consistent three-way pattern
  (`loading && ...`, `error && ...`, `!loading && !error && data.length === 0 && ...`)
  across essentially every data-fetching page — verified directly on 20+ pages while
  compiling §E, not just a sample.
- **Form validation feedback**: inline red error banners on every form (not native
  browser `alert()`s, with the exception of a handful of destructive-but-secondary
  actions like grading-save failures which do use `alert()`); a shared `useConfirm()`
  modal ([useConfirm.tsx](src/app/hooks/useConfirm.tsx)) and `useCommentPrompt()` modal
  ([useCommentPrompt.tsx](src/app/hooks/useCommentPrompt.tsx)) replace native `confirm()`/`prompt()` for
  destructive or reason-requiring actions (withdraw, leave group, delete, reject with a
  reason) — a deliberate, reusable UX component, not copy-pasted per page.

### Scalability & maintainability
- **Shared API client**: single [api.ts](src/app/lib/api.ts) wrapper used by literally
  every page — no page does a raw `fetch()`.
- **Shared hooks**: `useMessages`, `useMyProjects`, `useNotifications`, `useConfirm`,
  `useCommentPrompt` — each extracted once and reused across 2–3 roles' equivalent pages
  (e.g. the Discussions/Messages pages are near-identical across student/supervisor/admin,
  built on the same hooks rather than copy-forked logic).
- **Code reuse across roles**: the student/supervisor/admin Discussions, DiscussionThread,
  NewDiscussion, and Messages pages are structurally near-duplicates of each other
  (confirmed by direct diff-reading) — real reuse of *pattern*, though not reuse of
  *code* (each role has its own file; there's no shared `<Discussions role="...">`
  component). This is a real, if imperfect, maintainability trade-off worth naming in a
  report: less DRY than it could be, but consistent enough that a change to one role's
  version is a known, mechanical port to the other two.

### Compatibility
- **UNVERIFIED**: no evidence in the repo of cross-browser or device testing (no test
  files, no BrowserStack config, no CI). The responsive Tailwind breakpoints (`md:`)
  imply mobile-vs-desktop was considered, but there is no record of which real devices
  or browsers were actually used to check it — that would have to come from the team's
  own account, not the code.

---

## I. WHAT WAS BUILT VS WHAT WAS PLANNED

| Requirement | Status | Evidence |
|---|---|---|
| **Student** — browse projects | **BUILT & WORKING** | [BrowseProjects.tsx](src/app/pages/student/BrowseProjects.tsx), `GET /projects` |
| Student — apply for / select a project | **BUILT & WORKING**, but **changed**: solo application always goes through a "group of one," not a distinct direct-apply endpoint | `POST /groups`; `POST /allocations` (the originally-simpler direct-apply path) is unreachable from the UI — see §G flow 3 |
| Student — view assessments and deadlines | **BUILT & WORKING** | [student/Assessments.tsx](src/app/pages/student/Assessments.tsx), `GET /assessments/my` (extended-deadline-aware) |
| Student — upload submission files **with multiple versioned attempts** | **PARTIAL** | Upload is real (`POST /submissions`); versioning is **NOT BUILT** — [Submission.js:20](Backend_PMS/src/models/Submission.js#L20) has a unique index on `(assessment, student)`, so a resubmission overwrites the one document in place (`submissionController.js:51-56`); there is no version array, no history, no "attempt number" anywhere in the schema or API |
| Student — view released marks and written feedback | **BUILT & WORKING** | Same Assessments page; `submission.marks`/`submission.feedback` |
| Student — access group and individual project-specific discussion forums | **BUILT & WORKING**, and **changed in scope**: discussions are project-scoped only (no "individual," i.e. non-project, discussion exists), plus a *separate*, non-project-scoped public Forum was added on top | [DiscussionThread.js](Backend_PMS/src/models/DiscussionThread.js) (`project` required); [Forum.tsx](src/app/pages/Forum.tsx) is the added general-purpose layer |
| Student — email notification on feedback release | **BUILT & WORKING** | `gradeSubmission` → `createNotification` → unconditional email send ([submissionController.js:152-158](Backend_PMS/src/controllers/submissionController.js#L152-L158), [notificationController.js:8-28](Backend_PMS/src/controllers/notificationController.js#L8-L28)) |
| **Supervisor** — create/edit/delete project listings | **NOT BUILT for supervisors** — this ended up **admin-only** | Route `roleGuard` on `PUT`/`DELETE /projects/:id` lists `supervisor`, but the controller itself unconditionally 403s any non-admin ([projectController.js:122-124,140-142](Backend_PMS/src/controllers/projectController.js#L122-L142)) — a supervisor can view (`ViewProject.tsx`) but never edit or delete. This is a genuine, verifiable divergence from the plan, not a UI-only omission |
| Supervisor — view all student submissions for their projects | **BUILT & WORKING** | [supervisor/Submissions.tsx](src/app/pages/supervisor/Submissions.tsx), `GET /submissions` (role-scoped) |
| Supervisor — enter marks and written feedback | **BUILT & WORKING** | `PUT /submissions/:id/grade` |
| Supervisor — control release of marks | **PARTIAL / reframed**: there is no separate "hold vs. release marks" toggle — grading and release are the same action (setting `marks`/`feedback` immediately flips `status` to `graded` and immediately notifies the student). What *is* separately controllable is **assessment visibility** (whether students can see/submit an assessment at all), which is a different lever than "release marks" | [gradeSubmission](Backend_PMS/src/controllers/submissionController.js#L121-L166) vs. [setAssessmentVisibility](Backend_PMS/src/controllers/assessmentController.js#L161-L208) |
| Supervisor — participate in project discussions | **BUILT & WORKING** | Same Discussions stack as student, scoped to owned projects |
| **Admin** — create assessments linked to projects | **BUILT & WORKING**, with a **changed model**: assessments are shared templates, "linked to a project" happens via a separate per-project `AssessmentVisibility` toggle each supervisor controls, not a direct project link at creation | See §G flow 4 |
| Admin — set and extend deadlines | **PARTIAL / changed ownership**: the *original* deadline is set by admin at template creation (`Assessment.dueDate`); *extending* it is **supervisor-only, per-project**, and admin is explicitly excluded from extending (`roleGuard('supervisor')` on that route) — admin cannot itself extend a deadline once set | [assessmentRoutes.js:31](Backend_PMS/src/routes/assessmentRoutes.js#L31) |
| Admin — create/manage user accounts and assign roles | **BUILT & WORKING** | [ManageUsers.tsx](src/app/pages/admin/ManageUsers.tsx), full CRUD |
| Admin — enforce role-based access control on all routes | **BUILT & WORKING**, with two minor, non-security-critical discrepancies documented in §D/§F (`projects` roleGuard vs. controller; `submissions/grade` roleGuard vs. controller) | See §D |
| Admin — system-wide monitoring dashboards | **BUILT & WORKING** | [Reports.tsx](src/app/pages/admin/Reports.tsx), live-polling `GET /reports/summary` |
| Admin — complete activity log for audit | **PARTIAL**: [Dashboard.tsx](src/app/pages/admin/Dashboard.tsx) shows a "Recent Activity" feed, but it is **synthesized client-side** at page-load time from three separate list endpoints (newest 5 students, newest 5 projects, newest 5 non-pending allocations, merged and sorted by date — [Dashboard.tsx:56-82](src/app/pages/admin/Dashboard.tsx#L56-L82)), not a persisted, queryable, exhaustive audit-log collection. There is no `AuditLog` model; deletions (a user, a project, a message) leave no trace at all. This does **not** satisfy "complete activity log for audit" as literally specified |
| **Automated** — email notifications for submissions, feedback release, approaching deadlines | **BUILT & WORKING**, all three confirmed | submission created ([submissionController.js:70-77](Backend_PMS/src/controllers/submissionController.js#L70-L77)), graded ([submissionController.js:152-158](Backend_PMS/src/controllers/submissionController.js#L152-L158)), due-soon/overdue job ([assessmentReminders.js](Backend_PMS/src/jobs/assessmentReminders.js)) |
| Automated — full version history of submissions | **NOT BUILT** | See the student-submissions row above — confirmed by the schema's unique-per-(assessment,student) index and the overwrite-in-place logic |
| Automated — data consistency and referential integrity | **PARTIAL**: enforced *procedurally* in application code (unique compound indexes on Allocation/AssessmentVisibility/Submission/AssessmentReminder; deletion of a project blocked while it has Allocations or visible Assessments; self-healing of legacy Project records), but **not** enforced by the database itself the way foreign keys would — deleting a `User` ([deleteUser](Backend_PMS/src/controllers/userController.js#L214-L222)) does **not** cascade to or clean up their Allocations, Submissions, Messages, Group memberships, or Notifications, which is exactly the class of integrity problem a relational FK/cascade (per the original PostgreSQL plan) would have caught automatically | Confirmed by reading every model's absence of any pre/post `deleteOne` hook |

### What changed from the plan, and why (as evidenced by the code/history)

- **Who can create/edit/delete projects** narrowed from "supervisor" (plan) to
  "admin only" (built) — the route-level `roleGuard` still lists `supervisor`
  (suggesting it was originally intended, or half-migrated), but the controller
  overrides it. No commit message explains the reasoning; it reads as a deliberate
  policy tightening that the route guard was never cleaned up to match.
- **Assessments moved from project-linked to shared-template-plus-visibility-toggle** —
  a materially more flexible design than "create an assessment against a project" (one
  admin action can reach every project at once, per-project release/timing is then a
  supervisor decision), at the cost of being less literally what the plan described.
- **Discussions became project-scoped-only, with a separate general Forum bolted on** —
  git history shows this was a real pivot, not a from-scratch design: an
  `admin/ManageForum.tsx` (admin-only) existed at one point and was merge-conflict-resolved
  into a generic, all-roles `Forum.tsx` (`84e2bb7`, "keep the public forum version"),
  immediately followed by `653e09c` "make forum generic across all three roles" — i.e.
  the team explicitly chose to broaden it after building the narrower version first.
- **"Control release of marks" became "grading = release"** — there's no evidence a
  separate mark-holding mechanism was ever attempted; grading and publishing were
  designed as one action from the start.
- **Allocation decisions flip-flopped on whether admin can override a supervisor's call**
  — `01af831` "admin can no longer approve/reject" was followed, same day, by `8ee706a`
  "revert(allocation): let admin approve/reject alongside supervisor." The shipped
  behavior (admin as a fallback approver everywhere) is the reverted, more permissive
  state — direct evidence of the team testing a stricter model and deciding against it.

---

## J. DEVELOPMENT HISTORY (from git)

Full detail, including a complete per-commit table, per-file authorship, and
per-contributor summaries, is in the companion file **[COMMIT_LOG.md](COMMIT_LOG.md)**
(J2) and below (J1, J3–J8).

### J1. Overall statistics
- **131 total commits** (`git log --oneline --all | wc -l`), spanning **2026-07-03**
  (`bdcceae`, "Initial commit") to **2026-08-25** (`8d98545`, the assessment-reminder
  feature) — 53 days.
- **Contributors** (`git shortlog -sn --all`):

  | Author | Commits |
  |---|---|
  | Piash89 | 48 |
  | arthleo | 34 |
  | kishorebhandari000 | 30 |
  | Pijush11 | 15 |
  | jaspreets0 | 4 |

- **Author identities**: exactly 5 distinct `name <email>` pairs
  (`git log --all --format='%an <%ae>' | sort -u`), **no evidence of the same person
  committing under two different names/emails** — no merging of identities needed:
  `Piash89 <piash8054@gmail.com>`, `Pijush11 <shuvo112roy@gmail.com>`,
  `arthleo <arthurleonard05225@gmail.com>`, `jaspreets0 <26jaspreet2003@gmail.com>`,
  `kishorebhandari000 <kishorebhandari000@gmail.com>`.
- **Lines changed per author** (`git log --all --numstat`, aggregated):

  | Author | + added | − deleted |
  |---|---|---|
  | kishorebhandari000 | 30,306 | 7,828 |
  | arthleo | 21,566 | 2,615 |
  | Piash89 | 7,898 | 8,354 |
  | Pijush11 | 2,446 | 453 |
  | jaspreets0 | 514 | 151 |

  Note the shape difference: kishorebhandari000 and arthleo's totals include large
  scaffold/dependency commits (the 16,986-line initial commit is
  kishorebhandari000's; `d22364d`/`217f47d`, ~13,500 lines combined, are arthleo's
  pnpm-lockfile regenerations). Piash89's ratio (7,898 added vs. 8,354 *deleted*) is
  the only author with net-negative lines — consistent with their commit messages,
  which skew toward `fix(...)`/`feat(...)` conventional-commit-style backend hardening
  and refactors rather than large new scaffolding (see J4/J8).

### J3. What substantive commits actually did (message vs. diff, where they diverge)

Pure merges (24 commits) and single-character/trivial commits are omitted; the full
131-row table with exact diffstat for every commit, including these, is in
[COMMIT_LOG.md](COMMIT_LOG.md). Commits are grouped by what they actually built, in
chronological order, with a note wherever the commit message undersells or oversells
the diff.

- `07dc32b`/`f7acc99` (Jul 5, kishorebhandari000): assessment creation added for admin,
  then the same capability immediately removed from supervisor — an early instance of
  the "who can do X" policy churn that recurs throughout the project (cf. `01af831`/`8ee706a`).
- `48a88c0` (Jul 8, kishorebhandari000): "Add backend scaffold" is accurate — this is
  the commit that actually stood up Express/Mongoose/JWT auth for the first time
  (32 files, +2675/-142); everything backend-side descends from it.
- `d837846` (Jul 16, kishorebhandari000): "Week 3: Assessment model controller routes
  notifications + all frontend pages" — the diff (+2636/**-3175**) is net-negative,
  i.e. this commit's real effect was a large *rewrite/removal* of prior frontend
  scaffolding alongside the new Assessment backend, not a pure addition as the message
  implies.
- `1f83e0e` (Jul 21, Piash89): "Add Forum backend" — accurate; this is the origin of
  `ForumPost`/`ForumComment` (later reshaped by `653e09c`/`84e2bb7`, see below).
- `43c8689` (Jul 21, arthleo): "Added Undo option in Admin Allocation Requests" — a
  small (+26/-13) precursor to the much larger undo/decision-reversal machinery built
  into Groups five weeks later (`a54839e`).
- `028a3f3` through `c794560` (Jul 22, Piash89, 6 commits): a single-day sequence that
  wired the entire Discussions feature end-to-end (backend access control, then thread
  list, new-thread form, thread view/reply, per-comment deletion) — the most
  concentrated single-feature build in the whole history.
- `dfd7fdd` (Jul 28, Piash89): "Fix duplicate route registration, repair broken
  lockfile, remove orphaned pnpm config" — the diff is +54/**-6155**; the headline
  effect of this commit is deleting a corrupted 6000+-line lockfile, not the route fix
  the message leads with.
- `217f47d` (Jul 28, arthleo): "pnpm update (myside)" is a +7458/-0 lockfile
  regeneration — a large diffstat with essentially no functional code content, the
  inverse problem of `dfd7fdd` above (these two commits are a matched pair: one broke
  the lockfile area, the other rebuilt it).
- `01af831` → `8ee706a` (Aug 1, Piash89, same day): "admin can no longer
  approve/reject" immediately reverted by "revert(allocation): let admin approve/reject
  alongside supervisor" — see §I, a same-day policy reversal, not two unrelated fixes.
- `5463807` (Aug 1, kishorebhandari000): "merge and resolve conflicts" — 48 files,
  +1561/-365; this is the merge that reconciled two branches' concurrent allocation-UI
  work, producing (among other things) the never-routed `supervisor/Allocations.tsx`
  (see §J7).
- `e8a010e` → `5b97821` (Aug 2, Piash89, a 6-commit run): the entire Submission
  model + upload + student-submit-page + supervisor-grading pipeline built in one day,
  immediately followed by `c5ea85d` adding the local-disk upload fallback the same day
  — i.e. the fallback wasn't planned ahead, it was added because Cloudinary wasn't
  configured in the dev environment they were testing against.
- `23e6db3` → `248f60b` (Aug 2–3, kishorebhandari000): group formation, student-ID
  auto-generation, and "student selecting projects as a group" — the origin of the
  Group model and the group-application flow that later fully replaced solo
  application (§G flow 3, §I).
- `23e88d3` → `10334c8` (Aug 3, Piash89): "replacing the fake Messages tabs" —
  explicit confirmation in the commit message itself that Messages was previously a
  mock UI before this pair of commits made it real.
- `e277abd` (Aug 4, arthleo): "Removed Feedback and GradeSubmission pages... Removed
  the feature for students to change their email" — a feature-*removal* commit;
  confirms two pages (`Feedback.tsx`, `GradeSubmission.tsx`, visible in the `5463807`
  merge's file list) were deleted outright rather than evolved, and that student
  self-service email changes were a deliberately cut feature (consistent with
  `student/Profile.tsx`'s read-only email field today).
- `a91e45f` (Aug 10, Piash89): "fix(messages): repair backend broken by previous
  commit" — a same-day hotfix for `22d150e` (jaspreets0's "Update messaging and search
  feature"), confirmed by the immediately-following `739a306` "docs: note the messaging
  backend hotfix and merge to main."
- `a31941b` / `d1c9b96` (Aug 15, kishorebhandari000): both large, net-negative diffs
  (610/814 and 748/977) under vague messages ("Fixed Assessment", "For the notification
  and the message.") — real, substantial rework (touching 18 and 27 files respectively)
  whose actual scope isn't recoverable from the message alone.
- `a54839e` / `8dcbac0` / `8d98545` (Aug 25, arthleo, the final 3 substantive commits):
  group management + undo, the supervisor Submissions page, and the assessment-reminder
  job — the three features this dossier was originally commissioned to verify (see the
  session's own prior investigation), all landing in a single final day of work.

### J4. Authorship by module

| Module | Key files | Contributing authors (commit hashes) |
|---|---|---|
| Auth | `authController.js`, `authRoutes.js`, `auth.js`, `User.js` | kishorebhandari000 (`48a88c0` origin), arthleo (`5f8692e` forgot-password, `8896f52` fix), kishorebhandari000 (`23e6db3`, `28eb533` password rules) |
| Users | `userController.js`, `userRoutes.js`, admin/ManageUsers.tsx | kishorebhandari000 (`48a88c0`), Pijush11 (`b2afda1` update/delete endpoints, `8de46f4` wire buttons), kishorebhandari000 (`23e6db3` auto-ID) |
| Projects | `projectController.js`, admin/{Manage,Create,Edit}Project.tsx | kishorebhandari000 (`48a88c0`, `28e0120`), Piash89 (`679bf77`, `72dd3c9`, `dfd7fdd` fixes) |
| Allocations | `allocationController.js`, admin/ManageAllocation.tsx, supervisor/Allocations.tsx | kishorebhandari000 (`28e0120` origin), arthleo (`43c8689` undo), Piash89 (`cbe5767`/`01af831`/`8ee706a` policy churn, `da62ea6`/`a35e4b3` late fixes) |
| Groups | `groupController.js`, groupRoutes.js, Group.js, student/Groups.tsx, supervisor/Students.tsx | kishorebhandari000 (`23e6db3`/`248f60b` origin), arthleo (`09dab01`, `a54839e`/`8dcbac0` full management + undo) — blame: 55%/45% kishorebhandari000/arthleo on `groupController.js` |
| Assessments | `assessmentController.js`, Assessment.js, AssessmentVisibility.js, all 3 roles' Assessments.tsx | kishorebhandari000 (`07dc32b`/`f7acc99`/`d837846` origin, `11786d8` deadline extension), Piash89 (`eeae54d`, `3fad507`), arthleo (`e277abd`, `cc5443b`) |
| Submissions | `submissionController.js`, Submission.js, supervisor/Submissions.tsx | Piash89 (`e8a010e` → `5b97821` origin, sole author of the model), arthleo (`8dcbac0` supervisor page) |
| Forum | `forumController.js`, ForumPost.js, Forum.tsx | Piash89 (`1f83e0e` origin, `028a3f3`, `653e09c` generalize), kishorebhandari000 (`84e2bb7` merge-resolve), arthleo (`e968b2b` reactions) |
| Discussions | `discussionController.js`, DiscussionThread.js, all 3 roles' Discussions pages | Piash89 (`028a3f3`→`c794560`, the single-day full build), Pijush11 (`4c2d147` access-control fix) |
| Messages | `messageController.js`, Message.js, all 3 roles' Messages.tsx | Piash89 (`23e88d3`/`10334c8` origin — "replacing the fake Messages tabs"), jaspreets0 (`22d150e` search), Piash89 (`a91e45f` hotfix), arthleo (`ca803fc`, `4ab48df`) |
| Notifications | `notificationController.js`, Notification.js, NotificationBell.tsx, `assessmentReminders.js` | arthleo (`f5b7e75` origin, `078e64d` bell UI), kishorebhandari000 (`28e0120`), arthleo (`03f420e` refactor), arthleo (`8d98545` reminder job) |
| Reports | `reportsController.js`, admin/Reports.tsx | Piash89 (`1c9fb95` origin — "replace hardcoded mock data with a real admin endpoint"), arthleo (`3bdac45`) |
| Shared UI/nav | `Sidebar.tsx`, `routes.tsx`, `api.ts`, hooks/ | kishorebhandari000 (origin, 64% of current `Sidebar.tsx` by blame), Piash89 (36% by blame, `fc5652a`/`e649fe4` SectionHint tooltips), Pijush11 (`ca6d113` 401 handling, `c2f3d73` ProtectedRoute) |

### J5. Authorship by file (representative core files — not exhaustive across all ~150 source files)

| File | Original author | Later contributors | Commits touching it |
|---|---|---|---|
| [routes.tsx](src/app/routes.tsx) | kishorebhandari000 (`bdcceae`) | Pijush11, arthleo, Piash89, kishorebhandari000 | 15 |
| [Sidebar.tsx](src/app/components/Sidebar.tsx) | kishorebhandari000 (`bdcceae`) | Piash89, arthleo, kishorebhandari000 | 10 |
| [api.ts](src/app/lib/api.ts) | kishorebhandari000 (`48a88c0`) | kishorebhandari000, Pijush11 | 3 |
| [app.js](Backend_PMS/src/app.js) | kishorebhandari000 (`48a88c0`) | kishorebhandari000, Piash89, arthleo, Pijush11 | 17 |
| [auth.js](Backend_PMS/src/middleware/auth.js) | kishorebhandari000 (`48a88c0`) | *(none — untouched since creation)* | 1 |
| [User.js](Backend_PMS/src/models/User.js) | kishorebhandari000 (`48a88c0`) | arthleo, kishorebhandari000 | 6 |
| [Project.js](Backend_PMS/src/models/Project.js) | kishorebhandari000 (`48a88c0`) | kishorebhandari000 (`28e0120`) | 2 |
| [Submission.js](Backend_PMS/src/models/Submission.js) | Piash89 (`e8a010e`) | *(none — untouched since creation)* | 1 |
| [Message.js](Backend_PMS/src/models/Message.js) | Piash89 (`23e88d3`) | *(none)* | 1 |
| [Notification.js](Backend_PMS/src/models/Notification.js) | arthleo (`f5b7e75`) | kishorebhandari000 | 2 |
| [ForumPost.js](Backend_PMS/src/models/ForumPost.js) | Piash89 (`1f83e0e`) | arthleo (reactions) | 2 |
| [DiscussionThread.js](Backend_PMS/src/models/DiscussionThread.js) | Piash89 (`1f83e0e`) | arthleo (reactions) | 2 |
| [groupController.js](Backend_PMS/src/controllers/groupController.js) | kishorebhandari000 (`23e6db3`) | kishorebhandari000, arthleo | 7 |
| [admin/ManageAllocation.tsx](src/app/pages/admin/ManageAllocation.tsx) | kishorebhandari000 (`bdcceae`) | arthleo, Piash89, kishorebhandari000 | 12 |
| [supervisor/ManageProjects.tsx](src/app/pages/supervisor/ManageProjects.tsx) | kishorebhandari000 (`bdcceae`) | arthleo, kishorebhandari000 | 11 |
| [student/BrowseProjects.tsx](src/app/pages/student/BrowseProjects.tsx) | kishorebhandari000 (`bdcceae`) | arthleo, kishorebhandari000 | 11 |
| [student/Groups.tsx](src/app/pages/student/Groups.tsx) | arthleo (`a54839e`, 2026-08-25) | arthleo (`8dcbac0`, same day) | 2 |
| [supervisor/Students.tsx](src/app/pages/supervisor/Students.tsx) | arthleo (`a54839e`) | arthleo (`8dcbac0`) | 2 |
| [supervisor/Submissions.tsx](src/app/pages/supervisor/Submissions.tsx) | arthleo (`8dcbac0`) | *(none since)* | 1 |

`git blame` line-ownership on the biggest/most-contested files (percentage of lines in
the file's **current** content, i.e. who last touched each surviving line — not total
historical contribution):

| File | Owner breakdown (current lines) |
|---|---|
| Sidebar.tsx (148 lines) | kishorebhandari000 64% (95 lines) · Piash89 36% (53 lines) |
| groupController.js (611 lines) | kishorebhandari000 55% (337 lines) · arthleo 45% (274 lines) |
| supervisor/ManageProjects.tsx (360 lines) | kishorebhandari000 71% (256 lines) · arthleo 29% (104 lines) |
| app.js (43 lines) | kishorebhandari000 65% (28) · Piash89 33% (14) · arthleo 2% (1) |

### J6. Timeline by week

| Week (Mon–Sun) | Who committed | What was built / milestone |
|---|---|---|
| 2026-06-29 – 07-05 | kishorebhandari000 | Repo initialized from the Figma export (`bdcceae`); first backend feature attempt (assessment creation for admin, then rolled back for supervisor) |
| 07-06 – 07-12 | arthleo, kishorebhandari000, Piash89, jaspreets0 | **Real backend stood up** (`48a88c0` — auth/users/profile wired to the frontend for the first time); branding rename; email notifications introduced |
| 07-13 – 07-19 | kishorebhandari000, Pijush11 | "Week 3" push — Assessment + Project + Allocation models, controllers, notifications, and matching frontend pages (`d837846`, `28e0120`); admin user-management endpoints added (Pijush11) |
| 07-20 – 07-26 | Pijush11, arthleo, Piash89 | Route protection (`ProtectedRoute`, global 401 handling); **Forum backend built and wired end-to-end**; **Discussions built end-to-end in one day** (Piash89, 6 commits); access-control fixes for tasks/discussions (Pijush11); dependency-install fix (react/react-dom to `dependencies`) |
| 07-27 – 08-02 | Piash89, arthleo, kishorebhandari000 | Lockfile corruption fixed and re-broken and fixed again (`dfd7fdd`/`217f47d`); profile-avatar refactor across roles; Google Sheets contact-form logging added; **allocation policy churn** (admin approve/reject added, reverted same day); **Submission model + full upload/grading pipeline built in one day** (Piash89); Cloudinary local-disk fallback added; **Group model + group-application flow introduced**, replacing solo apply |
| 08-03 – 08-09 | Piash89, kishorebhandari000, Pijush11, arthleo, jaspreets0 | **Messages rebuilt from a mock UI to a real, real-time-backed feature** (Piash89); admin assessment-overview fixed to read real Submission data (Pijush11); Feedback/GradeSubmission pages removed as dead weight (arthleo); notification links refactored to a shared component; reports summary enhanced; password-strength rules added |
| 08-10 – 08-16 | Piash89, jaspreets0, Pijush11, kishorebhandari000 | SectionHint tooltip component built and wired into nav (Piash89); messaging search added then hotfixed same window (jaspreets0/Piash89); admin project search/filter added (Pijush11); **Week 6 progress doc committed** (`afa4824`) — a real internal team milestone marker; Jaspreet's message search bug fixed (arthleo) |
| 08-17 – 08-23 | Piash89, kishorebhandari000, arthleo | Sidebar tooltip redone directly on main (superseding an unmerged branch, §J7); supervisor dashboard stats corrected to read from `/submissions`; confirmation step added before a supervisor decides a student's allocation; deadline-extension feature; emoji reactions added to Forum/Discussions |
| 08-24 – 08-25 | arthleo | **Final push**: full group-management UI (My Group for students, My Students for supervisors) with undo; supervisor Submissions/grading page with search; hourly assessment-reminder background job — the three newest, most recently-verified features in the app |

### J7. Collaboration friction

- **Merge conflicts, concretely**: `5463807` (Aug 1, kishorebhandari000, "merge and
  resolve conflicts," 48 files) and its immediate follow-up `84e2bb7` ("Resolve merge
  conflict in NewForumPost.tsx - keep public forum version") are the two commits with
  real conflict-resolution content (as opposed to the other ~20 merge commits in the
  history, which are clean fast-forwards/no-op merges). The `84e2bb7` diff shows the
  actual collision: one line of history had `admin/ManageForum.tsx` (an admin-only
  forum page) and `admin/NewForumPost.tsx`; the other had the generic, all-roles
  `Forum.tsx`/`NewForumPost.tsx` this dossier documents in §D/§E — two people had
  independently evolved the same feature in incompatible directions (admin-exclusive vs.
  universal), and the merge resolution picked the universal version, immediately
  reinforced by the very next substantive commit, `653e09c` "make forum generic across
  all three roles."
- **The same merge also reveals a second collision**: `supervisor/Allocations.tsx`
  (175 new lines) and `admin/EditProject.tsx` (163 new lines) both appear as brand-new
  files in that single merge — i.e. two people built allocation/project-management UI
  on parallel branches at the same time. `EditProject.tsx` survived and is in active use
  today (§D). `supervisor/Allocations.tsx` did not — it was never given a route, and its
  job (reviewing pending student/group applications) was instead absorbed into
  `supervisor/ManageProjects.tsx`'s group-review section, built out over the following
  three weeks. This is the concrete instance of "two people built the same thing twice";
  one version won, the other was quietly orphaned rather than deleted.
- **A same-person, same-idea redo (not a two-person collision, but adjacent)**:
  `cdd5bca` "Replace sidebar info buttons with hover tooltips" (Piash89, 2026-08-16) was
  committed to a branch (`sidebar-tooltips`) that was never merged; the *identical*
  change was then redone directly on `main` the next day as `e649fe4` "fix(ui): replace
  sidebar info button with hover/focus tooltip" (also Piash89). The branch is still
  present in the repo (`git branch -a`) but is now fully redundant.
- **A second genuinely abandoned branch**: `feature/admin-project-search`
  (Pijush11 — `cbcad7e`/`80f1898`/`a06072a`, all 2026-08-16) adds "creation date and
  group size on project cards" and card sorting to the admin Manage Projects page.
  **This work was never merged and was not independently redone** — the admin
  `ManageProjects.tsx` on `main` today (read directly for this dossier, §E) has search
  and status/supervisor filtering but no creation date, no group-size display, and no
  sorting. This is real, unmerged, still-relevant work sitting on an unmerged branch —
  not a stale duplicate.
- **A revert as disagreement, not a bug fix**: `01af831` → `8ee706a` (§J3, §I) — same
  author, same day, opposite policy. Reads as the author (or the team, via Piash89)
  testing a stricter allocation-approval model and rolling it back within hours, rather
  than two independent decisions.
- **Branches created**: 3 besides `main` — `feature/week6-section-hints` (merged, via
  `7f41cbd`), `sidebar-tooltips` (abandoned, superseded on `main`), and
  `feature/admin-project-search` (abandoned, genuinely unmerged work). A 4th,
  `remotes/origin/backend`, is the original backend-scaffold branch, merged long ago via
  `f4f8cd3` and simply never deleted from the remote.
- **Process/quality-of-life friction, not a conflict but worth noting for a "challenges"
  section**: several commit messages are placeholders or near-meaningless (`.` — `b414546`;
  `aa` — `601884d`; `Check it` — `ffe77d0`; `changes to be committed:` — `b43f2ce`; `testing`
  — `0047d23`) — a minor but real process observation about commit hygiene across a
  student team, independent of any actual code collision.

### J8. Contribution summary

**Piash89** — 48 commits, the most of any contributor, and the only one with net-negative
line count (7,898 added vs. 8,354 deleted), reflecting a role skewed toward hardening,
fixing, and refactoring existing features rather than large from-scratch builds:
originated Forum, Discussions (built essentially solo in one day), Messages (rebuilt
from mock to real), Reports, Submission grading, the SectionHint tooltip system, and
the Cloudinary local-disk fallback; also the primary author of the allocation-policy
back-and-forth (`cbe5767`/`01af831`/`8ee706a`) and of most of the small `fix(...)`
conventional-commits scattered across Aug 1–17. Owns roughly a third of `Sidebar.tsx`
and `app.js` by current-line blame.

**arthleo** — 34 commits, 21,566 lines added (second-highest by volume, inflated in part
by two large pnpm-lockfile regenerations totalling ~13,500 lines). Built the original
real-email notification system, the Notification Bell UI, Forgot Password, Google
Sheets contact-form logging, and — in the final day of the project's history — the
entire group-management UI (student "My Group," supervisor "My Students," undo
workflow), the supervisor Submissions/grading page, and the assessment-reminder
background job (§J6, week of Aug 24–25). Owns 29–45% of the group/allocation-adjacent
files they touched (`groupController.js`, `ManageProjects.tsx`) by blame, reflecting
substantial rework of kishorebhandari000's earlier versions rather than fresh authorship.

**kishorebhandari000** — 30 commits but the highest total line volume (30,306 added),
dominated by the 16,986-line initial scaffold import and the "Week 3" backend-foundation
commits (`d837846`, `28e0120`) that established Project/Allocation/Assessment/
Notification. Also built the group-formation origin (`23e6db3`/`248f60b`, later
substantially extended by arthleo), password-requirement rules, and deadline extension.
Owns the majority (55–71%) of the oldest, most foundational files by blame
(`groupController.js`, `Sidebar.tsx`, `ManageProjects.tsx`, `app.js`) — consistent with
being the project's original scaffolder and most persistent long-term contributor
(commits from week 1 through week 7).

**Pijush11** — 15 commits, 2,446 lines added, the most tightly-scoped contributor:
admin user-management endpoints and edit/delete wiring, `ProtectedRoute` + global 401
handling, discussion/task access-control fixes, the admin project-search/filter feature
on `main`, and the genuinely unmerged admin-project-search-enhancement work still
sitting on `feature/admin-project-search` (§J7) — the one contributor with real,
identifiable in-flight work that never reached `main`.

**jaspreets0** — 4 commits, 514 lines added, the smallest footprint: one placeholder
commit (`testing`), a low-quality-message commit (`aa`), one real feature contribution
(messaging search, `22d150e`, which needed a same-day hotfix from Piash89 in `a91e45f`),
and one assessment-related save (`412669e`).

---

## K. PROBLEMS, LIMITATIONS AND KNOWN ISSUES

Every item below was found directly in the code, not inferred.

- **Dead/orphaned frontend page**: `src/app/pages/supervisor/Allocations.tsx` — fully
  implemented, calls real endpoints, has zero route in `routes.tsx` and zero incoming
  link anywhere in `src/` (§E, §J7).
- **Dead/broken backend route**: `Backend_PMS/src/routes/taskRoutes.js:14-27` — an extra
  `router.post("/tasks/:id/assign", ...)` block placed *after* `module.exports`, using
  `Task`, `User`, and `sendNotification` without importing any of them. It is still
  registered on the exported router object (JS objects are mutated by reference), so it
  is technically reachable at `POST /api/tasks/tasks/:id/assign`, but calling it throws
  an uncaught `ReferenceError` — a real, unguarded runtime crash for anyone who hits it,
  currently only unreachable because no frontend page does (§D, §H).
- **Entire Task feature has no UI**: model, controller (5 working endpoints), and routes
  exist; no page under `src/app/pages` calls `/api/tasks`. Backend-complete, frontend-absent.
- **Route/controller permission mismatches** (not security holes, but real
  inconsistencies a reviewer should not have to rediscover): `PUT`/`DELETE
  /projects/:id` roleGuard lists `supervisor`, controller blocks them anyway;
  `PUT /submissions/:id/grade` roleGuard lists only `supervisor`, controller separately
  allows `admin` (§D).
- **Dependency confusion in the frontend `package.json`**: it lists `express`,
  `mongoose`, `jsonwebtoken`, `bcryptjs`, `socket.io`, `multer`, `cloudinary`,
  `nodemailer`, `morgan`, `dotenv`, `esbuild`, `rollup` — all backend-shaped packages —
  despite there being no backend code anywhere at the repo root; the real backend lives
  entirely in `Backend_PMS/` with its own independent `package.json` (different
  `mongoose` major version: 8 there vs. 9 declared at the root). These root-level
  entries appear to be dead weight, not a second backend (§B).
- **Confirmed-unused frontend dependencies**: `@mui/material`/`@mui/icons-material`
  (zero imports anywhere under `src/`); `recharts` (only reachable through
  `components/ui/chart.tsx`, which no page imports); the `carousel`/`command`/`drawer`
  shadcn primitives and their backing libraries (`embla-carousel-react`, `cmdk`,
  `vaul`) show the same unreached pattern. The 48-file `components/ui/` directory as a
  whole is largely unwired Figma-export boilerplate — real, working UI is hand-rolled
  Tailwind on every page actually routed.
- **Uncommitted-secret risk is mitigated but present by convention only**: `Backend_PMS/.env`
  exists on disk and is correctly gitignored (`.gitignore` includes `.env`), but there is
  **no `.env.example`** anywhere in the repo — a fresh clone has no template for the ~13
  required environment variables (§B) and would fail to start (`connectDB()` throws if
  `MONGO_URI` is unset; `generateToken` throws if `JWT_SECRET` is unset) without
  out-of-band instructions from a teammate.
- **No automated cascade on user/project deletion** — deleting a `User` or `Project`
  leaves orphaned `Allocation`/`Submission`/`Message`/`Group`/`Notification` documents
  pointing at a now-missing ref; several read paths defensively `.filter()` these out
  client-side (e.g. `supervisor/Dashboard.tsx:55`) rather than the data never existing in
  a broken state to begin with (§I, "data consistency and referential integrity").
- **No rate limiting anywhere** — login, forgot-password, and the un-UI'd
  `/auth/register` are all callable without limit (§H).
- **No file-type allow-list on uploads** — only a 25MB size cap; Cloudinary's
  `resource_type: 'auto'` accepts anything within that.
- **In-memory socket registry doesn't survive a restart or scale past one process** —
  `Backend_PMS/src/utils/realtime.js` keeps `userId → socketId` in a plain in-process
  `Map`; a server restart silently drops every "who's online" mapping until each client
  reconnects and re-emits `register` (harmless in practice since the frontend does this
  automatically, but it means realtime delivery — not the underlying data — is lost for
  any message sent in the gap, and this design would not survive horizontal scaling to
  more than one Node instance without a shared adapter).
- **Feature removed mid-project, evidence in history not current code**: `e277abd`
  ("Removed Feedback and GradeSubmission pages... Removed the feature for students to
  change their email") confirms both a page removal and a deliberate feature cut
  (self-service email change) — consistent with `student/Profile.tsx`'s read-only email
  field today, but only discoverable by reading git history, not the current tree alone.
- **Config that must be supplied manually for a fresh clone to be fully functional**:
  `MONGO_URI` (a running MongoDB instance), `JWT_SECRET`, SMTP credentials (or every
  email-triggering action silently fails server-side, caught by `.catch()` and logged
  but never surfaced to the user), and — optionally, degrading gracefully via the
  local-disk fallback — Cloudinary credentials. Google Sheets logging degrades
  gracefully (best-effort, swallowed errors) if unconfigured.

---

## L. TESTING

**There is no automated testing anywhere in this repository.** Confirmed by an
exhaustive search for `*.test.*` and `*.spec.*` files: every match found is inside
`node_modules` (test files belonging to third-party dependencies themselves, e.g.
`react-day-picker`, `simple-update-notifier`) — zero test files exist under `src/` or
`Backend_PMS/src/`. Neither `package.json` (root or `Backend_PMS/`) declares a test
runner (no Jest, Vitest, Mocha, Supertest, Playwright, or Cypress in either
dependency list), and neither `scripts` block defines a `test` command — the backend's
scripts are only `start`/`dev` ([Backend_PMS/package.json:7-10](Backend_PMS/package.json#L7-L10)), the frontend's only
`build`/`dev` ([package.json:6-9](package.json#L6-L9)). There is also no CI configuration
(`.github/workflows/` does not exist) that could have been running tests remotely.

What the evidence suggests was actually used instead of automated tests:

- **Manual, iterative dev-loop testing** — the sheer density of same-day/next-day
  hotfix commits (`a91e45f` fixing `22d150e` the same day; `01af831`/`8ee706a` reverted
  within hours; `dfd7fdd`/`217f47d` fixing/re-breaking the lockfile) is the pattern of a
  team running the app locally, finding a break, and pushing a fix — not a suite
  catching regressions before merge.
- **Defensive coding as a substitute for test coverage** — the self-healing logic for
  legacy Project records ([projectController.js:126-131](Backend_PMS/src/controllers/projectController.js#L126-L131)), the `.filter()` guards
  against orphaned refs on the supervisor dashboard, and the consistent
  `try/catch`-with-fallback-message pattern on every frontend data fetch all read as
  responses to bugs actually encountered while manually exercising the app, then coded
  around rather than covered by a regression test.
- **A written progress-tracking document**: `docs/week6-progress.md` and the
  `afa4824` "docs: add Week 6 progress summary" commit indicate the team kept a manual,
  narrative record of what had been verified working each week — a process substitute
  for a test report, not a replacement for one.
- **No evidence of manual QA scripts, a bug tracker, or a staging environment** either —
  UNVERIFIED beyond what's in the repo; the team may have used an external tool (e.g. a
  shared spreadsheet, Trello board, or Discord channel) not reflected in version control.

For a report, this should be stated plainly: automated test coverage is **0%**, and
correctness was maintained through manual verification and rapid iteration rather than
a test suite.

---

## M. FIGURE / SCREENSHOT SHOT-LIST

12 suggested captures, each naming the exact route or file to screenshot/crop and what
it demonstrates. Routes assume a locally running instance (`http://localhost:5173`).

1. **`/login`** — clean, minimal login form with the show/hide password toggle.
   *Caption: "Single login entry point for all three roles; the app redirects by role after auth."*
2. **`/admin/users`** (with the "Add User" modal open, role = Student) — shows the
   auto-generated student ID / login email notice.
   *Caption: "Admin provisions accounts directly — students and supervisors don't self-register; IDs and login emails are generated automatically."*
3. **`/student/projects`** (with the "Apply as a Group" modal open, teammate search
   showing one "already committed" greyed-out result).
   *Caption: "Group application flow — a student proposes a project with teammates in one step; already-committed students are visibly blocked from joining."*
4. **`/supervisor/projects`** (Pending Your Review section, a group card expanded).
   *Caption: "Two-stage allocation: the supervisor recommends a group before an admin gives the final allocation."*
5. **`/admin/allocation`** (Groups Awaiting Final Allocation + the Force-Assign form).
   *Caption: "Admin's final-allocation queue, plus the force-assign safety net that bypasses the normal request flow entirely."*
6. **`/supervisor/assessments`** (a template row with the visibility toggle and an
   extend-deadline panel open).
   *Caption: "Assessment templates are created once by admin, then released per-project by each supervisor — this toggle is that release control."*
7. **`/student/assessments`** (one graded submission expanded, showing mark + written
   feedback + the original uploaded file link).
   *Caption: "Student-facing grade release: mark, written feedback, and the submitted file, all in one place."*
8. **`/supervisor/assessments/submissions`** (the grading panel open on a pending
   submission, mark/feedback form visible).
   *Caption: "Supervisor grading workflow — the same action that sets the mark also publishes it to the student."*
9. **`/student/groups`** — the "My Group" roster with the Message button.
   *Caption: "A student's own group, with a direct link into real-time messaging with a teammate."*
10. **[src/app/pages/supervisor/Allocations.tsx](src/app/pages/supervisor/Allocations.tsx)
    open in an editor next to [src/app/routes.tsx](src/app/routes.tsx)** (a code crop, not
    a browser screenshot) — highlight that no route imports/references this file.
    *Caption: "A fully-implemented page with zero route — concrete evidence of dead code found during this audit."*
11. **`/admin/reports`** — the live-refreshing Submission Statistics bars with the
    pulsing "Live" indicator visible.
    *Caption: "Admin's system-wide dashboard, polling the real aggregate endpoint every 10 seconds."*
12. **Mobile viewport (~375px) of `/student/dashboard`** — the collapsed hamburger
    sidebar and mobile top bar.
    *Caption: "Responsive layout: a dedicated mobile drawer nav, not just a squeezed desktop layout."*
13. **[Backend_PMS/src/routes/taskRoutes.js](Backend_PMS/src/routes/taskRoutes.js), lines
    1–27, in an editor** (a code crop) — highlight the route registered after
    `module.exports` referencing undefined `Task`/`User`/`sendNotification`.
    *Caption: "A real bug found by code review: this route is still reachable but will crash with a ReferenceError if ever called."*
14. **[COMMIT_LOG.md](COMMIT_LOG.md) or a terminal running `git shortlog -sn --all`**
    (a text/terminal capture).
    *Caption: "131 commits across 5 contributors over 8 weeks — the team's actual, git-verified delivery cadence."*
15. **`/forum/:id`** viewed while logged out (no sidebar, just Navbar/Footer chrome), next
    to the same thread viewed logged in (full app chrome).
    *Caption: "The public Forum is deliberately readable by anonymous visitors — a scope decision that came out of a real merge conflict during development (see §J7)."*
