// ai / no-match 分支：生成确认卡 + 无匹配说明卡
import { Link } from 'react-router-dom'
import type { RouteResult } from './AskPage'

interface GenerateConfirmProps {
  route: RouteResult
  onConfirmGenerate: () => void
  onRefine: () => void
  /** 生成中 */
  generating?: boolean
}

/** ai 分支：未命中高置信，确认后生成临时交互实验（架构图分支 C） */
export function GenerateConfirm({ route, onConfirmGenerate, onRefine, generating = false }: GenerateConfirmProps) {
  return (
    <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <h4 className="text-base font-bold text-gray-900">未命中现有实验</h4>
        <span className="shrink-0 px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 text-xs font-semibold">
          受约束生成
        </span>
      </div>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">{route.reason}</p>

      {/* 低分候选（若有） */}
      {route.matches.length > 0 && (
        <div className="mb-4">
          <div className="text-xs font-medium text-gray-400 mb-2">相关实验（置信度较低）</div>
          <div className="flex flex-wrap gap-2">
            {route.matches.slice(0, 3).map((m) => (
              <Link
                key={m.path}
                to={m.path}
                className="px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-xs text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-colors"
              >
                {m.title}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onConfirmGenerate}
          disabled={generating}
          className="inline-flex items-center justify-center px-4 h-10 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {generating ? (
            <>
              <svg className="w-4 h-4 mr-1.5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z" />
              </svg>
              正在生成…
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-1.5 text-amber-300" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l1.9 5.7L19.6 9l-5.7 1.9L12 16.6l-1.9-5.7L4.4 9l5.7-1.3L12 2zm7 11l.9 2.6 2.6.9-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9.9-2.6z" />
              </svg>
              确认生成临时实验
            </>
          )}
        </button>
        <button
          type="button"
          onClick={onRefine}
          className="inline-flex items-center justify-center px-4 h-10 rounded-lg bg-white text-blue-600 border-2 border-blue-200 text-sm font-semibold hover:border-blue-400 hover:bg-blue-50 transition-colors"
        >
          调整问题
        </button>
      </div>
      <p className="text-[11px] text-gray-400 mt-3">* 临时实验生成将在下一步接入（模板优先 + 大模型配置 + Schema 校验）</p>
    </section>
  )
}

interface NoMatchProps {
  route: RouteResult
  onRefine: () => void
}

/** no-match 分支：说明原因 + 替代学习路径 */
export function NoMatchCard({ route, onRefine }: NoMatchProps) {
  return (
    <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <h4 className="text-base font-bold text-gray-900">未能识别到可演示的内容</h4>
        <span className="shrink-0 px-2.5 py-1 rounded-full bg-rose-50 text-rose-500 text-xs font-semibold">
          未匹配
        </span>
      </div>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">{route.reason}</p>
      <div className="mb-4 px-3.5 py-3 rounded-xl bg-blue-50/60 border border-blue-100 text-[13px] text-gray-600 leading-relaxed">
        建议：换一种表述方式（例如「演示傅里叶变换」「画出正弦函数图像」），或直接浏览全部实验，也可以输入「x=1 处切线」这类带参数的问题。
      </div>
      <div className="flex items-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center justify-center px-4 h-10 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20"
        >
          浏览全部实验
        </Link>
        <button
          type="button"
          onClick={onRefine}
          className="inline-flex items-center justify-center px-4 h-10 rounded-lg bg-white text-blue-600 border-2 border-blue-200 text-sm font-semibold hover:border-blue-400 hover:bg-blue-50 transition-colors"
        >
          调整问题
        </button>
      </div>
    </section>
  )
}