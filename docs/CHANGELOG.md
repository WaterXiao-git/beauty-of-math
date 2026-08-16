## 2026-08-14 · 高数实验入口收敛
**模块**：实验目录、应用路由、退役内容页
**内容**：实验目录改为仅展示 8 个自研高数实验，所有卡片统一进入 `/demo/*`。根路径直接加载知识地图；历史单段实验重定向已移除，未匹配地址统一进入退役页。退役页仅提供返回知识地图和高数实验两个入口。
**涉及文件**：`client/src/App.tsx`、`client/src/course/ExperimentLibraryPage.tsx`、`client/src/course/ExperimentLibrary.tsx`、`client/src/course/ExperimentLibrary.test.ts`、`client/src/pages/RetiredContentPage.tsx`、`client/src/experiments/Home.tsx`
**验证**：`cd client; npx vitest run src/course/ExperimentLibrary.test.ts`（1 项通过）；`cd client; npx tsc -b --pretty false`（退出码 0）。

---

## 2026-08-09 · 八门大学数学课程知识图谱

**模块**：课程知识模型、章节目录、知识地图、知识点导航、AI 提问页与实验页目录

**内容**：章节目录由单一高等数学扩展为八门课程：高等数学、线性代数、概率论与数理统计、离散数学与数论、数值分析与优化、解析几何与拓扑、应用数学与动力系统、基础数学与函数。每门课程均建立四章、分节和大学课程层级的核心知识点，并为知识点生成直接关联、先修关系与最多二层的递归邻接遍历。目录新增课程切换器；切换后左侧章节树、中央知识地图、下方同节知识点卡片、右侧简介与学习目标同步更新。首页、AI 提问页和 Experiment V2 实验页抽屉共用同一课程模型，实验页点击知识点仍回到对应课程的知识地图，由用户决定是否进入演示。

**涉及文件**：`client/src/course/courseCatalog.ts`（新增）、`client/src/course/courseData.ts`、`client/src/course/KnowledgeNavigationPanel.tsx`、`client/src/course/DrawerSidebar.tsx`、`client/src/course/CourseHome.tsx`、`client/src/course/KnowledgeMap.tsx`、`client/src/ask/AskPage.tsx`、`client/src/demo/DemoHeader.tsx`

**验证**：八门课程逐门切换后均显示各自四章内容；线性代数“矩阵及其运算”可展示关联知识地图、同节知识点卡片和课程专属详情；AI 提问页与 `/demo/epsilon-delta` 实验页目录均可选择八门课程，并保留“浏览全部 300 个可视化实验”入口。专项 ESLint 与 TypeScript 检查通过。

---
## 2026-08-09 · 删除旧实验外壳并统一 Experiment V2 入口

**模块**：应用路由、历史布局、300 实验统一入口、课程目录抽屉

**内容**：删除历史深色侧栏及其移动端头部，移除 `App.tsx` 中约 300 条直接渲染旧实验组件的重复顶级路由。所有正式实验统一通过 `/demo/:experimentId` 进入 `DemoPage → Experiment V2` 工作台；旧的 `/calculus`、`/fourier` 等单段地址保留兼容重定向并立即跳到相应 `/demo/*`，避免历史收藏失效，同时彻底消除旧侧栏与新版顶栏同时出现的双层导航。恢复章节目录抽屉底部“浏览全部 300 个可视化实验”入口，仍保留此前要求删除的右上角“全部”文字按钮。章节与小节改为“首次定位选中知识点时自动展开，之后尊重用户手动开合”，当前知识点不再强制锁定父级展开状态。AI 提问页增加仅限当前前端运行时的会话快照：进入实验后使用浏览器返回会恢复问题、匹配结果、学习路径和解析面板；刷新页面或从导航重新进入则保持空白初始态，不写入浏览器持久存储。

**涉及文件**：`client/src/App.tsx`、`client/src/components/Layout/Layout.tsx`、`client/src/components/Layout/Sidebar.tsx`（删除）、`client/src/course/DrawerSidebar.tsx`、`client/src/course/KnowledgeNavigationPanel.tsx`、`client/src/course/CourseHome.tsx`、`client/src/ask/AskPage.tsx`

**验证**：浏览器确认 `/calculus` 自动跳转到 `/demo/calculus`，页面只保留 Experiment V2 顶栏、课程目录、实验主画布和右侧控制区，不再出现深色侧栏；从 `/ask` 打开课程目录可见底部“浏览全部 300 个可视化实验”，点击后正确进入 `/experiments` 并显示 300 个结果；在 `/?point=limit-of-function` 中点击第一章和 `1.2 极限` 均可收起包含当前选中知识点的内容；提交“定积分怎么计算面积”进入实验后返回，问题和完整匹配结果恢复，重新加载 `/ask` 后恢复为 0/500 与“等待你的问题”。

---
## 2026-08-09 · 恢复知识地图首页与知识点目录

**模块**：知识地图首页、AI 提问页、知识点目录、移动端抽屉、Experiment V2 面包屑

**内容**：撤销课程卡片首页和误放在根路径的 AI 提问工作台，根路径 `/` 恢复为客户示意图中的知识地图首页，AI 自然语言提问继续使用独立 `/ask` 页面。首页与 AI 页初次进入时均不再默认绑定“函数的极限”：四个章节保持收起、无知识点选中；首页显示知识点选择引导，选择后才加载知识地图与详情；AI 页输入框为空，当前提问解析和 AI 理解结果显示未提问占位，提交后才进行知识点推断。首页左侧改回课程知识点目录，数据来自原课程章节、分节和知识点模型；知识点点击只更新 URL 的 `point` 参数、中央知识地图、知识点卡片和右侧详情，不直接进入实验。演示页中的同一目录也统一返回 `/?point=...` 知识地图页，由用户自行决定是否再次进入演示。目录采用客户图中的编号圆标、折叠箭头、竖向引导线和圆点知识项，并同时用于桌面常驻栏和移动端抽屉。完整的 8 门课程与 300 个实验分类仅保留在实验中心 `/experiments`。删除目录头部重复的“全部实验”快捷入口。首页面包屑精简为“首页 → 当前知识点”，实验页统一精简为“首页 → 实验库 → 实验名”，不再展示冗长的单课程章节路径。

