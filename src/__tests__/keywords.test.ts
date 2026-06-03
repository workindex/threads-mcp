import { describe, it, expect } from 'vitest'
import { STOPWORDS, calcKeywordFrequency, calcTrending } from '../analysis/keywords'

describe('calcKeywordFrequency', () => {
  it('한글 단어 빈도를 계산한다', () => {
    const texts = ['창업 성장 창업', '성장 공부']
    const result = calcKeywordFrequency(texts, STOPWORDS, 10)
    expect(result[0]).toEqual({ word: '창업', count: 2 })
    expect(result[1]).toEqual({ word: '성장', count: 2 })
  })

  it('불용어를 제거한다', () => {
    const texts = ['생각 창업 생각']
    const result = calcKeywordFrequency(texts, STOPWORDS, 10)
    expect(result.find(r => r.word === '생각')).toBeUndefined()
  })

  it('2자 미만 단어를 무시한다', () => {
    const texts = ['나 창업']
    const result = calcKeywordFrequency(texts, STOPWORDS, 10)
    expect(result.find(r => r.word === '나')).toBeUndefined()
  })
})

describe('calcTrending', () => {
  it('이번 주 새로 등장한 키워드에 gain을 부여한다', () => {
    const thisWeek = ['창업 창업 창업']
    const lastWeek: string[] = []
    const result = calcTrending(thisWeek, lastWeek, STOPWORDS, 5)
    const found = result.topGains.find(g => g.word === '창업')
    expect(found).toBeDefined()
    expect(found!.gain).toBeGreaterThan(0)
  })
})
