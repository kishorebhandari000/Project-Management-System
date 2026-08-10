/**
 * Single source of truth for SectionHint tooltip copy.
 * Edit the strings here to change what a hint says anywhere in the app.
 * Keep each blurb short (roughly one sentence, ~120 characters where possible).
 */
export const sectionHints = {
  // Sidebar navigation — shared across roles where the destination is identical
  navDashboard: 'Your at-a-glance overview: key stats and recent activity.',
  navForum: 'Browse and post open discussions visible to everyone in the unit.',
  navDiscussions: 'Threaded conversations tied to a project. Reply to keep everything in one place.',
  navMessages: 'Private one-to-one chats with your teammates, supervisor, or admin.',
  navAssessments: 'View assessments, track due dates, and see grades once released.',

  // Student-only nav
  navBrowseProjects: 'Browse open projects and apply, solo or as a group.',

  // Supervisor-only nav
  navManageProjectsSupervisor: 'Manage the projects you supervise and review student applications.',

  // Admin-only nav
  navManageUsers: 'Create, search, and edit student and supervisor accounts.',
  navManageProjectsAdmin: 'Create and edit projects, and manage their attached files.',
  navManageAllocation: 'See which students are assigned to which projects, and approve or reassign them.',
  navReports: 'System-wide stats: completion rates, average grades, and pending reviews.',

  // Admin dashboard
  adminStatPendingAllocations: 'Allocation requests waiting for your approval or rejection.',
  adminQuickActions: 'Shortcuts to the most common admin tasks.',

  // Supervisor dashboard
  supervisorStatPendingRequests: 'Students who have applied to your projects and are awaiting a decision.',
  supervisorStatToReview: "Submitted work that hasn't been graded yet.",
  supervisorMyStudents: 'Progress of each student currently assigned to you, based on graded work.',

  // Student dashboard
  studentCurrentProject: "The project you're currently working on, including your group and supervisor.",
} as const;

export type SectionHintKey = keyof typeof sectionHints;