**涉及文件**：`client/src/App.tsx`、`client/src/course/CourseHome.tsx`、`client/src/course/KnowledgeNavigationPanel.tsx`、`client/src/course/DrawerSidebar.tsx`、`client/src/ask/AskPage.tsx`、`client/src/demo/DemoHeader.tsx`、`client/src/course/CourseSelectionHome.tsx`（删除）、`client/src/course/CourseTreeNavigation.tsx`（删除）

**验证**：前端变更文件 ESLint 与 TypeScript 通过；上一轮生产构建确认 300/300 实验配置完整且主题违规为 0。浏览器验证 `/` 初始四章收起且显示“选择一个知识点开始学习”；`/ask` 输入为空、显示 0/500，并在中栏和右栏展示未提问状态；从 `/demo/epsilon-delta` 打开章节目录并点击“数列的极限”后进入 `/?point=limit-of-sequence` 的知识地图及详情，没有切换至对应实验。

---
## 2026-08-09 · 全课程首页与 300 实验统一导航

**模块**：课程选择首页、全局课程抽屉、实验中心 URL 筛选、Experiment V2 面包屑

**内容**：根路径 `/` 不再默认展示“高等数学（上册）”单课程知识页，改为面向全部内容的课程选择首页，展示 8 门课程及各自真实章节数、实验数，并提供全部实验和 AI 提问入口。全局课程抽屉从旧高数本地种子切换为 300 个真实实验的统一分类，支持展开 8 门课程、26 个章节、71 个知识点以及搜索，课程、章节、知识点均可进入对应实验筛选结果。实验中心新增 URL 查询参数同步，同一路由下从首页或抽屉切换课程也会正确更新结果。Experiment V2 顶栏为实验自动读取真实分类，统一显示并链接“首页 → 课程 → 章节 → 知识点 → 实验”；AI 提问页没有明确知识点上下文时不再默认突出高等数学。

**涉及文件**：`client/src/App.tsx`、`client/src/course/CourseSelectionHome.tsx`、`client/src/course/DrawerSidebar.tsx`、`client/src/course/CourseHeader.tsx`、`client/src/course/ExperimentLibraryPage.tsx`、`client/src/course/ExperimentLibrary.tsx`、`client/src/demo/DemoHeader.tsx`、`client/src/ask/AskPage.tsx`

**验证**：前端完整 ESLint、生产构建、300/300 课程配置检查与主题检查通过；涉及文件专项 ESLint 和 TypeScript 通过。浏览器确认 `/` 展示 8 门课程且高等数学只是其中一项；全局抽屉展示 8 门课程、300 个实验及课程内章节/知识点链接；从首页进入线性代数返回 28 个实验；`/demo/linear-algebra` 自动显示“首页 → 线性代数 → 矩阵与线性代数 → 矩阵与向量 → 线性代数”，首页链接可返回 `/`。

---
## 2026-08-09 · 300 个实验课程体系与 Agent 双模式验收

**模块**：实验数据目录、实验中心、AI 智能提问、动态实验、统一 Experiment V2 工作台

**内容**：按真实的 300 个实验 Manifest 建立“课程 → 章节 → 知识点 → 实验”统一分类，共形成 8 门课程、26 个章节和 71 个知识点，未分类实验为 0；实验目录接口新增课程、章节、知识点、难度与关键词组合查询，并返回由真实数据计算的层级聚合。实验中心增加课程卡片、章节/知识点联动筛选、搜索及完整分页浏览，结果数量均来自接口。AI 提问增加“智能推荐”和“直接问 AI”两种明确模式：直接模式绕过实验路由调用解释接口；智能推荐命中后不再强制跳转，由用户选择打开实验或改由 AI 解答；未命中时自动进入 AI 解释与临时实验生成流程。AI 临时实验页移除旧版侧边栏和独立布局，统一接入当前 Experiment V2 顶栏、课程抽屉、截图/全屏、上下文助教、参数区、知识点区和真实教学步骤播放器，同时保留原动态画布与参数交互。

**涉及文件**：`server/src/content/experimentTaxonomy.ts`、`server/src/services/experimentCatalogService.ts`、`server/src/services/experimentCatalogService.test.ts`、`server/src/routes/content.ts`、`client/src/services/contentCatalog.ts`、`client/src/course/ExperimentLibrary.tsx`、`client/src/ask/QuestionInput.tsx`、`client/src/ask/AskPage.tsx`、`client/src/ask/MatchResults.tsx`、`client/src/ask/AnswerCard.tsx`、`client/src/components/AgentExperimentRouter/AgentExperimentRouter.tsx`、`client/src/components/Layout/Layout.tsx`、`client/src/experiments/dynamic/DynamicExperimentPage.tsx`

**验证**：服务端 199 项测试、Manifest 检查与 TypeScript 构建通过；前端 257 个测试文件共 1855 项测试、完整 ESLint、TypeScript 与生产构建通过，构建期确认 300/300 实验课程配置完整且主题违规为 0。浏览器验证实验中心展示 300 个真实实验及 8 门课程的真实数量，关键词“极限 / 矩阵 / 概率”分别返回 5 / 25 / 33 项，高等数学课程筛选返回 50 项；验证智能推荐命中后保留用户选择、直接 AI 模式可取得 DeepSeek 教学解释；验证“四维超立方体的三维投影”生成 16 个顶点、32 条边及 4 个教学步骤，并以统一 Experiment V2 页面呈现。

---
## 2026-08-09 · 修复动态实验需求与输出错配

**模块**：智能提问页、动态实验 Agent、生成接口、语义一致性校验

**内容**：修复智能提问页仍调用旧二维 `/api/generate`、导致复杂需求被强行转换成无关函数曲线的问题。智能提问页现与首页 Agent 入口统一使用 `/api/agent/route` 和 `/api/agent/generate`；停止挂载落后的 `/api/route`、`/api/generate` 后台接口，并取消后端失败时会编造低置信候选的旧前端目录降级。统一路由继续沿用规则优先、候选召回、低置信度 Agent 增强与备用模型复核的原有算法；当问题明确属于数学可视化且没有可靠预设实验时，即使模型否定了弱候选，也会保留“确认生成”入口，避免可执行需求被降级成无操作死路。新增“需求—渲染器—教学内容”一致性门禁：三维/高维、算法、随机模拟、矩阵变换、分形和物理动态等需求必须使用通用隔离画布；极坐标、四则运算与显式函数分别使用匹配的结构化渲染器；核心数学概念必须同时出现在标题、描述、公式、步骤或知识点中。主模型错配时自动交由备用模型重做，双模型均不合格时拒绝展示，避免标题正确但图形无关。

