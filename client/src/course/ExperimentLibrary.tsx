import { Link } from 'react-router-dom'

import { OWNED_EXPERIMENT_CATALOG } from '../owned-experiments/catalog.generated'

export function getHighMathExperimentCards() {
  return OWNED_EXPERIMENT_CATALOG.map((experiment) => ({
    id: experiment.id,
    title: experiment.title,
    description: experiment.description,
    knowledgePoint: experiment.knowledgePointId,
    path: experiment.path,
  }))
}

export default function ExperimentLibrary() {
  const cards = getHighMathExperimentCards()

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">浏览全部实验</h2>
        <p className="mt-1 text-sm text-slate-500">
          当前共 {cards.length} 个自研高等数学交互实验，不包含已下线的旧实验资源。
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <article
            key={card.path}
            className="flex min-h-56 flex-col rounded-2xl border border-slate-200 bg-slate-50 p-5"
          >
            <h3 className="text-base font-bold text-slate-900">{card.title}</h3>
            <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">{card.description}</p>
            <p className="mt-4 text-xs font-medium text-slate-500">
              所属知识点：{card.knowledgePoint}
            </p>
            <Link
              to={card.path}
              className="mt-4 inline-flex h-10 items-center justify-center rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-500"
            >
              进入演示
            </Link>
          </article>
        ))}
      </div>
    </section>
  )
}
