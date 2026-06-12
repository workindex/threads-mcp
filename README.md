# threads-mcp

[한국어](#한국어) | [English](#english)

---

## 한국어

Threads 포스트를 수집하고 Obsidian wiki로 내보내는 오픈소스 MCP 서버.

Claude Code·Codex 같은 LLM이 당신의 Threads 기록을 직접 읽고 분석할 수 있도록, Threads API에서 포스트를 수집해 로컬 파일과 Obsidian wiki 노트로 변환합니다. 데이터는 전부 로컬에 저장되며 외부로 전송되지 않습니다.

### 무엇을 하나

- **수집**: Threads Graph API에서 내 포스트·댓글을 증분 수집 → `threads/raw/posts.json`
- **분석**: 키워드 빈도, 트렌딩, 성공 패턴, 댓글 활동 등 순수 로컬 분석
- **wiki 내보내기**: 포스트별 Obsidian 노트(frontmatter + 본문) 생성
- **글쓰기 컨텍스트**: 성공글 풀텍스트 + 패턴 + 브랜드 정보를 LLM 초안 작성용으로 집약

총 17개 MCP 도구. AI API 키 불필요 — 분석은 전부 결정적(deterministic) 로컬 연산입니다.

### 사전 준비

| 프로그램 | 필요 여부 | 용도 |
|---------|---------|------|
| [Obsidian](https://obsidian.md/ko/) | 필수 | `export_to_wiki`로 생성된 노트를 열고 탐색 |
| [Obsidian Clipper](https://obsidian.md/ko/clipper) | 선택 | 브라우저에서 웹 페이지를 Obsidian vault로 직접 클리핑 |

> **설계 배경**: 이 MCP의 wiki 아키텍처는 Andrej Karpathy의 [LLM Wiki 패턴](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)을 따릅니다. 원본 소스를 매번 재처리하는 대신, LLM이 wiki를 점진적으로 구축·유지하는 방식입니다.

### 설치

```bash
git clone https://github.com/soloandco/threads-mcp.git
cd threads-mcp
npm install
```

### 설정

1. **액세스 토큰 발급**: [Meta for Developers](https://developers.facebook.com/)에서 Threads API 장기 액세스 토큰을 발급받습니다.

2. **config 생성**:
   ```bash
   cp config.yaml.example config.yaml
   ```
   토큰은 `config.yaml`에 직접 넣거나, `THREADS_ACCESS_TOKEN` 환경 변수로 전달합니다(권장).

3. **MCP 등록** — Claude Code 프로젝트 루트 `.mcp.json`:
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

### 사용

Claude Code를 재시작하면 `threads` 서버가 로드됩니다. `/mcp`로 확인 후:

1. `collect_posts` — Threads API에서 포스트 수집 (최초 1회 + 주기적)
2. `export_to_wiki` — Obsidian 노트로 내보내기
3. `get_draft_context` — 다음 글 초안용 컨텍스트 확보

### MCP 도구 (17개)

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
| `save_feedback` | 초안 피드백 저장 (다음 초안에 자동 반영) |
| `get_feedback_rules` | 저장된 피드백·규칙 목록 조회 |
| `promote_feedback` | 규칙을 브랜드 DNA에 영구 등록 |

### Claude Code 스킬 (동봉)

MCP가 데이터 레이어라면, 스킬은 그 위에서 동작하는 워크플로 레시피입니다. Claude Code가 자동 인식합니다.

#### threads — 글쓰기 코칭 스킬

`.claude/skills/threads/` — 소크라테스식 7단계 글쓰기 워크플로. 트리거: "스레드 글 써줘", "오늘 글"

스킬은 예시 파일(`*.example`)로만 제공합니다. 본인 스타일로 채워서 쓰세요.

```
.claude/skills/threads/
├── SKILL.md.example            ← 7단계 워크플로 구조 (여기서 시작)
└── references/
    ├── anti-slop-ko.md         ← 한국어 anti-slop 가드 (그대로 사용 가능)
    ├── voice-profile.md.example   ← 본인 문체 측정값 채우는 템플릿
    └── exemplar-and-verify.md.example  ← 예문 선별·검증 절차
```

**시작 방법:**

1. `SKILL.md.example` → `SKILL.md`로 복사 후 `커스터마이징 포인트` 주석을 본인 전략으로 채우기
2. `voice-profile.md.example` → `voice-profile.md`로 복사 후 본인 포스트 20개 분석해서 수치 입력
3. `exemplar-and-verify.md.example` → `exemplar-and-verify.md`로 복사 (내용은 대부분 그대로 사용 가능)

#### threads-wiki-synthesis — wiki 합성·분석 스킬

`.claude/skills/threads-wiki-synthesis/` — 포스트·댓글 데이터를 분석해 인사이트 문서를 생성합니다. 트리거: "패턴 분석", "댓글에서 배운 것", "강의 자료 만들어줘"

4가지 모드:

| 모드 | 하는 일 | 출력 |
|------|--------|------|
| **pattern** | 전체 포스트 engagement 패턴 집계 | `wiki/insights/YYYY-MM-DD-post-patterns.md` |
| **comments** | 댓글 전수 집계 → 팔로워 관심사 추출 | `wiki/insights/YYYY-MM-DD-follower-interests.md` |
| **topic** | 특정 토픽·기간 합성 → 강의 목차 생성 | `wiki/insights/YYYY-MM-DD-{topic}-synthesis.md` |
| **skill-suggest** | 반복 작업 감지 → 스킬 초안 자동 생성 | `wiki/insights/skill-suggestions.md` |

> **설계 원칙**: 빈도·순위가 들어간 표는 반드시 스크립트 집계 결과 기반으로 작성합니다. 샘플 기반 추정을 금지하는 규칙이 스킬에 명시되어 있습니다.

### 개발

```bash
npm test          # vitest (39개 테스트)
npm run build     # tsc 빌드
npm run dev       # tsx로 서버 직접 실행
```

---

## English

An open-source MCP server that collects your Threads posts and exports them to Obsidian wiki notes.

Lets LLMs like Claude Code and Codex directly read and analyze your Threads history — collecting posts via the Threads API and converting them to local files and Obsidian wiki notes. All data stays local; nothing is sent to external servers.

### What it does

- **Collect**: Incrementally fetch your posts and replies from the Threads Graph API → `threads/raw/posts.json`
- **Analyze**: Keyword frequency, trending topics, success patterns, reply activity — all local, no AI API needed
- **Wiki export**: Generate per-post Obsidian notes with frontmatter + body
- **Writing context**: Aggregate top-performing posts + patterns + brand info for LLM draft writing

17 MCP tools. No AI API key required — all analysis is deterministic local computation.

### Prerequisites

| Program | Required | Purpose |
|---------|----------|---------|
| [Obsidian](https://obsidian.md/) | Required | Open and navigate notes generated by `export_to_wiki` |
| [Obsidian Clipper](https://obsidian.md/clipper) | Optional | Clip web pages directly into your Obsidian vault from the browser |

> **Design background**: The wiki architecture in this MCP follows Andrej Karpathy's [LLM Wiki pattern](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f). Instead of reprocessing raw sources on every query, LLMs incrementally build and maintain a persistent wiki.

### Installation

```bash
git clone https://github.com/soloandco/threads-mcp.git
cd threads-mcp
npm install
```

### Setup

1. **Get an access token**: Obtain a long-lived Threads API access token from [Meta for Developers](https://developers.facebook.com/).

2. **Create config**:
   ```bash
   cp config.yaml.example config.yaml
   ```
   Set your token in `config.yaml`, or pass it via the `THREADS_ACCESS_TOKEN` environment variable (recommended).

3. **Register with Claude Code** — add to your project's `.mcp.json`:
   ```json
   {
     "mcpServers": {
       "threads": {
         "command": "npx",
         "args": ["tsx", "./src/server.ts"],
         "cwd": "/path/to/threads-mcp",
         "env": {
           "THREADS_ACCESS_TOKEN": "your_token_here"
         }
       }
     }
   }
   ```
   On Windows, set `command` to `C:\\Program Files\\nodejs\\npx.cmd`.

   To use a custom config location, set the `THREADS_CONFIG` environment variable to the absolute path. (Default: `<cwd>/threads/config.yaml`)

### Usage

Restart Claude Code and the `threads` server will load. Verify with `/mcp`, then:

1. `collect_posts` — Fetch your posts from the Threads API (run once, then periodically)
2. `export_to_wiki` — Export posts as Obsidian notes
3. `get_draft_context` — Get context for writing your next post

### MCP Tools (17)

| Tool | Purpose |
|------|---------|
| `collect_posts` | Fetch posts from Threads API |
| `get_posts` | List posts with filters and sorting |
| `get_engagement_stats` | Likes, replies, and views statistics |
| `get_top_content` | Top-performing posts |
| `get_topic_frequency` | Keyword frequency analysis |
| `get_trending_now` | Trending keywords this week |
| `get_my_replies` | Reply activity analysis |
| `get_user_summary` | Collection status summary |
| `get_brand_dna` | View brand settings |
| `update_brand_dna` | Update brand settings |
| `save_draft` | Save a draft locally |
| `list_drafts` | List saved drafts |
| `get_draft_context` | Aggregate context for draft writing |
| `export_to_wiki` | Export to Obsidian wiki |
| `save_feedback` | Save draft feedback (auto-applied in next draft) |
| `get_feedback_rules` | View saved feedback and distilled rules |
| `promote_feedback` | Promote a rule to permanent brand DNA |

### Claude Code Skills (included)

The MCP is the data layer; skills are workflow recipes that run on top of it. Claude Code picks them up automatically.

#### threads — Writing Coaching Skill

`.claude/skills/threads/` — Socratic 7-step writing workflow. Triggers on: "write a threads post", "오늘 글"

Skills are provided as example files (`*.example`) only — fill them in with your own style.

```
.claude/skills/threads/
├── SKILL.md.example            ← 7-step workflow structure (start here)
└── references/
    ├── anti-slop-ko.md         ← Korean anti-slop guard (usable as-is)
    ├── voice-profile.md.example   ← Template for your measured voice profile
    └── exemplar-and-verify.md.example  ← Exemplar selection & verification process
```

**Getting started:**

1. Copy `SKILL.md.example` → `SKILL.md` and fill in the `커스터마이징 포인트` comments with your own strategy
2. Copy `voice-profile.md.example` → `voice-profile.md` and analyze 20 of your posts to fill in the metrics
3. Copy `exemplar-and-verify.md.example` → `exemplar-and-verify.md` (mostly usable as-is)

#### threads-wiki-synthesis — Wiki Analysis Skill

`.claude/skills/threads-wiki-synthesis/` — Analyzes your posts and comments to generate insight documents. Triggers on: "패턴 분석", "강의 자료 만들어줘", "댓글에서 배운 것"

4 modes:

| Mode | What it does | Output |
|------|-------------|--------|
| **pattern** | Aggregate engagement patterns across all posts | `wiki/insights/YYYY-MM-DD-post-patterns.md` |
| **comments** | Count all comments → extract follower interests | `wiki/insights/YYYY-MM-DD-follower-interests.md` |
| **topic** | Synthesize a topic or time period → generate course outline | `wiki/insights/YYYY-MM-DD-{topic}-synthesis.md` |
| **skill-suggest** | Detect repeated tasks → auto-generate skill drafts | `wiki/insights/skill-suggestions.md` |

> **Design principle**: Any table with frequencies or rankings must be based on actual script output — estimation from samples is explicitly prohibited in the skill.

### Development

```bash
npm test          # vitest (39 tests)
npm run build     # tsc build
npm run dev       # run server directly with tsx
```

## License

[AGPL-3.0](./LICENSE)
