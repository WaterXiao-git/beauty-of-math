import { useState } from 'react'
import BugReportModal from './BugReportModal'

interface BugReportButtonProps {
  experimentName?: string
  experimentPath?: string
}

export default function BugReportButton({ experimentName, experimentPath }: BugReportButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-4 right-4 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-orange-200 bg-white text-orange-500 shadow-lg transition-all hover:scale-105 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2"
        aria-label="报告问题"
        title="报告问题"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </button>

      {isModalOpen && (
        <BugReportModal
          onClose={() => setIsModalOpen(false)}
          experimentName={experimentName}
          experimentPath={experimentPath}
        />
      )}
    </>
  )
}
