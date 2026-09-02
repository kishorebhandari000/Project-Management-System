# System Dossier — Project Management System (PMS)
### Part 1 of 2: Sections A–F — see [SYSTEM_DOSSIER_2.md](SYSTEM_DOSSIER_2.md) for G–M

Compiled by reading the codebase directly (models, controllers, routes, every frontend
page, configs, and full git history) as of `git log -1` = `8d98545` (2026-08-25), the
current tip of `main` at the time of writing. All file paths are repo-relative.
`Backend_PMS/` is the API server; everything else at the repo root is the Vite/React
frontend. Every claim below is anchored to a specific file (and line, where useful) —
nothing here is inferred from naming conventions or assumed from the feature list.

Labels used throughout: **BUILT & WORKING** / **PARTIAL** / **NOT BUILT** / **UNVERIFIED**.

---

## A. SYSTEM OVERVIEW

PMS is a final-year-project (capstone) management system for a university department.
Three roles use it:

- **Student** — browses projects, applies alone or forms a group to apply together,
  gets allocated to (at most) one project, sees assessments released for that project,
  uploads submission files, sees marks/feedback, messages their supervisor/groupmates,
  participates in project-scoped discussions and a public forum, gets notified (in-app
  + email) of decisions and deadlines.
- **Supervisor** — owns projects (assigned by an admin, not self-created), reviews and
  approves/rejects student and group applications on their own projects, releases
  assessment templates to their projects, grades submissions, extends per-project
  deadlines, discusses/messages with their students.
- **Admin** — creates/edits/deletes projects and assigns a supervisor to each, creates
  user accounts (students/supervisors) with auto-generated IDs/emails, creates the
  shared assessment templates, makes final allocation decisions (and can force-assign
  as a safety net), views system-wide reports.

### Folder structure (meaningful directories only)

```
Project-Management-System/
├── src/app/                          # frontend (Vite + React 18 + TypeScript)
│   ├── pages/
│   │   ├── student/                  # 9 pages — student-only routes
│   │   ├── supervisor/               # 11 pages (1 unrouted, see §E) — supervisor-only routes
│   │   ├── admin/                    # 15 pages — admin-only routes
│   │   └── *.tsx                     # Homepage, Login, Forum(+thread/new), password reset, ColorPalette
│   ├── components/                   # shared widgets (Sidebar, NotificationBell, ProfileAvatar, dialogs, etc.)
│   │   └── ui/                       # 48 shadcn/Radix primitives — mostly unused Figma-export boilerplate (§B, §K)
│   ├── hooks/                        # useMessages, useMyProjects, useNotifications, useConfirm, useCommentPrompt
│   ├── lib/                          # api.ts (fetch wrapper), socket.ts, sectionHints.ts, notificationCategories.ts
│   ├── routes.tsx                    # all 45 route definitions
│   └── App.tsx                       # RouterProvider + ConfirmProvider + CommentPromptProvider
├── Backend_PMS/src/                  # backend (Node + Express 4 + Mongoose 8)
│   ├── models/                       # 16 Mongoose schemas (§C)
│   ├── controllers/                  # one file per resource, business logic (§D)
│   ├── routes/                       # one Express router per resource, mounted in app.js (§D)
│   ├── middleware/                   # auth (JWT), roleGuard, upload (multer), errorHandler
│   ├── config/                       # db.js (Mongo connect), cloudinary.js (upload storage), corsOrigin.js
│   ├── utils/                        # asyncHandler, generateToken, mailer, realtime (socket.io), googleSheets, reactions, studentCommitment, validatePassword
│   ├── jobs/assessmentReminders.js   # hourly setInterval job for due-soon/overdue notifications
│   ├── app.js                        # Express app, all route mounts
│   └── server.js                     # HTTP server + socket.io + Mongo connect + reminder job start
├── COMMIT_LOG.md                     # full 131-row commit table (this dossier's companion file)
├── SYSTEM_DOSSIER_1.md               # this file
└── SYSTEM_DOSSIER_2.md               # sections G–M
```

Two other repo-root documents pre-date this dossier and independently corroborate much
of it: `PROJECT_STATUS.md` (self-described as AI-generated from the codebase, last
touched by commit `a7ee1ca`) and `docs/week6-progress.md`. This dossier was produced by
fresh, independent inspection of the current code rather than by copying either.

---

## B. TECHNOLOGY STACK AS BUILT

There are **two separate `package.json`s** — the frontend at the repo root and the
backend at `Backend_PMS/package.json` — each with its own `node_modules` and lockfile.

### Backend — `Backend_PMS/package.json` (this is the code that actually runs as the API)