**涉及文件**：`client/src/ask/AskPage.tsx`、`client/src/ask/GenerateConfirm.tsx`、`client/src/ask/askData.ts`、`client/src/services/questionRoute.ts`、`client/src/services/questionRoute.test.ts`、`client/src/services/agentRouting.ts`、`server/src/index.ts`、`server/src/routes/agent.ts`、`server/src/agent/generationOffer.ts`、`server/src/agent/generationOffer.test.ts`、`server/src/agent/dynamicExperiment/alignment.ts`、`server/src/agent/dynamicExperiment/generator.ts`、`server/src/agent/dynamicExperiment/alignment.test.ts`、`server/src/agent/dynamicExperiment/generator.test.ts`

**验证**：服务端 197 项测试、300 实验 Manifest 检查和 TypeScript 构建通过；前端路由与动态实验 7 项专项测试、TypeScript 及涉及文件 ESLint 通过。真实接口确认旧 `/api/route`、`/api/generate` 均返回 404；浏览器完整验证“四维超立方体的三维投影”先进入受约束生成确认，再生成 `sandboxed-html` 高维超立方体实验，画布正确显示 16 个顶点、32 条边和旋转/投影距离参数，未出现无关二维余弦曲线。

---
## 2026-08-09 · 精简实验底栏与模型故障兜底

**模块**：Experiment V2、问题反馈入口、数学解释服务、质量检查

**内容**：取消未与实验状态绑定的通用“观察 / 调整 / 比较 / 总结”播放器，普通实验释放底部空间；罗尔定理、导数和 ε−δ 三个具有真实教学状态的专用播放器继续保留。右下角反馈入口改为仅含问题图标的圆形按钮，保留点击反馈、悬浮说明及无障碍标签。修复外部模型调用被统一 4.5 秒提前中止及旧进程环境变量覆盖新密钥的问题：开发环境统一以 `server/.env` 为 AI 配置源，概念解释、路由 Agent、临时实验生成与模型复核共享同一套 DeepSeek/千问地址、模型、密钥和独立超时；生产环境仍优先使用部署平台变量。概念解释关闭不必要的深度思考，并在响应中标记真实模型或本地兜底来源。同步调整实验质量扫描规则，不再将主动不使用通用播放器判为缺陷。

**涉及文件**：`client/src/experiment-v2/ExperimentShell.tsx`、`client/src/components/BugReport/BugReportButton.tsx`、`client/src/ask/AnswerCard.tsx`、`client/src/demo/ContextAssistant.tsx`、`client/scripts/check-experiment-v2-quality.ts`、`server/src/config/environment.ts`、`server/src/index.ts`、`server/src/services/llmService.ts`、`server/src/services/llmService.test.ts`、`server/src/agent/ai/config.ts`、`server/.env.example`

**验证**：前端专项 ESLint 和 TypeScript 通过；服务端 189 项测试、300 实验 Manifest 检查和构建通过；浏览器验证普通实验无通用底栏、罗尔定理专用步骤保留、反馈按钮仅显示圆形图标且仍可打开表单；当前 `.env` 下 DeepSeek V4 Flash 与千问 3.7 Plus 均完成真实请求，`/api/answer` 返回 DeepSeek 来源，`/api/generate` 成功生成 161 个采样点与 4 个教学步骤，Agent 路由记录实际使用 `deepseek/deepseek-v4-flash`。

---
## 2026-08-08 · 全部实验统一接入 Experiment V2 工作台

**模块**：实验路由、Experiment V2 兼容运行时、统一浅色主题、构建检查

**内容**：将尚未原生迁移的 43 个历史实验统一改由 `LegacyExperimentRuntime` 加载，使 300 个实验均具备同一套顶栏、课程目录、截图/全屏、上下文 AI 助教与底部教学步骤；兼容运行时移除会挤压旧实验主区域的临时说明侧栏，并隐藏旧页面重复标题，同时保留原有 Canvas、Plotly、参数控制和讲解逻辑；`lazyRetry` 增加组件 Props 泛型支持；清理 `package.json` 中重复的主题检查脚本，并修正反应扩散实验浅色徽标的低对比度文字。

**涉及文件**：`client/src/App.tsx`、`client/src/experiment-v2/LegacyExperimentRuntime.tsx`、`client/src/index.css`、`client/src/experiments/reaction-diffusion/ReactionDiffusionExperiment.tsx`、`client/package.json`

**验证**：全仓 ESLint 通过；TypeScript 与生产构建通过；课程完整性检查确认 300/300；主题检查违规 0；浏览器抽查旧 Plotly（微积分）、旧 Canvas（加减乘除）和原生 V2（ε-δ）均正常渲染且控制台无错误。

---
## 2026-08-08 · 演示页上下文助教、截图模式与全屏

**模块**：统一演示页、AI 概念解释服务、屏幕捕获、迁移工具

**内容**：演示页顶部新增真正的页内上下文 AI 助教，提问会自动携带当前演示标题和课程面包屑；DeepSeek 主模型与千问备用模型均限制为 4.5 秒，双模型不可用时返回与罗尔定理、导数几何意义、ε−δ 或当前知识点匹配的本地教学解释，避免旧接口最长 60 秒的串行等待。截图入口改为专用演示模式，会隐藏课程目录、播放器与普通页头并提供保存 PNG、全屏和退出操作；普通演示页同时增加全屏切换。迁移产生的可重建备份目录加入 Git 忽略，但保留质量报告与迁移脚本供复查。

**涉及文件**：`client/src/demo/ContextAssistant.tsx`、`client/src/demo/DemoHeader.tsx`、`client/src/demo/screenCapture.ts`、`client/src/experiment-v2/ExperimentShell.tsx`、`server/src/services/llmService.ts`、`server/src/services/llmService.test.ts`、`.gitignore`

**验证**：服务端 189 项测试和 TypeScript 构建通过；前端相关文件 ESLint 与 TypeScript 通过；浏览器实测页内助教约 9 秒内完成本地兜底，截图模式隐藏侧栏和播放器，全屏进入、退出及普通布局恢复正常。

---
## 2026-08-08 · 统一白色实验画布与核心演示行为

**模块**：Experiment V2、ε−δ、导数几何意义、罗尔定理、版本化内容种子

