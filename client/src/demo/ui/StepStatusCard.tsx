// 当前步骤卡：右侧三卡列底部，与底部播放条同高（h-20），与三卡竖直对齐
interface StepStatusCardProps {
  stepDesc: { title: string; desc: string }
}

export default function StepStatusCard({ stepDesc }: StepStatusCardProps) {
  return (
    <div className="shrink-0 h-20 bg-white rounded-2xl border border-gray-100 shadow-sm p-3.5 flex flex-col justify-center">
      <div className="text-[10px] text-gray-400 mb-0.5">当前步骤</div>
      <div className="text-sm font-bold text-purple-600 leading-tight truncate">{stepDesc.title}</div>
      <div className="text-[11px] text-gray-500 leading-snug mt-0.5 line-clamp-2">{stepDesc.desc}</div>
    </div>
  )
}
