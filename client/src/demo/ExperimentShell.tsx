// 旧实验页统一外壳：DemoHeader（面包屑/提问）+ 内容区 + 左侧触角 + 章节抽屉
// 让 300+ 原有实验页（/linear-function 等）获得与演示页一致的外观与导航
import { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import DemoHeader from './DemoHeader'
import DrawerTab from './DrawerTab'
import DrawerSidebar from '../course/DrawerSidebar'
import { experiments } from '../experiments/catalog'

export default function ExperimentShell() {
  const navigate = useNavigate()
  const location = useLocation()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const path = location.pathname
  const exp = experiments.find((e) => path === e.path || path.startsWith(e.path + '/'))
  const title = exp?.title ?? (path === '/' ? '首页' : path.slice(1))

  return (
    <div className="flex flex-col h-full w-full bg-[#f5f7fa]">
      <DemoHeader breadcrumb={['首页', '交互实验', title]} onBreadcrumbClick={() => navigate('/')} />

      <div className="relative flex-1 min-h-0">
        {/* 内容区（滚动 + 内边距，与原布局一致） */}
        <div className="h-full overflow-y-auto p-4 md:p-8">
          <Outlet />
        </div>

        {/* 收起态左侧触角：点击弹出章节目录抽屉 */}
        {!drawerOpen && <DrawerTab onClick={() => setDrawerOpen(true)} />}

        {/* 抽屉式侧边栏（章节知识点目录，选中跳转 /demo/:pointId） */}
        <DrawerSidebar
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          selectedPointId=""
          onSelectPoint={(id) => {
            setDrawerOpen(false)
            navigate('/demo/' + id)
          }}
        />
      </div>
    </div>
  )
}
