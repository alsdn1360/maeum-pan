# 마음판

YouTube 설교 영상을 AI로 요약하는 웹 애플리케이션입니다. 사용자가 설교 영상 URL을 입력하면 백엔드가 YouTube 자막을 가져오고, Google Gemini API로 요약을 생성합니다.

이 저장소는 Next.js 프론트엔드와 FastAPI 백엔드를 함께 관리하는 모노레포입니다.

## 기술 스택

프론트엔드는 `apps/web`, 백엔드는 `apps/api`에서 관리합니다.

| 영역 | 주요 기술 | 용도 |
| --- | --- | --- |
| 프론트엔드 | Next.js 16.1.6, React 19.2.3 | App Router 기반 웹 애플리케이션 |
| 스타일링 | Tailwind CSS v4, Framer Motion 12.30.0 | UI 스타일과 애니메이션 |
| UI | shadcn 3.8.1, Base UI, Hugeicons | 컴포넌트와 아이콘 |
| 백엔드 | FastAPI, Uvicorn, Pydantic | API 서버와 요청/응답 스키마 |
| AI | google-genai | Gemini API 호출 |
| YouTube | youtube-transcript-api, yt-dlp | 영상 자막 추출 |
| 데이터베이스 | SQLAlchemy, PostgreSQL 드라이버 | 설교 요약 캐시 저장 |
| 모노레포 | Turborepo, pnpm workspaces | 앱별 스크립트 실행과 의존성 관리 |

## 기준 실행 환경

다음 버전을 기준으로 문서를 작성했습니다.

- Node.js: Next.js 요구 사항에 따라 20.9 이상
- pnpm: 10.28.2
- Python: 3.13 이상
- 프론트엔드 개발 서버: `http://localhost:3000`
- 백엔드 개발 서버: `http://localhost:8000`

## 프로젝트 구조

```txt
maeum-pan/
├── apps/
│   ├── web/                    # Next.js 프론트엔드
│   │   ├── src/
│   │   │   ├── app/            # App Router 페이지와 레이아웃
│   │   │   ├── api/            # API 요청 함수
│   │   │   ├── components/     # 재사용 가능한 React 컴포넌트
│   │   │   ├── constants/      # 프론트엔드 상수
│   │   │   └── lib/            # 공통 유틸리티
│   │   └── public/             # 정적 파일과 PWA 자산
│   └── api/                    # FastAPI 백엔드
│       ├── core/               # 앱 설정과 공통 오류 처리
│       ├── routers/            # API 라우터
│       ├── schemas/            # Pydantic 요청/응답 스키마
│       ├── services/           # 비즈니스 로직
│       ├── constants/          # 프롬프트 등 API 상수
│       └── main.py             # FastAPI 앱 진입점
├── package.json                # 루트 스크립트
├── pnpm-lock.yaml
└── README.md
```

## 환경 변수

로컬 실행 전에 필요한 환경 변수를 설정합니다. 실제 값은 커밋하지 않습니다.

`apps/web/.env.local`에서 사용하는 값은 다음과 같습니다.

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY=<kakao-javascript-key>
```

`apps/api/.env`에서 사용하는 값은 다음과 같습니다.

```bash
GEMINI_API_KEY=<gemini-api-key>
DATABASE_URL=<postgresql-url>
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

`DATABASE_URL`이 없으면 백엔드는 설교 요약을 데이터베이스에 캐시하지 않습니다.

## 시작하기

처음 실행할 때는 루트 의존성을 설치한 뒤 백엔드 Python 가상 환경을 만듭니다.

```bash
pnpm install
pnpm --filter api install:py
```

`pnpm --filter api install:py` 명령은 `apps/api/venv`에 가상 환경을 만들고, `apps/api/requirements.txt`에 정의된 Python 패키지를 설치합니다.

전체 개발 서버를 실행합니다.

```bash
pnpm dev
```

`pnpm dev`는 Turborepo로 프론트엔드와 백엔드를 함께 실행합니다.

- 웹 앱: `http://localhost:3000`
- API 서버: `http://localhost:8000`
- API 상태 확인: `http://localhost:8000/`

앱을 따로 실행하려면 다음 명령을 사용합니다.

```bash
# 프론트엔드만 실행합니다.
pnpm --filter web dev

# 백엔드만 실행합니다.
pnpm --filter api dev
```

## 주요 명령어

루트에서 자주 사용하는 명령어는 다음과 같습니다.

| 명령어 | 설명 |
| --- | --- |
| `pnpm dev` | 모든 앱의 개발 서버를 실행합니다. |
| `pnpm build` | 모든 앱을 프로덕션용으로 빌드합니다. |
| `pnpm start` | 모든 앱을 프로덕션 모드로 실행합니다. |
| `pnpm lint` | 모든 앱의 린트를 실행합니다. |
| `pnpm lint:fix` | 자동 수정 가능한 린트 문제를 수정합니다. |
| `pnpm format` | 포매터를 실행합니다. |

앱별 명령어는 `--filter` 옵션으로 실행합니다.

```bash
pnpm --filter web build
pnpm --filter api lint
pnpm --filter api format
```

## API 엔드포인트

현재 백엔드는 다음 엔드포인트를 제공합니다.

| 메서드 | 경로 | 설명 |
| --- | --- | --- |
| `GET` | `/` | API 상태를 확인합니다. |
| `POST` | `/sermon` | YouTube URL 또는 비디오 ID로 설교 요약을 생성합니다. |
| `GET` | `/sermon/{video_id}` | 저장된 설교 요약을 조회합니다. |

## 프로덕션 빌드

전체 앱을 빌드하려면 루트에서 다음 명령을 실행합니다.

```bash
pnpm build
```

프론트엔드만 빌드하려면 다음 명령을 실행합니다.

```bash
pnpm --filter web build
```

백엔드에는 별도 컴파일 단계가 없습니다. `pnpm --filter api start` 명령으로 `uvicorn` 서버를 실행합니다.

## 문제 해결

로컬 실행 중 자주 확인해야 하는 항목은 다음과 같습니다.

| 증상 | 확인할 항목 |
| --- | --- |
| 웹 앱에서 API 요청이 실패합니다. | `apps/web/.env.local`의 `NEXT_PUBLIC_API_BASE_URL` 값이 백엔드 주소와 일치하는지 확인합니다. |
| Gemini 요약 생성이 실패합니다. | `apps/api/.env`에 `GEMINI_API_KEY`가 설정되어 있는지 확인합니다. |
| 백엔드에서 CORS 오류가 발생합니다. | `CORS_ORIGINS`에 프론트엔드 주소가 포함되어 있는지 확인합니다. |
| `api` 스크립트가 가상 환경을 찾지 못합니다. | `pnpm --filter api install:py`를 다시 실행해 `apps/api/venv`를 생성합니다. |