| Dependency | Version | Used for |
|---|---|---|
| express | ^4.19.2 | HTTP server/router — [app.js](Backend_PMS/src/app.js) |
| mongoose | ^8.5.1 | MongoDB ODM — all 16 models |
| jsonwebtoken | ^9.0.2 | Auth tokens — [generateToken.js](Backend_PMS/src/utils/generateToken.js), [auth.js](Backend_PMS/src/middleware/auth.js) |
| bcryptjs | ^2.4.3 | Password hashing — [User.js:23](Backend_PMS/src/models/User.js#L23) |
| cors | ^2.8.5 | CORS handling — [app.js:14](Backend_PMS/src/app.js#L14) |
| multer | ^2.2.0 | Multipart file upload middleware — [upload.js](Backend_PMS/src/middleware/upload.js) |
| cloudinary + multer-storage-cloudinary | ^1.41.3 / ^4.0.0 | Cloud file storage — [cloudinary.js](Backend_PMS/src/config/cloudinary.js) |
| nodemailer | ^9.0.3 | SMTP email — [mailer.js](Backend_PMS/src/utils/mailer.js) |
| socket.io | ^4.8.3 | Realtime push (chat, notifications) — [realtime.js](Backend_PMS/src/utils/realtime.js) |
| googleapis | ^173.0.0 | Google Sheets logging of contact-form + group-formation events — [googleSheets.js](Backend_PMS/src/utils/googleSheets.js) — **not in the original plan at all** |
| morgan | ^1.10.0 | HTTP request logging (dev) |
| dotenv | ^16.4.5 | `.env` loading |
| nodemon (dev) | ^3.1.4 | Auto-restart in `npm run dev` |

### Frontend — root `package.json` (name `@figma/my-make-file` — originated as a Figma "Make" AI-scaffold, per [README.md](README.md))

| Dependency | Version | Used for |
|---|---|---|
| react / react-dom | ^18.3.1 | UI framework |
| vite | ^6.3.5 | Dev server + build — [vite.config.ts](vite.config.ts) |
| react-router | 7.13.0 | Client routing — [routes.tsx](src/app/routes.tsx) |
| tailwindcss + @tailwindcss/vite | 4.1.12 | Utility-class styling, used hand-rolled on every page |
| @radix-ui/* (16 packages) | various | Primitive behavior for the ~48-file `components/ui/` shadcn library — **only a handful of these are actually wired into real pages** (§K); `@radix-ui/react-tooltip` is genuinely used directly by [Sidebar.tsx:4](src/app/components/Sidebar.tsx#L4) |
| socket.io-client | ^4.8.3 | Realtime client — [socket.ts](src/app/lib/socket.ts) |
| react-hook-form | 7.55.0 | Present, but no page in `src/app/pages` imports it — forms are hand-rolled `useState` everywhere observed |
| styled-components | ^6.4.3 | Actually used — [GetStartedButton.tsx](src/app/components/GetStartedButton.tsx), [LoginButton.tsx](src/app/components/LoginButton.tsx) |
| @mui/material, @mui/icons-material, @emotion/* | 7.3.5 / 11.x | **Confirmed unused** — no import of `@mui/material` or `@mui/icons-material` anywhere under `src/` |
| recharts | 2.15.2 | Only referenced inside `components/ui/chart.tsx`, which itself is not imported by any page — effectively dead |
| react-dnd, react-slick, react-responsive-masonry, canvas-confetti | various | No import found under `src/` — scaffold leftovers |
| cmdk, vaul, embla-carousel-react | various | Back the unused `ui/command.tsx`, `ui/drawer.tsx`, `ui/carousel.tsx` primitives — not reached from any real page |
| mongoose, express, jsonwebtoken, bcryptjs, socket.io, multer, cloudinary, nodemailer, morgan, dotenv, esbuild, rollup | various | **Listed in the frontend's `package.json` but there is no backend code anywhere under the repo root outside `Backend_PMS/`** — these are dead/vestigial entries in a pure-frontend package (see §K) |
| lucide-react | 0.487.0 | Icon set, used throughout (e.g. [Login.tsx:3](src/app/pages/Login.tsx#L3)) |
| sonner | 2.0.3 | Toast notifications — used by [useNotifications.ts](src/app/hooks/useNotification.ts) |

### Planned (per the brief) vs. actually used

| Layer | Planned | Actually used | Why |
|---|---|---|---|
| Frontend | React | React 18 + Vite + TypeScript + react-router 7 | Matches plan; TS/Vite/router are reasonable implementation choices not specified in the plan |
| Backend | Node.js + Express | Node.js + Express 4 | Matches plan exactly |
| Database | PostgreSQL + Prisma ORM | **MongoDB + Mongoose** | Confirmed via [db.js](Backend_PMS/src/config/db.js) (`mongoose.connect(process.env.MONGO_URI)`) and every model file using `mongoose.Schema`. Full pivot away from the relational plan — all "relationships" are Mongoose `ObjectId` refs with app-level `.populate()`, not foreign keys/joins |
| Auth | JWT + bcrypt | JWT (`jsonwebtoken`) + bcrypt (`bcryptjs`) | Matches plan |
| Notifications/realtime | Nodemailer + Socket.io | Nodemailer + Socket.io | Matches plan exactly — see [notificationController.js:8-28](Backend_PMS/src/controllers/notificationController.js#L8-L28) (every in-app notification also sends an email) and [realtime.js](Backend_PMS/src/utils/realtime.js) |
| File uploads | Cloudinary + Multer | Cloudinary + Multer, **with an unplanned local-disk fallback** | [cloudinary.js:7-49](Backend_PMS/src/config/cloudinary.js#L7-L49): if `CLOUDINARY_CLOUD_NAME`/`CLOUDINARY_API_KEY`/`CLOUDINARY_API_SECRET` aren't set, uploads silently fall back to `Backend_PMS/uploads/` on local disk, served via `app.use('/uploads', ...)` ([app.js:20](Backend_PMS/src/app.js#L20)). Added in commit `c5ea85d` (2026-08-02) specifically because Cloudinary wasn't configured in dev |
| Hosting | Vercel + Render | **No evidence of either** | No `vercel.json`, `render.yaml`, `Procfile`, `netlify.toml`, or `.github/workflows/` anywhere in the repo. A `dist/` folder exists (a local `vite build` was run at some point) but there is no deployment configuration checked in — **appears local-only / undeployed as of this snapshot** (UNVERIFIED beyond the repo's own contents — the team may deploy manually outside version control) |

### Runtime setup

- **Ports**: backend defaults to `5000` (`process.env.PORT || 5000`, [server.js:20](Backend_PMS/src/server.js#L20)); frontend Vite dev server is hardcoded to `5173` with `strictPort: true` ([vite.config.ts:37-40](vite.config.ts#L37-L40)).
- **Starting it**: `npm run dev` in `Backend_PMS/` (nodemon) and `npm run dev` at the repo root (vite) — two separate processes, no root-level script orchestrates both.
- **CORS**: any `http://localhost:*` or `http://127.0.0.1:*` origin is allowed, plus whatever `CLIENT_ORIGIN` is set to — [corsOrigin.js](Backend_PMS/src/config/corsOrigin.js), added in `49d49ab` specifically because Vite's auto-incrementing port kept breaking a fixed-origin CORS config.
- **Required env vars** (backend, inferred from `process.env.*` reads across the codebase — no `.env.example` exists in the repo, only a gitignored `Backend_PMS/.env` whose contents were not read for this report): `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN` (optional, defaults `'7d'`), `PORT` (optional, defaults `5000`), `CLIENT_ORIGIN`, `SMTP_HOST`, `SMTP_PORT` (optional, defaults `587`), `SMTP_USER`, `SMTP_PASS`, `CLOUDINARY_CLOUD_NAME`/`CLOUDINARY_API_KEY`/`CLOUDINARY_API_SECRET` (optional — local-disk fallback if absent), `CONTACT_EMAIL` (optional), `GOOGLE_SERVICE_ACCOUNT_EMAIL`/`GOOGLE_PRIVATE_KEY`/`GOOGLE_SHEET_ID` (optional — Sheets logging is best-effort/fire-and-forget and swallows its own errors if absent, see [contactController.js:15-17](Backend_PMS/src/controllers/contactController.js#L15-L17)), `NODE_ENV` (controls whether stack traces are returned by the error handler).
- **Frontend env var**: `VITE_API_URL` (optional, defaults `http://localhost:5000/api` — [api.ts:1](src/app/lib/api.ts#L1)).

---

## C. DATA MODEL

16 Mongoose models under `Backend_PMS/src/models/`. All use `{ timestamps: true }`
(adds `createdAt`/`updatedAt`) except `reactionSchema` (a subdocument, `{ _id: false }`).

### User — [User.js](Backend_PMS/src/models/User.js)
| Field | Type | Notes |
|---|---|---|
| name | String | required, trimmed |
| email | String | required, unique, lowercase, trimmed |
| password | String | required, min length 8, `select: false` (never returned by default queries) |
| role | String | enum `admin`/`supervisor`/`student`, default `student` |
| phone, address, personalEmail | String | optional profile fields, default `''` |
| resetPasswordToken, resetPasswordExpires | String / Date | `select: false` |
| studentId | String | unique, **sparse** (only students have one) |

Hooks: `pre('save')` hashes `password` with bcrypt (10 rounds) only if modified
([User.js:21-24](Backend_PMS/src/models/User.js#L21-L24)). Methods: `comparePassword`,
`createResetToken` (32-byte random token, SHA-256 hashed at rest, 1-hour expiry, raw
token only ever goes in the email link — [User.js:30-35](Backend_PMS/src/models/User.js#L30-L35)).

### Project — [Project.js](Backend_PMS/src/models/Project.js)
title (required), description (required), category (free string), supervisor (ref
User, required), createdBy (ref User, required), maxStudents (default 1), status (enum
`open`/`allocated`/`closed`, default `open`), files (embedded array of `{url, name,
uploadedAt}`).

### Allocation — [Allocation.js](Backend_PMS/src/models/Allocation.js)
project (ref Project, required), student (ref User, required), supervisor (ref User,
required — a snapshot, kept in sync on every decision), status (enum
`pending`/`approved`/`rejected`, default `pending`), decidedAt, comment (rejection
reason). **Compound unique index** on `(project, student)` — a student can request the
same project only once.

### Group — [Group.js](Backend_PMS/src/models/Group.js)
name (optional), project (ref Project, required), supervisor (ref User, required),
leader (ref User, required), members (array of ref User, required), status (enum
`pending`/`supervisor_approved`/`approved`/`rejected`, default `pending`), decidedAt,
decidedBy (ref User — who made the current-stage decision, enables undo-your-own-decision
logic), comment. No unique index — legitimately allows multiple groups per project up to
`MAX_GROUPS_PER_PROJECT` (= 2, a constant in [groupController.js:14](Backend_PMS/src/controllers/groupController.js#L14), not stored on the model).

### Assessment — [Assessment.js](Backend_PMS/src/models/Assessment.js)
A **shared template**, not per-student or per-project: title (required), description,
category (enum `tutorial`/`report`/`presentation`, required), dueDate, files (embedded
array, same shape as Project.files).

### AssessmentVisibility — [AssessmentVisibility.js](Backend_PMS/src/models/AssessmentVisibility.js)
The join between Assessment and Project: assessment (ref, required), project (ref,
required), visible (Boolean, default `false`), extendedDueDate (Date, default `null` —
a per-project override of the template's own `dueDate`). **Compound unique index** on
`(assessment, project)`. Absence of a record ≡ not visible.

### AssessmentReminder — [AssessmentReminder.js](Backend_PMS/src/models/AssessmentReminder.js)
A dedup ledger for the reminder job: assessment, project, student (all ref, required),
type (enum `due_soon`/`overdue`, required). **Compound unique index** on all four fields
— guarantees each student is reminded at most once per milestone per assessment.

### Submission — [Submission.js](Backend_PMS/src/models/Submission.js)
assessment (ref Assessment, required), student (ref User, required), fileUrl (required),
fileName (required), marks (Number, min 0 max 100, default `null`), feedback (String,
default `''`), status (enum `submitted`/`graded`, default `submitted`), submittedAt
(default now), gradedAt. **Compound unique index** on `(assessment, student)` — a
resubmission **overwrites** the existing document rather than creating a new version
(see §I — no submission-history/versioning exists).

### Task — [Task.js](Backend_PMS/src/models/Task.js)
title (required), description, status (enum `todo`/`in_progress`/`done`, default
`todo`), priority (enum `low`/`medium`/`high`, default `medium`), dueDate, project (ref,
required), assignee (ref User), createdBy (ref User, required). **This model has a
controller and routes but no corresponding frontend page anywhere in `src/app/pages` —
a fully backend-only, UI-less feature** (see §D, §K).

### Forum — [ForumPost.js](Backend_PMS/src/models/ForumPost.js) / [ForumComment.js](Backend_PMS/src/models/ForumComment.js)
ForumPost: title, body (both required, trimmed), createdBy (ref User), reactions
(embedded `reactionSchema[]`). ForumComment: body (required), author (ref User), post
(ref ForumPost, required), reactions.

### Discussions — [DiscussionThread.js](Backend_PMS/src/models/DiscussionThread.js) / [DiscussionPost.js](Backend_PMS/src/models/DiscussionPost.js)
DiscussionThread: title, content (both required), status (enum `open`/`closed`, default
`open`), project (ref Project, required — **project-scoped**, unlike the public Forum),
createdBy, reactions. DiscussionPost: content (required), thread (ref, required),
createdBy, reactions.

### Message — [Message.js](Backend_PMS/src/models/Message.js)
sender, recipient (both ref User, required), content (required, trimmed), read
(Boolean, default `false`). Non-unique index on `(sender, recipient, createdAt)` for
conversation-history queries.

### Notification — [Notification.js](Backend_PMS/src/models/Notification.js)
user (ref User, required), type (String, default `'general'` — used as a free-text
discriminator, not an enum), title, message (both required), link (optional, a frontend
route), read (Boolean, default `false`).

### reactionSchema — [reactionSchema.js](Backend_PMS/src/models/reactionSchema.js)
Not a top-level model — an embedded subdocument shared by ForumPost/ForumComment/
DiscussionThread/DiscussionPost: emoji (required), user (ref User, required),
`{ _id: false }`.

### Relationships (in words)
- **User 1—N Project** (as `supervisor`, and separately as `createdBy`, always an admin).
- **User N—M Project** via **Allocation** (one active/approved allocation per student in
  practice, enforced at the application layer, not the schema — see §H).
- **User N—M Project** via **Group** (a group is a bundle of students applying together;
  finalizing a group creates one Allocation per member — [groupController.js:183-217](Backend_PMS/src/controllers/groupController.js#L183-L217)).
- **Assessment N—M Project** via **AssessmentVisibility** (release control) — Assessment
  itself has no direct link to Project or User.
- **Submission** links one Assessment to one User (student) — effectively the resolution
  of "is this project's assessment done, by whom, with what grade."
- **DiscussionThread** belongs to exactly one Project; **DiscussionPost** belongs to
  exactly one DiscussionThread. **ForumPost/ForumComment** are global, no Project link.
- **Message** is a simple directed edge between two Users; conversations are derived by
  querying both directions, not stored as a separate "conversation" entity.
- **Task** links to a Project and optionally an assignee — orphaned from the UI (see
  above), so this relationship exists in the schema/API but is never exercised by any
  known workflow.

### Legacy / orphaned fields
- `Allocation.supervisor` and `Group.supervisor` are **snapshots** taken at creation
  time; several controllers explicitly re-derive the *current* supervisor from
  `Project.supervisor` instead of trusting the snapshot, because an admin can reassign a
  project's supervisor later and the snapshot would go stale (documented inline, e.g.
  [allocationController.js:72-77](Backend_PMS/src/controllers/allocationController.js#L72-L77)). The snapshot fields are still written and still read in places (e.g.
  the `getAllocations` populate), so they are not fully dead, but they are a known
  source of drift the code works around rather than a normalized source of truth.
- `Project.createdBy` and `Project.status` are self-healed on edit for "legacy records"
  missing them ([projectController.js:126-131](Backend_PMS/src/controllers/projectController.js#L126-L131)) — direct evidence that at least one
  pre-schema-change Project document existed in a real dev database at some point.

---

## D. COMPLETE API SURFACE

Mount points, from [app.js:24-39](Backend_PMS/src/app.js#L24-L39):

```
/api/health         inline handler in app.js (public)
/api/auth            → authRoutes.js
/api/users            → userRoutes.js
/api/projects          → projectRoutes.js
/api/tasks              → taskRoutes.js
/api/profile              → profileRoutes.js
/api/forum                 → forumRoutes.js
/api/discussions             → discussionRoutes.js
/api/allocations               → allocationRoutes.js
/api/notifications                → notificationRoutes.js
/api/assessments                    → assessmentRoutes.js
/api/submissions                      → submissionRoutes.js
/api/reports                            → reportsRoutes.js
/api/messages                             → messageRoutes.js
/api/contact                                → contactRoutes.js
/api/emails                                   → emailRoutes.js
/api/groups                                     → groupRoutes.js
/uploads   → express.static(UPLOADS_ROOT) — serves local-disk-fallback files ([app.js:20](Backend_PMS/src/app.js#L20))
```

`protect` = JWT auth required ([auth.js](Backend_PMS/src/middleware/auth.js)). `roleGuard(...)` = role
whitelist, applied after `protect`. Where a route's `roleGuard` is broader than what the
controller actually allows, this is called out explicitly — it is a real discrepancy in
the code, not a report error.

### Auth — `/api/auth` ([authRoutes.js](Backend_PMS/src/routes/authRoutes.js))
| Method | Path | Middleware | Controller | What it does | Returns | Callable by |
|---|---|---|---|---|---|---|
| POST | /register | none | register | Self-service signup; role always defaults to `student` (nothing lets a caller pick `admin`/`supervisor` here) | `{token, user}` | Unauthenticated |
| POST | /login | none | login | Verifies email+password, issues JWT | `{token, user}` | Unauthenticated |
| POST | /forgot-password | none | forgotPassword | Always returns the same message whether or not the email exists (anti-enumeration); emails a reset link if it does | `{message}` | Unauthenticated |
| POST | /reset-password/:token | none | resetPassword | Validates hashed token + expiry, sets new password | `{message}` | Unauthenticated |
| GET | /me | protect | getMe | Returns the full `req.user` document (minus `select:false` fields) | `{user}` | Any authenticated |

### Users — `/api/users` ([userRoutes.js](Backend_PMS/src/routes/userRoutes.js), all routes behind `protect`)
| Method | Path | Middleware | Controller | What it does | Returns | Callable by |
|---|---|---|---|---|---|---|
| GET | /search-students?q= | protect only | searchStudents | Name/email/studentId search (min 2 chars) for group-formation UI; flags each result `alreadyCommitted` | `{users}` | Any authenticated |
| POST | / | roleGuard('admin') | createUser | Creates a student (auto studentId + `{id}@pms.edu` email) or supervisor (auto `first.last@pms.edu` email) | `{user}` | Admin |
| GET | /?role= | roleGuard('admin') | getUsers | Lists users, optional role filter | `{count, users}` | Admin |
| PUT | /:id | roleGuard('admin') | updateUser | Edits name/email/role of any user | `{user}` | Admin |
| DELETE | /:id | roleGuard('admin') | deleteUser | Hard-deletes a user (no cascade to their Allocations/Submissions/etc.) | `{message}` | Admin |

### Profile — `/api/profile` ([profileRoutes.js](Backend_PMS/src/routes/profileRoutes.js), all behind `protect`, no role restriction)
| Method | Path | Controller | What it does | Callable by |
|---|---|---|---|---|
| GET | / | getMe | Own profile (name/email/role/phone/address/personalEmail) | Any authenticated |
| PUT | / | updateMe | Update own name/phone/address/personalEmail (not email — no route does) | Any authenticated |
| PUT | /password | changePassword | Change own password (requires current password) | Any authenticated |

### Projects — `/api/projects` ([projectRoutes.js](Backend_PMS/src/routes/projectRoutes.js), all behind `protect`)
| Method | Path | Route roleGuard | Controller | What it does | Callable by (actual, after controller checks) |
|---|---|---|---|---|---|
| GET | / | none | getProjects | Students see only `open` by default; supervisors see only their own by default; supports `?status=`/`?supervisor=` overrides; enriches with seat counts and (for students) joinable open groups | Any authenticated |
| GET | /:id | none | getProjectById | Single project detail | Any authenticated |
| POST | / | admin | createProject | Admin picks the supervisor by ID | Admin |
| PUT | /:id | **admin, supervisor** | updateProject | **Route allows supervisor, but the controller itself 403s anyone but admin** ([projectController.js:122-124](Backend_PMS/src/controllers/projectController.js#L122-L124)) — a supervisor can never actually reach this despite the roleGuard listing them | **Admin only** (discrepancy — see §K) |
| DELETE | /:id | **admin, supervisor** | deleteProject | Same discrepancy — controller checks `role !== 'admin'` and 403s; blocked entirely if the project has any Allocation or visible AssessmentVisibility | **Admin only** (discrepancy) |
| POST | /:id/files | admin | addProjectFile | Uploads one file (multer, 25MB cap) to a project | Admin |

### Tasks — `/api/tasks` ([taskRoutes.js](Backend_PMS/src/routes/taskRoutes.js), all behind `protect`, no `roleGuard` at all)
| Method | Path | Controller | What it does | Callable by |
|---|---|---|---|---|
| POST | / | createTask | Creates a Task on a project | Any authenticated user with access to that project (admin, that project's supervisor, or a student with an approved Allocation on it) |
| GET | /?project= | getTasks | Lists tasks for a project | Same project-access rule |
| GET | /:id | getTask | Single task | Same |
| PUT | /:id | updateTask | Edit task; notifies new assignee | Same |
| DELETE | /:id | deleteTask | Delete task | Same |

Below `module.exports = router` in this same file sits an **orphaned extra route**,
`router.post("/tasks/:id/assign", ...)` ([taskRoutes.js:14-27](Backend_PMS/src/routes/taskRoutes.js#L14-L27)), that references `Task`, `User`,
and `sendNotification` — **none of which are imported anywhere in this file**. Because
`router` is mutated by reference, this route *is* still registered on the exported
router (reachable at `POST /api/tasks/tasks/:id/assign`), but calling it will throw an
uncaught `ReferenceError` at runtime. This is dead/broken code, not a working feature —
flagged in detail in §K.

**No frontend page anywhere calls `/api/tasks`** — this entire module (model, controller,
5 working routes) is backend-complete but has zero UI. **PARTIAL** at best; from a
user's perspective, **NOT BUILT**.

### Forum — `/api/forum` ([forumRoutes.js](Backend_PMS/src/routes/forumRoutes.js))
Public read, authenticated write; deletion is author-or-admin, enforced in the
controller (not via `roleGuard`).
| Method | Path | Middleware | Controller | Callable by |
|---|---|---|---|---|
| GET | / | none | getPosts | Public |
| POST | / | protect | createPost | Any authenticated |
| GET | /:id | none | getPost | Public |
| DELETE | /:id | protect | deletePost | Post author or admin |
| POST | /:id/react | protect | reactToPost | Any authenticated |
| GET | /:id/comments | none | getComments | Public |
| POST | /:id/comments | protect | createComment | Any authenticated |
| DELETE | /:id/comments/:commentId | protect | deleteComment | Comment author or admin |
| POST | /:id/comments/:commentId/react | protect | reactToComment | Any authenticated |

### Discussions — `/api/discussions` ([discussionRoutes.js](Backend_PMS/src/routes/discussionRoutes.js), all behind `protect`; per-project access enforced in `assertProjectAccess`, [discussionController.js:9-33](Backend_PMS/src/controllers/discussionController.js#L9-L33))
| Method | Path | Controller | Callable by |
|---|---|---|---|
| GET | /?project= | getThreads | Admin, that project's supervisor, or a student with an approved Allocation on it |
| POST | / | createThread | Same |
| GET | /:id | getThread | Same |
| PUT | /:id | updateThread | Thread author or admin |
| DELETE | /:id | deleteThread | Thread author, that project's supervisor, or admin |
| POST | /:id/react | reactToThread | Same project-access rule |
| GET | /:id/posts | getPosts | Same |
| POST | /:id/posts | createPost | Same |
| PUT | /:id/posts/:postId | updatePost | Post author or admin |
| DELETE | /:id/posts/:postId | deletePost | Post author, project supervisor, or admin |
| POST | /:id/posts/:postId/react | reactToPost | Project-access rule |

### Allocations — `/api/allocations` ([allocationRoutes.js](Backend_PMS/src/routes/allocationRoutes.js), all behind `protect`)
| Method | Path | roleGuard | Controller | What it does | Callable by |
|---|---|---|---|---|---|
| GET | /?status= | none | getAllocations | Role-scoped: student→own, supervisor→own projects' allocations, admin→all | Any authenticated |
| POST | / | student | requestAllocation | Solo application to a project; notifies its supervisor + all admins | Student |
| POST | /assign | admin | forceAssignAllocation | Directly creates an approved allocation, clearing any other approved allocation the student held (safety-net override) | Admin |
| PUT | /:id/decision | supervisor, admin | decideAllocation | Approve/reject/undo(`pending`); authorized against the project's *current* supervisor, not the stored snapshot | That project's supervisor, or admin |

### Assessments — `/api/assessments` ([assessmentRoutes.js](Backend_PMS/src/routes/assessmentRoutes.js), `protect` + per-route `roleGuard`)
| Method | Path | roleGuard | Controller | What it does | Callable by |
|---|---|---|---|---|---|
| POST | / | admin | createAssessment | Creates a shared template, starts hidden everywhere | Admin |
| POST | /:id/files | admin | addAssessmentFile | Attaches a file (e.g. brief) to a template | Admin |
| GET | /all | admin | getAllAssessments | All templates + count of projects each is visible to | Admin |
| GET | /my | student | getMyAssessments | Templates visible on the student's currently-approved project, with per-project extended due dates resolved in | Student |
| GET | /supervisor | supervisor | getSupervisorAssessments | Every template × every project the supervisor owns, with current visibility/extension state | Supervisor |
| PUT | /:id/visibility | admin, supervisor | setAssessmentVisibility | Toggles release for one project; supervisor limited to projects they currently own; notifies newly-visible students | Admin (any project), supervisor (own projects only) |
| PUT | /:id/extend-deadline | supervisor **only** | extendDeadline | Per-project deadline extension, must be strictly later than the template's own due date; notifies students if currently visible | Supervisor (own projects only) — admin explicitly excluded at the route level |

### Submissions — `/api/submissions` ([submissionRoutes.js](Backend_PMS/src/routes/submissionRoutes.js), all behind `protect`)
| Method | Path | roleGuard | Controller | What it does | Callable by |
|---|---|---|---|---|---|
| GET | / | none | getSubmissions | Role-scoped: student→own, supervisor→submissions from students currently approved on their projects, admin→all | Any authenticated |
| POST | / | student | createSubmission | Multer file upload (25MB), overwrites any existing un-graded submission for that (assessment, student) pair; blocked if already graded | Student |
| PUT | /:id/grade | supervisor | gradeSubmission | Sets marks (0–100) + feedback, flips status to `graded`; authorization checked against the student's current approved project's supervisor, **admin also allowed as a fallback in the controller body** even though the route's `roleGuard` only lists `supervisor` | Owning supervisor, or admin (controller-level, not route-level) |

### Reports — `/api/reports` ([reportsRoutes.js](Backend_PMS/src/routes/reportsRoutes.js))
| Method | Path | roleGuard | Controller | What it does | Callable by |
|---|---|---|---|---|---|
| GET | /summary | admin | getSummary | Aggregate dashboard stats: totals, allocation completion rate, average grade, pending reviews, per-assessment submission stats, project-category breakdown | Admin |

### Messages — `/api/messages` ([messageRoutes.js](Backend_PMS/src/routes/messageRoutes.js), all behind `protect`)
| Method | Path | Controller | What it does | Callable by |
|---|---|---|---|---|
| GET | /contacts | getContacts | Real relationship-derived contact list (admin: everyone; supervisor: their approved students + admins; student: their approved supervisors + non-rejected groupmates + admins) with last-message preview and unread count | Any authenticated |
| GET | /:userId | getMessages | Full conversation with one allowed contact; marks their messages to you as read | Any authenticated, contact-restricted |
| POST | / | sendMessage | Sends a message to an allowed contact; pushes it live via socket.io | Any authenticated, contact-restricted |
| DELETE | /:messageId | deleteMessage | Deletes a message you sent | Sender only |

### Contact — `/api/contact` ([contactRoutes.js](Backend_PMS/src/routes/contactRoutes.js))
| Method | Path | Controller | What it does | Callable by |
|---|---|---|---|---|
| POST | / | sendContactMessage | Public homepage contact form; emails `CONTACT_EMAIL`/`SMTP_USER` and best-effort logs to Google Sheets | Unauthenticated |

### Emails — `/api/emails` ([emailRoutes.js](Backend_PMS/src/routes/emailRoutes.js))
| Method | Path | roleGuard | Controller | What it does | Callable by |
|---|---|---|---|---|---|
| POST | / | admin, supervisor, student (i.e. any logged-in role, explicitly enumerated) | sendDirectEmail | Free-text SMTP email to any address; **students are restricted server-side to addresses belonging to an existing supervisor account** ([emailController.js:25-27](Backend_PMS/src/controllers/emailController.js#L25-L27)) | Any authenticated (student scope-limited) |

### Groups — `/api/groups` ([groupRoutes.js](Backend_PMS/src/routes/groupRoutes.js), all behind `protect`)
| Method | Path | roleGuard | Controller | What it does | Callable by |
|---|---|---|---|---|---|
| POST | / | student | createGroup | Proposes a group + applies to a project together; caps at 2 non-rejected groups per project; blocks already-committed students | Student |
| POST | /:id/join | student | joinGroup | Joins an existing open group with free seats | Student |
| GET | /my | student | getMyGroups | Groups the caller is a member of | Student |
| GET | / | supervisor, admin | getGroups | Supervisor: groups on their own projects; admin: all | Supervisor, admin |
| PUT | /:id/decision | supervisor, admin | decideGroup | Two-stage workflow: supervisor recommends/rejects → admin gives final allocation (or admin can act directly on a still-pending group) | Owning supervisor (stage 1), admin (stage 1 fallback or stage 2) |
| PUT | /:id/undo-decision | supervisor | undoGroupDecision | Supervisor undoes their own not-yet-finalized decision, back to `pending` | Owning supervisor, own decision only |
| PUT | /:id/undo | admin | undoGroupAllocation | Reverses a finalized allocation, releases the seats | Admin |
| PUT | /:id/members | supervisor, admin | updateGroupMembers | Edits roster of an existing group, syncing Allocation records if already approved | Owning supervisor, admin |
| DELETE | /:id/leave | student | leaveGroup | Non-leader member leaves | Any member except the leader |
| DELETE | /:id | student | withdrawGroup | Leader withdraws the whole (still-pending) request | Group leader only |

---

## E. FRONTEND PAGES

45 route entries in [routes.tsx](src/app/routes.tsx) map to 46 page components (one
component, `Allocations.tsx`, has no route at all). Every page below fetches from the
real API via [api.ts](src/app/lib/api.ts) — **none of the pages currently rendered in
production routes are hardcoded Figma mock data**. Loading/empty/error states are
present on effectively every data-driven page (a consistent pattern, not spot-built).

### Student (`/student/*`, guarded by `ProtectedRoute role="student"`)
| Page | Route | Sidebar nav? | What it does | Key API calls | Status |
|---|---|---|---|---|---|
| [Dashboard.tsx](src/app/pages/student/Dashboard.tsx) | /student/dashboard | Yes ("Dashboard") | Current project, upcoming deadlines, group link | GET /allocations, /groups/my, /assessments/my, /submissions | **REAL** |
| [BrowseProjects.tsx](src/app/pages/student/BrowseProjects.tsx) | /student/projects | Yes ("Browse Projects") | List open projects, apply solo or form/join a group | GET /projects, /allocations, /groups/my; POST /groups, /groups/:id/join; DELETE /groups/:id, /groups/:id/leave; GET /users/search-students | **REAL** |
| [Assessments.tsx](src/app/pages/student/Assessments.tsx) | /student/assessments | Yes ("Assessments") | View released assessments, upload submissions, see marks/feedback | GET /assessments/my, /submissions; POST(upload) /submissions | **REAL** |
| [Groups.tsx](src/app/pages/student/Groups.tsx) | /student/groups | **No** (reachable only via a link on Dashboard) | View own group's roster, message a member | GET /groups/my | **REAL** |
| [Discussions.tsx](src/app/pages/student/Discussions.tsx) | /student/discussions | Yes ("Discussions") | Thread list across the student's approved project(s) | GET /allocations, /discussions?project= | **REAL** |
| [DiscussionThread.tsx](src/app/pages/student/DiscussionThread.tsx) | /student/discussions/:id | (via Discussions list) | Thread view, reply, react, delete (author/admin/supervisor) | GET/POST/DELETE /discussions/:id, .../posts, .../react | **REAL** |
| [NewDiscussion.tsx](src/app/pages/student/NewDiscussion.tsx) | /student/discussions/new | (via Discussions "New Discussion" button) | Create a thread | GET /allocations (via useMyProjects); POST /discussions | **REAL** |
| [Messages.tsx](src/app/pages/student/Messages.tsx) | /student/messages | Yes ("Messages") | Real-time chat tab + one-off email tab | GET /messages/contacts, /messages/:id; POST /messages, /emails; socket.io | **REAL** |
| [Notifications.tsx](src/app/pages/student/Notifications.tsx) | /student/notifications | (bell icon in header) | Notification list, category filter, marks all read on open | GET /notifications; PUT /notifications/read-all | **REAL** |
| [Profile.tsx](src/app/pages/student/Profile.tsx) | /student/profile | (avatar icon in header) | View/edit own profile | GET/PUT /profile | **REAL** |

### Supervisor (`/supervisor/*`, guarded by `ProtectedRoute role="supervisor"`)
| Page | Route | Sidebar nav? | What it does | Key API calls | Status |
|---|---|---|---|---|---|
| [Dashboard.tsx](src/app/pages/supervisor/Dashboard.tsx) | /supervisor/dashboard | Yes | Stats, my-students progress list, pending allocation requests (approve/reject), pending reviews | GET /projects, /allocations, /submissions; PUT /allocations/:id/decision | **REAL** |
| [ManageProjects.tsx](src/app/pages/supervisor/ManageProjects.tsx) | /supervisor/projects | Yes ("Manage Projects") | Group-application review (recommend/reject/undo), per-project enrolled roster + files | GET /projects, /allocations, /groups; PUT /groups/:id/decision, /groups/:id/undo-decision | **REAL** |
| [Students.tsx](src/app/pages/supervisor/Students.tsx) | /supervisor/projects/students | **No** (button on Manage Projects: "My Students") | Current + past students across the supervisor's projects, search, message | GET /allocations?status=approved | **REAL** |
| [ViewProject.tsx](src/app/pages/supervisor/ViewProject.tsx) | /supervisor/projects/:id/view | (link on Manage Projects) | Read-only project detail | GET /projects/:id | **REAL** |
| [Assessments.tsx](src/app/pages/supervisor/Assessments.tsx) | /supervisor/assessments | Yes ("Assessments") | Toggle template visibility per project, extend deadlines | GET /assessments/supervisor; PUT /assessments/:id/visibility, /assessments/:id/extend-deadline | **REAL** |
| [Submissions.tsx](src/app/pages/supervisor/Submissions.tsx) | /supervisor/assessments/submissions | **No** (button on Assessments: "View Submissions") | Grade submissions (marks + feedback), search, category filter | GET /submissions; PUT /submissions/:id/grade | **REAL** |
| [Discussions.tsx](src/app/pages/supervisor/Discussions.tsx) | /supervisor/discussions | Yes | Same pattern as student's | GET /projects (via useMyProjects), /discussions?project= | **REAL** |
| [DiscussionThread.tsx](src/app/pages/supervisor/DiscussionThread.tsx) | /supervisor/discussions/:id | (via list) | Same pattern | GET/POST/DELETE /discussions/... | **REAL** |
| [NewDiscussion.tsx](src/app/pages/supervisor/NewDiscussion.tsx) | /supervisor/discussions/new | (via list) | Same pattern | POST /discussions | **REAL** |
| [Messages.tsx](src/app/pages/supervisor/Messages.tsx) | /supervisor/messages | Yes | Same chat+email pattern as student's | Same as student Messages | **REAL** |
| [Notifications.tsx](src/app/pages/supervisor/Notifications.tsx) | /supervisor/notifications | (bell icon) | Same pattern | GET /notifications | **REAL** |
| [Profile.tsx](src/app/pages/supervisor/Profile.tsx) | /supervisor/profile | (avatar icon) | Same pattern | GET/PUT /profile | **REAL** |
| [Allocations.tsx](src/app/pages/supervisor/Allocations.tsx) | **none — no route in routes.tsx, no link anywhere in src/** | **No** | A second, independent "approve/reject pending applications" page — fully wired to a real endpoint, just never mounted | GET /allocations; PUT /allocations/:id/decision | **DEAD CODE** — real implementation, zero reachability. Created in the same merge (`5463807`, 2026-08-01) that also introduced `ManageAllocation.tsx` on the admin side; superseded by the group-application review that was later folded directly into `ManageProjects.tsx` (§K, §J7) |

### Admin (`/admin/*`, guarded by `ProtectedRoute role="admin"`)
| Page | Route | Sidebar nav? | What it does | Key API calls | Status |
|---|---|---|---|---|---|
| [Dashboard.tsx](src/app/pages/admin/Dashboard.tsx) | /admin/dashboard | Yes | Stats + a hand-merged "recent activity" feed (new students, new projects, allocation decisions) + quick-action tiles | GET /users?role=, /projects, /allocations | **REAL** |
| [ManageUsers.tsx](src/app/pages/admin/ManageUsers.tsx) | /admin/users | Yes | Create/edit/delete students & supervisors, auto-generated IDs/emails shown post-creation | GET /users?role=; POST /users; PUT /users/:id; DELETE /users/:id | **REAL** |
| [ManageProjects.tsx](src/app/pages/admin/ManageProjects.tsx) | /admin/projects | Yes | List/search/filter all projects, upload files, delete, link to create/edit | GET /projects; DELETE /projects/:id; POST(upload) /projects/:id/files | **REAL** |
| [CreateProject.tsx](src/app/pages/admin/CreateProject.tsx) | /admin/projects/create | (button on Manage Projects) | New project form; note in the UI itself that difficulty/duration/prerequisite fields from the original Figma design are **not persisted** ([CreateProject.tsx:153-155](src/app/pages/admin/CreateProject.tsx#L153-L155)) | GET /users?role=supervisor; POST /projects | **REAL**, with an explicitly-acknowledged partial field set |
| [EditProject.tsx](src/app/pages/admin/EditProject.tsx) | /admin/projects/:id/edit | (link on Manage Projects) | Edit an existing project | GET /users?role=supervisor, /projects/:id; PUT /projects/:id | **REAL** |
| [ManageAllocation.tsx](src/app/pages/admin/ManageAllocation.tsx) | /admin/allocation | Yes | Groups awaiting final allocation, approved groups (undo), force-assign form, full allocations table | GET /allocations, /projects, /users?role=student, /groups; PUT /allocations/:id/decision, /groups/:id/decision, /groups/:id/undo; POST /allocations/assign | **REAL** |
| [Assessments.tsx](src/app/pages/admin/Assessments.tsx) | /admin/assessments | Yes | List all templates + how many projects each is released to | GET /assessments/all | **REAL** |
| [CreateAssessment.tsx](src/app/pages/admin/CreateAssessment.tsx) | /admin/assessments/create | (button on Assessments + Dashboard quick action) | Create a template + attach files | POST /assessments; POST(upload) /assessments/:id/files | **REAL** |
| [Reports.tsx](src/app/pages/admin/Reports.tsx) | /admin/reports | Yes | Live-refreshing (10s poll + focus refetch) system dashboard | GET /reports/summary | **REAL** |
| [Discussions.tsx](src/app/pages/admin/Discussions.tsx) | /admin/discussions | Yes | Same pattern, scoped to all projects (admin) | GET /projects, /discussions?project= | **REAL** |
| [DiscussionThread.tsx](src/app/pages/admin/DiscussionThread.tsx) | /admin/discussions/:id | (via list) | Same pattern | GET/POST/DELETE /discussions/... | **REAL** |
| [NewDiscussion.tsx](src/app/pages/admin/NewDiscussion.tsx) | /admin/discussions/new | (via list) | Same pattern | POST /discussions | **REAL** |
| [Messages.tsx](src/app/pages/admin/Messages.tsx) | /admin/messages | Yes | Same chat+email pattern | Same as student Messages | **REAL** |
| [Notifications.tsx](src/app/pages/admin/Notifications.tsx) | /admin/notifications | (bell icon) | Same pattern | GET /notifications | **REAL** |
| [Profile.tsx](src/app/pages/admin/Profile.tsx) | /admin/profile | (avatar icon) | Same pattern | GET/PUT /profile | **REAL** |

### Shared / public
| Page | Route | What it does | Key API calls | Status |
|---|---|---|---|---|
| [Homepage.tsx](src/app/pages/Homepage.tsx) | /, /about, /features, /contact | Landing page, latest 3 forum posts, contact form | GET /forum (unauth); POST /contact (unauth) | **REAL** |
| [Login.tsx](src/app/pages/Login.tsx) | /login | Login form, role-based redirect | POST /auth/login | **REAL** |
| [ForgotPassword.tsx](src/app/pages/ForgotPassword.tsx) | /forgot-password | Request reset email | POST /auth/forgot-password | **REAL** |
| [ResetPassword.tsx](src/app/pages/ResetPassword.tsx) | /reset-password/:token | Set new password | POST /auth/reset-password/:token | **REAL** |
| [Forum.tsx](src/app/pages/Forum.tsx) | /forum (`AuthenticatedRoute`) | Public-content thread list, role-aware sidebar | GET /forum; DELETE /forum/:id | **REAL** |
| [NewForumPost.tsx](src/app/pages/NewForumPost.tsx) | /forum/new (`AuthenticatedRoute`) | New public thread | POST /forum | **REAL** |
| [ForumThread.tsx](src/app/pages/ForumThread.tsx) | /forum/:id | Thread + comments + reactions; renders with full app chrome if logged in, bare Navbar/Footer if not (accessible to anonymous visitors) | GET /forum/:id, /forum/:id/comments; POST .../react, .../comments; DELETE ... | **REAL** |
| [ColorPalette.tsx](src/app/pages/ColorPalette.tsx) | /colors | A static design-reference swatch page from the original Figma export | none | Not a functional feature — a design utility left wired into the router; harmless but not part of the product |

**Orphan summary**: exactly one page component, `supervisor/Allocations.tsx`, exists
with zero route and zero incoming link — real, working code that is completely
unreachable in the shipped app.

---

## F. ROLE PERMISSION MATRIX

"Server-side" = enforced in a controller or `roleGuard`, cannot be bypassed by the
frontend. "UI-only" = the frontend simply doesn't render a control; nothing stops a
crafted request. `ProtectedRoute`/`AuthenticatedRoute` gate *page access*, not API
calls, and are pure `localStorage` checks — see §H for how weak that is on its own.

| Action | Admin | Supervisor | Student | Unauthenticated | Enforced where |
|---|---|---|---|---|---|
| Register a new account | ✅ (self-registers as student only) | — | ✅ | ✅ | Server — [authController.js:8-31](Backend_PMS/src/controllers/authController.js#L8-L31) (role always defaults `student`, nothing lets a caller pick a privileged role via `/register`) |
| Create a user with a chosen role (student/supervisor) | ✅ | ❌ | ❌ | ❌ | Server — `roleGuard('admin')` on `POST /users` |
| Create a project | ✅ | ❌ | ❌ | ❌ | Server — `roleGuard('admin')` |
| Edit / delete a project | ✅ | ❌ (route `roleGuard` allows supervisor, controller 403s them anyway) | ❌ | ❌ | Server, with a route/controller mismatch — [projectController.js:122](Backend_PMS/src/controllers/projectController.js#L122) |
| Apply to a project (solo) | ❌ | ❌ | ✅ | ❌ | Server — `roleGuard('student')` on `POST /allocations` |
| Apply to a project (as a group) | ❌ | ❌ | ✅ | ❌ | Server — `roleGuard('student')` on `POST /groups` |
| Approve/reject a solo application | ✅ (fallback) | ✅ (owning project only) | ❌ | ❌ | Server — `decideAllocation`, checked against current `Project.supervisor` |
| Approve/reject a group application (stage 1: recommend) | ✅ (can skip straight to final) | ✅ (owning project only) | ❌ | ❌ | Server — `decideGroup` |
| Final allocation decision on a group (stage 2) | ✅ | ❌ | ❌ | ❌ | Server — role check inside `decideGroup` |
| Force-assign a student to a project | ✅ | ❌ | ❌ | ❌ | Server — `roleGuard('admin')` |
| Create an assessment template | ✅ | ❌ | ❌ | ❌ | Server — `roleGuard('admin')` |
| Release/hide an assessment for a project | ✅ (any project) | ✅ (own projects only) | ❌ | ❌ | Server — ownership check inside `setAssessmentVisibility` |
| Extend an assessment's deadline | ❌ | ✅ (own projects only) | ❌ | ❌ | Server — `roleGuard('supervisor')` at the route, admin explicitly excluded |
| Upload a submission | ❌ | ❌ | ✅ (only for a currently-visible assessment on their approved project) | ❌ | Server — `roleGuard('student')` + visibility check in `createSubmission` |
| Grade a submission | ✅ (fallback) | ✅ (owning project only) | ❌ | ❌ | Server — role check + ownership inside `gradeSubmission` (route `roleGuard` only lists `supervisor`; admin allowed by the controller body regardless) |
| View system reports | ✅ | ❌ | ❌ | ❌ | Server — `roleGuard('admin')` |
| Read the public forum | ✅ | ✅ | ✅ | ✅ | Server — `GET /forum` has no `protect` |
| Post/comment on the forum | ✅ | ✅ | ✅ | ❌ | Server — `protect` on write routes |
| Delete a forum post/comment | ✅ (any) | own only | own only | ❌ | Server — author-or-admin check in controller |
| Read/post in a project discussion | ✅ (all projects) | ✅ (own projects) | ✅ (approved-project only) | ❌ | Server — `assertProjectAccess` in `discussionController.js` |
| Delete a discussion thread/post | ✅ (any) | own project's threads/posts, or own authored | own authored only | ❌ | Server — layered author/supervisor/admin check |
| Message another user | ✅ (anyone) | approved students + admins | approved supervisor(s) + groupmates + admins | ❌ | Server — `getAllowedContacts`/`isAllowedContact` in `messageController.js` |
| Send a free-text email | ✅ (any address) | ✅ (any address) | ✅ (supervisor addresses only) | ❌ | Server — role branch inside `sendDirectEmail` |
| Submit the public contact form | n/a | n/a | n/a | ✅ | No auth required by design |
| Access `/admin/*`, `/supervisor/*`, `/student/*` pages | own role only | own role only | own role only | ❌ | **Frontend only** — `ProtectedRoute` reads `localStorage.userRole`; this is a UX guard, not a security boundary — the real boundary is always the corresponding API's `roleGuard`/controller check above |

Where the table says "Server", a determined client cannot bypass it by editing
`localStorage` or skipping the UI — the `roleGuard`/controller logic runs on every
request regardless of what page rendered it.