**内容**：统一实验外壳改为客户要求的白底、浅灰网格和蓝色强调体系，并同步修正 245 个原本依赖深色文字的迁移实验；`usePanZoom` 增加显式复位，ε−δ 与导数演示的重置现在会同时恢复默认案例、参数、步骤、播放状态和画布视口；罗尔定理默认案例改为 `f(x)=x²−1`、区间 `[-1,1]`、`ξ=0`，重置会恢复全部三项条件并清除画布平移缩放；导数的 `h` 扩展为 `[-2,2]` 且跳过零点，新增左右趋近快捷按钮，可直接比较左、右差商；同时修复罗尔公式浮层的 KaTeX 转义。

**涉及文件**：`client/src/experiment-v2/ExperimentShell.tsx`、`client/src/experiments/`、`client/src/demo/usePanZoom.ts`、`client/src/demo/EpsilonDeltaDemo.tsx`、`client/src/demo/DerivativeDemo.tsx`、`client/src/demo/RolleDemo.tsx`、`client/src/demo/RolleCanvas.tsx`、`client/src/demo/rolleData.ts`、`server/src/data/knowledge.ts`、`server/src/content/publishedSeed.ts`

**验证**：前端相关文件专项 ESLint 与 TypeScript、服务端 TypeScript 构建通过；浏览器验证罗尔默认案例与完整重置、ε−δ 默认案例重置、导数左右差商和白色画布正常。

---
## 2026-08-08 · Experiment V2 React 规则修复

**模块**：统一演示路由、微积分补充实验、Experiment V2 运行时

**内容**：修复动态原生演示在渲染期间创建组件的问题；将两个函数曲线采样闭包收回 `useMemo`，使依赖与实际计算一致；移除通用播放器中不必要的同步重置 effect；把历史实验自动发现注册表拆分为纯工具模块，并使用按实验 ID 重新挂载的异步加载子组件替代 effect 内同步清空状态。由此清除 React Compiler、Hooks 和 Fast Refresh 报告的 7 个 ESLint 错误及 2 个相关警告，同时清理 255 个批量迁移实验中的空白行尾，恢复 `git diff --check` 零问题。

**涉及文件**：`client/src/demo/DemoPage.tsx`、`client/src/demo/knowledge/CoreCalculusSupplementDemos.tsx`、`client/src/experiment-v2/ExperimentShell.tsx`、`client/src/experiment-v2/LegacyExperimentRuntime.tsx`、`client/src/experiment-v2/legacyExperimentRegistry.ts`

**验证**：上述文件专项 ESLint 与前端 TypeScript 构建通过；完整 ESLint、测试与生产构建待最终回归。

---
## 2026-08-08 · AI 提问路由断线恢复

**模块**：AI 提问页、路由请求客户端、本地实验目录

**内容**：将 `/api/route` 调用抽离为带响应校验、1.5 秒短超时和一次自动重试的请求客户端；开发环境后端启动或热重载造成代理瞬断时，自动使用本地 300 项实验目录与可靠提示规则生成降级结果，不再把可继续处理的数学问题显示为红色失败。页面会明确区分“自动重试已恢复”和“本地降级结果”，后端恢复后可重新解析获得完整智能路由。

**涉及文件**：`client/src/ask/AskPage.tsx`、`client/src/ask/GenerateConfirm.tsx`、`client/src/ask/routeTypes.ts`、`client/src/services/questionRoute.ts`

**验证**：待执行前端专项测试、ESLint、TypeScript、生产构建及浏览器断线回归。

---
## 2026-08-06 · 客户版 AI 提问学习工作台

**模块**：AI 提问页、课程语义适配、课程目录抽屉

**内容**：按客户效果图将 `/ask` 从路由调试式结果页重构为自然语言提问学习工作台；新增带图片选择、语音与公式入口的多模态输入区，以及默认可见的知识点简介、学习路径、可视化模板、预计时长和关联知识卡片。真实 `/api/route` 结果会与课程章节、知识点、目标及演示路径合并，低质量实验候选不会覆盖同小节的课程语义推荐；概念解释、直接匹配、候选确认、临时实验生成和未匹配五类分支继续保留。右栏改为用户问题、识别章节、Top 3、学习目标和演示预览的结构化解析；课程目录继续默认隐藏，并将覆盖式抽屉宽度、关闭按钮和选中态对齐客户参考图。补充相对于同学前端第一版的完整更新说明，明确基线、成果边界、验证结果和未完成事项。

**涉及文件**：`client/src/ask/AskPage.tsx`、`client/src/ask/QuestionInput.tsx`、`client/src/ask/MatchResults.tsx`、`client/src/ask/AnalysisPanel.tsx`、`client/src/course/DrawerSidebar.tsx`、`docs/updates-since-teammate-v1.md`

**验证**：前端 TypeScript、变更文件 ESLint、256 个测试文件 / 1852 项测试及 Vite 生产构建通过；浏览器验证默认提问预览、真实极限路由、导数语义切换、Top 3 课程推荐、隐藏目录遮罩与 `/demo/derivative` 演示跳转正常。

---
## 2026-08-06 · 后端完整课程导航目录

**模块**：内容领域模型、课程目录种子、内容仓储服务、前端内容适配

**内容**：新增 `cataloged` 目录状态，将高等数学（上册）补齐为 4 个章节、11 个小节和 18 个知识点；3 个已有完整 Bundle 保持 `published`，其余 15 个知识点作为公开目录项返回但不提供伪造演示路径。课程统计增加正式发布数量，课程树知识点增加 `availability` 以及可空的内容版本和演示路径；前端适配层能够覆盖全部目录摘要，并只为正式发布内容绑定统一演示页。

**涉及文件**：`server/src/content/`、`server/src/services/contentCatalogService.ts`、`client/src/services/contentCatalog.ts`、`client/src/course/courseContentAdapter.ts`、`README.md`、`docs/knowledge-content-data-model.md`

**验证**：服务端完整测试 186/186、Manifest 300/300 和 TypeScript 构建通过；前端完整测试 1852/1852、TypeScript、ESLint 与生产构建通过；运行中 API 冒烟检查返回 4 个章节、11 个小节、18 个知识点（3 published / 15 cataloged）。

---
## 2026-08-06 · 恢复隐藏式章节目录

**模块**：课程首页、课程目录抽屉

**内容**：修正客户版主页面对侧栏交互的实现偏差，移除桌面端常驻章节树；桌面端和移动端统一为默认隐藏的左侧抽屉，通过顶部“课程目录”打开，展开时使用遮罩覆盖主页面，并保留搜索、Esc 关闭、点击遮罩关闭和滚动锁定能力。目录关闭后不占用或挤压知识地图、导航卡片与右侧详情的展示空间。

