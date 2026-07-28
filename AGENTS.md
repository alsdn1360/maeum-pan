# AGENTS.md

YouTube 설교 영상을 Gemini로 요약하는 웹 서비스. Next.js(`apps/web`) + FastAPI(`apps/api`) pnpm/Turborepo 모노레포.
셋업·환경 변수·트러블슈팅은 [README.md](README.md)를 참고한다.

## 명령어

루트에서 Turborepo로 실행한다. 개별 앱은 `--filter`를 붙인다.

```bash
pnpm dev                    # web(3000) + api(8000) 동시 실행
pnpm lint                   # web: eslint / api: ruff check
pnpm format                 # web: prettier / api: ruff format
pnpm --filter web build
pnpm --filter api install:py   # apps/api/venv 생성 + requirements.txt 설치
```

- API는 `apps/api`가 아니라 **저장소 루트의 부모 기준 `api.main:app`** 으로 실행된다(`apps/api/package.json` 참고). Python 코드는 항상 패키지 상대 임포트(`from ..core.config import ...`)를 쓴다.
- 테스트 프레임워크는 아직 없다. 변경 검증은 lint + 실제 실행으로 한다.
- 커밋 시 husky + lint-staged가 `apps/web`의 변경 파일에 `eslint --fix`를 돌린다.

## 아키텍처

요청 흐름: `web` → `POST /sermon` → `SermonService` → 캐시 조회 → 자막 추출(`YouTubeService`) + 메타데이터 → `GeminiService` 요약 → DB 저장 → 응답.

- **`apps/api/services/`**: 비즈니스 로직. 전부 `@staticmethod`만 가진 클래스(`SermonService`, `GeminiService`, `YouTubeService`, `SermonCacheService`).
- **`apps/api/routers/`**: 얇게 유지. 검증·조합은 service로 내린다.
- **`DATABASE_URL`/`GEMINI_API_KEY`가 없어도 앱은 뜬다.** DB 엔진과 Gemini 클라이언트는 모듈 로드 시 `None`으로 남고 런타임에 분기한다. 새 외부 의존성도 같은 방식으로 방어한다.
- **에러는 `ApiError`로만 던진다** (`core/errors.py`). `status_code` + 대문자 스네이크 `code` + **사용자에게 보여줄 한국어 `message`. 응답은 항상 `{ "error": { code, message, details } }` 형태이고, 프론트의 `apiClient`가 이 구조를 파싱해 메시지를 꺼낸다.
- **경계에서 snake_case ↔ camelCase 변환.** Python 내부는 snake_case, 응답은 Pydantic `serialization_alias`로 camelCase(`videoId`, `isNonSermon`). 프론트 타입은 camelCase 그대로 쓴다.
- 설교가 아닌 영상은 Gemini가 `TYPE: NON_SERMON`만 반환하고, 이는 에러가 아니라 `is_non_sermon` 플래그로 전달된다.
- 요약 결과는 `video_id` 기준으로 Postgres에 캐시된다. 캐시 히트 시 의도적으로 10~15초 지연을 준다(즉시 응답이 오히려 어색해서).

## 웹 규칙

- **라우트 단위 코로케이션**: 특정 라우트에서만 쓰는 것은 해당 폴더의 `_components/`, `_hooks/`, `_constants/`에 둔다. 두 곳 이상에서 쓰일 때만 `src/components`, `src/lib`, `src/constants`로 올린다.
- **API 레이어는 `src/api/<method>-<resource>/`** 에 `get.ts`/`post.ts` + `type.ts`로 나눈다. fetch는 직접 쓰지 않고 `@/lib/api-client`의 `apiClient`를 쓴다.
- **경로/URL은 상수 + 플레이스홀더**: `API_URL`, `APP_PATH`에 `'/sermon/{videoId}'` 형태로 정의하고 `buildUrlWithParams`로 치환한다.
- **컴포넌트는 마크업만, 상태·로직은 훅으로** 분리한다(`link-input-form.tsx` ↔ `use-link-input-form.ts`).
- 파일명은 kebab-case, 컴포넌트는 `function` 선언 + named export, 훅/유틸은 화살표 함수 + named export.
- UI는 shadcn(`src/components/ui`, 스타일 `base-maia`) + Tailwind v4 + Hugeicons. 새 아이콘은 `src/components/common/icons/icons.tsx`에 모은다.
- 서버/클라이언트 base URL이 다르다: 서버는 `API_BASE_URL`, 브라우저는 `NEXT_PUBLIC_API_BASE_URL`.
- 사용자에게 보이는 문구는 전부 한국어.

## 스타일

린터가 강제하므로 수동으로 맞추기보다 `pnpm lint:fix` / `pnpm format`을 돌린다. 다만 자동 수정이 안 되는 것들:

- ESLint `padding-line-between-statements`: **모든 구문 사이에 빈 줄**이 필요하다(import 연속, const/let 연속 등은 예외).
- 타입 임포트는 인라인 형태로: `import { type Sermon } from '@/types/sermon'`.
- import 정렬 순서: side effect → react → 외부 → 상대 경로 → 에셋 (`simple-import-sort`).
- Prettier: 작은따옴표, 80자, `bracketSameLine: true`(JSX 닫는 `>`를 마지막 속성과 같은 줄에).
- Ruff: 더블 쿼트, line-length 88, target `py311`.

## 배포

- `apps/web`: Vercel.
- `apps/api`: Dockerfile → Cloud Run(`asia-northeast3`), Firebase Hosting이 리라이트로 앞단에 붙는다. Cloud Run은 `PORT` 환경변수를 사용하므로 포트를 하드코딩하지 않는다.

## 기여

- 브랜치는 `dev`에서 따고 `dev`로 PR을 보낸다(`main`은 배포 브랜치).
- 커밋 메시지: `Feat: `, `Fix: `, `Refactor: `, `Chore: `, `Design: ` 접두사 + 한국어 본문.
- 커밋 본문은 **불릿 5개 이하**로 짧게 쓴다. 변경이 많아도 항목을 쪼개 나열하지 말고 묶어서 요약한다. 카테고리 소제목이나 여러 문장짜리 설명은 넣지 않는다.
- `.env`, `.env.local`은 커밋하지 않는다.
