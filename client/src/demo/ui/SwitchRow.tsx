// iOS 风格 Switch：标题+说明左，开关右
interface SwitchRowProps {
  label: string
  desc?: string
  checked: boolean
  onChange: (v: boolean) => void
}

export default function SwitchRow({ label, desc, checked, onChange }: SwitchRowProps) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <div className="pr-3 min-w-0">
        <div className="text-[13px] font-medium text-gray-700">{label}</div>
        {desc && <div className="text-[11px] text-gray-400 leading-snug">{desc}</div>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`w-11 h-6 rounded-full transition-colors shrink-0 ${checked ? 'bg-purple-600' : 'bg-gray-200'}`}
      >
        <span
          className={`block w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
            checked ? 'translate-x-[22px]' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  )
}
