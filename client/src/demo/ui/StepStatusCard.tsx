// 当前步骤卡：与底部播放条同处一行（h-20），三行内容留足行距不遮挡
interface StepStatusCardProps {
  stepDesc: { title: string; desc: string }
}

export default function StepStatusCard({ stepDesc }: StepStatusCardProps) {
  return (
    <div
      className="w-80 xl:w-96 shrink-0 h-full bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 flex flex-col justify-center gap-1.5 overflow-hidden"
      title={stepDesc.desc}
    >
      <div className="text-[10px] text-gray-400 leading-none">当前步骤</div>
      <div className="text-sm font-bold text-purple-600 leading-snug truncate">{stepDesc.title}</div>
      <div className="text-[11px] text-gray-500 leading-relaxed truncate">{stepDesc.desc}</div>
    </div>
  )
}
