# threads-mcp

Threads 포스트를 수집하고 Obsidian wiki로 내보내는 오픈소스 MCP 서버.

Claude Code·Codex 같은 LLM이 당신의 Threads 기록을 직접 읽고 분석할 수 있도록, Threads API에서 포스트를 수집해 로컬 파일과 Obsidian wiki 노트로 변환합니다. 데이터는 전부 로컬에 저장되며 외부로 전송되지 않습니다.

## 무엇을 하나

- **수집**: Threads Graph API에서 내 포스트·댓글을 증분 수집 → `threads/raw/posts.json`
- **분석**: 키워드 빈도, 트렌딩, 성공 패턴, 댓글 활동 등 순수 로컬 분석
- **wiki 내보내기**: 포스트별 Obsidian 노트(frontmatter + 본문) 생성
- **글쓰기 컨텍스트**: 성공글 풀텍스트 + 패턴 + 브랜드 정보를 LLM 초안 작성용으로 집약

총 14개 MCP 도구. AI API 키 불필요 — 분석은 전부 결정적(deterministic) 로컬 연산입니다.

## 설치

```bash
git clone https://github.com/<your-org>/threads-mcp.git
cd threads-mcp
npm install
```

## 설정

1. **액세스 토큰 발급**: [Meta for Developers](https://developers.facebook.com/)에서 Threads API 장기 액세스 토큰을 발급받습니다.

2. **config 생성**:
   ```bash
   cp config.yaml.example config.yaml
   ```
   토큰은 `config.yaml`에 직접 넣거나(`config.yaml`은 gitignore됨), `THREADS_ACCESS_TOKEN` 환경 변수로 전달합니다(권장).

3. **MCP 등록** — Claude Code의 경우 프로젝트 루트 `.mcp.json`:
   ```json
   {
     "mcpServers": {
       "threads": {
         "command": "npx",
         "args": ["tsx", "./src/server.ts"],
         "cwd": "/path/to/threads-mcp",
         "env": {
           "THREADS_ACCESS_TOKEN": "발급받은_토큰"
         }
       }
     }
   }
   ```
   Windows는 `command`를 `C:\\Program Files\\nodejs\\npx.cmd`로 지정합니다.

   config 위치를 바꾸려면 `THREADS_CONFIG` 환경 변수로 절대 경로를 지정합니다. (기본값: `<cwd>/threads/config.yaml`)

## 사용

Claude Code를 재시작하면 `threads` 서버가 로드됩니다. `/mcp`로 확인 후:

1. `collect_posts` — Threads API에서 포스트 수집 (최초 1회 + 주기적)
2. `export_to_wiki` — Obsidian 노트로 내보내기
3. `get_draft_context` — 다음 글 초안용 컨텍스트 확보

## MCP 도구 (14개)

| 도구 | 용도 |
|------|------|
| `collect_posts` | Threads API에서 포스트 수집 |
| `get_posts` | 포스팅 목록 조회 (필터·정렬) |
| `get_engagement_stats` | 좋아요·댓글·조회 통계 |
| `get_top_content` | 성과 상위 포스팅 |
| `get_topic_frequency` | 주제 키워드 빈도 |
| `get_trending_now` | 이번 주 급상승 키워드 |
| `get_my_replies` | 내 댓글 활동 분석 |
| `get_user_summary` | 수집 현황 요약 |
| `get_brand_dna` | 브랜드 설정 조회 |
| `update_brand_dna` | 브랜드 설정 업데이트 |
| `save_draft` | 글 초안 로컬 저장 |
| `list_drafts` | 초안 목록 |
| `get_draft_context` | 초안 작성용 컨텍스트 집약 |
| `export_to_wiki` | Obsidian wiki 내보내기 |

## 글쓰기 스킬 (동봉)

`.claude/skills/threads/`에 Claude Code용 글쓰기 코칭 스킬이 포함되어 있습니다. MCP가 데이터 레이어라면, 스킬은 그 위에서 동작하는 소크라테스식 글쓰기 워크플로 레시피입니다. Claude Code가 자동 인식합니다.

## 개발

```bash
npm test          # vitest (39개 테스트)
npm run build     # tsc 빌드
npm run dev       # tsx로 서버 직접 실행
```

## 라이선스

[AGPL-3.0](./LICENSE)
