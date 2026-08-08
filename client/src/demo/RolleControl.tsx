import { Link } from 'react-router-dom'

import ExperimentCard from '../experiment-v2/ExperimentCard'

import type { RolleCase } from './rolleData'

import {
  CASES,
  CONDITION_FORMULA,
  THEOREM_TEXT,
} from './rolleData'

import type { Conditions } from './RolleCanvas'

interface RolleControlProps {
  /**
   * 当前函数案例 ID。
   */
  caseId: string

  /**
   * 切换函数案例。
   */
  onSelectCase: (
    id: string,
  ) => void

  /**
   * 当前罗尔定理条件状态。
   */
  conditions: Conditions

  /**
   * 切换某个定理条件。
   */
  onToggleCondition: (
    key: keyof Conditions,
  ) => void

  /**
   * 当前三个条件是否全部满足。
   */
  judgmentOk: boolean

  /**
   * 当前教学判断文本。
   */
  judgmentText: string
}

type ConditionKey =
  keyof Conditions

/**
 * 罗尔定理三个条件。
 */
const CONDITION_ITEMS: Array<{
  key: ConditionKey
  label: string
  desc: string
}> = [
  {
    key: 'continuous',
    label: '闭区间连续',
    desc: '关闭后将破坏连续性',
  },

  {
    key: 'differentiable',
    label: '开区间可导',
    desc: '关闭后将破坏可导性',
  },

  {
    key: 'equalEndpoints',
    label: '端点函数值相等',
    desc: '关闭后将破坏等高条件',
  },
]

interface ToggleSwitchProps {
  checked: boolean
  onChange: () => void
  label: string
}

/**
 * Experiment V2 通用风格开关。
 *
 * 暂时定义在 RolleControl 内部。
 * 后续如果其他实验也需要大量开关，
 * 可以再抽成公共组件。
 */
function ToggleSwitch({
  checked,
  onChange,
  label,
}: ToggleSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={[
        'relative',
        'h-6',
        'w-10',
        'shrink-0',
        'rounded-full',
        'transition-all',
        'duration-200',

        checked
          ? [
              'bg-indigo-600',
              'shadow-inner',
            ].join(' ')
          : [
              'bg-gray-300',
              'hover:bg-gray-400',
            ].join(' '),
      ].join(' ')}
    >
      <span
        className={[
          'absolute',
          'top-0.5',
          'h-5',
          'w-5',
          'rounded-full',
          'bg-white',
          'shadow',
          'transition-all',
          'duration-200',

          checked
            ? 'left-[18px]'
            : 'left-0.5',
        ].join(' ')}
      />
    </button>
  )
}

/**
 * 罗尔定理右侧控制区域。
 *
 * 注意：
 *
 * 这里已经不再返回：
 *
 * <aside>
 *
 * 因为：
 *
 * ExperimentShell
 *
 * 已经统一负责：
 *
 * - Sidebar 宽度
 * - Desktop / Mobile 布局
 * - overflow
 * - 响应式
 *
 * RolleControl 只负责渲染：
 *
 * 1. 定理条件
 * 2. 案例与条件
 * 3. 教学判断
 */
