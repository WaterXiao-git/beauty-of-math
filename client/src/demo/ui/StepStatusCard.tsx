// 当前步骤卡：与底部播放条同处一行（h-20），宽度与右侧三卡对齐
interface StepStatusCardProps {
  stepDesc: { title: string; desc: string }
}

export default function StepStatusCard({ stepDesc }: StepStatusCardProps) {
  return (
    <div className="w-80 xl:w-96 shrink-0 h-full bg-white rounded-2xl border border-gray-100 shadow-sm p-3.5 flex flex-col justify-center">
      <div className="text-[10px] text-gray-400 mb-0.5">当前步骤</div>
      <div className="text-sm font-bold text-purple-600 leading-tight truncate">{stepDesc.title}</div>
      <div className="text-[11px] text-gray-500 leading-snug mt-0.5 line-clamp-2">{stepDesc.desc}</div>
    </div>
  )
}
