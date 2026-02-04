# maeum-pan (마음판)

YouTube 설교 영상을 AI로 요약해주는 웹 앱입니다.

Next.js 프론트엔드와 FastAPI 백엔드로 구성된 모노레포 프로젝트입니다. 교회 유튜브 설교 영상의 URL을 입력하면 Gemini를 이용한 요약을 제공합니다.

## 기술 스택

### 프론트엔드 (apps/web)

| 카테고리 | 패키지 | 버전 | 용도 |
|---------|--------|------|------|
| **코어** | Next.js | 16.1.6 | React 프레임워크 (App Router 사용) |
| | React | 19.2.3 | 라이브러리 |
| **스타일링** | Tailwind CSS | v4 | 유틸리티 CSS 프레임워크 |
| | Framer Motion | 12.30.0 | 애니메이션 라이브러리 |
| **UI 컴포넌트** | shadcn | 3.8.1 | 재사용 가능한 UI 컴포넌트 |
| | @base-ui/react | 1.1.0 | 헤드리스 UI 컴포넌트 |
| | @hugeicons/react | 1.1.4 | 아이콘 라이브러리 |
| **기능** | next-themes | 0.4.6 | 다크 모드 지원 |
| | @ducanh2912/next-pwa | 10.2.9 | PWA 지원 |
| | html-to-image | 1.11.13 | DOM을 이미지로 변환 |
| **모니터링** | @vercel/analytics | 1.6.1 | Vercel 애널리틱스 |
| | @vercel/speed-insights | 1.3.1 | 성능 모니터링 |
| **개발 도구** | TypeScript | 5+ | 타입 안전성 |
| | ESLint | 9+ | JavaScript/TypeScript 린팅 |
| | Prettier | 3.8.1 | 코드 포매팅 |
| | React Compiler | 1.0.0 | React 19 최적화 컴파일러 |

### 백엔드 (apps/api)

| 카테고리 | 패키지 | 버전 | 용도 |
|---------|--------|------|------|
| **코어** | FastAPI | 0.115.0+ | 현대적인 Python 웹 프레임워크 |
| | Uvicorn | 0.32.0+ | ASGI 서버 (성능 향상을 위한 standard 포함) |
| | Pydantic | 2.0.0+ | 데이터 검증 및 스키마 정의 |
| **AI/ML** | google-genai | 0.3.0+ | Google Gemini API 클라이언트 |
| **YouTube** | youtube-transcript-api | 0.6.3+ | YouTube 자막 추출 |
| **데이터베이스** | SQLAlchemy | 2.0.0+ | ORM (asyncio 지원) |
| | asyncpg | 0.29.0+ | PostgreSQL 비동기 드라이버 |
| | psycopg2-binary | 2.9.0+ | PostgreSQL 동기 드라이버 |
| **유틸리티** | python-dotenv | 1.0.0+ | 환경변수 관리 |
| | ruff | 0.9.0+ | 빠른 Python 린터 & 포매터 |


### 모노레포 도구

| 도구 | 용도 |
|------|------|
| Turborepo | 모노레포 빌드 시스템 |
| pnpm workspaces | 패키지 매니저 및 워크스페이스 관리 |


## 프로젝트 구조

```
maeum-pan/
└── apps/
    ├── web/                    # Next.js 프론트엔드
    │   ├── src/
    │   │   ├── app/           # App Router 페이지 및 레이아웃
    │   │   │   ├── (main)/   # 메인 페이지 (설교 URL 입력 폼)
    │   │   │   └── sermon/[id]/  # 설교 상세 페이지 (동적 라우트)
    │   │   ├── components/    # 재사용 가능한 React 컴포넌트
    │   │   │   ├── ui/        # shadcn/ui 컴포넌트
    │   │   │   └── providers/ # Context 프로바이더 (테마 등)
    │   │   ├── api/           # API 클라이언트 함수들
    │   │   ├── lib/           # 유틸리티 함수
    │   │   └── constants/     # 앱 상수
    │   └── public/            # 정적 파일
    │
    └── api/                    # FastAPI 백엔드
        ├── routers/           # FastAPI 라우트 핸들러
        ├── services/          # 비즈니스 로직
        ├── schemas/           # Pydantic 모델 (요청/응답 스키마)
        ├── core/              # 핵심 설정 (환경변수, 앱 설정 등)
        ├── constants/         # API 상수 (프롬프트 등)
        └── main.py            # FastAPI 앱 진입점
```

프론트엔드는 PWA를 지원합니다. 백엔드는 YouTube의 자막을 가져와서 Gemini로 요약을 생성합니다.

## 시작하기

- Node.js
- pnpm 10.28.2 이상
- Python 3.13 이상

### 처음 세팅할 때

1. 클론하고 의존성 설치:
```bash
git clone <your-repo-url>
cd maeum-pan
pnpm install
```

2. Python 백엔드 세팅:
```bash
pnpm --filter api install:py
```

이렇게 하면 `apps/api/.venv`에 가상 환경이 만들어지고 Python 패키지들이 설치됩니다.

3. 전부 실행:
```bash
pnpm dev
```

Turborepo가 Next.js 개발 서버(포트 3000)와 FastAPI 서버(포트 8000) 둘 다 띄워줍니다.

따로따로 실행하고 싶으면:
```bash
# 웹앱만
pnpm --filter web dev

# API만
pnpm --filter api dev
```

## 프로덕션 빌드

```bash
pnpm build
```

이렇게 하면 두 앱 모두 빌드됩니다. `--filter web`이나 `--filter api`로 개별 빌드도 가능합니다.
