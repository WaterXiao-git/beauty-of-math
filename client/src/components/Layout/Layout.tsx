import { useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'

import { BugReportButton } from '../BugReport'

export default function Layout() {
  const mainRef = useRef<HTMLElement>(null)
  const location = useLocation()
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
      {isExperimentPage && <BugReportButton pagePath={location.pathname} />}
    </div>
  )
}
