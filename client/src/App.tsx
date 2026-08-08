import { lazy, Suspense, type ComponentType } from 'react'
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useParams,
} from 'react-router-dom'

import ErrorBoundary from './components/ErrorBoundary'
import Layout from './components/Layout/Layout'
import Home from './experiments/Home'

function lazyRetry<P extends object>(
  loader: () => Promise<{ default: ComponentType<P> }>,
  retries = 2,
) {
  return lazy(() => {
    const attempt = (remaining: number): Promise<{ default: ComponentType<P> }> =>
      loader().catch((error) => {
        if (remaining <= 0) throw error
        return new Promise((resolve) => {
          window.setTimeout(() => resolve(attempt(remaining - 1)), 1000)
        })
      })
    return attempt(retries)
  })
}

const AskPage = lazyRetry(() => import('./ask/AskPage'))
const ExperimentLibraryPage = lazyRetry(() => import('./course/ExperimentLibraryPage'))
const DemoPage = lazyRetry(() => import('./demo/DemoPage'))
const TempExperiment = lazyRetry(() => import('./demo/TempExperiment'))
const DynamicExperimentPage = lazyRetry(() => import('./experiments/dynamic/DynamicExperimentPage'))
const BugAdminPage = lazyRetry(() => import('./pages/BugAdminPage'))
const ValentineMobile = lazyRetry(() => import('./components/ValentineMobile/ValentineMobile'))

function LegacyExperimentRedirect() {
  const { experimentId } = useParams<{ experimentId: string }>()
  return <Navigate replace to={experimentId ? `/demo/${encodeURIComponent(experimentId)}` : '/experiments'} />
}

function Loading() {
  return (
    <div className="flex h-64 flex-col items-center justify-center gap-3 text-gray-400">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-300 border-t-indigo-600" />
      <span className="text-sm">加载中...</span>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="ask" element={<AskPage />} />
              <Route path="experiments" element={<ExperimentLibraryPage />} />
              <Route path="demo/:pointId" element={<DemoPage />} />
              <Route path="temp/:specId" element={<TempExperiment />} />
              <Route path="generated-experiment" element={<DynamicExperimentPage />} />
              <Route path=":experimentId" element={<LegacyExperimentRedirect />} />
            </Route>
            <Route path="/admin" element={<BugAdminPage />} />
            <Route
              path="/valentine"
              element={(
                <Suspense fallback={<div className="fixed inset-0 bg-[#0a050f]" />}>
                  <ValentineMobile />
                </Suspense>
              )}
            />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  )
}
