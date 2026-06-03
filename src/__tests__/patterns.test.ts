import { describe, it, expect } from 'vitest'
import { extractPatterns } from '../analysis/patterns'

describe('extractPatterns', () => {
  it('텍스트가 3개 미만이면 빈 배열 반환', () => {
    expect(extractPatterns(['a', 'b'])).toEqual([])
  })

  it('50% 이상이 물음표로 끝나면 "질문형 마무리" 포함', () => {
    const texts = ['좋은가요?', '아닌가요?', '그렇다', '맞는가?']
    const patterns = extractPatterns(texts)
    expect(patterns).toContain('질문형 마무리')
  })

  it('60% 이상이 숫자 포함이면 "구체적 수치 포함" 포함', () => {
    const texts = ['3가지', '100명', '5배', '없음', '없음']
    const patterns = extractPatterns(texts)
    expect(patterns).toContain('구체적 수치 포함')
  })

  it('50% 이상이 짧은 첫 줄이면 "짧은 첫 줄 hook" 포함', () => {
    const texts = [
      '짧다\n이후 긴 내용',
      '짧다\n이후',
      '매우 길고 긴 첫 줄인데 50자를 훌쩍 넘어서 hook이 아님',
      '짧다\n...',
    ]
    const patterns = extractPatterns(texts)
    expect(patterns).toContain('짧은 첫 줄 hook')
  })
})
