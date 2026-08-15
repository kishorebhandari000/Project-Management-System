import { NOTIFICATION_CATEGORY_LABELS, type NotificationCategoryFilter } from '../lib/notificationCategories';

const TABS: { value: NotificationCategoryFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'projects', label: NOTIFICATION_CATEGORY_LABELS.projects },
  { value: 'assessments', label: NOTIFICATION_CATEGORY_LABELS.assessments },
  { value: 'deadlines', label: NOTIFICATION_CATEGORY_LABELS.deadlines },
];

interface Props {
  value: NotificationCategoryFilter;
  onChange: (value: NotificationCategoryFilter) => void;
}

export default function NotificationCategoryTabs({ value, onChange }: Props) {
  return (
    <div className="flex gap-2 mb-6 border-b border-gray-200">
      {TABS.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => onChange(tab.value)}
          className={`px-4 py-2 text-sm border-b-2 -mb-px transition-colors ${
            value === tab.value
              ? 'border-[#2563a8] text-[#2563a8]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
