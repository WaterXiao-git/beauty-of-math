# 统一演示配置指南（function-plot 通用模板）

> 新增演示**只填配置、不碰代码**。数据写入 `server/src/data/knowledge.ts` 的 `knowledgePoints` 数组，
> 在 `client/src/course/courseData.ts` 挂一个知识点 + `client/src/demo/DemoPage.tsx` 注册模板即可。

## 一、最小配置模板

```ts
{
  id: 'xxx',                       // 唯一 id（也作为 /demo/:id 路由参数）
  title: '演示标题',
  course: '高等数学（上册）',
  chapter: '函数与极限',
  section: '函数',
  template: 'function-plot',       // 固定：通用函数画布模板
  summary: '概念要点正文（显示在「概念要点」卡）',
  formula: 'y = kx + b',           // 可选：概念要点卡底部公式（KaTeX）
  goals: ['学习目标1', '目标2'],
  defaultCase: 'case-1',           // 默认选中的案例 id
  // —— 可选：统一配置（所有案例共享）——
  legend: [                        // 画布图例
    { color: '#60a5fa', label: '直线' },
  ],
  dataItems: [                     // 数据面板项
    { label: '斜率 k', expr: 'k' },              // expr：mathjs 基于 params 求值
    { label: '截距点', text: '(0, {b})' },       // text：静态，支持 {参数名} 插值
  ],
  tips: [                          // 观察提示（淡蓝气泡）
    { icon: '📈', text: '斜率 {k}，y 截距 {b}。' },
  ],
  cases: [
    {
      id: 'case-1',
      name: '案例名',
      expr: 'k*x + b',             // mathjs 表达式，可用 params 中的变量
      expr2: '...',                // 可选：第二条曲线（反函数/指数对数用）
      pieces: [                    // 可选：分段函数
        { expr: '-1', to: 0 },
        { expr: '1', from: 0 },
      ],
      domain: [-5, 5],             // 数据 x 范围（等比坐标系）
      yRange: [-5, 5],             // 数据 y 范围
      params: { k: 1, b: 0 },      // 可选：参数（自动生成滑块）
      paramRanges: {               // 滑块范围（key 对应 params）
        k: { label: '斜率', min: -4, max: 4, step: 0.1 },
      },
      shape: 'linear',             // 可选：内置特殊标注（见下）
      desc: '案例说明',
    },
  ],
  steps: [                         // 底部播放条四步
    { id: 's1', title: '第一步', desc: '说明' },
    { id: 's2', title: '第二步', desc: '说明' },
    { id: 's3', title: '第三步', desc: '说明' },
    { id: 's4', title: '第四步', desc: '说明' },
  ],
  meta: { difficulty: '入门难度', duration: '约 15 分钟', templates: ['标签'] },
  version: 1,
}
```

## 二、内置 shape（特殊标注，可选）

| shape | 标注 | 参数约定 |
|---|---|---|
| `linear` | x/y 截距点（可拖，改 k/b）、斜率三角形 | k、b |
| `quadratic` | 顶点（可拖）、对称轴、根、Δ | a、b、c |
| `absolute` | 顶点（可拖）、零点 | a、h、k |
| `rational` | 垂直/水平渐近线、中心点（可拖） | a、h、k |
| `exp-log` | 双曲线（指数靛蓝+对数粉）+ y=x 虚线 | base（expr2 用 log(x,base)） |
| `inverse-pair` | 双曲线 + y=x 虚线 | 无（expr/expr2 固定） |
| `piecewise` | 分段采样（段间断开） | 无（用 pieces） |
| `composite` | 单曲线 | 无 |
| 不填 | 仅曲线+网格+刻度 | 任意 params |

不填 shape 时，配合 `legend/dataItems/tips/formula` 配置即可呈现完整演示。

## 三、注册三步

1. `server/src/data/knowledge.ts` 数组末尾追加配置
2. `client/src/course/courseData.ts` 相应小节加知识点（`demoId` 填 id）
3. `client/src/demo/DemoPage.tsx` 的 `demoRegistry` 加一行 `'<id>': FunctionPlotDemo`

> 前端模板已支持全部能力：正方形格子+自适应刻度、参数滑块自动生成、拖拽点、AI 助教、播放条、三卡面板。
