# 설교 본문 등장 전환 자연스럽게 만들기 — 설계

작성일: 2026-07-29

## 배경

설교 페이지(`/sermon/[id]`)에 진입하면 스피너가 돌다가 요약 본문이 나타난다. 이
전환이 어색하다는 문제 제기가 있었고, 어색함의 원인은 두 가지로 좁혀졌다.

1. **스피너가 툭 사라진다.** `SermonContent`가 `isLoading` 분기에서 early
   return 하므로 스피너는 exit 애니메이션 없이 즉시 언마운트되고, 곧바로 본문이
   나타난다.
2. **본문이 한꺼번에 등장한다.** `SermonBody`만 `opacity`/`y` 페이드를 갖고
   있고, 그 안의 마크다운 블록 전체가 하나의 덩어리로 동시에 뜬다. `Separator`와
   `SermonContentInfo`에는 모션이 아예 없다.

조사 중 세 번째 원인도 확인했다.

3. **로딩 중에만 스크롤바가 생겼다 사라진다.** 페이지 내부 로딩이 라우트 세그먼트
   용 `app/loading.tsx`(`min-h-screen w-screen`)를 재사용한다. `max-w-prose`
   컨테이너 안에 100vw × 100vh 박스가 들어가 가로·세로 모두 넘치고, `-mt-16`이
   이를 보정하고 있다. 여기에 `SermonFooter`가 로딩 중에도 렌더되어 스피너 아래
   화면 밖에 접혀 있다. 본문이 뜨는 순간 스크롤바가 사라지며 레이아웃이 튄다.

## 목표

- 스피너에서 본문으로의 전환을 페이드 핸드오프로 바꾼다.
- 요약 본문을 마크다운 블록 단위로 순차 등장시킨다.
- 로딩 중 발생하는 불필요한 스크롤과 레이아웃 점프를 없앤다.

## 비목표

- 로딩 표현을 스켈레톤으로 바꾸지 않는다. 요약 길이가 가변이라 스켈레톤 모양이
  실제 본문과 어긋나고, 구현량 대비 이득이 작다.
- 요약 마크다운 포맷(`apps/api/constants/prompts.py`)은 건드리지 않는다.
- 데이터 페칭 로직(`useSermonData`, SWR 설정, localStorage 캐시)은 건드리지
  않는다.

## 접근 결정

본문을 순차 등장시키는 방법으로 세 가지를 검토했다.

| 안 | 내용 | 판단 |
|---|---|---|
| A | `ReactMarkdown`의 `components`로 최상위 블록 태그를 모션 컴포넌트에 매핑하고 부모에 `staggerChildren` | **채택** |
| B | 요약 문자열을 `###` 기준으로 잘라 섹션별로 렌더하고 섹션끼리 stagger | 기각 |
| C | 본문 전체 → `Separator` → `SermonContentInfo` 3단계만 지연 | 기각 |

B는 프론트엔드가 Gemini 출력 포맷에 결합된다. 프롬프트가 바뀌면 조용히 깨지는
부채가 된다. C는 "본문이 한꺼번에 등장한다"는 원인을 그대로 남긴다.

A는 마크다운 파싱 결과의 구조만 사용하므로 요약 포맷이 바뀌어도 동작하며, 문자열
파싱이 없다.

## 설계

### 1. 전환 구조 — `_components/sermon-content.tsx`

로딩/에러/빈값/성공 네 갈래의 early return을 `AnimatePresence mode="wait"` 아래
하나의 트리로 합치고, 각 갈래에 안정적인 `key`를 준다.

`mode="wait"`를 쓰는 이유: 스피너는 세로 가운데 정렬이고 본문은 상단 정렬이라
둘이 겹쳐 교차 페이드하면 서로 다른 위치에서 두 덩어리가 동시에 움직여 지저분해
진다. 스피너가 완전히 빠져나간 뒤 본문이 들어오는 순차 핸드오프가 맞다.
`_components/link-input-status-msg.tsx`도 같은 패턴을 쓴다.

성공 분기는 `m.div` 컨테이너 하나가 `initial="hidden" animate="visible"`와
`staggerChildren`을 갖는다. 자식 구성(위에서 아래):

1. `SermonBody` — 마크다운 블록들
2. `Separator`
3. `SermonContentInfo`
4. `SermonFooter`

**stagger 부모는 이 컨테이너 하나뿐이다.** `SermonBody`가 자체 stagger 부모를
가지면 안 된다. 그럴 경우 본문 블록들과 `Separator` 이하가 서로 다른 체인에서
동시에 흐르기 시작해, 본문이 끝나기 전에 구분선이 먼저 뜬다. 컨테이너 하나에
전부 등록시켜 하나의 평평한 체인(본문 블록들 → 구분선 → 출처 정보 → 푸터)을
만든다.

`Separator`, `SermonContentInfo`, `SermonFooter`는 모션 props를 받지 않으므로
각각 블록 variants를 가진 `m.div`로 감싼다.

### 2. 본문 순차 등장 — `_components/sermon-body.tsx`

`SermonBody`의 루트는 **모션이 아닌 일반 `<article>`** 로 두고 기존 `prose`
클래스를 유지한다. 마크다운 블록들은 위 컨테이너의 자식으로 등록된다 —
framer-motion의 variants 전파는 React context를 타므로 사이에 일반 DOM 요소가
있어도 끊기지 않는다.

