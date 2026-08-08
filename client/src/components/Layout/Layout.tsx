import { useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'

import { BugReportButton } from '../BugReport'
import { NarrationController } from '../NarrationController'
import { NarrationProvider, useNarrationOptional } from '../../contexts/NarrationContext'

function LayoutContent() {
  const mainRef = useRef<HTMLElement>(null)
  const narration = useNarrationOptional()
  const location = useLocation()
  const isNarrationMode = narration?.playbackState.isNarrationMode || false
  const isPresenterMode = narration?.playbackState.isPresenterMode || false
  const isExperimentPage =
    location.pathname.startsWith('/demo/') ||
    location.pathname.startsWith('/temp/') ||
    location.pathname === '/generated-experiment'

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, behavior: 'auto' })
  }, [location.pathname])

  return (
    <div className="flex h-screen bg-slate-100">
      <main ref={mainRef} className="min-h-0 flex-1">
        <Outlet />
      </main>
      {isNarrationMode && !isPresenterMode && <NarrationController />}
      {isExperimentPage && <BugReportButton experimentPath={location.pathname} />}
    </div>
  )
}

export default function Layout() {
  return (
    <NarrationProvider>
      <LayoutContent />
    </NarrationProvider>
  )
}
