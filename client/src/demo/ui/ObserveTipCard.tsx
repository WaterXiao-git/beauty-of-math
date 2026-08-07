// 观察提示卡：淡蓝气泡列表（✨ + 说明文字，16px 圆角）
interface ObserveTip {
  icon?: string
  text: string
}

interface ObserveTipCardProps {
  title?: string
  tips: ObserveTip[]
}

export default function ObserveTipCard({ title = '观察提示', tips }: ObserveTipCardProps) {
  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h3 className="text-sm font-bold text-gray-800 mb-3">{title}</h3>
      <div className="space-y-2">
        {tips.map((t, i) => (
          <div key={i} className="flex items-start gap-2.5 px-3.5 py-2.5 rounded-2xl bg-blue-50/70 border border-blue-100">
            <span className="shrink-0 text-sm leading-relaxed">{t.icon ?? '✨'}</span>
            <p className="text-[13px] text-gray-600 leading-relaxed">{t.text}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
