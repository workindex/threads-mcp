export function extractPatterns(texts: string[]): string[] {
  if (texts.length < 3) return []

  const total = texts.length
  const patterns: string[] = []

  const questionEnding = texts.filter(t => t.trimEnd().endsWith('?')).length
  if (questionEnding / total >= 0.5) patterns.push('질문형 마무리')

  const hasNumbers = texts.filter(t => /\d+/.test(t)).length
  if (hasNumbers / total >= 0.6) patterns.push('구체적 수치 포함')

  const hasPersonal = texts.filter(t =>
    /나는|내가|했을 때|했더니|해봤|직접/.test(t)
  ).length
  if (hasPersonal / total >= 0.5) patterns.push('개인 경험담')

  const hasHook = texts.filter(t => (t.split('\n')[0] ?? '').length <= 50).length
  if (hasHook / total >= 0.5) patterns.push('짧은 첫 줄 hook')

  const goodLength = texts.filter(t => t.length >= 150 && t.length <= 400).length
  if (goodLength / total >= 0.5) patterns.push('150~400자 적정 길이')

  return patterns
}