`ReactMarkdown`의 `components`로 다음 태그를 모션 컴포넌트에 매핑한다.

`h2`, `h3`, `h4`, `p`, `blockquote`, `ul`, `ol`

각 매핑은 공통 블록 variants(`opacity: 0 → 1`, `y: 12 → 0`)를 받는다.

**`components` 객체는 반드시 모듈 스코프 상수로 둔다.** 컴포넌트 함수 안에서
만들면 렌더마다 새 참조가 되어 `ReactMarkdown`이 마크다운 트리를 리마운트하고
애니메이션이 다시 돈다.

stagger 순서는 자식이 부모에 등록되는 순서, 즉 문서 순서를 따른다.

중첩된 모션 요소(예: `blockquote > p`, `ul > li > p`)는 가장 가까운 모션 조상의
자식으로 등록되므로 최상위 stagger 슬롯을 소비하지 않고 부모와 같은 타이밍에
뜬다. 의도된 동작이다.

`li`는 매핑하지 않는다. 목록은 `ul`/`ol` 단위로 한 덩어리로 뜬다.

react-markdown v10의 컴포넌트 props에는 `node`가 포함되므로 DOM에 전달되지
않도록 구조 분해로 제거한다.

### 3. 모션 상수 — `_constants/sermon-motion.ts`

블록 variants와 컨테이너 variants, stagger 간격, exit 트랜지션을 여기에 모은다.
설교 라우트에서만 쓰이므로 `src/lib`으로 올리지 않는다(CLAUDE.md의 라우트 단위
코로케이션 규칙). 기본 트랜지션은 기존 `@/lib/motion`의 `createTransition`을
재사용한다.

값:

- 블록 stagger 간격: `0.05s`
- 블록 이동 거리: `y: 12px`
- 스피너 exit: `opacity: 0`, `scale: 0.96`, `0.25s`

본문 블록이 12~16개이고 여기에 구분선·출처 정보·푸터 3개가 더해지므로 전체
캐스케이드는 약 0.75~0.95초에 끝난다.

### 4. 로딩 컴포넌트 — `_components/sermon-loading.tsx`

페이지 내부 로딩 전용 컴포넌트를 새로 만든다. `app/loading.tsx`는 라우트 세그먼트
로딩용으로 그대로 둔다.

높이는 `min-h-[calc(100dvh-6.25rem)]`로 스크롤 컨테이너의 보이는 영역에 맞춘다.
`6.25rem`(100px)의 근거는 헤더 `h-16`(64px) + 캡처 영역 `pt-5`(20px) +
`pb-4`(16px)이며, 코드에 주석으로 남긴다. 이렇게 하면 `-mt-16` 보정과
`w-screen`으로 인한 가로 넘침이 모두 사라진다.

### 5. 푸터 위치 이동 — `app/sermon/[id]/page.tsx`

`SermonFooter`를 `page.tsx`에서 `SermonContent`의 성공 분기로 옮긴다. 지금은
로딩·에러·빈값 상태에서도 렌더되어 로딩 중 스크롤을 만든다.

`SermonFooter`는 여전히 `#sermon-capture-area` 안쪽에 있으므로 말씀 카드 저장
(`useCaptureSermon`, `html-to-image`)에 영향이 없다.

### 6. 동작 줄이기 대응 — `_components/providers/motion-provider.tsx`

`LazyMotion` 안에 `<MotionConfig reducedMotion="user">`를 추가한다. OS의 "동작
줄이기" 설정을 켠 사용자에게는 이번 stagger를 포함한 앱 전역의 이동/스케일
애니메이션이 자동으로 비활성화되고 opacity 전환만 남는다.

## 영향 범위

신규:

- `apps/web/src/app/sermon/[id]/_constants/sermon-motion.ts`
- `apps/web/src/app/sermon/[id]/_components/sermon-loading.tsx`

수정:

- `apps/web/src/app/sermon/[id]/_components/sermon-content.tsx`
- `apps/web/src/app/sermon/[id]/_components/sermon-body.tsx`
- `apps/web/src/app/sermon/[id]/page.tsx`
- `apps/web/src/components/providers/motion-provider.tsx`

건드리지 않음: `app/loading.tsx`, `use-sermon-data.ts`, `sermon-header.tsx`,
`sermon-content-info.tsx`, `sermon-footer.tsx`, API 전체.

## 검증

테스트 프레임워크가 없으므로 lint + 빌드 + 수동 확인으로 검증한다.

1. `pnpm lint`
2. `pnpm --filter web build`
3. dev 서버에서 수동 확인
   - 설교 페이지 하드 리로드 → 스피너가 페이드아웃되고 본문이 위에서부터
     순차적으로 올라오는지
   - 로딩 중 가로·세로 스크롤바가 생기지 않는지
   - 메인에서 링크 제출 → 설교 페이지 이동 경로에서도 동일한지
   - 에러 상태와 빈 상태에서도 전환이 깨지지 않는지
   - "말씀 카드로 저장하기"가 정상 동작하고 이미지에 푸터가 포함되는지
   - OS 동작 줄이기를 켠 상태에서 이동 애니메이션 없이 표시되는지
