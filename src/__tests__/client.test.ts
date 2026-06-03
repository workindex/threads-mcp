import { describe, it, expect } from 'vitest'
import { normalizePost, normalizeReply } from '../threads/client'

describe('normalizePost', () => {
  it('API 응답을 Post 인터페이스로 변환한다', () => {
    const raw = {
      id: '123',
      text: '안녕',
      timestamp: '2026-01-15T09:00:00+0000',
      like_count: 10,
      replies_count: 3,
      repost_count: 1,
      views: 500,
      is_reply: false,
    }
    const post = normalizePost(raw)
    expect(post.id).toBe('123')
    expect(post.text).toBe('안녕')
    expect(post.posted_at).toBe('2026-01-15T09:00:00+0000')
    expect(post.like_count).toBe(10)
    expect(post.reply_count).toBe(3) // replies_count → reply_count
    expect(post.view_count).toBe(500) // views → view_count
    expect(post.is_reply).toBe(false)
  })

  it('누락된 필드는 0/false로 대체한다', () => {
    const post = normalizePost({ id: 'x', timestamp: '2026-01-01T00:00:00Z' })
    expect(post.like_count).toBe(0)
    expect(post.reply_count).toBe(0)
    expect(post.is_reply).toBe(false)
    expect(post.text).toBe('')
  })

  it('replied_to_id와 has_replies를 매핑한다', () => {
    const raw = {
      id: '456',
      timestamp: '2026-01-15T09:00:00Z',
      replied_to: { id: '111' },
      has_replies: true,
      is_reply: true,
    }
    const post = normalizePost(raw)
    expect(post.replied_to_id).toBe('111')
    expect(post.has_replies).toBe(true)
    expect(post.is_reply).toBe(true)
  })

  it('replied_to 없으면 replied_to_id는 undefined', () => {
    const post = normalizePost({ id: 'y', timestamp: '2026-01-01T00:00:00Z' })
    expect(post.replied_to_id).toBeUndefined()
    expect(post.has_replies).toBe(false)
  })
})

describe('normalizeReply', () => {
  it('API 응답을 Reply 인터페이스로 변환한다', () => {
    const raw = {
      id: 'r1',
      text: '좋은 글이네요',
      timestamp: '2026-01-15T10:00:00Z',
      username: 'user123',
      permalink: 'https://threads.net/@user123/post/r1',
      root_post: { id: 'p1' },
      replied_to: { id: undefined as unknown as string },
      has_replies: false,
      hide_status: 'UNHIDDEN',
    }
    const reply = normalizeReply(raw, 'p1')
    expect(reply.id).toBe('r1')
    expect(reply.root_post_id).toBe('p1')
    expect(reply.username).toBe('user123')
    expect(reply.text).toBe('좋은 글이네요')
    expect(reply.has_replies).toBe(false)
    expect(reply.permalink).toBe('https://threads.net/@user123/post/r1')
    expect(reply.hide_status).toBe('UNHIDDEN')
  })

  it('root_post 없으면 fallbackRootId를 사용한다', () => {
    const raw = {
      id: 'r2',
      text: '대댓글',
      timestamp: '2026-01-15T11:00:00Z',
      username: 'user456',
      replied_to: { id: 'r1' },
    }
    const reply = normalizeReply(raw, 'fallback-root')
    expect(reply.root_post_id).toBe('fallback-root')
    expect(reply.replied_to_id).toBe('r1')
  })

  it('누락된 필드는 기본값으로 처리한다', () => {
    const raw = { id: 'r3', timestamp: '2026-01-01T00:00:00Z' }
    const reply = normalizeReply(raw, 'root')
    expect(reply.username).toBe('')
    expect(reply.text).toBe('')
    expect(reply.has_replies).toBe(false)
    expect(reply.permalink).toBeUndefined()
  })
})
