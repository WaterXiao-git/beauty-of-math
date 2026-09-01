function stableValue(value: unknown): unknown {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? Number(value.toPrecision(12)) : String(value)
  }
  if (Array.isArray(value)) return value.map(stableValue)
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, nested]) => [key, stableValue(nested)]),
    )
  }
  return value
}

function hash(input: string) {
  let value = 2166136261
  for (let index = 0; index < input.length; index += 1) {
    value ^= input.charCodeAt(index)
    value = Math.imul(value, 16777619)
  }
  return (value >>> 0).toString(16).padStart(8, '0')
}

export function sceneFingerprint(scene: unknown) {
  return hash(JSON.stringify(stableValue(scene)))
}

export function textFingerprint(text: string) {
  return hash(text.normalize('NFKC').toLowerCase().replace(/[\s\p{P}\p{S}]+/gu, ''))
}
