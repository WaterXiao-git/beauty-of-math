import test from 'node:test'
import assert from 'node:assert/strict'

import {
  isGeneratableMathExperimentRequest,
} from './mathDomainGuard.js'

test('允许数学术语和表达式进入实验生成', () => {
  const questions = [
    '画出心形线 r=a(1-cos(theta))',
    '观察 y=x^2 的参数变化',
    '演示 23 - 8',
  ]

  for (const question of questions) {
    assert.equal(
      isGeneratableMathExperimentRequest(question),
      true,
      question,
    )
  }
})

test('拒绝天气和普通闲聊进入实验生成', () => {
  const questions = [
    '今天天气怎么样',
    '给我讲一个笑话',
    '帮我写一封请假邮件',
    '讲解群论中的拉格朗日定理',
  ]

  for (const question of questions) {
    assert.equal(
      isGeneratableMathExperimentRequest(question),
      false,
      question,
    )
  }
})

test('已有实验候选仍需同时具备可视化意图', () => {
  assert.equal(
    isGeneratableMathExperimentRequest(
      '观察抽象名称的图像变化',
      [{} as never],
    ),
    true,
  )

  assert.equal(
    isGeneratableMathExperimentRequest(
      '解释抽象名称',
      [{} as never],
    ),
    false,
  )
})
