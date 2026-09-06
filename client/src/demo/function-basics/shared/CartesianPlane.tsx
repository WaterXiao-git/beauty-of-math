import type { ReactNode } from 'react'
import { PAD, VIEW_H, VIEW_W, sx, sy } from './math'

export default function CartesianPlane({ children, testId }: { children: ReactNode; testId: string }) {
  return (
    <svg data-testid={testId} viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="h-full min-h-[430px] w-full" role="img">
      <defs>
        <pattern id={`${testId}-grid`} width="79.2" height="49" patternUnits="userSpaceOnUse">
          <path d="M79.2 0H0V49" fill="none" stroke="#e2e8f0" />
        </pattern>
      </defs>
      <rect x={PAD} y={PAD} width={VIEW_W - PAD * 2} height={VIEW_H - PAD * 2} rx="14" fill="#fbfdff" />
      <rect x={PAD} y={PAD} width={VIEW_W - PAD * 2} height={VIEW_H - PAD * 2} rx="14" fill={`url(#${testId}-grid)`} />
      <line x1={PAD} y1={sy(0)} x2={VIEW_W - PAD} y2={sy(0)} stroke="#64748b" strokeWidth="1.5" />
      <line x1={sx(0)} y1={PAD} x2={sx(0)} y2={VIEW_H - PAD} stroke="#64748b" strokeWidth="1.5" />
      {children}
    </svg>
  )
}
