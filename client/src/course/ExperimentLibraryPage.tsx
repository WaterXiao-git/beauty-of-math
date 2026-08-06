import CourseHeader from './CourseHeader'
import ExperimentLibrary from './ExperimentLibrary'

export default function ExperimentLibraryPage() {
  return (
    <div className="flex h-full flex-col bg-[#f5f7fa]">
      <CourseHeader breadcrumb={['首页', '全部可视化实验']} />
      <main className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[1500px] p-4 md:p-6">
          <ExperimentLibrary />
        </div>
      </main>
    </div>
  )
}
