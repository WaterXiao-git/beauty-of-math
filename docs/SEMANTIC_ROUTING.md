# 语义路由配置与维护

浏览器的智能推荐调用 `POST /api/agent/route`。后端先进行规则匹配；明确直达的请求直接返回，其余非空请求在配置千问后进入向量检索。向量把文字转为一组数，用来比较问题和实验内容的含义，不再要求用户先说出数学关键词。

向量候选保持 `related`，用于推荐和 AI 复核。原问题的向量证据在复核后保留；模型自行改写问题产生的普通弱匹配仍不能冒充原始证据。AI 明确判断无匹配时仍可返回 `no-match`。向量服务失败时回退规则结果，临时实验生成的数学范围检查保持独立。

## 本地千问配置

在 `server/.env` 配置已有的 `QWEN_API_KEY`。文件和密钥不提交 Git。下列只展示变量及示例，不含真实密钥：

```dotenv
QWEN_API_KEY=你的已有千问Key
QWEN_BASE_URL=控制台提供的OpenAI兼容地址
QWEN_EMBEDDING_ENABLED=true
QWEN_EMBEDDING_BASE_URL=
QWEN_EMBEDDING_MODEL=qwen3.7-text-embedding-flash
QWEN_EMBEDDING_DIMENSIONS=1024
QWEN_EMBEDDING_TIMEOUT_MS=8000
QWEN_EMBEDDING_CACHE_DIR=.cache/embeddings
```

`QWEN_EMBEDDING_BASE_URL` 留空时继承 `QWEN_BASE_URL`，请求发送到兼容地址下的 `/embeddings`。业务空间专属 Key 应搭配控制台给出的业务空间地址。模型与维度参数参见[阿里云向量化说明](https://help.aliyun.com/zh/model-studio/embedding)。

密钥依次选择第一个非空值：`QWEN_EMBEDDING_API_KEY` → `QWEN_API_KEY` → `DASHSCOPE_API_KEY`。复用聊天密钥时不必重复设置第一项；已有第一项会优先使用。

修改 `.env` 后重启后端。开发环境读取 `server/.env`，生产环境通过部署平台注入变量。

## 索引如何保存

- 后端启动后在后台预热索引，请求也可以触发构建；同一进程内共享构建任务。
- 默认保存在 `server/.cache/embeddings/`；相对缓存路径始终以 `server/` 为基准，不受启动目录影响。
- 缓存文件按模型、兼容地址、维度和格式版本区分，保存实验 ID、文档摘要和向量，不保存用户问题、密钥或 AI 回答。
- 重启后复用已有向量。标题、模块或描述改变时，只重新计算变化条目；删除实验后重写索引，移除对应条目。
- 模型、地址或维度变化时使用独立索引。损坏的条目重新生成；磁盘无法写入时仍可在本次进程内检索，但不能保证下次启动复用。
- `.cache/` 已被 Git 忽略。首次构建仍需调用模型并等待，默认每批最多 10 个实验。用户问题的向量每次实时计算。

## 查看配置与索引状态

```powershell
Invoke-RestMethod http://localhost:3001/api/agent/status | ConvertTo-Json -Depth 6
```

`semanticRouting.enabled` 表示存在可用配置，不等于服务已经成功调用。

`semanticRouting.index` 中：

| 字段 | 含义 |
| --- | --- |
| `state` | `disabled` 未配置或关闭；`idle` 尚未构建；`building` 构建中；`ready` 索引可用；`failed` 构建失败 |
| `indexedCount` / `totalCount` | 已完成与应有的实验数量 |
| `reusedCount` | 本次构建从磁盘复用的条目数 |
| `persistent` | 当前构建已读取或成功写入有效缓存；为假时不能据此声称索引已落盘 |

索引可用也不保证后续查询或聊天模型永远可用。构建失败时检查模型权限、接口地域及网络；下次检索会再次尝试构建。

## 修改或增加实验描述

`config/experiment-descriptions.json` 按知识点标题保存每个实验的数学主题、区别和适用条件。它描述检索所需的数学含义，不替代实验页面的功能实现或数学模型验证。

修改描述后，从仓库根目录执行：

```powershell
node scripts/generate-owned-experiment-registries.mjs
node scripts/generate-owned-experiment-registries.mjs --check
```

生成器将描述同步到 `config/owned-experiments.json`、前端目录及后端实验注册表，缺失或完全重复的描述会报错。随后重启后端，以加载新的注册表并更新受影响的向量。日常补充实验含义不必添加一组关键词。

目前生成器仍按现有 14 模块、150 知识点校验数量；未来扩充课程总数时，需要同步调整课程范围校验。

## 本次验证范围

相关 41 个定向单元测试及后端 TypeScript 检查通过。实际千问请求已返回 1024 维向量，150 条实验索引已落盘；新进程复用 150 条缓存。真实问题“我想看看越走越靠近一个数的过程”经向量检索及 AI 复核返回“数列趋近过程”，分支为推荐。这些是当前样例的验证结果，不代表所有自然语言问题都能正确判定。