**涉及文件**：`client/src/course/CourseHome.tsx`、`client/src/course/CourseHeader.tsx`、`client/src/course/DrawerSidebar.tsx`、`README.md`

**验证**：TypeScript、ESLint 和课程内容适配专项测试通过；浏览器验证目录默认隐藏、按钮打开、遮罩覆盖和关闭后主内容恢复正常。

---
## 2026-08-06 · 客户版三栏课程主页面

**模块**：课程首页、课程目录、知识点导航、实验目录

**内容**：根路径改为默认展示“函数的极限”知识工作区，桌面端恢复“左侧章节树—中间知识地图与同小节知识点卡片—右侧当前知识点详情”的三栏结构；章节树支持一键收起和恢复，移动端继续使用可搜索抽屉。第一章重组为“函数 / 极限 / 连续函数”三个小节并补齐三级知识点；后端发布内容只覆盖摘要、模板和版本，课程大纲标题保持稳定。300 个实验目录从主页主体迁移至独立 `/experiments` 页面，桌面目录和移动抽屉均提供入口。

**涉及文件**：`client/src/course/`、`client/src/App.tsx`、`client/src/components/Layout/Layout.tsx`、`README.md`

**验证**：课程内容适配专项测试、TypeScript 与 ESLint 通过；前端完整测试 1852/1852 和生产构建通过（课程完整性 300/300）；浏览器验证默认知识点、三栏同屏、目录收起/恢复、URL 知识点联动及 300 项实验目录正常。

---
## 2026-08-06 · 可隐藏课程导航与前后端实验目录联动

**模块**：课程首页、知识点导航、演示页导航、AI 提问页、内容目录 API

**内容**：将常驻章节栏改为支持遮罩、搜索、Esc 关闭和滚动锁定的隐藏抽屉，并统一接入课程首页、演示页和 AI 提问页；新增可点击返回的课程概览首页，以 URL 查询参数保存知识点选择，知识点卡片扩展为全课程 15 项搜索导航；正式发布的 3 个知识点使用 `/api/content` 数据覆盖，本地课程内容作为渐进迁移回退；新增 300 个正式实验的后端分页、关键词、难度和主题筛选接口及首页实验库；补齐演示截图、带知识点上下文提问、帮助提示和本地学习计划交互。

**涉及文件**：`client/src/course/`、`client/src/demo/DemoHeader.tsx`、`client/src/demo/DemoPage.tsx`、`client/src/ask/AskPage.tsx`、`client/src/services/contentCatalog.ts`、`server/src/services/experimentCatalogService.ts`、`server/src/routes/content.ts`、`README.md`、`docs/knowledge-content-data-model.md`

**验证**：前端专项适配测试 1/1、完整测试 1852/1852、ESLint 和生产构建通过（课程完整性 300/300）；服务端完整测试 185/185、TypeScript 生产构建通过；`/api/content/experiments` 总量、分数搜索及难度/主题组合筛选冒烟检查通过；浏览器验证首页返回、URL 知识点状态、抽屉搜索、15 项知识点导航、300 项实验目录、演示路径和上下文提问均正常。

---
## 2026-08-06 · 版本化课程内容模型与只读 API

**模块**：课程内容模型、发布数据、仓储和 HTTP API

**内容**：章节模型增加父子层级以支持“章节—小节—知识点”；将 ε−δ、导数几何意义和罗尔定理迁移为包含发布版本、参数、案例、步骤、语义对象、公式、验收规则及主模板绑定的 `1.0.0` Bundle；新增启动时强校验的内存仓储，以及课程列表、课程树、知识点详情和版本历史只读接口。保留原 `/api/knowledge` 兼容接口。

**涉及文件**：`server/src/content/`、`server/src/services/contentCatalogService.ts`、`server/src/routes/content.ts`、`server/src/index.ts`、`docs/knowledge-content-data-model.md`、`README.md`

**验证**：内容模型与仓储聚焦测试 11/11；服务端完整测试 181/181、TypeScript 检查和生产构建通过；5 个 `/api/content` 正常/异常路径冒烟检查结果为 200/200/200/200/404

---
## 2026-08-06 · 同步课程平台前端并兼容现有 Agent 后端

**模块**：课程主页、AI 提问页、统一演示页、服务端接口

**内容**：合入 `WaterXiao-git/beauty-of-math` 的 `feat/frontend-course-demo-and-conventions` 前端成果；新增课程—章节—知识点三栏主页、AI 提问页、统一演示容器、临时实验页及 geoboard 交互画板。冲突处理中保留现有 `/api/agent/*` 路由和双模型配置，同时挂载新版前端依赖的 `/api/route`、`/api/knowledge`、`/api/answer`、`/api/generate` 兼容接口，并合并双方依赖。

**涉及文件**：`client/src/course/`、`client/src/ask/`、`client/src/demo/`、`client/src/App.tsx`、`client/src/components/Layout/Layout.tsx`、`server/src/index.ts`、`server/src/data/`、`server/src/routes/`、`server/src/services/`、`server/package.json`

**验证**：课程完整性 300/300；前端 TypeScript、Vite 生产构建（3664 modules）、ESLint、255 个测试文件 / 1851 项测试全部通过；后端构建、Manifest 300/300、175 项测试全部通过；`/api/health`、`/api/knowledge/:id`、`/api/route` 冒烟检查返回 200

---
## 2026-08-06 · 演示页面包屑可点击

**模块**：前端演示页

**内容**：DemoHeader 面包屑非末项可点击（hover 变紫+下划线）；四个演示页接入：ε−δ/导数/罗尔非末项点击回主界面，临时实验页「临时实验」点击回提问页

**涉及文件**：`client/src/demo/DemoHeader.tsx`、`EpsilonDeltaDemo.tsx`、`DerivativeDemo.tsx`、`RolleDemo.tsx`、`TempExperiment.tsx`

**验证**：tsc exit 0；vite 编译 5 模块 200

---
## 2026-08-06 · 修复：ε−δ 页 √x 案例曲线不显示

**模块**：前端演示画布

**内容**：无限延伸改造后曲线采样从可视范围开始，√x 在 x<0 为 NaN 被跳过，首点非 i=0 导致 path 以 L 开头被 SVG 判为无效 → 整条曲线消失；改为 started 标志让首个有效点用 M 起笔（sin/x² 不受影响）

