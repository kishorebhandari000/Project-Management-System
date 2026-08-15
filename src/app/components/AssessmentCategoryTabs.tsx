export type AssessmentCategory = 'tutorial' | 'report' | 'presentation';
export type AssessmentCategoryFilter = 'all' | AssessmentCategory;

export const ASSESSMENT_CATEGORY_LABELS: Record<AssessmentCategory, string> = {
  tutorial: 'Tutorial',
  report: 'Project Report',
  presentation: 'Project Presentation',
};

const TABS: { value: AssessmentCategoryFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'tutorial', label: ASSESSMENT_CATEGORY_LABELS.tutorial },
  { value: 'report', label: ASSESSMENT_CATEGORY_LABELS.report },
  { value: 'presentation', label: ASSESSMENT_CATEGORY_LABELS.presentation },
];

interface Props {
  value: AssessmentCategoryFilter;
  onChange: (value: AssessmentCategoryFilter) => void;
}

export default function AssessmentCategoryTabs({ value, onChange }: Props) {
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
