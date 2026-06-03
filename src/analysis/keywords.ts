import type { KeywordFreq, TrendingResult } from '../stores/store'

export const STOPWORDS = new Set([
  '있다', '없다', '하다', '되다', '이다', '아니다', '같다', '보다',
  '그리고', '그래서', '하지만', '그런데', '또한', '그냥', '정말', '너무',
  '이것', '저것', '그것', '여기', '거기', '이런', '저런', '그런',
  '이번', '다음', '지금', '오늘', '어제', '내일', '항상', '계속',
  '생각', '사람', '경우', '때문', '부분', '이유', '방법', '문제',
  '우리', '저희', '여러', '많은', '처음', '마지막', '모든', '각각',
])

export function calcKeywordFrequency(
  texts: string[],
  stopwords: Set<string>,
  top: number
): KeywordFreq[] {
  const freq: Record<string, number> = {}
  for (const text of texts) {
    const words = text.match(/[가-힣]{2,6}/g) ?? []
    for (const w of words) {
      if (!stopwords.has(w)) freq[w] = (freq[w] ?? 0) + 1
    }
  }
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, top)
    .map(([word, count]) => ({ word, count }))
}

export function calcTrending(
  thisWeekTexts: string[],
  lastWeekTexts: string[],
  stopwords: Set<string>,
  top: number
): TrendingResult {
  const countFreq = (texts: string[]) => {
    const freq: Record<string, number> = {}
    for (const text of texts) {
      const words = text.match(/[가-힣]{2,6}/g) ?? []
      for (const w of words) {
        if (!stopwords.has(w)) freq[w] = (freq[w] ?? 0) + 1
      }
    }
    return freq
  }

  const thisFreq = countFreq(thisWeekTexts)
  const lastFreq = countFreq(lastWeekTexts)

  const gains: TrendingResult['topGains'] = []
  for (const [word, cnt] of Object.entries(thisFreq)) {
    if (cnt < 2) continue
    const prev = lastFreq[word] ?? 0
    const gain = prev === 0 ? cnt * 2 : cnt - prev
    if (gain > 0) gains.push({ word, thisCount: cnt, lastCount: prev, gain })
  }
  gains.sort((a, b) => b.gain - a.gain)

  return {
    topGains: gains.slice(0, top),
    highViewKeywords: [],
    thisWeekTotal: thisWeekTexts.length,
    lastWeekTotal: lastWeekTexts.length,
  }
}
