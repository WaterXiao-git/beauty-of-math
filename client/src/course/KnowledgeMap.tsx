// 中间上部：知识地图（SVG 拓扑图：中心节点 + 关联节点 + 连线）
import { useState } from 'react'
import type { KnowledgePoint, KnowledgeStatus } from './courseData'
import { STATUS_META } from './courseData'

interface KnowledgeMapProps {
  point: KnowledgePoint
  /** 关联知识点对象（用于点击跳转选中） */
  relatedPoints: KnowledgePoint[]
  onSelectPoint: (pointId: string) => void
}

/** SVG 状态色（与 Tailwind 状态 token 一一对应） */
const STATUS_HEX: Record<KnowledgeStatus, { dot: string; border: string }> = {
  mastered: { dot: '#10b981', border: '#a7f3d0' },
  learning: { dot: '#2563eb', border: '#bfdbfe' },
  'not-started': { dot: '#f59e0b', border: '#fde68a' },
}

/** 关联节点环绕位置（相对 800x340 画布） */
const NODE_POSITIONS = [
  { x: 120, y: 170 },
  { x: 235, y: 78 },
  { x: 565, y: 78 },
  { x: 680, y: 170 },
  { x: 560, y: 272 },
  { x: 240, y: 272 },
]

const CENTER = { x: 400, y: 175 }
const NODE_W = 132
const NODE_H = 34

export default function KnowledgeMap({ point, relatedPoints, onSelectPoint }: KnowledgeMapProps) {
  const [fullscreen, setFullscreen] = useState(false)

  return (
    <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 md:p-5 flex flex-col">
      {/* 工具栏 */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-gray-800">知识地图</h3>
        <div className="flex items-center gap-4">
          {/* 状态图例 */}
          <div className="flex items-center gap-3 text-xs text-gray-500">
            {(Object.keys(STATUS_META) as Array<keyof typeof STATUS_META>).map((key) => (
              <span key={key} className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${STATUS_META[key].dot}`} />
                {STATUS_META[key].label}
              </span>
            ))}
          </div>
          {/* 全屏按钮 */}
          <button
            type="button"
            onClick={() => setFullscreen((v) => !v)}
            className="p-1.5 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            aria-label={fullscreen ? '退出全屏' : '全屏'}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              {fullscreen ? (
                <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
              ) : (
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* 拓扑图画布 */}
      <div className={`relative rounded-lg bg-gradient-to-br from-gray-50 to-blue-50/40 border border-gray-100 transition-all duration-300 ${fullscreen ? 'h-[30rem]' : 'h-56 md:h-64'}`}>
        <svg viewBox="0 0 800 340" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
          {/* 连线（浅蓝实线 + 虚线到中心） */}
          {point.related.map((title, i) => {
            const pos = NODE_POSITIONS[i % NODE_POSITIONS.length]
            const rel = relatedPoints.find((rp) => rp.title === title)
            const color = rel ? STATUS_HEX[rel.status] : undefined
            return (
              <g key={title}>
                <line
                  x1={CENTER.x} y1={CENTER.y} x2={pos.x} y2={pos.y}
                  stroke="#bfdbfe" strokeWidth={1.5}
                  strokeDasharray={i % 2 === 0 ? '6 4' : undefined}
                />
                {/* 关联节点 */}
                <g
                  onClick={() => rel && onSelectPoint(rel.id)}
                  className={rel ? 'cursor-pointer' : undefined}
                >
                  <rect
                    x={pos.x - NODE_W / 2} y={pos.y - NODE_H / 2}
                    width={NODE_W} height={NODE_H} rx={17}
                    fill={rel ? '#ffffff' : '#f8fafc'}
                    stroke={rel && color ? color.border : '#e5e7eb'}
                    strokeWidth={1.2}
                  />
                  {rel && color && (
                    <circle cx={pos.x - NODE_W / 2 + 14} cy={pos.y} r={4} fill={color.dot} />
                  )}
                  <text
                    x={pos.x} y={pos.y + 4.5}
                    textAnchor="middle" fontSize={13} fontWeight={rel ? 500 : 400}
                    fill={rel ? '#374151' : '#9ca3af'}
                  >
                    {title}
                  </text>
                </g>
              </g>
            )
          })}

          {/* 中心主节点：蓝色胶囊 */}
          <g>
            <rect
              x={CENTER.x - NODE_W / 2 - 12} y={CENTER.y - NODE_H / 2 - 8}
              width={NODE_W + 24} height={NODE_H + 16} rx={25}
              fill="#2563eb" className="drop-shadow-md"
            />
            <text x={CENTER.x} y={CENTER.y + 5} textAnchor="middle" fontSize={14.5} fontWeight={700} fill="#ffffff">
              {point.title}
            </text>
          </g>
        </svg>
      </div>
    </section>
  )
}