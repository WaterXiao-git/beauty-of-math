// 右侧栏：当前知识点详情（简介 / 配图 / 学习目标 / CTA）

import { useState } from 'react'
import { Link } from 'react-router-dom'

import type { KnowledgePoint } from './courseData'
import { STATUS_META } from './courseData'

import {
  getKnowledgePointDemoPath,
} from '../experiment-v2/routing'

interface KnowledgeDetailProps {
  point: KnowledgePoint
}

/**
 * ε−δ 极限收敛示意图。
 *
 * 当前仍作为知识点详情区域的默认示意图使用。
 * 后续如果需要，可以再根据不同知识点切换不同预览图。
 */
function LimitChart() {
  return (
    <svg
      viewBox="0 0 300 180"
      className="
        h-auto
        w-full
        rounded-lg
        border
        border-gray-100
        bg-gray-50
      "
    >
      {/* 坐标轴 */}
      <g
        stroke="#9ca3af"
        strokeWidth={1}
      >
        {/* x 轴 */}
        <line
          x1={30}
          y1={150}
          x2={282}
          y2={150}
        />

        {/* y 轴 */}
        <line
          x1={40}
          y1={12}
          x2={40}
          y2={160}
        />
      </g>

      {/* 箭头 */}
      <g fill="#9ca3af">
        <path d="M278 146 L288 150 L278 154 Z" />
        <path d="M36 16 L40 6 L44 16 Z" />
      </g>

      {/* ε 条带 */}
      <g
        stroke="#93c5fd"
        strokeWidth={1}
        strokeDasharray="4 3"
      >
        <line
          x1={40}
          y1={70}
          x2={278}
          y2={70}
        />

        <line
          x1={40}
          y1={92}
          x2={278}
          y2={92}
        />
      </g>

      {/* 极限水平线 y = A */}
      <line
        x1={40}
        y1={81}
        x2={278}
        y2={81}
        stroke="#2563eb"
        strokeWidth={1.4}
        strokeDasharray="2 2"
      />

      {/* x = x₀ 竖虚线 */}
      <line
        x1={195}
        y1={12}
        x2={195}
        y2={160}
        stroke="#f59e0b"
        strokeWidth={1}
        strokeDasharray="4 3"
      />

      {/* 函数曲线 */}
      <path
        d="
          M40 140
          C 90 138 120 130 150 112
          C 172 100 182 92 195 84
          C 210 75 235 74 262 76
          L 280 78
        "
        fill="none"
        stroke="#1d4ed8"
        strokeWidth={2.2}
        strokeLinecap="round"
      />

      {/* 标注 */}
      <g
        fontSize={11}
        fill="#4b5563"
        fontFamily="inherit"
      >
        <text
          x={268}
          y={142}
        >
          x
        </text>

        <text
          x={24}
          y={16}
        >
          y
        </text>

        <text
          x={200}
          y={172}
        >
          x₀
        </text>

        <text
          x={228}
          y={66}
          fill="#2563eb"
        >
          A
        </text>

        <text
          x={238}
          y={86}
          fill="#93c5fd"
        >
          ε
        </text>

        <text
          x={150}
          y={120}
          fill="#1d4ed8"
          fontSize={11.5}
        >
          y = f(x)
        </text>

        <text
          x={46}
          y={72}
          fill="#6b7280"
          fontSize={10}
        >
          A+ε
        </text>

        <text
          x={46}
          y={98}
          fill="#6b7280"
          fontSize={10}
        >
          A−ε
        </text>
      </g>
    </svg>
  )
}

/**
 * 当前知识点右侧详情。
 *
 * 现在「进入演示」不再：
 *
 * demoId -> /demo/*
 * experimentPath -> /calculus 等旧页面
 * 无实验 -> /ask
 *
 * 而是统一使用：
 *
 * getKnowledgePointDemoPath(point)
 *
 * 最终所有入口都会进入 /demo/*。
 */