**涉及文件**：`client/src/demo/EpsilonDeltaDemo.tsx`

**验证**：tsc exit 0；vite 编译 200

---
## 2026-08-06 · geoboard 几何画板内核（GeoGebra 式预留框架）+ 导数页拖拽示例

**模块**：前端演示画布

**内容**：
- 新增 geoboard 内核：types.ts（CoordSystem 坐标映射/PointConstraint 约束/visibleRect/clipLineToRect 无限线裁剪）、useDraggablePoint（命中+拖拽+约束 free/xAxis/yAxis/curve）、GeoPoint（可拖拽点：命中区/拖拽态/标签，stopPropagation 与画布平移互斥）、GeoLine（两点定线自动贯穿可视区域）
- 导数页接入示例：P 点沿曲线拖动（更新 x0，滑块同步）、Q 点沿曲线拖动（更新 h），割线/切线改 GeoLine 贯穿并随点实时联动，Δx/Δy/斜率数值面板同步
- 预留能力清单见 geoboard/types.ts 注释（衍生对象/测量/约束系统/对象面板）

**涉及文件**：
- `client/src/demo/geoboard/`（types.ts、useDraggablePoint.ts、GeoPoint.tsx、GeoLine.tsx，新增）
- `client/src/demo/DerivativeDemo.tsx`（接入）

**验证**：tsc exit 0；vite 编译 5 模块 200

---
## 2026-08-06 · ε−δ 演示页曲线与虚线无限延伸

**模块**：前端演示画布

**内容**：ε−δ 页（默认案例 x²）：曲线采样范围从固定 domain 改为可视世界范围（铺满视图）；ε 蓝虚线（L±ε）与 L 线、δ 黄虚线改为贯穿全屏（可视映射坐标），ε/δ 带区域同步扩展；pan/zoom 时跟随世界坐标但始终贯穿

**涉及文件**：`client/src/demo/EpsilonDeltaDemo.tsx`

**验证**：tsc exit 0；vite 编译 200

---
## 2026-08-06 · 修复：Cannot access 'dMin' before initialization

**模块**：前端演示画布

**内容**：视口网格 grid 计算被插入到 domain 变量（dMin/dMax、xMin/xMax、a/b）定义之前，触发 TDZ 报错；三个画布的 grid 计算统一移到 sx/sy 定义之后

**涉及文件**：`client/src/demo/RolleCanvas.tsx`、`EpsilonDeltaDemo.tsx`、`DerivativeDemo.tsx`

**验证**：顺序断言 grid@>domain@ 正确；tsc exit 0；vite 编译 200

---
## 2026-08-06 · 坐标轴/网格无限延伸（Desmos 风格）

**模块**：前端演示画布

**内容**：
- 新增 viewport.ts：calcViewportGrid 按当前 pan/zoom 变换计算铺满屏幕的网格线（间距自适应 niceStep 1/2/5×10^n）与贯穿坐标轴（世界 0 的屏幕位置）
- 三个演示画布（罗尔/ε−δ/导数）的网格与坐标轴从"固定数据范围"改为"视口坐标系"（g 外屏幕坐标）；曲线/节点/ε−δ 带等数据内容保持世界坐标
- 效果：任意缩放/平移后网格始终铺满画布、坐标轴贯穿全屏

**涉及文件**：`client/src/demo/viewport.ts`（新增）、`RolleCanvas.tsx`、`EpsilonDeltaDemo.tsx`、`DerivativeDemo.tsx`

**验证**：tsc exit 0；vite 编译 4 模块 200

---
## 2026-08-06 · 修复：演示页 usePanZoom is not defined

**模块**：前端演示页

**内容**：EpsilonDeltaDemo / DerivativeDemo 调用 usePanZoom 但 import 缺失（此前 patch 的 import 锚点依赖 MathFormula import，这两个文件没有）；补上 import

**涉及文件**：`client/src/demo/EpsilonDeltaDemo.tsx`、`DerivativeDemo.tsx`

**验证**：tsc exit 0；vite 编译 200 且模块包含 usePanZoom

---
## 2026-08-06 · 演示画布滚轮缩放 + 拖拽平移（修复）

**模块**：前端演示页

**内容**：
- 新增 usePanZoom hook：滚轮以鼠标为中心缩放（0.5-12x）+ 拖拽平移 + 区分点击/拖拽（consumeDrag）
- 应用于三个演示画布（罗尔/ε−δ/导数），SVG 内容以 <g transform> 包裹
- 修复：含图标 <svg> 的文件 gClose 曾误插到图标闭合前（lastIndexOf 误匹配），改为插入主画布第一个 </svg> 前

**涉及文件**：`client/src/demo/usePanZoom.ts`（新增）、`RolleCanvas.tsx`、`EpsilonDeltaDemo.tsx`、`DerivativeDemo.tsx`

**验证**：tsc exit 0；vite 编译 4 模块全 200

---
## 2026-08-06 · 演示画布滚轮缩放 + 拖拽平移

**模块**：前端演示页

**内容**：新增 usePanZoom hook（滚轮以鼠标为中心缩放 0.5-12x + 拖拽平移，区分点击/拖拽），应用于三个演示画布（罗尔定理/ε−δ/导数）；SVG 内容以 <g transform> 包裹，光标 grab 样式

**涉及文件**：`client/src/demo/usePanZoom.ts`（新增）、`RolleCanvas.tsx`、`EpsilonDeltaDemo.tsx`、`DerivativeDemo.tsx`

**验证**：tsc exit 0；vite 编译 4 模块 200

---
## 2026-08-06 · 主界面面包屑可点击回退层级

**模块**：前端主界面

**内容**：CourseHeader 面包屑非末项可点击（> 连接，代表子章节层级）；CourseHome 实现层级跳转：首页/课程→默认知识点、章节→该章第一个知识点、小节→该小节第一个知识点；AskPage 不受影响

**涉及文件**：`client/src/course/CourseHeader.tsx`、`CourseHome.tsx`

**验证**：tsc exit 0；vite 编译 200

---
## 2026-08-06 · 清理被遗弃的前端残留

**模块**：前端清理

**内容**：
- askData.ts 删除 6 个废弃模拟数据导出（VISUAL_TEMPLATES/ESTIMATED_TIME/DIFFICULTY/RELATED_MATCHES/TOP_MATCHES/RECOMMENDED_GOALS/VISUAL_PREVIEW_NOTE），保留 PROMPT_POOL/LEARNING_PATH/RelatedMatch
- 删除 NarrationOutline 组件（原项目遗留孤儿，0 引用）

