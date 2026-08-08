import type { ReactNode } from 'react'

interface ExperimentCardProps {
  title: string
  children: ReactNode
  action?: ReactNode
  className?: string
}

/**
 * Experiment V2 右侧栏统一卡片。
 *
 * 用途：
 * - 概念说明
 * - 案例与参数
 * - 教学判断
 * - 运行状态
 * - 公式
 * - 学习目标
 * - 实验信息
 *
 * 所有实验尽量复用这个外壳，
 * 避免 300 个实验各自维护不同的卡片样式。
 */
export default function ExperimentCard({
  title,
  children,
  action,
  className = '',
}: ExperimentCardProps) {
  return (
    <section
      className={[
        'rounded-2xl',
        'border border-gray-100',
        'bg-white',
        'p-5',
        'shadow-sm',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="min-w-0 text-sm font-bold text-gray-800">
          {title}
        </h3>

        {action && (
          <div className="shrink-0">
            {action}
          </div>
        )}
      </div>

      <div className="min-w-0">
        {children}
      </div>
    </section>
  )
}