export default function KnowledgeDetail({
  point,
}: KnowledgeDetailProps) {
  const status =
    STATUS_META[point.status]

  const [
    learningPlan,
    setLearningPlan,
  ] = useState<string[]>(() => {
    try {
      return JSON.parse(
        localStorage.getItem(
          'mathviz-learning-plan',
        ) ?? '[]',
      ) as string[]
    } catch {
      return []
    }
  })

  const inPlan =
    learningPlan.includes(point.id)

  /**
   * 统一演示路径。
   *
   * 示例：
   *
   * demoId = epsilon-delta
   * -> /demo/epsilon-delta
   *
   * experimentPath = /calculus
   * -> /demo/calculus
   *
   * 两者都不存在：
   * point.id = limit-laws
   * -> /demo/limit-laws
   */
  const demoPath =
    getKnowledgePointDemoPath(
      point,
    )

  const toggleLearningPlan = () => {
    const next =
      learningPlan.includes(point.id)
        ? learningPlan.filter(
            (id) =>
              id !== point.id,
          )
        : [
            ...new Set([
              ...learningPlan,
              point.id,
            ]),
          ]

    localStorage.setItem(
      'mathviz-learning-plan',
      JSON.stringify(next),
    )

    setLearningPlan(next)
  }

  return (
    <aside
      className="
        hidden
        w-72
        shrink-0
        flex-col
        gap-5
        rounded-xl
        border
        border-gray-100
        bg-white
        p-5
        shadow-sm

        xl:flex
        xl:w-80
      "
    >
      {/* =====================================
          标题 + 学习状态
         ===================================== */}
      <div
        className="
          flex
          items-start
          justify-between
          gap-2
        "
      >
        <h3
          className="
            text-lg
            font-bold
            leading-snug
            text-gray-900
          "
        >
          {point.title}
        </h3>

        <span
          className={[
            'shrink-0',
            'rounded-full',
            'px-2.5',
            'py-1',
            'text-xs',
            'font-semibold',
            status.bg,
            status.text,
          ].join(' ')}
        >
          {status.label}
        </span>
      </div>

      {/* =====================================
          知识点简介
         ===================================== */}
      <div>
        <h4
          className="
            mb-2
            text-xs
            font-bold
            uppercase
            tracking-wide
            text-gray-400
          "
        >
          知识点简介
        </h4>

        <p
          className="
            text-[13px]
            leading-relaxed
            text-gray-600
          "
        >
          {point.summary}
        </p>
      </div>

      {/* =====================================
          示意图
         ===================================== */}
      <div>
        <LimitChart />
      </div>

      {/* =====================================
          学习目标
         ===================================== */}
      <div className="flex-1">
        <h4
          className="
            mb-2
            text-xs
            font-bold
            uppercase
            tracking-wide
            text-gray-400
          "
        >
          学习目标
        </h4>

        <ul className="space-y-2">
          {point.goals.map(
            (
              goal,
              index,
            ) => (
              <li
                key={index}
                className="
                  flex
                  items-start
                  gap-2
                  text-[13px]
                  leading-relaxed
                  text-gray-600
                "
              >
                <svg
                  className="
                    mt-0.5
                    h-4
                    w-4
                    shrink-0
                    text-blue-600
                  "
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    fill="#eff6ff"
                    stroke="none"
                  />

                  <path d="M9 12l2 2 4-4" />
                </svg>

                <span>
                  {goal}
                </span>
              </li>
            ),
          )}
        </ul>
      </div>

      {/* =====================================
          操作按钮
         ===================================== */}
      <div
        className="
          space-y-2.5
          pt-1
        "
      >
        {/* 进入演示 */}
        <Link
          to={demoPath}
          className="
            inline-flex
            h-11
            w-full
            items-center
            justify-center
            gap-1.5
            rounded-lg
            bg-blue-600
            text-sm
            font-semibold
            text-white
            shadow-md
            shadow-blue-500/20
            transition-all

            hover:bg-blue-700
            hover:shadow-lg
            hover:shadow-blue-500/25

            active:bg-blue-800
          "
        >
          进入演示

          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14m-6-6 6 6-6 6" />
          </svg>
        </Link>

        {/* 学习计划 */}
        <button
          type="button"
          onClick={
            toggleLearningPlan
          }
          aria-pressed={
            inPlan
          }
          className={[
            'inline-flex',
            'h-11',
            'w-full',
            'items-center',
            'justify-center',
            'gap-1.5',
            'rounded-lg',
            'border-2',
            'text-sm',
            'font-semibold',
            'transition-all',

            inPlan
              ? [
                  'border-emerald-200',
                  'bg-emerald-50',
                  'text-emerald-700',
                  'hover:bg-emerald-100',
                ].join(' ')
              : [
                  'border-blue-200',
                  'bg-white',
                  'text-blue-600',
                  'hover:border-blue-400',
                  'hover:bg-blue-50',
                  'active:bg-blue-100',
                ].join(' '),
          ].join(' ')}
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect
              x="3"
              y="4"
              width="18"
              height="18"
              rx="2"
            />

            <path d="M16 2v4M8 2v4M3 10h18" />
          </svg>

          {inPlan
            ? '已加入学习计划'
            : '加入学习计划'}
        </button>
      </div>
    </aside>
  )
}