**涉及文件**：`client/src/ask/askData.ts`、`client/src/components/NarrationOutline/`（删除）

**验证**：node 递归扫描确认 7 个目标无残留；tsc --noEmit exit 0

---
## 2026-08-06 · 分支 C：确认后生成临时交互实验（/api/generate + iframe 隔离）

**模块**：server 生成服务 + 前端临时实验页

**内容**：
- 新增 DynamicExperimentSpec schema + 本地模板库（直角坐标/极坐标/四则运算，模板优先）
- 新增 generateService：规则模板选择（极坐标/计算关键词）→ DeepSeek 生成配置 → Qwen 复核/故障接管 → Schema 校验（formula mathjs 可解析 + domain 合法，不合规退化本地默认模板）→ 服务端预采样
- 新增 POST /api/generate
- 新增 /temp/:specId 页面：SessionStorage 读 spec + iframe srcDoc 渲染自包含 SVG（sandbox 隔离，仅会话预览，不写源码/不注册永久路由）
- AskPage ai 分支「确认生成」接真实接口

**涉及文件**：
- `server/src/data/tempSpecSchema.ts`、`services/generateService.ts`、`routes/generate.ts`（新增）
- `server/src/services/llmService.ts`（导出 chat/配置）、`index.ts`（挂载）、`package.json`（+mathjs）
- `client/src/demo/TempExperiment.tsx`（新增）、`client/src/ask/AskPage.tsx`、`GenerateConfirm.tsx`、`App.tsx`、`Layout.tsx`

**验证**：server/client tsc 通过；/api/generate 实测 3 类问题（x²→cartesian、三叶玫瑰→polar、求和→arithmetic）返回完整 spec（含 161 采样点）；vite 编译 200

---
## 2026-08-06 · 配置 DeepSeek Key 并验证真实解释生成

**模块**：server LLM

**内容**：server/.env 写入 DEEPSEEK_API_KEY（已确认被 .gitignore 忽略，不提交泄露）；真实调用实测成功：POST /api/answer 返回完整解释卡片（标题/摘要/4 条关键点/数学示例：lim x→2 (3x-1)=5 的 ε-δ 证明）

**涉及文件**：`server/.env`（新建，git 忽略）

**验证**：真实 DeepSeek 调用 200，返回结构化 JSON 解释；answer 分支端到端链路（前端 → /api/route → /api/answer → DeepSeek → 卡片）打通。

---
## 2026-08-06 · 分支 B：双模型概念解释（/api/answer）

**模块**：server LLM + 前端 answer 分支

**内容**：
- 新增 llmService：DeepSeek 主模型 + Qwen 备用模型（故障接管），OpenAI 兼容协议 + 30s 超时 + JSON 解析容错
- 新增 POST /api/answer：生成结构化解释卡片（标题/摘要/关键点/示例），密钥仅存服务端 .env（dotenv）
- AnswerCard 改为真实调用（三态：加载/成功/失败降级占位）
- 提供 server/.env.example 模板

**涉及文件**：
- `server/src/services/llmService.ts`、`server/src/prompts/explain.ts`、`server/src/routes/answer.ts`（新增）
- `server/src/index.ts`（dotenv + 挂载）、`server/.env.example`（新增）、`server/package.json`（+dotenv）
- `client/src/ask/AnswerCard.tsx`（重写）、`AskPage.tsx`（适配）

**验证**：server/client tsc 通过；无 Key 时 500 返回明确错误（前端降级占位）；真实生成需用户配置 .env 后验证。

---
## 2026-08-06 · 修复：极限类问题误路由到「反函数」

**模块**：server 规则优先路由

**内容**：
- 问题「什么是函数在一点的极限？」此前核心词「函数在一点的极限」无法匹配知识点短语「函数的极限」，误落 Manifest 评分（反函数 63% suggest）
- 知识点匹配改为短关键词包含 + 最长匹配优先（极限→ε−δ、导数/微分→导数、罗尔→罗尔）

**涉及文件**：`server/src/services/routeService.ts`

**验证**：tsc 通过；7 组极限/导数/罗尔相关问题全部 direct 命中正确知识点（@1/knowledge）。

---
## 2026-08-06 · 前端 AskPage 接入真实规则优先路由

**模块**：前端 AI 提问页

**内容**：
- AskPage「智能解析」改为真实调用 POST /api/route（不再使用模拟数据）
- 按五分支渲染结果：direct/suggest → 匹配卡片（进入演示跳 top.path）；answer → 解释卡片（占位，待接大模型）；ai → 生成确认卡；no-match → 说明卡
- AnalysisPanel 改为路由解析面板（意图/分支/置信度/原因/Top 匹配）
- 新增 AnswerCard / GenerateConfirm / NoMatchCard 组件
- MatchResults 关联卡支持无公式（后端 matches 无 summary/formula）

**涉及文件**：
- `client/src/ask/AskPage.tsx`（重写）
- `client/src/ask/AnswerCard.tsx`、`GenerateConfirm.tsx`（新增）
- `client/src/ask/AnalysisPanel.tsx`、`MatchResults.tsx`（改造）

**验证**：tsc 通过；vite 编译 5 模块 200；后端 /api/route 实测五分支正确。

---
# MathViz 改动存档（Change Log）

> 工作约定：每次代码改动后，在本文件追加一条记录（日期 / 模块 / 内容 / 涉及文件 / 验证）。
> 按时间倒序排列，最新改动在最上方。

---

## 2026-08-06 · 规则优先路由核心（架构图第 3 层）

**模块**：server 后端

**内容**：
- 新增 300 实验 Manifest（从 client catalog.ts 同步）
- 新增规则优先路由：意图识别（draw/calculate/explain/demo/find）+ 核心词提取 + 英文术语映射 + 知识点优先路由 + 自研规则评分 + 参数提取
- 新增 POST /api/route 接口，返回五分支决策（direct/suggest/answer/ai/no-match）
- 弃用 Fuse.js 7.5（实测中文/拉丁串 score 恒为 1.0），改自研评分

**涉及文件**：
- `server/src/data/experimentManifest.ts`（新增，300 条）
- `server/src/services/routeService.ts`（新增）
- `server/src/routes/route.ts`（新增）
- `server/src/index.ts`（挂载 /api/route）
- `server/package.json`（+pinyin-pro）

