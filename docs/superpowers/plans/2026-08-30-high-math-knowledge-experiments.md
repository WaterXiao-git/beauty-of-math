# High Mathematics Knowledge Experiments Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将客户文档中的十四个高等数学模块和 150 个知识点建设为独立 Native 实验页面。

**Architecture:** 以一份课程清单驱动导航、实验 catalog、前后端注册表和通用 Native 渲染器；保留语义完全匹配的专用实验组件。每个知识点拥有唯一 ID 与路由，同类页面只复用绘图底层。

**Tech Stack:** React 19、TypeScript、SVG、Vite、Vitest、Node.js

**Spec:** `docs/superpowers/specs/2026-08-30-high-math-knowledge-experiments.md`

## Global Constraints

- 只发布高等数学十四模块。
- 不恢复旧 300 个实验与多模态输入。
- 所有页面使用现有 Experiment V2 Native 外壳。

---

### Task 1: 课程范围约束

**Files:**
- Modify: `client/src/course/courseScope.test.ts`
- Create: `client/src/course/highMathCurriculum.test.ts`

- [ ] 先断言十四模块、150 个唯一知识点和逐点 renderer 绑定。
- [ ] 运行测试并确认旧四章数据导致失败。

### Task 2: 十四模块课程数据与注册表

**Files:**
- Create: `config/high-math-curriculum.json`
- Modify: `scripts/generate-owned-experiment-registries.mjs`
- Modify: `client/src/course/courseData.ts`

- [ ] 写入文档中的十四模块与 150 个知识点。
- [ ] 由同一来源生成前端 catalog 与后端 registry。
- [ ] 运行生成器并使课程范围测试通过。

### Task 3: Native 知识点实验页

**Files:**
- Create: `client/src/demo/knowledge/KnowledgeExperiment.tsx`
- Modify: `client/src/owned-experiments/renderers.ts`
- Test: `client/src/owned-experiments/renderers.test.ts`

- [ ] 先断言全部 catalog ID 都能获得 renderer。
- [ ] 实现十四类 SVG/HTML 交互视图、参数控制和 PlayerBar 步骤。
- [ ] 保留现有专用实验映射，其余 ID 绑定通用知识点实验。

### Task 4: 完整性与记录

**Files:**
- Modify: `client/scripts/check-course-integrity.ts`
- Modify: `docs/CHANGELOG.md`

- [ ] 校验十四模块、150 个唯一知识点和 150 个 renderer。
- [ ] 生成注册表并执行课程检查、测试与构建。
- [ ] 在变更日志顶部记录改动和验证结果。
