import type { ContentSection } from '../types/content'

interface OfficialPersonalToggleProps {
  value: ContentSection
  onChange: (value: ContentSection) => void
}

const OPTIONS: { value: ContentSection; label: string }[] = [
  { value: 'official', label: '公式' },
  { value: 'personal', label: '個人' },
]

export function OfficialPersonalToggle({ value, onChange }: OfficialPersonalToggleProps) {
  return (
    <div className="inline-flex rounded-md border border-gray-300 dark:border-gray-700">
      {OPTIONS.map((option, index) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`px-4 py-1.5 text-sm ${index === 0 ? 'rounded-l-md' : 'rounded-r-md'} ${
            value === option.value
              ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
              : 'text-gray-600 dark:text-gray-300'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
