import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { experiments } from '../experiments/catalog'
import {
  fetchExperimentCatalog,
  type PublishedExperiment,
} from '../services/contentCatalog'

const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: '入门级',
  elementary: '基础级',
  intermediate: '中级',
  advanced: '高级',
  expert: '专业级',
}

const DIFFICULTY_STYLES: Record<string, string> = {
  beginner: 'bg-emerald-50 text-emerald-700',
  elementary: 'bg-blue-50 text-blue-700',
  intermediate: 'bg-amber-50 text-amber-700',
  advanced: 'bg-violet-50 text-violet-700',
  expert: 'bg-rose-50 text-rose-700',
}

function getLocalFallback(q: string, difficulty: string, limit: number): PublishedExperiment[] {
  const keyword = q.trim().toLocaleLowerCase('zh-CN')
  return experiments
    .filter((item) => !difficulty || item.difficulty === difficulty)
    .filter((item) => {
      if (!keyword) return true
      return [item.title, item.description, item.path, ...item.topics]
        .join(' ')
        .toLocaleLowerCase('zh-CN')
        .includes(keyword)
    })
    .slice(0, limit)
    .map((item, index) => ({
      id: item.path.slice(1) || String(index + 1),
      path: item.path,
      title: item.title,
      description: item.description,
      topics: item.topics,
      difficulty: item.difficulty,
      hasAnimation: item.hasAnimation,
      hasSteps: item.hasSteps,
    }))
}

export default function ExperimentLibrary() {
  const [query, setQuery] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [visibleLimit, setVisibleLimit] = useState(12)
  const [items, setItems] = useState<PublishedExperiment[]>([])
  const [total, setTotal] = useState(experiments.length)
  const [source, setSource] = useState<'loading' | 'api' | 'fallback'>('loading')

  useEffect(() => {
    const controller = new AbortController()
    const timer = window.setTimeout(() => {
      setSource('loading')
      fetchExperimentCatalog(
        { q: query, difficulty, limit: Math.min(visibleLimit, 60) },
        controller.signal,
      )
        .then((result) => {
          setItems(result.items)
          setTotal(result.total)
          setSource('api')
        })
        .catch((error: unknown) => {
          if (error instanceof DOMException && error.name === 'AbortError') return
          const fallback = getLocalFallback(query, difficulty, visibleLimit)
          setItems(fallback)
          setTotal(
            getLocalFallback(query, difficulty, experiments.length).length,
          )
          setSource('fallback')
        })
    }, 180)

    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [difficulty, query, visibleLimit])

  const difficultyOptions = useMemo(
    () => ['', 'beginner', 'elementary', 'intermediate', 'advanced', 'expert'],
    [],
  )

  const updateDifficulty = (value: string) => {
    setDifficulty(value)
    setVisibleLimit(12)
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">全部可视化实验</h2>
            <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-600">
              {total} 个结果
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            搜索并直接打开已有实验；目录由后端统一提供，离线时自动使用本地清单。
          </p>
        </div>

        <label className="relative block w-full lg:w-80">
          <span className="sr-only">搜索实验</span>
          <svg className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setVisibleLimit(12)
            }}
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
            placeholder="搜索分数、极限、曲线……"
          />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-2" aria-label="按难度筛选">
        {difficultyOptions.map((value) => (
          <button
            key={value || 'all'}
            type="button"
            onClick={() => updateDifficulty(value)}
            aria-pressed={difficulty === value}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              difficulty === value
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {value ? DIFFICULTY_LABELS[value] : '全部难度'}
          </button>
        ))}
        <span className="ml-auto self-center text-xs text-slate-400">
          {source === 'loading' ? '正在同步…' : source === 'api' ? '后端目录已同步' : '当前使用本地目录'}
        </span>
      </div>

      {items.length > 0 ? (
        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              className="group flex min-h-44 flex-col rounded-xl border border-slate-200 p-4 transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-bold text-slate-800 transition group-hover:text-indigo-600">
                  {item.title}
                </h3>
                <span className={`shrink-0 rounded-md px-2 py-1 text-[11px] font-semibold ${DIFFICULTY_STYLES[item.difficulty] ?? 'bg-slate-100 text-slate-600'}`}>
                  {DIFFICULTY_LABELS[item.difficulty] ?? item.difficulty}
                </span>
              </div>
              <p className="mt-2 line-clamp-3 flex-1 text-sm leading-6 text-slate-500">
                {item.description}
              </p>
              <div className="mt-3 flex items-center gap-2">
                {item.topics.slice(0, 2).map((topic) => (
                  <span key={topic} className="rounded bg-slate-100 px-2 py-1 text-[11px] text-slate-500">
                    {topic}
                  </span>
                ))}
                <span className="ml-auto text-sm font-semibold text-indigo-600">打开实验 →</span>
              </div>
            </Link>
          ))}
        </div>
      ) : source === 'loading' ? (
        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-44 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-xl border border-dashed border-slate-300 py-12 text-center text-sm text-slate-500">
          没有找到匹配实验，请尝试更短的关键词或切换难度。
        </div>
      )}

      {items.length < total && visibleLimit < 60 && (
        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={() => setVisibleLimit((value) => Math.min(value + 12, 60))}
            className="rounded-lg border border-indigo-200 px-5 py-2.5 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50"
          >
            再显示 12 个
          </button>
        </div>
      )}
    </section>
  )
}
