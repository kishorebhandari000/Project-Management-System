export type NotificationCategory = 'projects' | 'assessments' | 'deadlines';
export type NotificationCategoryFilter = 'all' | NotificationCategory;

export const NOTIFICATION_CATEGORY_TYPES: Record<NotificationCategory, string[]> = {
  projects: [
    'allocation_request',
    'allocation_decision',
    'group_forwarded',
    'group_created',
    'group_decision',
    'group_membership_changed',
  ],
  assessments: ['submission_created', 'assessment_graded', 'assessment_visible'],
  // No type values map here yet - legitimately empty until a deadline-reminder
  // feature exists. Not a bug.
  deadlines: [],
};

export const NOTIFICATION_CATEGORY_LABELS: Record<NotificationCategory, string> = {
  projects: 'Projects',
  assessments: 'Assessments',
  deadlines: 'Deadlines',
};

// Returns null for uncategorized types (task_assigned, direct_email, general,
// or anything unrecognized) - these only ever show under "All", never under a
// category tab.
export function categoryForType(type: string): NotificationCategory | null {
  return (
    (Object.keys(NOTIFICATION_CATEGORY_TYPES) as NotificationCategory[]).find((category) =>
      NOTIFICATION_CATEGORY_TYPES[category].includes(type)
    ) ?? null
  );
}

export function notificationTypeColor(type: string): string {
  const category = categoryForType(type);
  if (category === 'projects') return 'bg-blue-100 text-blue-700';
  if (category === 'assessments') return 'bg-green-100 text-green-700';
  if (category === 'deadlines') return 'bg-amber-100 text-amber-700';
  return 'bg-gray-100 text-gray-700';
}