**验证**：tsc 通过；15 组真实问题实测五分支全部正确。

---

## 2026-08-06 · Vite 代理修复

**模块**：前端构建

**内容**：vite.config.ts 新增 server.proxy，/api 代理到后端 http://localhost:3001（此前前端 fetch /api 拿到 index.html 导致 JSON 解析失败）

**涉及文件**：`client/vite.config.ts`

**验证**：代理链路实测 200 + JSON。

---

## 2026-08-06 · ε−δ 极限定义 / 导数几何意义演示页

**模块**：前端演示

**内容**：
- 新增 EpsilonDeltaDemo：ε 误差带 + δ 邻域可视化、可行 δ 数值搜索（标注不唯一）、ε 滑块联动、四步播放教学
- 新增 DerivativeDemo：P/Q 双点、割线/切线、Δx/Δy 标注、x₀/h 滑块、h 播放递减逼近、教学判断
- 两个页面配置来自统一接口 /api/knowledge/:id（mathjs 动态解析）
- PlayerBar 泛化支持 steps prop

**涉及文件**：
- `client/src/demo/EpsilonDeltaDemo.tsx`（新增）
- `client/src/demo/DerivativeDemo.tsx`（新增）
- `client/src/demo/PlayerBar.tsx`（steps prop）
- `client/src/demo/RolleDemo.tsx`（适配）
- `client/src/demo/DemoPage.tsx`（注册模板）
- `client/src/course/courseData.ts`（demoId：functions limit→epsilon-delta、derivative→derivative）

**验证**：tsc 通过；vite 编译 6 模块 200；后端 epsilon-delta/derivative 配置接口 200。

---

## 2026-08-06 · 统一演示路由 /demo/:pointId

**模块**：前端演示入口

**内容**：
- 新增 DemoPage 统一演示容器：按知识点 demoId 渲染模板；未实现模板显示"建设中"占位 + 替代学习路径（符合需求 2.2）
- 主界面/AI 提问页「进入演示」全部改为 /demo/:pointId，不再直接跳老 UI 实验页
- Layout isCourseShell 支持 /demo/ 前缀（演示页全屏）

**涉及文件**：
- `client/src/demo/DemoPage.tsx`（新增）
- `client/src/course/KnowledgeDetail.tsx`、`client/src/ask/AskPage.tsx`（链接改造）
- `client/src/course/courseData.ts`（demoId 字段 + 微分中值定理→rolle）
- `client/src/App.tsx`（/demo/:pointId 路由）
- `client/src/components/Layout/Layout.tsx`（isCourseShell 前缀）

**验证**：tsc + vite + 6 项链接断言全部通过。

---

## 2026-08-06 · 罗尔定理交互演示页

**模块**：前端演示

**内容**：
- 新增 RolleDemo：深色画板（SVG 曲线/端点/ξ/水平切线/条件破坏可视化）+ 右侧控制面板（定理条件/案例 Tabs/3 条件开关/教学判断/AI 助教）+ 底部播放控制条（4 步进）
- 默认案例「双谷曲线」f(x)=x⁴−x²（数学自洽：a=-1/b=1/f(a)=f(b)=0/ξ=0）
- 注册 /rolle 路由

**涉及文件**：
- `client/src/demo/rolleData.ts`、`DemoHeader.tsx`、`RolleCanvas.tsx`、`RolleControl.tsx`、`PlayerBar.tsx`、`RolleDemo.tsx`（新增）
- `client/src/App.tsx`、`client/src/components/Layout/Layout.tsx`

**验证**：tsc + vite 8 模块 200。

---

## 2026-08-06 · AI 智能提问页

**模块**：前端页面

**内容**：
- 新增 AskPage（三栏）：多模态提问输入区（textarea/工具栏/推荐问题）+ AI 理解与匹配结果（主卡片/学习路径/关联卡）+ 右侧提问解析面板（复述/识别章节/Top3/目标/可视化预览/CTA）
- 新增 askData 示例数据；Header 增加「智能提问」按钮与激活态
- 注册 /ask 路由；Layout isCourseShell 加入 /ask

**涉及文件**：
- `client/src/ask/`（askData.ts、QuestionInput.tsx、MatchResults.tsx、AnalysisPanel.tsx、AskPage.tsx，新增）
- `client/src/course/CourseHeader.tsx`、`client/src/App.tsx`、`client/src/components/Layout/Layout.tsx`

**验证**：tsc + vite 7 模块 200。

---

## 2026-08-06 · 抽屉式侧边栏组件

**模块**：前端组件

**内容**：新增 DrawerSidebar（off-canvas 可折叠抽屉：章节与知识点标题/关闭按钮/搜索栏/章节分组列表/选中态高亮），独立可复用

**涉及文件**：`client/src/course/DrawerSidebar.tsx`（新增）

**验证**：tsc + vite 200。

---

## 2026-08-06 · 主界面改造（课程学习平台三栏布局）

**模块**：前端主界面

**内容**：
- 首页改为课程平台：顶部 Header（Logo「数韵之美」/面包屑/智能提问/头像）+ 左章节树 + 中（知识地图 SVG + 知识点导航卡片网格）+ 右知识点详情（简介/ε−δ 图/学习目标/CTA）
- 新增 courseData（高等数学（上册）4 章示例课程 + 状态/等级 token）
- Layout 首页全屏分支；/ask 与 /rolle 亦全屏

**涉及文件**：
- `client/src/course/`（courseData.ts、CourseHome.tsx、CourseHeader.tsx、ChapterSidebar.tsx、KnowledgeMap.tsx、KnowledgeCards.tsx、KnowledgeDetail.tsx，新增）
- `client/src/experiments/Home.tsx`（转发 CourseHome）
- `client/src/components/Layout/Layout.tsx`

**验证**：tsc + vite 全模块 200。

---

## 2026-08-06 · 环境与构建修复

**模块**：开发环境

**内容**：
- npm 12 allow-remote 配置（registry 换淘宝镜像 + allow-remote=all），解决 EALLOWREMOTE
- 修复 vite.config.ts 的 Windows 路径 bug（new URL().pathname → fileURLToPath），解决 D:\D:\ 双盘符
- esbuild/es5-ext install-scripts 警告确认无害

**涉及文件**：`client/vite.config.ts`、用户级 `~/.npmrc`

**验证**：npm install 全通；vite dev 正常；tsc 通过。
