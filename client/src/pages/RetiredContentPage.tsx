import { Link } from 'react-router-dom'

export default function RetiredContentPage() {
  return (
    <main className="flex min-h-full items-center justify-center bg-slate-100 p-6">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">内容已下线</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          此地址不再提供内容，请从知识地图或当前自研实验继续学习。
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            to="/"
            className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            返回知识地图
          </Link>
          <Link
            to="/experiments"
            className="inline-flex h-10 items-center justify-center rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-500"
          >
            浏览全部实验
          </Link>
        </div>
      </section>
    </main>
  )
}
