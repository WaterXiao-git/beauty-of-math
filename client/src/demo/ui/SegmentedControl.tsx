// iOS 风格 Segmented Control：胶囊按钮组，选中紫色渐变
interface SegmentedOption {
  id: string
  label: string
}

interface SegmentedControlProps {
  options: SegmentedOption[]
  value: string
  onChange: (id: string) => void
}

export default function SegmentedControl({ options, value, onChange }: SegmentedControlProps) {
  return (
    <div className="flex gap-1 bg-gray-100 rounded-full p-1">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          className={`flex-1 px-3 h-[34px] rounded-full text-xs font-semibold transition-all ${
            o.id === value
              ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
