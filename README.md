# 数韵之美 · MathViz

面向数学学习与课堂演示的**智能交互式可视化平台**：按课程—章节—知识点进入，或直接自然语言提问；公式、图形、参数、教学步骤与解释同步联动。

## 快速开始（Clone 后三步）

```bash
# 1. 安装全部依赖（根目录 + client + server）
npm run install:all

# 2. 配置 LLM Key（AI 解释/生成功能需要；不配则显示降级提示，其余功能正常）
copy server\.env.example server\.env
# 编辑 server\.env，至少填写：
#   DEEPSEEK_API_KEY=sk-xxx        # 主模型（deepseek-chat）
#   QWEN_API_KEY=sk-xxx            # 备用模型（qwen-plus，故障接管，可选）

# 3. 启动开发环境（前端 5173 + 后端 3001）
npm run dev
```

> ⚠️ npm 12 注意：若安装报 `EALLOWREMOTE`，执行 `npm config set allow-remote all`（lock 已统一官方源，正常无需此步）。

## 页面与路由

| 路由 | 说明 |
|---|---|
| `/` | 课程主界面（三栏：章节目录 / 知识地图+卡片 / 知识点详情） |
| `/ask` | AI 智能提问与路由（规则优先五分支：direct/suggest/answer/ai/no-match） |
| `/demo/:pointId` | 统一演示容器（罗尔/ε−δ/导数，配置驱动） |
| `/temp/:specId` | 临时交互实验（SessionStorage + iframe 隔离，仅会话预览） |
| 原 300+ 实验页 | 保留（`/calculus`、`/fourier` 等） |

## 后端 API

| 接口 | 说明 |
|---|---|
| `POST /api/route` | 规则优先路由：意图识别 + 300 实验召回 + 五分支决策 |
| `GET /api/knowledge` / `GET /api/knowledge/:id` | 统一知识点内容配置 |
| `POST /api/answer` | 双模型概念解释（DeepSeek 主 + Qwen 备） |
| `POST /api/generate` | 临时实验生成（模板优先 + Schema 校验 + 预采样） |
| `/api/bugs`、`/api/admin/login` | 原 Bug 报告与后台 |

## 架构要点

- **规则优先、双模型协作**：能命中 300 实验则完全不调用 LLM（低延迟低成本）；概念类走 DeepSeek 解释；未命中走受约束生成
- **统一演示容器**：知识点差异收敛为内容配置（`server/src/data/knowledge.ts`），新知识点只加数据不改代码
- **geoboard 几何画板**（`client/src/demo/geoboard/`）：可拖拽点 + 无限坐标系 + 贯穿线，GeoGebra 式预留框架
- **密钥安全**：LLM Key 仅存 `server/.env`（gitignore），不下发前端

## 目录结构

```
├─ client/src/
│  ├─ course/        # 课程平台（主界面/章节/知识地图/详情）
│  ├─ ask/           # AI 智能提问页
│  ├─ demo/          # 统一演示（Rolle/ε−δ/导数/Temp）+ geoboard + viewport
│  └─ experiments/   # 原 300 实验页（保留）
├─ server/src/
│  ├─ data/          # 实验 Manifest / 知识点配置 / 临时实验模板
│  ├─ services/      # 规则路由 / LLM / 生成
│  ├─ routes/        # route / knowledge / answer / generate / bugs / experiments
│  └─ prompts/       # LLM system prompt
└─ docs/CHANGELOG.md # 改动存档（每次改动追加，见 AGENTS.md）
```

## 项目约定

- **改动存档**：每次代码改动后在 `docs/CHANGELOG.md` 顶部追加记录（见 `AGENTS.md`）
- **分支规范**：功能开发在 `feat/` 分支；合并用「切到目标分支 → merge feat 分支」（蓝山工作室规范）