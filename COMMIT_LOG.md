# Complete Commit Log

Generated from `git log --all --reverse --date=short --format='%h|%ad|%an|%s' --numstat`
(aggregated to one row per commit via `--shortstat`). Oldest → newest. 131 commits total,
2026-07-03 → 2026-08-25. Pure merge commits with no diff of their own show `—` for files/±.
Referenced from [SYSTEM_DOSSIER_2.md](SYSTEM_DOSSIER_2.md) section J2.

| # | Hash | Date | Author | Message | Files | +/- |
|---|------|------|--------|---------|-------|-----|
| 1 | bdcceae | 2026-07-03 | kishorebhandari000 | Initial commit | 114 | +16986/-0 |
| 2 | 07dc32b | 2026-07-05 | kishorebhandari000 | Add assessment creation for admin role | 3 | +231/-2 |
| 3 | f7acc99 | 2026-07-05 | kishorebhandari000 | Remove assessment creation from supervisor role | 1 | +54/-171 |
| 4 | 5ab79e2 | 2026-07-07 | arthleo | PMS to Project Management System | 1 | +1/-1 |
| 5 | d22364d | 2026-07-07 | arthleo | New pnpm installation and package-lock.json file added to the project. Updated package.json and pnpm-lock.yaml | 3 | +6105/-1 |
| 6 | 1eaf7d0 | 2026-07-07 | arthleo | I added a new Button file | 4 | +102/-3 |
| 7 | 48a88c0 | 2026-07-08 | kishorebhandari000 | Add backend scaffold (auth, users, profile) and wire frontend to real API | 32 | +2675/-142 |
| 8 | f4f8cd3 | 2026-07-08 | kishorebhandari000 | Merge pull request #1 from kishorebhandari000/backend | — | merge |
| 9 | 13a819f | 2026-07-14 | Piash89 | Rename website from PMS to Project Management System (week 1 changes) | 7 | +891/-11 |
| 10 | 4f78b69 | 2026-07-14 | Piash89 | Merge branch 'main' of .../Project-Management-System | — | merge |
| 11 | f5b7e75 | 2026-07-14 | arthleo | Added Notification Feature sending from a real email for users; new notifications/users/tasks/projects sections in MongoDB | 16 | +1150/-33 |
| 12 | 0047d23 | 2026-07-14 | jaspreets0 | testing | 1 | +1/-1 |
| 13 | b2afda1 | 2026-07-15 | Pijush11 | Add admin updateUser and deleteUser endpoints | 4 | +611/-21 |
| 14 | d837846 | 2026-07-16 | kishorebhandari000 | Week 3: Assessment model controller routes notifications + all frontend pages | 29 | +2636/-3175 |
| 15 | 28e0120 | 2026-07-18 | kishorebhandari000 | This is Kishore part for week-3. Project, Allocation and notifications. | 25 | +1511/-959 |
| 16 | 7c9e2b8 | 2026-07-19 | kishorebhandari000 | Week 3: Assessment model, controller, routes, notifications - merge resolved | — | merge |
| 17 | 8de46f4 | 2026-07-21 | Pijush11 | Wire admin Edit/Delete user buttons and fix _id mismatch | 1 | +141/-6 |
| 18 | e6e9982 | 2026-07-21 | Pijush11 | Merge branch 'main' of .../Project-Management-System | — | merge |
| 19 | c2f3d73 | 2026-07-21 | Pijush11 | Add ProtectedRoute to guard admin/supervisor/student routes | 3 | +654/-197 |
| 20 | ca6d113 | 2026-07-21 | Pijush11 | Add global 401 handling to redirect to login on expired token | 1 | +31/-13 |
| 21 | b414546 | 2026-07-21 | arthleo | . | 2 | +476/-589 |
| 22 | 1f83e0e | 2026-07-21 | Piash89 | Add Forum backend: ForumPost/ForumComment models, controller, routes | 9 | +339/-5 |
| 23 | 84f464f | 2026-07-21 | Piash89 | Merge branch 'main' of .../Project-Management-System | — | merge |
| 24 | f316a49 | 2026-07-21 | arthleo | Fixed wiring on routes | 3 | +284/-2 |
| 25 | 2f0d61d | 2026-07-21 | arthleo | Merge branch 'main' of .../Project-Management-System | — | merge |
| 26 | 9df1de9 | 2026-07-21 | arthleo | Added frontend for notifications and working buttons on assessments | 4 | +57/-26 |
| 27 | 8896f52 | 2026-07-21 | arthleo | Fixed User.Js | 2 | +3/-7 |
| 28 | 078e64d | 2026-07-21 | arthleo | Added Front-End for Notification Bells so it follows a real count of notifications | 6 | +54/-33 |
| 29 | 43c8689 | 2026-07-21 | arthleo | Added Undo option in Admin Allocation Requests | 2 | +26/-13 |
| 30 | 5f8692e | 2026-07-21 | arthleo | Added Forgot Password option in login (backend and frontend included) | 6 | +231/-3 |
| 31 | 028a3f3 | 2026-07-22 | Piash89 | Wire up forum frontend to real API; fix public access and add id validation | 7 | +878/-461 |
| 32 | e7ee661 | 2026-07-22 | Piash89 | Fix leftover repo issues: dep conflict, formatting, dead code, stale branding | 5 | +430/-11 |
| 33 | 8c55851 | 2026-07-22 | Piash89 | Fix Discussions backend access control and wire up routes | 4 | +68/-63 |
| 34 | e04d0ef | 2026-07-22 | Piash89 | Wire Discussions.tsx thread list to real API (student, supervisor, admin) | 7 | +464/-156 |
| 35 | 149b08c | 2026-07-22 | Piash89 | Wire NewDiscussion.tsx create form to real API (student, supervisor, admin) | 4 | +354/-110 |
| 36 | 424e153 | 2026-07-22 | Piash89 | Wire DiscussionThread.tsx view/reply to real API (student, supervisor, admin) | 5 | +660/-263 |
| 37 | c794560 | 2026-07-22 | Piash89 | Add per-comment deletion to the Forum | 3 | +54/-7 |
| 38 | b968219 | 2026-07-24 | kishorebhandari000 | Week 3: Update student Profile page | 1 | +1/-0 |
| 39 | b4f56d9 | 2026-07-24 | kishorebhandari000 | Merge branch 'main' of .../Project-Management-System | — | merge |
| 40 | 4c2d147 | 2026-07-26 | Pijush11 | Fix discussion access control (supervisor + approved Allocation) and add discussion routes | 3 | +45/-22 |
| 41 | 73ef45a | 2026-07-26 | Pijush11 | Fix task access control to use supervisor + approved Allocation (was broken owner/members) | 1 | +23/-14 |
| 42 | e3c41d8 | 2026-07-26 | Pijush11 | Merge branch 'main' of .../Project-Management-System | — | merge |
| 43 | 2192992 | 2026-07-26 | Pijush11 | Fix: move react/react-dom to dependencies so fresh installs work | 2 | +237/-165 |
| 44 | fa97f7c | 2026-07-26 | kishorebhandari000 | Updated Small-Small Changes in homepage. and contact made active. | 12 | +399/-171 |
| 45 | bf87b63 | 2026-07-26 | kishorebhandari000 | Merge branch 'main' of .../Project-Management-System | — | merge |
| 46 | dfd7fdd | 2026-07-28 | Piash89 | Fix duplicate route registration, repair broken lockfile, remove orphaned pnpm config | 4 | +54/-6155 |
| 47 | 217f47d | 2026-07-28 | arthleo | pnpm update (myside) | 4 | +7458/-0 |
| 48 | f654e97 | 2026-07-28 | kishorebhandari000 | Little more changes. | 7 | +66/-27 |
| 49 | f2a2a6e | 2026-07-28 | kishorebhandari000 | Merge branch 'main' of .../Project-Management-System | — | merge |
| 50 | aeedf45 | 2026-07-28 | arthleo | feat: refactor profile avatar component and integrate it across student and supervisor pages | 37 | +858/-179 |
| 51 | 0dde0b4 | 2026-07-28 | arthleo | Merge branch 'main' of .../Project-Management-System | — | merge |
| 52 | b43f2ce | 2026-07-28 | kishorebhandari000 | changes to be committed: | 3 | +222/-3 |
| 53 | a9f104e | 2026-07-28 | kishorebhandari000 | Merge branch 'main' of .../Project-Management-System | — | merge |
| 54 | f8b1e37 | 2026-07-28 | arthleo | Added Google Sheets API to save all users' data when they submit contact form | 4 | +529/-13 |
| 55 | bdba346 | 2026-07-28 | arthleo | Merge branch 'main' of .../Project-Management-System | — | merge |
| 56 | 62fe021 | 2026-07-28 | arthleo | Renamed Sheet name | 1 | +1/-1 |
| 57 | 2280a66 | 2026-08-01 | Piash89 | fix(forum): enforce create/delete permissions server-side | 2 | +9/-3 |
| 58 | 01af831 | 2026-08-01 | Piash89 | fix(allocation): admin can no longer approve/reject; add force-assign safety net | 4 | +86/-9 |
| 59 | 653e09c | 2026-08-01 | Piash89 | feat(forum): make forum generic across all three roles | 6 | +111/-55 |
| 60 | cbe5767 | 2026-08-01 | Piash89 | feat(allocation): supervisor pending-applications page, admin force-assign UI | 2 | +284/-49 |
| 61 | a456b5c | 2026-08-01 | Piash89 | Merge remote-tracking branch 'origin/main' | — | merge |
| 62 | 8ee706a | 2026-08-01 | Piash89 | revert(allocation): let admin approve/reject alongside supervisor | 3 | +48/-8 |
| 63 | 5463807 | 2026-08-01 | kishorebhandari000 | merge and resolve conflicts | 48 | +1561/-365 |
| 64 | 84e2bb7 | 2026-08-01 | kishorebhandari000 | Resolve merge conflict in NewForumPost.tsx - keep public forum version | 13 | +497/-83 |
| 65 | 49d49ab | 2026-08-01 | Piash89 | fix(auth): stop CORS from blocking login when Vite isn't on port 5173 | 5 | +842/-2 |
| 66 | 74f91b0 | 2026-08-01 | Piash89 | fix(forum): keep the logged-in user's sidebar on a thread page | 2 | +41/-31 |
| 67 | a2fa547 | 2026-08-01 | Piash89 | Merge remote-tracking branch 'origin/main' | — | merge |
| 68 | 679bf77 | 2026-08-01 | Piash89 | fix(projects): stop crash when a project has no supervisor set | 2 | +3/-3 |
| 69 | 72dd3c9 | 2026-08-01 | Piash89 | fix(projects): self-heal legacy records missing createdBy/status on save | 1 | +5/-0 |
| 70 | 3fad507 | 2026-08-01 | Piash89 | fix(assessments): populate project title, not a nonexistent 'name' field | 7 | +15/-15 |
| 71 | 1c9fb95 | 2026-08-02 | Piash89 | feat(reports): replace hardcoded mock data with a real admin endpoint | 4 | +180/-81 |
| 72 | e8a010e | 2026-08-02 | Piash89 | feat(submissions): new Submission model + file-upload grading backend | 6 | +192/-3 |
| 73 | eeae54d | 2026-08-02 | Piash89 | feat(assessments): add Create Assessment quick action to admin dashboard | 1 | +4/-0 |
| 74 | e042814 | 2026-08-02 | Piash89 | feat(assessments): student file-upload submission page | 1 | +140/-112 |
| 75 | 5b97821 | 2026-08-02 | Piash89 | feat(assessments): supervisor grading against real Submission records | 2 | +106/-92 |
| 76 | 4896a22 | 2026-08-02 | Piash89 | fix(feedback): wire both Feedback pages to real Submission data | 2 | +70/-41 |
| 77 | c5ea85d | 2026-08-02 | Piash89 | feat(uploads): local-disk fallback when Cloudinary isn't configured | 5 | +92/-23 |
| 78 | 8a98bf4 | 2026-08-02 | Piash89 | chore: gitignore local backend process log/pid files | 1 | +3/-0 |
| 79 | fef1703 | 2026-08-02 | Piash89 | fix(nav): forum showed admin sidebar to every role, breaking navigation | 4 | +9/-9 |
| 80 | 23e6db3 | 2026-08-02 | kishorebhandari000 | Add group formation feature, student ID auto-generation, supervisor email auto-generation | 9 | +758/-143 |
| 81 | 248f60b | 2026-08-03 | kishorebhandari000 | done the student selecting projects as a group | 12 | +573/-322 |
| 82 | 23e88d3 | 2026-08-03 | Piash89 | feat(messages): real direct messaging backend, replacing the fake Messages tabs | 4 | +162/-0 |
| 83 | 10334c8 | 2026-08-03 | Piash89 | feat(messages): real-time chat UI for all three roles | 4 | +612/-221 |
| 84 | 2bf273b | 2026-08-03 | Piash89 | Merge remote-tracking branch 'origin/main' | — | merge |
| 85 | 5dc28b7 | 2026-08-03 | kishorebhandari000 | Merge branch 'main' of .../Project-Management-System | — | merge |
| 86 | 2a16dcd | 2026-08-03 | kishorebhandari000 | Only done notification for the supervisor and need admin and student to be done | 10 | +73/-85 |
| 87 | 0439144 | 2026-08-04 | Pijush11 | fix(assessments): admin overview reads real Submission data and shows the uploaded file | 1 | +67/-31 |
| 88 | 634ac33 | 2026-08-04 | kishorebhandari000 | Merge branch 'main' of .../Project-Management-System | — | merge |
| 89 | e277abd | 2026-08-04 | arthleo | Removed Feedback and GradeSubmission pages; updated Sidebar and Assessments; removed student email-change feature | 8 | +230/-468 |
| 90 | ef20d27 | 2026-08-04 | arthleo | Merge branch 'main' of .../Project-Management-System | — | merge |
| 91 | cc5443b | 2026-08-04 | arthleo | feat(assessments): enhance submission table with feedback display and improved layout | 1 | +67/-36 |
| 92 | 412669e | 2026-08-04 | jaspreets0 | Save assesment work | 2 | +170/-3 |
| 93 | 4ab48df | 2026-08-04 | arthleo | Redesign Send button in Messages in every role pages | 5 | +181/-45 |
| 94 | 2f94b24 | 2026-08-04 | arthleo | Merge branch 'main' of .../Project-Management-System | — | merge |
| 95 | 2d4a41a | 2026-08-04 | arthleo | Changed Contact Submit button | 3 | +66/-8 |
| 96 | 03f420e | 2026-08-04 | arthleo | Refactor notification links to use NotificationBell component across various pages | 28 | +120/-206 |
| 97 | 3bdac45 | 2026-08-04 | arthleo | Enhance reports functionality: update summary to include submission data and improve loading behavior with live refresh | 3 | +62/-12 |
| 98 | 28eb533 | 2026-08-08 | kishorebhandari000 | changed password requirement | 9 | +150/-35 |
| 99 | e38507e | 2026-08-08 | kishorebhandari000 | Some Improvements for week-6 | 16 | +528/-279 |
| 100 | a6f5b87 | 2026-08-10 | Piash89 | feat(ui): add reusable SectionHint tooltip component | 3 | +292/-0 |
| 101 | 35b896b | 2026-08-10 | Piash89 | fix(ui): SectionHint tooltip self-closing when opened by tap/click | 1 | +12/-5 |
| 102 | fc5652a | 2026-08-10 | Piash89 | feat(ui): wire SectionHint into nav and dashboard cards | 5 | +64/-39 |
| 103 | 53a135a | 2026-08-10 | Piash89 | fix: resolve horizontal overflow on Manage Allocation at mobile width | 1 | +5/-5 |
| 104 | afa4824 | 2026-08-10 | Piash89 | docs: add Week 6 progress summary | 1 | +128/-0 |
| 105 | 601884d | 2026-08-04 | jaspreets0 | aa | 2 | +17/-17 |
| 106 | 22d150e | 2026-08-10 | jaspreets0 | Update messaging and search feature | 3 | +326/-130 |
| 107 | 7f41cbd | 2026-08-10 | Piash89 | Merge branch 'feature/week6-section-hints' into main | — | merge |
| 108 | a91e45f | 2026-08-10 | Piash89 | fix(messages): repair backend broken by previous commit | 2 | +138/-292 |
| 109 | 739a306 | 2026-08-10 | Piash89 | docs: note the messaging backend hotfix and merge to main | 1 | +23/-3 |
| 110 | f8b2d44 | 2026-08-11 | Pijush11 | feat(admin): add search and filtering to Manage Projects | 1 | +117/-4 |
| 111 | a7ee1ca | 2026-08-11 | Pijush11 | search bar | 2 | +476/-3 |
| 112 | 09dab01 | 2026-08-11 | arthleo | feat: add confirmation and comment prompts across various components | 23 | +1409/-584 |
| 113 | ca803fc | 2026-08-11 | arthleo | Fixed Jaspreet's Search Feature in Messages | 3 | +78/-6 |
| 114 | a31941b | 2026-08-15 | kishorebhandari000 | Fixed Assessment | 18 | +610/-814 |
| 115 | d1c9b96 | 2026-08-15 | kishorebhandari000 | For the notification and the message. | 27 | +748/-977 |
| 116 | cbcad7e | 2026-08-16 | Pijush11 | style(admin): simplify filter dropdown labels *(branch-only, not in main)* | 1 | +2/-2 |
| 117 | 80f1898 | 2026-08-16 | Pijush11 | feat(admin): show creation date and group size on project cards *(branch-only, not in main)* | 1 | +7/-0 |
| 118 | a06072a | 2026-08-16 | Pijush11 | feat(admin): improve Manage Projects card info and add sorting *(branch-only, not in main)* | 1 | +70/-9 |
| 119 | ffe77d0 | 2026-08-16 | kishorebhandari000 | Check it | 5 | +284/-129 |
| 120 | cdd5bca | 2026-08-16 | Piash89 | Replace sidebar info buttons with hover tooltips *(branch-only, not in main — superseded by #121)* | 1 | +30/-21 |
| 121 | e649fe4 | 2026-08-17 | Piash89 | fix(ui): replace sidebar info button with hover/focus tooltip | 1 | +30/-21 |
| 122 | da62ea6 | 2026-08-17 | Piash89 | fix(supervisor): pull dashboard stats from /submissions, not /assessments/supervisor | 1 | +6/-7 |
| 123 | a35e4b3 | 2026-08-17 | Piash89 | fix(supervisor): require confirmation before deciding a student's allocation | 1 | +15/-1 |
| 124 | 11786d8 | 2026-08-18 | kishorebhandari000 | Deadline Extended | 7 | +218/-19 |
| 125 | e968b2b | 2026-08-18 | arthleo | implement emoji reactions for forum and discussion posts, shadow details, easier navigation | 20 | +400/-30 |
| 126 | c780755 | 2026-08-18 | arthleo | Merge branch 'main' of .../Project-Management-System | — | merge |
| 127 | 7363b71 | 2026-08-19 | kishorebhandari000 | For the toggle button | 1 | +22/-10 |
| 128 | a54839e | 2026-08-25 | arthleo | add group management features for students and supervisors, including group decision undo functionality | 13 | +585/-48 |
| 129 | 8dcbac0 | 2026-08-25 | arthleo | add submissions page for supervisors with grading functionality and search feature | 15 | +902/-266 |
| 130 | b40d5b3 | 2026-08-25 | arthleo | Merge branch 'main' of .../Project-Management-System | — | merge |
| 131 | 8d98545 | 2026-08-25 | arthleo | implement assessment reminder functionality with notification system | 4 | +131/-2 |

**Note on rows 116–118**: these three commits exist only on `remotes/origin/feature/admin-project-search`
(and local `feature/admin-project-search`), never merged into `main`. They are included here because
`git log --all` walks every ref, not just `main`. Row 120 (`cdd5bca`) similarly exists only on
`sidebar-tooltips`, not `main` — its content was independently redone on `main` the next day as row 121.
See [SYSTEM_DOSSIER_2.md](SYSTEM_DOSSIER_2.md) §J7 for detail.