export default function RolleControl({
  caseId,
  onSelectCase,
  conditions,
  onToggleCondition,
  judgmentOk,
  judgmentText,
}: RolleControlProps) {
  /**
   * 当前案例。
   */
  const activeCase =
    CASES.find(
      (item) =>
        item.id === caseId,
    ) ?? CASES[0]

  /**
   * AI 提问内容。
   *
   * 将当前案例与条件状态一起带给 AI。
   */
  const askQuestion = [
    '请结合当前罗尔定理实验讲解为什么结论成立或不成立。',
    `当前函数案例：${activeCase.name}。`,
    `闭区间连续：${conditions.continuous ? '满足' : '不满足'}。`,
    `开区间可导：${conditions.differentiable ? '满足' : '不满足'}。`,
    `端点函数值相等：${conditions.equalEndpoints ? '满足' : '不满足'}。`,
  ].join('')

  const askPath =
    `/ask?question=${encodeURIComponent(
      askQuestion,
    )}`

  return (
    <div
      className="
        flex
        w-full
        flex-col
        gap-4
      "
    >
      {/* =========================================================
          1. 定理条件
         ========================================================= */}

      <ExperimentCard
        title="定理条件"
        action={
          <span
            className={[
              'rounded-full',
              'px-2.5',
              'py-1',
              'text-xs',
              'font-semibold',

              judgmentOk
                ? [
                    'bg-emerald-50',
                    'text-emerald-600',
                  ].join(' ')
                : [
                    'bg-amber-50',
                    'text-amber-600',
                  ].join(' '),
            ].join(' ')}
          >
            {judgmentOk
              ? '全部满足'
              : '条件未满足'}
          </span>
        }
      >
        <p
          className="
            text-[13px]
            leading-6
            text-gray-600
          "
        >
          {THEOREM_TEXT}
        </p>

        <div
          className="
            mt-3
            rounded-xl
            border
            border-indigo-100
            bg-indigo-50/70
            px-3.5
            py-3
            text-center
          "
        >
          <span
            className="
              text-sm
              font-semibold
              text-indigo-700
            "
          >
            {CONDITION_FORMULA}
          </span>
        </div>
      </ExperimentCard>

      {/* =========================================================
          2. 案例与条件
         ========================================================= */}

      <ExperimentCard
        title="案例与条件"
        action={
          <button
            type="button"
            onClick={() =>
              onSelectCase(
                'x3-1',
              )
            }
            disabled={
              caseId === 'x3-1'
            }
            className="
              rounded-lg
              bg-indigo-50
              px-2.5
              py-1
              text-xs
              font-medium
              text-indigo-600
              transition-all

              hover:bg-indigo-100

              disabled:cursor-default
              disabled:bg-gray-100
              disabled:text-gray-400
            "
          >
            {caseId === 'x3-1'
              ? '当前为反例'
              : '切换反例'}
          </button>
        }
      >
        {/* =====================================================
            函数案例 Tabs
           ===================================================== */}

        <div
          className="
            flex
            rounded-xl
            bg-gray-100
            p-1
          "
        >
          {CASES.map(
            (
              item:
                RolleCase,
            ) => {
              const active =
                item.id ===
                caseId

              return (
                <button
                  key={
                    item.id
                  }
                  type="button"
                  onClick={() =>
                    onSelectCase(
                      item.id,
                    )
                  }
                  aria-pressed={
                    active
                  }
                  title={
                    item.desc
                  }
                  className={[
                    'min-w-0',
                    'flex-1',
                    'truncate',
                    'rounded-lg',
                    'px-2',
                    'py-1.5',
                    'text-xs',
                    'font-semibold',
                    'transition-all',

                    active
                      ? [
                          'bg-indigo-600',
                          'text-white',
                          'shadow-sm',
                          'shadow-indigo-500/20',
                        ].join(
                          ' ',
                        )
                      : [
                          'text-gray-500',
                          'hover:bg-white/70',
                          'hover:text-gray-700',
                        ].join(
                          ' ',
                        ),
                  ].join(
                    ' ',
                  )}
                >
                  {item.name}
                </button>
              )
            },
          )}
        </div>

        {/* 当前案例描述 */}
        <div
          className="
            mt-3
            rounded-lg
            bg-slate-50
            px-3
            py-2.5
          "
        >
          <div
            className="
              text-xs
              font-semibold
              text-slate-700
            "
          >
            {activeCase.name}
          </div>

          <div
            className="
              mt-1
              text-[11px]
              leading-5
              text-slate-400
            "
          >
            {activeCase.desc}
          </div>
        </div>

        {/* =====================================================
            条件开关
           ===================================================== */}

        <div
          className="
            mt-4
            space-y-1
          "
        >
          {CONDITION_ITEMS.map(
            (
              item,
            ) => {
              const checked =
                conditions[
                  item.key
                ]

              /**
               * x³−1 是天然端点不等高的反例。
               */
              const isAutoOff =
                item.key ===
                  'equalEndpoints' &&
                activeCase.id ===
                  'x3-1' &&
                !checked

              return (
                <div
                  key={
                    item.key
                  }
                  className={[
                    'flex',
                    'items-center',
                    'justify-between',
                    'gap-3',
                    'rounded-xl',
                    'px-3',
                    'py-2.5',
                    'transition-colors',

                    isAutoOff
                      ? [
                          'border',
                          'border-amber-100',
                          'bg-amber-50/60',
                        ].join(
                          ' ',
                        )
                      : 'hover:bg-gray-50',
                  ].join(
                    ' ',
                  )}
                >
                  {/* 条件文本 */}
                  <div
                    className="
                      min-w-0
                      flex-1
                    "
                  >
                    <div
                      className="
                        text-[13px]
                        font-medium
                        text-gray-700
                      "
                    >
                      {item.label}
                    </div>

                    <div
                      className={[
                        'mt-0.5',
                        'text-[11px]',
                        'leading-4',

                        isAutoOff
                          ? 'text-amber-600'
                          : 'text-gray-400',
                      ].join(
                        ' ',
                      )}
                    >
                      {isAutoOff
                        ? '此函数端点值不相等，是用于观察条件失效的反例'
                        : item.desc}
                    </div>
                  </div>

                  {/* 开关 */}
                  <ToggleSwitch
                    checked={
                      checked
                    }
                    label={
                      item.label
                    }
                    onChange={() =>
                      onToggleCondition(
                        item.key,
                      )
                    }
                  />
                </div>
              )
            },
          )}
        </div>
      </ExperimentCard>

      {/* =========================================================
          3. 教学判断
         ========================================================= */}

      <ExperimentCard
        title="教学判断"
        action={
          <span
            className={[
              'rounded-full',
              'px-2.5',
              'py-1',
              'text-xs',
              'font-semibold',

              judgmentOk
                ? [
                    'bg-emerald-50',
                    'text-emerald-600',
                  ].join(' ')
                : [
                    'bg-rose-50',
                    'text-rose-500',
                  ].join(' '),
            ].join(' ')}
          >
            {judgmentOk
              ? '结论成立'
              : '结论不成立'}
          </span>
        }
      >
        {/* 判断结果 */}
        <div
          className={[
            'flex',
            'items-start',
            'gap-2.5',
            'rounded-xl',
            'border',
            'px-3.5',
            'py-3',

            judgmentOk
              ? [
                  'border-emerald-100',
                  'bg-emerald-50/60',
                ].join(
                  ' ',
                )
              : [
                  'border-rose-100',
                  'bg-rose-50/60',
                ].join(
                  ' ',
                ),
          ].join(' ')}
        >
          <svg
            className={[
              'mt-0.5',
              'h-4',
              'w-4',
              'shrink-0',

              judgmentOk
                ? 'text-emerald-500'
                : 'text-rose-400',
            ].join(' ')}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {judgmentOk ? (
              <path d="M9 12l2 2 4-4m5.2 2a9 9 0 1 1-2.6-6.4" />
            ) : (
              <>
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                />

                <path d="M8 8l8 8M16 8l-8 8" />
              </>
            )}
          </svg>

          <p
            className="
              text-[13px]
              leading-6
              text-gray-600
            "
          >
            {judgmentText}
          </p>
        </div>

        {/* 条件状态摘要 */}
        <div
          className="
            mt-3
            grid
            grid-cols-1
            gap-2
          "
        >
          {CONDITION_ITEMS.map(
            (
              item,
            ) => {
              const passed =
                conditions[
                  item.key
                ]

              return (
                <div
                  key={
                    item.key
                  }
                  className="
                    flex
                    items-center
                    justify-between
                    rounded-lg
                    bg-gray-50
                    px-3
                    py-2
                  "
                >
                  <span
                    className="
                      text-xs
                      text-gray-500
                    "
                  >
                    {item.label}
                  </span>

                  <span
                    className={[
                      'text-xs',
                      'font-semibold',

                      passed
                        ? 'text-emerald-600'
                        : 'text-rose-500',
                    ].join(
                      ' ',
                    )}
                  >
                    {passed
                      ? '满足'
                      : '不满足'}
                  </span>
                </div>
              )
            },
          )}
        </div>

        {/* AI 助教 */}
        <Link
          to={askPath}
          className="
            mt-4
            inline-flex
            h-11
            w-full
            items-center
            justify-center
            gap-1.5
            rounded-xl
            bg-indigo-600
            text-sm
            font-semibold
            text-white
            shadow-md
            shadow-indigo-500/20
            transition-all

            hover:bg-indigo-700
            hover:shadow-lg
            hover:shadow-indigo-500/25

            active:bg-indigo-800
          "
        >
          <svg
            className="
              h-4
              w-4
              text-amber-300
            "
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 2l1.9 5.7L19.6 9l-5.7 1.9L12 16.6l-1.9-5.7L4.4 9l5.7-1.3L12 2zm7 11l.9 2.6 2.6.9-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9.9-2.6z" />
          </svg>

          向 AI 助教提问
        </Link>
      </ExperimentCard>
    </div>
  )
}