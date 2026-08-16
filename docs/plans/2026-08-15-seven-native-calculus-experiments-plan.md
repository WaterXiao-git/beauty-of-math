# 七个高等数学 Native 实验实施计划

1. **先补失败测试**
   - 将课程绑定测试扩展到七个新知识点。
   - 将自研实验范围从 8 个扩展到 15 个。
   - 验证测试在实现前因缺少 renderer 和 catalog 条目而失败。

2. **实现原创 Native Renderer**
   - 新增七个独立实验组件。
   - 统一使用 `ExperimentShell`、`ExperimentCard` 和专用四步 `PlayerBar`。
   - 使用原创 SVG 和本地数学计算完成交互。

3. **接入课程与 Agent 注册表**
   - 为七个知识点配置 `rendererId`。
   - 更新 `config/owned-experiments.json`。
   - 运行生成器更新前端 catalog 和后端 registry。

4. **更新范围门禁与数量展示**
   - 门禁允许且只允许 15 个自研实验。
   - 实验库数量从 catalog 动态计算。

5. **验证**
   - 运行定向测试、全部前后端测试、ESLint、范围检查和根目录 build。
   - 在浏览器逐个打开七个新增路由，检查统一 Native 页面与关键交互。

