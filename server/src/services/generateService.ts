// ============================================================================
// 临时实验生成服务（架构图分支 C）
// 流程：本地模板优先选择 -> DeepSeek 生成配置 -> Qwen 复核/故障接管
//      -> Schema 双端校验 -> 服务端预采样（iframe 内纯渲染，不解析公式）
// ============================================================================
import { compile } from 'mathjs'
import { randomUUID } from 'crypto'
import { chat, DEEPSEEK, QWEN } from './llmService.js'
import type { LLMConfig } from './llmService.js'
import { TEMP_TEMPLATES } from '../data/tempSpecSchema.js'
import type { DynamicExperimentSpec, TempTemplate, TempTemplateInfo } from '../data/tempSpecSchema.js'

const GENERATE_PROMPT = (template: TempTemplateInfo) => `你是「数韵之美」平台的数学可视化实验生成器。根据用户问题，为一个「${template.name}」模板生成临时实验配置。

严格输出 JSON（不要 markdown），字段：
{
  "title": "实验标题（一句话，贴合用户问题）",
  "formula": "mathjs 可解析表达式（${template.id === 'polar' ? '变量用 t' : '变量用 x'}，只允许数字、变量、+ - * / ^ () 与数学函数 sin/cos/tan/exp/log/sqrt/abs/floor/ceil）",
  "domain": [最小值, 最大值]（两个有限数字，${template.id === 'polar' ? '通常 [0, 2π]' : '需覆盖有意义区间'}）,
  "params": { "键": 数值 }（提取问题中的关键参数，可为空对象）,
  "steps": [ { "id": "s1", "title": "步骤标题", "desc": "步骤说明" } ]（2-4 条教学步骤）
}

要求：
- formula 必须合法且能采样；不要编造不存在的函数
- title/steps 用中文`;

/** 规则优先选择模板（本地模板库） */
export function selectTemplate(question: string): TempTemplateInfo {
  const q = question.toLowerCase()
  if (/极坐标|polar|角度|花瓣|螺旋|玫瑰/.test(q)) return TEMP_TEMPLATES.find((t) => t.id === 'polar')!
  if (/计算|运算|求和|加减乘除|等于多少|算/.test(q)) return TEMP_TEMPLATES.find((t) => t.id === 'arithmetic')!
  return TEMP_TEMPLATES.find((t) => t.id === 'cartesian')!
}

interface RawGenerated {
  title?: string
  formula?: string
  domain?: [number, number]
  params?: Record<string, number>
  steps?: { id: string; title: string; desc: string }[]
}

/** Schema 校验 + 兜底填充（双端校验的服务端一侧） */
export function validateSpec(raw: RawGenerated, template: TempTemplateInfo): { spec: Omit<DynamicExperimentSpec, 'id' | 'question' | 'createdAt' | 'points'>; formula: string } | null {
  const title = typeof raw.title === 'string' && raw.title.trim() ? raw.title.trim().slice(0, 40) : template.name
  const formula = typeof raw.formula === 'string' && raw.formula.trim() ? raw.formula.trim().slice(0, 100) : template.defaultFormula
  // formula 可解析性校验
  try {
    compile(formula)
  } catch {
    return null
  }
  let domain: [number, number] = template.defaultDomain
  if (
    Array.isArray(raw.domain) &&
    raw.domain.length === 2 &&
    typeof raw.domain[0] === 'number' &&
    typeof raw.domain[1] === 'number' &&
    Number.isFinite(raw.domain[0]) &&
    Number.isFinite(raw.domain[1]) &&
    raw.domain[0] < raw.domain[1]
  ) {
    domain = [raw.domain[0], raw.domain[1]]
  }
  const params: Record<string, number> = {}
  if (raw.params && typeof raw.params === 'object') {
    for (const [k, v] of Object.entries(raw.params)) {
      if (typeof v === 'number' && Number.isFinite(v)) params[k] = v
    }
  }
  let steps = template.defaultSteps
  if (Array.isArray(raw.steps) && raw.steps.length >= 2 && raw.steps.length <= 4) {
    steps = raw.steps.map((st, i) => ({
      id: typeof st.id === 'string' && st.id ? st.id : `s${i + 1}`,
      title: typeof st.title === 'string' && st.title ? st.title.slice(0, 20) : `步骤 ${i + 1}`,
      desc: typeof st.desc === 'string' ? st.desc.slice(0, 60) : '',
    }))
  }
  return { spec: { title, formula, template: template.id, domain, params, steps }, formula }
}

/** 服务端预采样（iframe 内仅渲染 SVG，不解析公式） */
export function sampleCurve(formula: string, template: TempTemplate, domain: [number, number]): { x: number; y: number }[] {
  const compiled = compile(formula)
  const points: { x: number; y: number }[] = []
  const N = 160
  for (let i = 0; i <= N; i++) {
    const v = domain[0] + ((domain[1] - domain[0]) * i) / N
    try {
      const y = compiled.evaluate({ [template === 'polar' ? 't' : 'x']: v })
      if (Number.isFinite(y) && Math.abs(y) < 1e6) points.push({ x: v, y })
    } catch {
      // 跳过不可计算点
    }
  }
  return points
}

/** 生成临时实验：LLM 生成 + 校验 + 采样（DeepSeek 主，Qwen 复核/接管） */
export async function generateTempExperiment(question: string): Promise<DynamicExperimentSpec> {
  const template = selectTemplate(question)
  const messages = [
    { role: 'system' as const, content: GENERATE_PROMPT(template) },
    { role: 'user' as const, content: `用户问题：${question}` },
  ]
  const providers: LLMConfig[] = [DEEPSEEK, QWEN].filter((p) => p.apiKey)
  if (providers.length === 0) {
    throw new Error('未配置 LLM API Key，无法生成临时实验')
  }

  let lastError: unknown
  let raw: RawGenerated | null = null
  for (const provider of providers) {
    try {
      const content = await chat(provider, messages)
      const block = content.trim().match(/\{[\s\S]*\}/)
      raw = JSON.parse(block ? block[0] : content) as RawGenerated
      break
    } catch (err) {
      lastError = err
      console.warn(`[generate] ${provider.name} 生成失败:`, err)
    }
  }
  if (!raw) throw lastError instanceof Error ? lastError : new Error('生成失败')

  const validated = validateSpec(raw, template)
  if (!validated) {
    // 生成内容不合规：退化为本地模板默认配置（可靠本地模板优先的兜底）
    const fallback = validateSpec({}, template)!
    return {
      id: randomUUID(),
      question,
      createdAt: Date.now(),
      points: sampleCurve(fallback.formula, template.id, fallback.spec.domain),
      ...fallback.spec,
    }
  }

  return {
    id: randomUUID(),
    question,
    createdAt: Date.now(),
    points: sampleCurve(validated.formula, template.id, validated.spec.domain),
    ...validated.spec,
  }
}